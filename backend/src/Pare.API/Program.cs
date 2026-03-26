using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Pare.Infrastructure.Data;
using Pare.Application.Interfaces;
using Pare.Infrastructure.Repositories;
using Pare.Infrastructure.Auth;
using Pare.Application.Services;

var builder = WebApplication.CreateBuilder(args);

// DefaultConnection String
Env.TraversePath().Load();

var dbName = Environment.GetEnvironmentVariable("POSTGRES_DB");
var dbUser = Environment.GetEnvironmentVariable("POSTGRES_USER");
var dbPass = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");

var connectionString = $"Host=localhost;Port=5432;Database={dbName};Username={dbUser};Password={dbPass}";

// Connection to database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Routing
builder.Services.AddRouting(options => { options.LowercaseUrls = true; });

// Subscriptions
builder.Services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();

// Users
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();

// Hash
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();

// Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// App
var app = builder.Build();

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();
app.Run();
