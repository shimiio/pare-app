using Microsoft.OpenApi.Models;
using System.Threading.RateLimiting;

namespace Pare.API.Extensions;

public static class WebApiExtensions
{
    public static IServiceCollection AddWebComponents(this IServiceCollection services, IConfiguration configuration)
    {
        // Routing
        services.AddRouting(options => { options.LowercaseUrls = true; });
        services.AddControllers();
        services.AddEndpointsApiExplorer();
        
        services.AddMemoryCache();

        // Swagger
        services.AddSwaggerGen(opt =>
        {
            opt.SwaggerDoc("v1", new OpenApiInfo { Title = "MyAPI", Version = "v1" });

            opt.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please enter token",
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                BearerFormat = "JWT",
                Scheme = "bearer"
            });


            opt.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                { new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.AddPolicy("global", httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        Window = TimeSpan.FromMinutes(1),
                        PermitLimit = 100,
                        QueueLimit = 0
                    }
                )
            );

            options.AddPolicy("auth", httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        Window = TimeSpan.FromMinutes(5),
                        PermitLimit = 10,
                        QueueLimit = 0
                    }
                )
            );
        });

        return services;
    }
}
