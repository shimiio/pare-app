using System.Net;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Caching.Memory;
using Serilog;
using Hangfire;
using HangfireBasicAuthenticationFilter;
using Pare.API.Middleware;
using Pare.Infrastructure.Jobs;
using Pare.Application;
using Pare.Infrastructure;
using Pare.API.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Serilog
builder.Host.UseSerilog((ctx, config) =>
{
    config
        .ReadFrom.Configuration(ctx.Configuration)
        .WriteTo.Console()
        .WriteTo.File("logs/app.log", rollingInterval: RollingInterval.Day);
});

// Dependency Injections
builder.Services.AddApplication(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddWebComponents(builder.Configuration);

var app = builder.Build();

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Get Header from Caddy 
var forwardedOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor
};

forwardedOptions.KnownIPNetworks.Clear();
forwardedOptions.KnownProxies.Clear();
forwardedOptions.KnownIPNetworks.Add(new System.Net.IPNetwork(IPAddress.Parse("172.16.0.0"), 12));

// Middleware
app.UseForwardedHeaders(forwardedOptions);
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// Hangfire dashboard
if (app.Environment.IsDevelopment())
{
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = []
    });
}
else
{
    app.Use(async (context, next) =>
    {
        // Rate limiting for Hangfire dashboard
        if (context.Request.Path.StartsWithSegments("/hangfire"))
        {
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var cache = context.RequestServices.GetRequiredService<IMemoryCache>();
            var key = $"hangfire_ratelimit_{ip}";
            var attemptsKey = $"{key}_attempts";
            var expiryKey = $"{key}_expiry";

            if (!cache.TryGetValue(expiryKey, out DateTimeOffset expiry))
            {
                expiry = DateTimeOffset.UtcNow.AddMinutes(5);
                cache.Set(expiryKey, expiry, expiry);
            }

            var attempts = cache.GetOrCreate(attemptsKey, entry =>
            {
                entry.AbsoluteExpiration = expiry;
                return 0;
            });

            if (attempts >= 10)
            {
                context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                await context.Response.WriteAsync("Too many requests");
                return;
            }

            cache.Set(attemptsKey, attempts + 1, new MemoryCacheEntryOptions
            {
                AbsoluteExpiration = expiry
            });
        }

        await next();
    });
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = [
            new HangfireCustomBasicAuthenticationFilter
            {
                User = builder.Configuration["Hangfire:Login"]
                    ?? throw new InvalidOperationException("Hangfire:Login not configured"),
                Pass = builder.Configuration["Hangfire:Password"]
                    ?? throw new InvalidOperationException("Hangfire:Password not configured")
            }
        ]
    });
}

// Recurring jobs
using (var scope = app.Services.CreateScope())
{
    RecurringJob.AddOrUpdate<RenewalJob>("renewal-job", job => job.ExecuteAsync(), Cron.Daily);
    RecurringJob.AddOrUpdate<ReminderJob>("reminder-job", job => job.ExecuteAsync(), Cron.Daily);
    RecurringJob.AddOrUpdate<TokenCleanupJob>("token-cleanup-job", job => job.ExecuteAsync(), Cron.Daily);
}

app.MapControllers();
app.Run();
