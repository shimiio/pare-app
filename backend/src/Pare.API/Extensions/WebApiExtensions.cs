using Microsoft.OpenApi.Models;
using Pare.Application.Common;
using System.Security.Claims;
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

        // Rate limits. One IP can be many people (mobile carriers and offices put thousands of users
        // behind a single address), so the IP only gets a high anti-flood ceiling; the real limits
        // are counted per person: per signed-in user, or per browser session for refresh and logout.
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.OnRejected = async (context, ct) =>
            {
                var ip = context.HttpContext.Connection.RemoteIpAddress?.ToString();
                var path = context.HttpContext.Request.Path;
                var logger = context.HttpContext.RequestServices
                    .GetRequiredService<ILogger<Program>>();

                logger.LogWarning("Rate limit exceeded | IP: {Ip} | Path: {Path}", ip, path);

                // Tells the client when to try again instead of making it guess
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                    context.HttpContext.Response.Headers.RetryAfter = ((int)Math.Ceiling(retryAfter.TotalSeconds)).ToString();

                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                await context.HttpContext.Response.WriteAsync("Too many requests", ct);
            };

            // Applies to every request on top of the endpoint policies below
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: ClientIp(httpContext),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        Window = TimeSpan.FromMinutes(1),
                        PermitLimit = 600,
                        QueueLimit = 0
                    }
                )
            );

            // Signed-in endpoints: per user, so people sharing an IP do not share a budget.
            // Needs UseRateLimiter after UseAuthentication, otherwise User is still empty here.
            options.AddPolicy("global", httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: UserOrIp(httpContext),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        Window = TimeSpan.FromMinutes(1),
                        PermitLimit = 100,
                        QueueLimit = 0
                    }
                )
            );

            // Login, register, logout: per IP on purpose. A per-account limit would let anyone lock a
            // stranger out by failing logins with their email, so password guessing is slowed per IP.
            options.AddPolicy("auth", httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: ClientIp(httpContext),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        Window = TimeSpan.FromMinutes(5),
                        PermitLimit = 10,
                        QueueLimit = 0
                    }
                )
            );

            // Refresh and logout: per browser session (the cookie), falling back to the IP without one.
            // A real browser refreshes a few times a minute at most (reloads, restored tabs).
            options.AddPolicy("session", httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: SessionOrIp(httpContext),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        Window = TimeSpan.FromMinutes(1),
                        PermitLimit = 20,
                        QueueLimit = 0
                    }
                )
            );
        });

        return services;
    }

    private static string ClientIp(HttpContext httpContext)
        => "ip:" + (httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown");

    private static string UserOrIp(HttpContext httpContext)
    {
        var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userId is null ? ClientIp(httpContext) : "user:" + userId;
    }

    // The cookie is hashed so the plain token never sits in the limiter's memory as a key
    private static string SessionOrIp(HttpContext httpContext)
    {
        var refreshToken = httpContext.Request.Cookies["refreshToken"];
        return string.IsNullOrEmpty(refreshToken) ? ClientIp(httpContext) : "session:" + TokenHasher.Hash(refreshToken);
    }
}
