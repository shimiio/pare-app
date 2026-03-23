using Microsoft.EntityFrameworkCore;
using Pare.Domain.Models;
using Pare.Application.Interfaces;
using Pare.Infrastructure.Data;

namespace Pare.Infrastructure.Repositories;

public class SubscriptionRepository : ISubscriptionRepository
{
    private readonly AppDbContext _db;

    public SubscriptionRepository(AppDbContext db)
    {
        _db = db;
    }

    // GET all
    public async Task<IEnumerable<Subscription>> GetAllAsync()
    {
        return await _db.Subscriptions.AsNoTracking().ToListAsync();
    }

    // GET by id
    public async Task<Subscription?> GetByIdAsync(int id)
    {
        return await _db.Subscriptions.FindAsync(id);
    }

    // POST
    public async Task<Subscription> CreateAsync(Subscription subscription)
    {
        _db.Subscriptions.Add(subscription);
        await _db.SaveChangesAsync();

        return subscription;
    }

    // PUT
    public async Task<Subscription?> UpdateAsync(int id, Subscription subscription)
    {
        var updated = await _db.Subscriptions.FindAsync(id);
        if (updated is null) return null;

        updated.Name = subscription.Name;
        updated.Price = subscription.Price;

        await _db.SaveChangesAsync();
        return updated;
    }

    // DELETE
    public async Task<bool> DeleteByIdAsync(int id)
    {
        var existing = await _db.Subscriptions.FindAsync(id);
        if (existing is null) return false;

        _db.Subscriptions.Remove(existing);
        await _db.SaveChangesAsync();
        return true;
    }
}
