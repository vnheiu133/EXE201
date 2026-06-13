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
        //Allo SignalR connections to receive access token from query string
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/chathub")))
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
    }
}
