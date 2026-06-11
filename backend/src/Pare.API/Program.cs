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

if (app.Environment.IsDevelopment() || builder.Configuration["Swagger:Enabled"] == "true")
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowedOrigins");
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = []
    });
}
else
{
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
