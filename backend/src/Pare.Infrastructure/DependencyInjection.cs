using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Hangfire;
using Hangfire.PostgreSql;
using Pare.Application.Interfaces;
using Pare.Application.Services;
using Pare.Infrastructure.Data;
using Pare.Infrastructure.Repositories;
using Pare.Infrastructure.Auth;
using Pare.Infrastructure.Services;
using Pare.Infrastructure.Jobs;

namespace Pare.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Build connection string
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured");

        // Connection to database
        services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

        // Hangfire
        services.AddHangfire(config => config.UsePostgreSqlStorage(options => options.UseNpgsqlConnection(connectionString)));
        services.AddHangfireServer();

        // Repositories & Services
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();

        // Email Service
        var emailProvider = configuration["Email:Provider"] ?? "smtp";

        if (emailProvider == "brevo")
            services.AddScoped<IEmailService, EmailService>();
        else
            services.AddScoped<IEmailService, SmtpEmailService>();

        // Jobs
        services.AddScoped<RenewalJob>();
        services.AddScoped<ReminderJob>();
        services.AddScoped<TokenCleanupJob>();
        services.AddScoped<IReminderService, ReminderService>();

        // JWT Auth
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:SecretKey"]
                    ?? throw new InvalidOperationException("Jwt:SecretKey not configured"))),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true
            };
        });

        services.AddAuthorization();

        return services;
    }
}
