using System.Net;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Hangfire;
using HangfireBasicAuthenticationFilter;
using Pare.API.Middleware;
using Pare.Infrastructure.Jobs;
using Pare.Application;
using Pare.Infrastructure;
using Pare.API.Extensions;
using Pare.Infrastructure.Data;

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
builder.Services.AddHttpContextAccessor();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddWebComponents(builder.Configuration);

var app = builder.Build();

// Migrate-only mode for Docker migrator service
if (args.Contains("--migrate-only"))
{
    Log.Information("Running in migrate-only mode...");
    using var scope = app.Services.CreateAsyncScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    Log.Information("Migrations applied successfully.");
    return;
}

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

app.UseForwardedHeaders(forwardedOptions);

// Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseRouting();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// Hangfire dashboard
var dashboardOptions = new DashboardOptions
{
    StatsPollingInterval = 60000
};

if (app.Environment.IsDevelopment())
{
    dashboardOptions.Authorization = [];
}
else
{
    dashboardOptions.Authorization = [
        new HangfireCustomBasicAuthenticationFilter
        {
            User = builder.Configuration["Hangfire:Login"]
                ?? throw new InvalidOperationException("Hangfire:Login not configured"),
            Pass = builder.Configuration["Hangfire:Password"]
                ?? throw new InvalidOperationException("Hangfire:Password not configured")
        }
    ];
}

app.MapHangfireDashboard("/hangfire", dashboardOptions)
   .RequireRateLimiting("hangfire");

// Recurring jobs
using (var scope = app.Services.CreateScope())
{
    RecurringJob.AddOrUpdate<RenewalJob>("renewal-job", job => job.ExecuteAsync(), "5 22 * * *"); // 22 05 UTC = 00 05 Austria time
    RecurringJob.AddOrUpdate<ReminderJob>("reminder-job", job => job.ExecuteAsync(), "0 10 * * *"); // 10 00 UTC = 12 00 Austria time
    RecurringJob.AddOrUpdate<TokenCleanupJob>("token-cleanup-job", job => job.ExecuteAsync(), "5 22 * * *");
}

app.MapControllers();
app.Run();
