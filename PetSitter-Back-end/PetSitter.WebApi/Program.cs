using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Net.payOS;
using Microsoft.OpenApi.Models;
using PetSitter.DataAccess;
using PetSitter.DataAccess.Repository.Implements;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Services.Implements;
using PetSitter.Services.Interfaces;
using PetSitter.Utility.Utils;
using System.Reflection;
using System.Text;
using PetSitter.Models.Enums;
using PetSitter.Models.Models;
using PetSitter.Utility;
using PetSitter.WebApi.Services;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using System.IO;

namespace PetSitter.WebApi;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Logging.ClearProviders();
        builder.Logging.AddConsole();
        builder.Logging.AddDebug();

        IConfiguration configuration = builder.Configuration;

        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString));

        //* Auto register all services and repositories
        var currentAssembly = typeof(Program).Assembly; // chỉ WebApi
        var referencedAssemblies = currentAssembly.GetReferencedAssemblies()
            .Where(a => a.Name != null && a.Name.StartsWith("PetSitter")); //* Only load assemblies that start with prefix of the projects in the solution

        var assemblies = referencedAssemblies
            .Select(Assembly.Load)
            .Append(currentAssembly);

        foreach (var type in assemblies.SelectMany(a => a.GetTypes()))
        {
            if (type.IsClass && !type.IsAbstract)
            {
                foreach (var iface in type.GetInterfaces())
                {
                    if (iface.Name == $"I{type.Name}")
                    {
                        builder.Services.AddScoped(iface, type);
                    }
                }
            }
        }
        //* END OF AUTO REGISTER
        builder.Services.AddScoped<IOrderRepository, OrderRepository>();
        builder.Services.AddScoped<IOrderService, OrderService>();
        builder.Services.AddScoped<IPaymentService, PayOSService>();
        builder.Services.AddScoped<IJwtService, JwtService>();
        builder.Services.AddScoped<IChatRepository, ChatRepository>();

        builder.Services.AddHttpClient<CountryStateServices>();
        builder.Services.AddSingleton<CloudinaryUploader>();
        builder.Services.AddSingleton<ChatPresenceService>();
        
        //* Configure routing to use lowercase URLs
        builder.Services.Configure<RouteOptions>(options => options.LowercaseUrls = true);
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowNextJsApp", policy =>
            {
                var configuredOrigins = builder.Configuration
                    .GetSection("Cors:AllowedOrigins")
                    .Get<string[]>()
                    ?? Array.Empty<string>();

                var allowedOrigins = new[]
                    {
                        "http://localhost:3000",
                        "http://localhost:3001",
                        "http://localhost:3002",
                        "http://127.0.0.1:3000",
                        "http://127.0.0.1:3001",
                        "http://127.0.0.1:3002",
                        "http://localhost:5100",
                        "https://localhost:5100",
                        "https://pet-sitter-seven.vercel.app",
                        "https://petshiter.vercel.app",
                        "https://www.petshiter.com",
                        "https://petshiter.com"
                    }
                    .Concat(configuredOrigins)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToArray();

                policy.WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        builder.Services.AddSingleton(new PayOS(
            configuration["PayOS:ClientId"],
            configuration["PayOS:ApiKey"],
            configuration["PayOS:ChecksumKey"]
        ));

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
.AddJwtBearer(options =>
{
    options.Events = new JwtBearerEvents
    {
        //Allow SignalR connections to receive access token from query string
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/chathub") || path.StartsWithSegments("/notificationhub")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JWT:Issuer"],
        ValidAudience = builder.Configuration["JWT:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"]))
    };
});

        // Add services to the container.
        builder.Services.AddAuthorization();

        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter 'Bearer' [space] and then your token in the text input below.\n\nExample: \"Bearer 12345abcdef\""
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
        });
    });
        
        builder.Services.AddControllers()
            .AddNewtonsoftJson(options => {

                options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;

                options.SerializerSettings.ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver();

                options.SerializerSettings.Converters.Add(new UtcDateTimeConverter());
            });
        
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddSignalR();
        var dataProtectionBuilder = builder.Services.AddDataProtection()
            .PersistKeysToFileSystem(new DirectoryInfo(
                Path.Combine(builder.Environment.ContentRootPath, "DataProtection-Keys")));

        if (OperatingSystem.IsWindows())
        {
            dataProtectionBuilder.ProtectKeysWithDpapi();
        }

        var app = builder.Build();
        SeedRoleAccounts(app);

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        if (!app.Environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }

        app.UseRouting();
        app.UseCors("AllowNextJsApp");
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapHub<ChatHub>("/chathub");
        app.MapHub<NotificationHub>("/notificationhub");
        app.MapControllers();

        app.Run();
    }

    private static void SeedRoleAccounts(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (!context.Database.CanConnect())
        {
            return;
        }

        var now = DateTime.UtcNow;
        const string defaultPassword = "Password123";

        var accounts = new[]
        {
            new
            {
                FullName = "Nguyen Van User",
                Email = "user@petsitter.vn",
                PhoneNumber = "0900000001",
                Role = UserRole.User,
                Address = "Da Nang, Viet Nam",
                ShopName = string.Empty,
                Description = string.Empty
            },
            new
            {
                FullName = "Pet Shop Demo",
                Email = "shop@petsitter.vn",
                PhoneNumber = "0900000002",
                Role = UserRole.ShopOwner,
                Address = "Da Nang, Viet Nam",
                ShopName = "Pet Shop Demo",
                Description = "Tai khoan cua hang demo"
            },
            new
            {
                FullName = "Admin He Thong",
                Email = "admin@petsitter.vn",
                PhoneNumber = "0900000003",
                Role = UserRole.Intermediary,
                Address = "Da Nang, Viet Nam",
                ShopName = "PetSitter Intermediary",
                Description = "Tai khoan dieu phoi he thong"
            }
        };

        foreach (var account in accounts)
        {
            var user = context.Users.FirstOrDefault(x => x.Email == account.Email);

            if (user == null)
            {
                user = new Users
                {
                    UserId = Guid.NewGuid(),
                    FullName = account.FullName,
                    Email = account.Email,
                    PhoneNumber = account.PhoneNumber,
                    Role = account.Role,
                    DateOfBirth = new DateTime(1999, 1, 1),
                    Address = account.Address,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword),
                    ProfilePictureUrl = "https://avatar.iran.liara.run/public",
                    CreatedAt = now,
                    UpdatedAt = now
                };

                context.Users.Add(user);
            }
            else
            {
                user.Role = account.Role;
                user.FullName = string.IsNullOrWhiteSpace(user.FullName) ? account.FullName : user.FullName;
                user.PhoneNumber = string.IsNullOrWhiteSpace(user.PhoneNumber) ? account.PhoneNumber : user.PhoneNumber;
                user.Address = string.IsNullOrWhiteSpace(user.Address) ? account.Address : user.Address;
                user.PasswordHash = string.IsNullOrWhiteSpace(user.PasswordHash)
                    ? BCrypt.Net.BCrypt.HashPassword(defaultPassword)
                    : user.PasswordHash;
                user.UpdatedAt = now;
            }

            if (account.Role is UserRole.ShopOwner or UserRole.Intermediary)
            {
                var shop = context.Shops.FirstOrDefault(x => x.UserId == user.UserId);
                if (shop == null)
                {
                    context.Shops.Add(new Shops
                    {
                        ShopId = Guid.NewGuid(),
                        UserId = user.UserId,
                        ShopName = account.ShopName,
                        Description = account.Description,
                        Address = account.Address,
                        Location = "Da Nang",
                        SocialMediaLinks = string.Empty,
                        ShopImageUrl = user.ProfilePictureUrl,
                        BankName = "Vietcombank",
                        BankNumber = "0000000000",
                        CreatedAt = now,
                        UpdatedAt = now
                    });
                }
            }
        }

        context.SaveChanges();

        // Seed Service Tags
        var serviceTags = new[]
        {
            new ServiceTags { ServiceTagId = Guid.NewGuid(), TagName = "Dắt chó đi dạo" },
            new ServiceTags { ServiceTagId = Guid.NewGuid(), TagName = "Tắm & Grooming" },
            new ServiceTags { ServiceTagId = Guid.NewGuid(), TagName = "Trông giữ thú cưng" },
            new ServiceTags { ServiceTagId = Guid.NewGuid(), TagName = "Huấn luyện thú cưng" }
        };

        foreach (var tag in serviceTags)
        {
            if (!context.ServiceTags.Any(x => x.TagName == tag.TagName))
            {
                context.ServiceTags.Add(tag);
            }
        }
        context.SaveChanges();

        // Seed Services for all shops
        var shops = context.Shops.ToList();
        foreach (var shop in shops)
        {
            shop.Location = "Đà Nẵng";
            if (!shop.Address.Contains("Đà Nẵng") && !shop.Address.Contains("Da Nang"))
            {
                shop.Address = "Đà Nẵng, Việt Nam";
            }
        }
        context.SaveChanges();

        var groomTag = context.ServiceTags.FirstOrDefault(x => x.TagName == "Tắm & Grooming");
        var walkTag = context.ServiceTags.FirstOrDefault(x => x.TagName == "Dắt chó đi dạo");
        var sitTag = context.ServiceTags.FirstOrDefault(x => x.TagName == "Trông giữ thú cưng");
        var trainTag = context.ServiceTags.FirstOrDefault(x => x.TagName == "Huấn luyện thú cưng");

        foreach (var shop in shops)
        {
            var servicesToSeed = new List<PetSitter.Models.Models.Services>();

            if (groomTag != null && !context.Services.Any(x => x.ShopId == shop.ShopId && x.TagId == groomTag.ServiceTagId))
            {
                servicesToSeed.Add(new PetSitter.Models.Models.Services
                {
                    ServiceId = Guid.NewGuid(),
                    ShopId = shop.ShopId,
                    TagId = groomTag.ServiceTagId,
                    ServiceName = $"Dịch vụ Tắm & Chải lông - {shop.ShopName}",
                    PricePerPerson = 15,
                    Description = "Gói tắm dưỡng lông, sấy khô, chải tơi, cắt tỉa móng và vệ sinh tai sạch sẽ cho các bé thú cưng.",
                    ServiceImageUrl = "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=600&auto=format&fit=crop",
                    CreatedAt = now
                });
            }

            if (walkTag != null && !context.Services.Any(x => x.ShopId == shop.ShopId && x.TagId == walkTag.ServiceTagId))
            {
                servicesToSeed.Add(new PetSitter.Models.Models.Services
                {
                    ServiceId = Guid.NewGuid(),
                    ShopId = shop.ShopId,
                    TagId = walkTag.ServiceTagId,
                    ServiceName = $"Dịch vụ Dắt chó đi dạo - {shop.ShopName}",
                    PricePerPerson = 8,
                    Description = "Giải phóng năng lượng cho cún cưng với 45-60 phút đi dạo ngoài trời cùng bảo mẫu thân thiện.",
                    ServiceImageUrl = "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?q=80&w=600&auto=format&fit=crop",
                    CreatedAt = now
                });
            }

            if (sitTag != null && !context.Services.Any(x => x.ShopId == shop.ShopId && x.TagId == sitTag.ServiceTagId))
            {
                servicesToSeed.Add(new PetSitter.Models.Models.Services
                {
                    ServiceId = Guid.NewGuid(),
                    ShopId = shop.ShopId,
                    TagId = sitTag.ServiceTagId,
                    ServiceName = $"Trông giữ thú cưng tại nhà - {shop.ShopName}",
                    PricePerPerson = 25,
                    Description = "Dịch vụ trông giữ thú cưng ngày đêm ấm áp như ở nhà. Được cho ăn đầy đủ, vui chơi tự do và cập nhật tình hình qua video thường xuyên.",
                    ServiceImageUrl = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop",
                    CreatedAt = now
                });
            }

            if (trainTag != null && !context.Services.Any(x => x.ShopId == shop.ShopId && x.TagId == trainTag.ServiceTagId))
            {
                servicesToSeed.Add(new PetSitter.Models.Models.Services
                {
                    ServiceId = Guid.NewGuid(),
                    ShopId = shop.ShopId,
                    TagId = trainTag.ServiceTagId,
                    ServiceName = $"Huấn luyện cún cưng cơ bản - {shop.ShopName}",
                    PricePerPerson = 45,
                    Description = "Khóa học rèn luyện thói quen đi vệ sinh đúng chỗ, nghe lời chủ và các lệnh cơ bản như ngồi, nằm, đứng.",
                    ServiceImageUrl = "https://images.unsplash.com/photo-1537151608828-ea2b117b6281?q=80&w=600&auto=format&fit=crop",
                    CreatedAt = now
                });
            }

            if (servicesToSeed.Count > 0)
            {
                context.Services.AddRange(servicesToSeed);
            }
        }
        context.SaveChanges();

        // Seed products and clean duplicate/English categories
        SeedProductsAndCleanCategories(context, app.Configuration);
    }

    private static void SeedProductsAndCleanCategories(ApplicationDbContext context, IConfiguration config)
    {
        // 1. Get or create the 4 Vietnamese categories
        var catFood = context.Categories.FirstOrDefault(x => x.CategoryName == "Thức ăn");
        if (catFood == null)
        {
            catFood = new Categories { CategoryId = Guid.NewGuid(), CategoryName = "Thức ăn" };
            context.Categories.Add(catFood);
        }
        
        var catToy = context.Categories.FirstOrDefault(x => x.CategoryName == "Đồ chơi");
        if (catToy == null)
        {
            catToy = new Categories { CategoryId = Guid.NewGuid(), CategoryName = "Đồ chơi" };
            context.Categories.Add(catToy);
        }

        var catAccessory = context.Categories.FirstOrDefault(x => x.CategoryName == "Phụ kiện");
        if (catAccessory == null)
        {
            catAccessory = new Categories { CategoryId = Guid.NewGuid(), CategoryName = "Phụ kiện" };
            context.Categories.Add(catAccessory);
        }

        var catHygiene = context.Categories.FirstOrDefault(x => x.CategoryName == "Vệ sinh & Tắm rửa");
        if (catHygiene == null)
        {
            catHygiene = new Categories { CategoryId = Guid.NewGuid(), CategoryName = "Vệ sinh & Tắm rửa" };
            context.Categories.Add(catHygiene);
        }
        context.SaveChanges();

        // 2. Remap other duplicate/English categories to the Vietnamese ones
        var allCats = context.Categories.ToList();
        foreach (var cat in allCats)
        {
            var targetCat = cat.CategoryName.ToLower() switch
            {
                "food" => catFood,
                "toys" => catToy,
                "furniture" => catAccessory,
                "cosmetics" => catHygiene,
                _ => null
            };

            if (targetCat != null && targetCat.CategoryId != cat.CategoryId)
            {
                // Remap products referencing this category
                var productsToRemap = context.Products.Where(p => p.CategoryId == cat.CategoryId).ToList();
                foreach (var p in productsToRemap)
                {
                    p.CategoryId = targetCat.CategoryId;
                }

                // Remap blogs referencing this category
                var blogsToRemap = context.Blogs.Where(b => b.CategoryId == cat.CategoryId).ToList();
                foreach (var b in blogsToRemap)
                {
                    b.CategoryId = targetCat.CategoryId;
                }
                context.SaveChanges();
            }
        }

        // Now delete the duplicate categories
        var duplicateCatNames = new[] { "food", "toys", "furniture", "cosmetics" };
        var duplicateCats = context.Categories
            .Where(c => duplicateCatNames.Contains(c.CategoryName.ToLower()))
            .ToList();
        if (duplicateCats.Any())
        {
            context.Categories.RemoveRange(duplicateCats);
            context.SaveChanges();
        }

        // 3. Clear existing Products and related tables to prevent duplicates
        var allWishlists = context.Wishlists.ToList();
        if (allWishlists.Any())
        {
            context.Wishlists.RemoveRange(allWishlists);
        }

        var allOrderItems = context.OrderItems.ToList();
        if (allOrderItems.Any())
        {
            context.OrderItems.RemoveRange(allOrderItems);
        }

        var allReviews = context.Reviews.ToList();
        if (allReviews.Any())
        {
            context.Reviews.RemoveRange(allReviews);
        }

        var allProducts = context.Products.ToList();
        if (allProducts.Any())
        {
            context.Products.RemoveRange(allProducts);
        }
        context.SaveChanges();

        // 4. Seed Brands and Tags if none exist
        var brandNames = new[] { "Royal Canin", "Whiskas", "Pedigree", "Me-O", "Chappi", "SmartHeart Gold" };
        foreach (var bName in brandNames)
        {
            if (!context.Brands.Any(b => b.BrandName == bName))
            {
                context.Brands.Add(new Brands { BrandId = Guid.NewGuid(), BrandName = bName });
            }
        }
        context.SaveChanges();

        var tagNames = new[] { "Dành cho Chó", "Dành cho Mèo", "Hàng Nhập Khẩu", "Phổ Biến" };
        foreach (var tName in tagNames)
        {
            if (!context.ProductTags.Any(t => t.ProductTagName == tName))
            {
                context.ProductTags.Add(new ProductTags { ProductTagId = Guid.NewGuid(), ProductTagName = tName });
            }
        }
        context.SaveChanges();

        var brands = context.Brands.ToList();
        var tags = context.ProductTags.ToList();

        var defaultBrand = brands.FirstOrDefault() ?? new Brands { BrandId = Guid.NewGuid(), BrandName = "Generic" };
        var defaultTag = tags.FirstOrDefault() ?? new ProductTags { ProductTagId = Guid.NewGuid(), ProductTagName = "Generic" };

        Func<string, Brands> getBrand = (name) => brands.FirstOrDefault(b => b.BrandName.Contains(name)) ?? defaultBrand;
        Func<string, ProductTags> getTag = (name) => tags.FirstOrDefault(t => t.ProductTagName.Contains(name)) ?? defaultTag;

        // 5. Upload images to Cloudinary and get URLs
        string exePath = AppDomain.CurrentDomain.BaseDirectory;
        string seedImagesDir = Path.Combine(exePath, "..", "..", "..", "SeedImages");
        if (!Directory.Exists(seedImagesDir))
        {
            seedImagesDir = Path.Combine(Directory.GetCurrentDirectory(), "SeedImages");
        }

        Console.WriteLine($"Looking for seed images in: {seedImagesDir}");

        string imgFood = UploadToCloudinary(config, Path.Combine(seedImagesDir, "pet_food_bag.png")).GetAwaiter().GetResult();
        string imgToy = UploadToCloudinary(config, Path.Combine(seedImagesDir, "pet_toys_set.png")).GetAwaiter().GetResult();
        string imgAccessory = UploadToCloudinary(config, Path.Combine(seedImagesDir, "pet_accessories.png")).GetAwaiter().GetResult();
        string imgHygiene = UploadToCloudinary(config, Path.Combine(seedImagesDir, "pet_grooming_hygiene.png")).GetAwaiter().GetResult();

        // 6. Find shops to distribute products
        var shops = context.Shops.ToList();
        if (!shops.Any()) return;

        var now = DateTime.UtcNow;

        var productDefs = new[]
        {
            // --- THỨ CĂN (Food) ---
            new { Name = "Thức ăn hạt Royal Canin Club Pro", Desc = "Thức ăn hạt dinh dưỡng cân bằng dành cho chó trưởng thành giúp hệ tiêu hóa khỏe mạnh và tăng cường sức đề kháng.", Price = 120000m, Cat = catFood, Brand = getBrand("Royal Canin"), Tag = getTag("Mèo"), Image = DownloadAndUploadToCloudinary(config, "photo-1583511655857-d19b40a7a54e").GetAwaiter().GetResult() },
            new { Name = "Thức ăn hạt cho mèo Whiskas vị cá ngừ", Desc = "Thức ăn dạng hạt thơm ngon, giàu omega 3 và 6 giúp mượt lông và sáng mắt cho mèo.", Price = 135000m, Cat = catFood, Brand = getBrand("Whiskas"), Tag = getTag("Mèo"), Image = DownloadAndUploadToCloudinary(config, "photo-1514888286974-6c03e2ca1dba").GetAwaiter().GetResult() },
            new { Name = "Hạt dinh dưỡng Pedigree vị bò và rau củ", Desc = "Hạt thơm ngon cho chó với hương vị bò nướng đậm đà, bổ sung chất xơ và protein dồi dào.", Price = 95000m, Cat = catFood, Brand = getBrand("Pedigree"), Tag = getTag("Chó"), Image = DownloadAndUploadToCloudinary(config, "photo-1548767797-d8c844163c4c").GetAwaiter().GetResult() },
            new { Name = "Thức ăn ướt cho chó Chappi vị gà", Desc = "Thức ăn đóng lon mềm, bổ dưỡng vị gà kích thích vị giác và dễ tiêu hóa.", Price = 45000m, Cat = catFood, Brand = getBrand("Chappi"), Tag = getTag("Chó"), Image = DownloadAndUploadToCloudinary(config, "photo-1628009368231-7bb7cfcb0def").GetAwaiter().GetResult() },
            new { Name = "Hạt cho mèo con Royal Canin Mother & Babycat", Desc = "Hạt siêu nhỏ dễ nhai dành cho mèo mẹ mang thai và mèo con từ 1 đến 4 tháng tuổi.", Price = 180000m, Cat = catFood, Brand = getBrand("Royal Canin"), Tag = getTag("Mèo"), Image = DownloadAndUploadToCloudinary(config, "photo-1514888286974-6c03e2ca1dba").GetAwaiter().GetResult() },
            new { Name = "Pate cho mèo Whiskas lon vị cá hồi", Desc = "Pate mềm mịn, giàu dưỡng chất từ cá hồi tươi ngon mang lại bữa ăn ngon miệng và giàu nước.", Price = 35000m, Cat = catFood, Brand = getBrand("Whiskas"), Tag = getTag("Mèo"), Image = DownloadAndUploadToCloudinary(config, "photo-1495360010541-f48722b34f7d").GetAwaiter().GetResult() },
            new { Name = "Hạt dinh dưỡng cho chó SmartHeart Gold", Desc = "Hạt cao cấp nhập khẩu từ Thái Lan hỗ trợ hệ tim mạch và bảo vệ xương khớp.", Price = 220000m, Cat = catFood, Brand = getBrand("SmartHeart"), Tag = getTag("Chó"), Image = DownloadAndUploadToCloudinary(config, "photo-1568640347023-a616a30bc3bd").GetAwaiter().GetResult() },
            new { Name = "Sữa bột cho chó mèo con Bio-Milk", Desc = "Sữa bột thay thế sữa mẹ giàu vitamin và khoáng chất giúp chó mèo sơ sinh phát triển toàn diện.", Price = 65000m, Cat = catFood, Brand = defaultBrand, Tag = getTag("Phổ"), Image = DownloadAndUploadToCloudinary(config, "photo-1548767797-d8c844163c4c").GetAwaiter().GetResult() },

            // --- ĐỒ CHƠI (Toys) ---
            new { Name = "Xương cao su gặm sạch răng cho chó", Desc = "Đồ chơi gặm bằng cao su tự nhiên siêu bền giúp làm sạch mảng bám răng và giảm stress cho cún.", Price = 50000m, Cat = catToy, Brand = defaultBrand, Tag = getTag("Chó"), Image = DownloadAndUploadToCloudinary(config, "photo-1576201836106-db1758fd1c97").GetAwaiter().GetResult() },
            new { Name = "Cần câu lông vũ cho mèo kèm chuông", Desc = "Đồ chơi tương tác giúp kích thích bản năng săn mồi và tăng khả năng vận động cho mèo.", Price = 25000m, Cat = catToy, Brand = defaultBrand, Tag = getTag("Mèo"), Image = DownloadAndUploadToCloudinary(config, "photo-1545249390-6bdfa286032f").GetAwaiter().GetResult() },
            new { Name = "Bóng cao su gai phát tiếng kêu cho cún", Desc = "Bóng gai đàn hồi tốt, phát ra tiếng kêu vui nhộn khi cún cắn hoặc chơi đùa.", Price = 30000m, Cat = catToy, Brand = defaultBrand, Tag = getTag("Chó"), Image = DownloadAndUploadToCloudinary(config, "photo-1516734212186-a967f81ad0d7").GetAwaiter().GetResult() },
            new { Name = "Đồ chơi dây thừng kéo co cho chó lớn", Desc = "Làm từ sợi cotton tự nhiên siêu bền chắc, thích hợp cho các trò chơi kéo co và nhai cắn lành mạnh.", Price = 65000m, Cat = catToy, Brand = defaultBrand, Tag = getTag("Chó"), Image = DownloadAndUploadToCloudinary(config, "photo-1601758228041-f3b2795255f1").GetAwaiter().GetResult() },
            new { Name = "Chuột đồ chơi bông cho mèo bắt mồi", Desc = "Chú chuột bông nhỏ xinh kèm chuông rung kích thích sự tò mò và hứng thú của chú mèo.", Price = 15000m, Cat = catToy, Brand = defaultBrand, Tag = getTag("Mèo"), Image = DownloadAndUploadToCloudinary(config, "photo-1573865526739-10659fec78a5").GetAwaiter().GetResult() },
            new { Name = "Đĩa bay huấn luyện cún cưng ngoài trời", Desc = "Thiết kế đĩa bay khí động học bằng nhựa dẻo cao cấp an toàn, chống trầy xước miệng cún.", Price = 45000m, Cat = catToy, Brand = defaultBrand, Tag = getTag("Chó"), Image = DownloadAndUploadToCloudinary(config, "photo-1596492784531-6e6eb5ea9993").GetAwaiter().GetResult() },
            new { Name = "Tháp bóng 3 tầng thông minh cho mèo", Desc = "Tháp bóng đồ chơi tương tác tự xoay giúp mèo giải trí cả ngày không chán.", Price = 95000m, Cat = catToy, Brand = defaultBrand, Tag = getTag("Mèo"), Image = DownloadAndUploadToCloudinary(config, "photo-1573865526739-10659fec78a5").GetAwaiter().GetResult() },
            new { Name = "Đồ chơi cá nhồi bông chứa cỏ mèo Catnip", Desc = "Cá bông mô phỏng sinh động, bên trong có chứa bột catnip cỏ mèo chất lượng cao.", Price = 35000m, Cat = catToy, Brand = defaultBrand, Tag = getTag("Mèo"), Image = DownloadAndUploadToCloudinary(config, "photo-1533738363-b7f9aef128ce").GetAwaiter().GetResult() },

            // --- PHỤ KIỆN (Accessories) ---
            new { Name = "Vòng cổ da bò cao cấp cho chó", Desc = "Vòng cổ bằng da bò thật siêu bền, khóa kim loại mạ vàng sang trọng và có thể điều chỉnh kích thước.", Price = 110000m, Cat = catAccessory, Brand = defaultBrand, Tag = getTag("Chó"), Image = DownloadAndUploadToCloudinary(config, "photo-1598133894008-61f7fdb8cc3a").GetAwaiter().GetResult() },
            new { Name = "Dây dắt chó đi dạo co giãn tự động", Desc = "Dây dắt dài 5 mét tự động thu gọn tiện lợi, giúp bạn dễ dàng kiểm soát cún khi đi dạo.", Price = 150000m, Cat = catAccessory, Brand = defaultBrand, Tag = getTag("Chó"), Image = DownloadAndUploadToCloudinary(config, "photo-1608096299210-db7e38487075").GetAwaiter().GetResult() },
            new { Name = "Nệm ngủ bông siêu êm cho chó mèo", Desc = "Nệm ngủ bằng vải nhung ấm áp, lót bông 3D đàn hồi mang lại giấc ngủ ngon sâu cho thú cưng.", Price = 250000m, Cat = catAccessory, Brand = defaultBrand, Tag = getTag("Phổ"), Image = DownloadAndUploadToCloudinary(config, "photo-1616394584738-fc6e612e71b9").GetAwaiter().GetResult() },
            new { Name = "Bát ăn đôi inox chống kiến cho thú cưng", Desc = "Thiết kế bát đôi inox kèm khay nhựa có rãnh chứa nước chống kiến bò vào thức ăn.", Price = 75000m, Cat = catAccessory, Brand = defaultBrand, Tag = getTag("Phổ"), Image = DownloadAndUploadToCloudinary(config, "photo-1615678815958-5910c6811c25").GetAwaiter().GetResult() },
            new { Name = "Khay vệ sinh cho mèo kèm xẻng", Desc = "Khay nhựa thành cao chống văng cát ra ngoài, chất liệu nhựa kháng khuẩn an toàn dễ chùi rửa.", Price = 140000m, Cat = catAccessory, Brand = defaultBrand, Tag = getTag("Mèo"), Image = DownloadAndUploadToCloudinary(config, "photo-1548199973-03cce0bbc87b").GetAwaiter().GetResult() },
            new { Name = "Chuồng quây sắt ghép đa năng cho cún", Desc = "Bộ quây sắt gồm 6 tấm dễ dàng tháo lắp, tạo không gian chơi đùa an toàn cho cún trong nhà.", Price = 290000m, Cat = catAccessory, Brand = defaultBrand, Tag = getTag("Chó"), Image = DownloadAndUploadToCloudinary(config, "photo-1552053831-71594a27632d").GetAwaiter().GetResult() },
            new { Name = "Balo phi hành gia vận chuyển chó mèo", Desc = "Balo nhựa cứng trong suốt thời trang giúp thú cưng ngắm nhìn thế giới bên ngoài khi di chuyển.", Price = 195000m, Cat = catAccessory, Brand = defaultBrand, Tag = getTag("Phổ"), Image = DownloadAndUploadToCloudinary(config, "photo-1519052537078-e6302a4968d4").GetAwaiter().GetResult() },
            new { Name = "Nhà cây cào móng Cat Tree cho mèo", Desc = "Nhà cây cào móng nhiều tầng bằng gỗ bọc dây thừng sisal tự nhiên giúp mèo thỏa mãn thói quen cào móng.", Price = 380000m, Cat = catAccessory, Brand = defaultBrand, Tag = getTag("Mèo"), Image = DownloadAndUploadToCloudinary(config, "photo-1548247416-ec66f4900b2e").GetAwaiter().GetResult() },

            // --- VỆ SINH & TẮM RỬA (Hygiene & Grooming) ---
            new { Name = "Sữa tắm chó lông trắng SOS White", Desc = "Sữa tắm chuyên dụng giữ màu lông trắng sáng, khử mùi hôi và dưỡng lông mềm mượt vượt trội.", Price = 125000m, Cat = catHygiene, Brand = defaultBrand, Tag = getTag("Chó"), Image = DownloadAndUploadToCloudinary(config, "photo-1516734212186-a967f81ad0d7").GetAwaiter().GetResult() },
            new { Name = "Sữa tắm trị ve rận cho chó mèo Hantox", Desc = "Sản phẩm chứa hoạt chất an toàn tiêu diệt tận gốc ve, rận, bọ chét và phòng ngừa ký sinh trùng quay lại.", Price = 85000m, Cat = catHygiene, Brand = defaultBrand, Tag = getTag("Phổ"), Image = DownloadAndUploadToCloudinary(config, "photo-1556229010-aa3f7ff66b24").GetAwaiter().GetResult() },
            new { Name = "Lược chải lông nút bấm tự làm sạch", Desc = "Lược chải lông rụng thông minh, chỉ cần ấn nút là lông rụng tự động đẩy ra ngoài rất dễ vệ sinh.", Price = 70000m, Cat = catHygiene, Brand = defaultBrand, Tag = getTag("Phổ"), Image = DownloadAndUploadToCloudinary(config, "photo-1544568100-847a948585b9").GetAwaiter().GetResult() },
            new { Name = "Dung dịch vệ sinh tai cho thú cưng", Desc = "Dung dịch nhỏ tai dịu nhẹ loại bỏ ráy tai bẩn, ngăn ngừa viêm tai và mùi hôi khó chịu.", Price = 55000m, Cat = catHygiene, Brand = defaultBrand, Tag = getTag("Phổ"), Image = DownloadAndUploadToCloudinary(config, "photo-1597633425046-08f5110420b5").GetAwaiter().GetResult() },
            new { Name = "Kìm cắt móng kèm dũa cho chó mèo", Desc = "Bộ kìm cắt móng bằng thép không gỉ sắc bén có chốt khóa an toàn chống cắt sâu vào thịt bé.", Price = 45000m, Cat = catHygiene, Brand = defaultBrand, Tag = getTag("Phổ"), Image = DownloadAndUploadToCloudinary(config, "photo-1596492784531-6e6eb5ea9993").GetAwaiter().GetResult() },
            new { Name = "Máy sấy lông thú cưng chuyên dụng", Desc = "Máy sấy công suất lớn với các mức điều chỉnh nhiệt độ và sức gió giúp sấy khô nhanh chóng lông thú cưng.", Price = 450000m, Cat = catHygiene, Brand = defaultBrand, Tag = getTag("Phổ"), Image = DownloadAndUploadToCloudinary(config, "photo-1516734212186-a967f81ad0d7").GetAwaiter().GetResult() },
            new { Name = "Nước hoa dưỡng lông thú cưng thơm lâu", Desc = "Dung dịch xịt khử mùi và tạo hương thơm dịu nhẹ lưu hương suốt 7 ngày.", Price = 115000m, Cat = catHygiene, Brand = defaultBrand, Tag = getTag("Phổ"), Image = DownloadAndUploadToCloudinary(config, "photo-1543466835-00a7907e9de1").GetAwaiter().GetResult() },
            new { Name = "Cát vệ sinh cho mèo hương cafe", Desc = "Cát sét tự nhiên thấm hút siêu nhanh, vón cục cứng và khử mùi hương cà phê dễ chịu.", Price = 60000m, Cat = catHygiene, Brand = defaultBrand, Tag = getTag("Mèo"), Image = DownloadAndUploadToCloudinary(config, "photo-1558788353-f76d92427f16").GetAwaiter().GetResult() }
        };

        int shopIndex = 0;
        foreach (var def in productDefs)
        {
            var shop = shops[shopIndex % shops.Count];
            var p = new Products
            {
                ProductId = Guid.NewGuid(),
                ShopId = shop.ShopId,
                CategoryId = def.Cat.CategoryId,
                BrandId = def.Brand.BrandId,
                TagId = def.Tag.ProductTagId,
                ProductName = def.Name,
                Description = def.Desc,
                Price = def.Price,
                StockQuantity = 100,
                AvailabilityStatus = true,
                ProductImageUrl = def.Image,
                ShippingInfo = "Giao hàng nhanh toàn quốc, miễn phí vận chuyển cho đơn hàng từ 500k.",
                CreatedAt = now,
                UpdatedAt = now
            };
            context.Products.Add(p);
            shopIndex++;
        }
        context.SaveChanges();
        Console.WriteLine("Seeded 32 unique products successfully!");
    }

    private static async Task<string> DownloadAndUploadToCloudinary(IConfiguration config, string unsplashId)
    {
        string imageUrl = $"https://images.unsplash.com/{unsplashId}?q=80&w=600&auto=format&fit=crop";
        try
        {
            using var client = new System.Net.Http.HttpClient();
            var response = await client.GetAsync(imageUrl);
            if (response.IsSuccessStatusCode)
            {
                var bytes = await response.Content.ReadAsByteArrayAsync();
                
                var account = new Account(
                    config["Cloudinary:CloudName"],
                    config["Cloudinary:ApiKey"],
                    config["Cloudinary:ApiSecret"]
                );
                var cloudinaryInstance = new Cloudinary(account) { Api = { Secure = true } };

                using var stream = new MemoryStream(bytes);
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(unsplashId + ".jpg", stream),
                    PublicId = "petsitter_unsplash_" + unsplashId,
                    Overwrite = true
                };
                var uploadResult = await cloudinaryInstance.UploadAsync(uploadParams);
                if (uploadResult?.SecureUrl?.AbsoluteUri != null)
                {
                    Console.WriteLine($"[SUCCESS] Uploaded Unsplash {unsplashId} to Cloudinary: {uploadResult.SecureUrl.AbsoluteUri}");
                    return uploadResult.SecureUrl.AbsoluteUri;
                }
            }
            else
            {
                Console.WriteLine($"[WARNING] Unsplash ID {unsplashId} returned status code {response.StatusCode}. Using direct link.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Failed to download/upload Unsplash {unsplashId}: {ex.Message}");
        }

        return imageUrl;
    }

    private static async Task<string> UploadToCloudinary(IConfiguration config, string localFilePath)
    {
        if (!File.Exists(localFilePath))
        {
            Console.WriteLine($"[WARNING] Local file not found: {localFilePath}. Using default fallback image.");
            return "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop";
        }

        try
        {
            var account = new Account(
                config["Cloudinary:CloudName"],
                config["Cloudinary:ApiKey"],
                config["Cloudinary:ApiSecret"]
            );
            var cloudinary = new Cloudinary(account) { Api = { Secure = true } };
            
            string publicId = Path.GetFileNameWithoutExtension(localFilePath);
            
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(localFilePath),
                PublicId = "petsitter_seed_" + publicId,
                Overwrite = true
            };
            
            var uploadResult = await cloudinary.UploadAsync(uploadParams);
            if (uploadResult?.SecureUrl?.AbsoluteUri != null)
            {
                Console.WriteLine($"[SUCCESS] Uploaded {localFilePath} to Cloudinary: {uploadResult.SecureUrl.AbsoluteUri}");
                return uploadResult.SecureUrl.AbsoluteUri;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Cloudinary upload failed for {localFilePath}: {ex.Message}");
        }

        return "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop";
    }
}
