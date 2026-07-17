using Microsoft.EntityFrameworkCore;
using Pare.Domain.Entities;

namespace Pare.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public required DbSet<Subscription> Subscriptions { get; set; }
    public required DbSet<User> Users { get; set; }
    public required DbSet<EmailVerificationToken> EmailVerificationsToken { get; set; }
    public required DbSet<UnsubscribeToken> UnsubscribeToken { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Subscription>().ToTable("subscriptions");
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<EmailVerificationToken>().ToTable("email_verification");
        modelBuilder.Entity<UnsubscribeToken>().ToTable("unsubscribe_tokens");

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
    }
}
