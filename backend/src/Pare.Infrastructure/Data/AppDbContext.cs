using Microsoft.EntityFrameworkCore;
using Pare.Domain.Entities;

namespace Pare.Infrastructure.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public required DbSet<Subscription> Subscriptions { get; set; }
    public required DbSet<User> Users { get; set; }
    public required DbSet<EmailVerificationToken> EmailVerificationsToken { get; set; }
    public required DbSet<UnsubscribeToken> UnsubscribeToken { get; set; }
    public required DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Subscription>().ToTable("subscriptions");
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<EmailVerificationToken>().ToTable("email_verification");
        modelBuilder.Entity<UnsubscribeToken>().ToTable("unsubscribe_tokens");
        modelBuilder.Entity<RefreshToken>().ToTable("refresh_tokens");

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Subscription>()
            .Property(s => s.Price)
            .HasPrecision(12, 2);

        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.User)
            .WithMany(u => u.Subscriptions)
            .HasForeignKey(s => s.UserId);

        modelBuilder.Entity<EmailVerificationToken>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.CodeHash).IsRequired().HasMaxLength(128);
            entity.HasIndex(x => x.UserId);
            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UnsubscribeToken>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Token).IsRequired().HasMaxLength(128);
            entity.HasIndex(x => x.Token);
            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(x => x.Id);
            // SHA-256 as lowercase hex (TokenHasher) is exactly 64 characters
            entity.Property(x => x.TokenHash).IsRequired().HasMaxLength(64);
            entity.HasIndex(x => x.TokenHash).IsUnique();
            entity.HasIndex(x => x.UserId);
            entity.HasOne(x => x.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
