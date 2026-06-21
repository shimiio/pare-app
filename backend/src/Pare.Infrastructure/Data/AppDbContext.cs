using Microsoft.EntityFrameworkCore;
using Pare.Domain.Entities;

namespace Pare.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public required DbSet<Subscription> Subscriptions { get; set; }
    public required DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Subscription>().ToTable("subscriptions");
        modelBuilder.Entity<User>().ToTable("users");

        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.User)
            .WithMany(u => u.Subscriptions)
            .HasForeignKey(s => s.UserId);
    }
}
