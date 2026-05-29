using DotNetEnv;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using FluentValidation;
using MediatR;
using Serilog;
using Hangfire;
using Hangfire.PostgreSql;
using Pare.Infrastructure.Jobs;
using Pare.Application.Interfaces;
using Pare.Infrastructure.Repositories;
using Pare.Infrastructure.Data;
using Pare.Infrastructure.Auth;
using Pare.API.Middleware;
using Pare.Application.Behaviours;
using Pare.Infrastructure.Services;
using Pare.Application.Services;

var builder = WebApplication.CreateBuilder(args);

// Serilog
builder.Host.UseSerilog((ctx, config) =>
{
    config
        .ReadFrom.Configuration(ctx.Configuration)
        .WriteTo.Console()
        .WriteTo.File("logs/app.log", rollingInterval: RollingInterval.Day);
});

// CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? throw new InvalidOperationException("Cors:AllowedOrigins not configured");

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowedOrigins", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// DefaultConnection String
Env.TraversePath().Load();

var dbName = Environment.GetEnvironmentVariable("POSTGRES_DB");
var dbUser = Environment.GetEnvironmentVariable("POSTGRES_USER");
var dbPass = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");

var connectionString = $"Host=localhost;Port=5432;Database={dbName};Username={dbUser};Password={dbPass}";

// Connection to database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Hangfire jobs
builder.Services.AddHangfire(config =>
    config.UsePostgreSqlStorage(options =>
        options.UseNpgsqlConnection(connectionString)
    ));

builder.Services.AddHangfireServer();
builder.Services.AddScoped<RenewalJob>();

builder.Services.AddScoped<IReminderService, ReminderService>();
builder.Services.AddScoped<ReminderJob>();
builder.Services.AddScoped<EmailService>();

builder.Services.AddScoped<TokenCleanupJob>();

// Routing
builder.Services.AddRouting(options => { options.LowercaseUrls = true; });

// Validation
builder.Services.AddValidatorsFromAssembly(
    typeof(Pare.Application.Subscriptions.Validators.SubscriptionWriteDtoValidator).Assembly);

// Subscriptions
builder.Services.AddMediatR(cfg =>
{
    cfg.LicenseKey = builder.Configuration["MediatR:LicenseKey"] ?? throw new InvalidOperationException("MediatR:LicenseKey not configured");
    cfg.RegisterServicesFromAssembly(typeof(Pare.Application.Subscriptions.Queries.GetAllSubscriptions.GetAllSubscriptionsQuery).Assembly);
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehaviour<,>));    // Serilog
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>)); // Validation
});

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();

// JWT token
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"] ?? throw new InvalidOperationException("Jwt:SecretKey not configured"))
        ),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true
    };
});

builder.Services.AddAuthorization();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

// Hash
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();

// Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opt =>
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


// App
var app = builder.Build();

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors("AllowedOrigins");

app.UseAuthentication();
app.UseAuthorization();

// Hangfire Dashboard
app.UseHangfireDashboard("/hangfire");

// Recurring jobs
using var scope = app.Services.CreateScope();
RecurringJob.AddOrUpdate<RenewalJob>(
    "renewal-job",
    job => job.ExecuteAsync(),
    Cron.Daily
);

RecurringJob.AddOrUpdate<ReminderJob>(
    "reminder-job",
    job => job.ExecuteAsync(),
    Cron.Daily
);

RecurringJob.AddOrUpdate<TokenCleanupJob>(
    "token-cleanup-job",
    job => job.ExecuteAsync(),
    Cron.Daily
);

app.MapControllers();

app.Run();
