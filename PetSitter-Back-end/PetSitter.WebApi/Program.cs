using Microsoft.AspNetCore.Authentication.JwtBearer;
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
using PetSitter.Utility;

namespace PetSitter.WebApi;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

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
        var app = builder.Build();

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
}
