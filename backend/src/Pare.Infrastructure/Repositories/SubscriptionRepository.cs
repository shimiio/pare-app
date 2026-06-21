using Microsoft.EntityFrameworkCore;
using Pare.Domain.Entities;
using Pare.Application.Interfaces;
using Pare.Infrastructure.Data;

namespace Pare.Infrastructure.Repositories;

public class SubscriptionRepository(AppDbContext db) : ISubscriptionRepository
{
    private readonly AppDbContext _db = db;

    // GET all
    public async Task<IEnumerable<Subscription>> GetAllAsync(int userId)
    {
        return await _db.Subscriptions
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .ToListAsync();
    }

    // GET by id
    public async Task<Subscription?> GetByIdAsync(int id, int userId)
    {
        return await _db.Subscriptions
            .AsNoTracking()
            .Where(s => s.Id == id && s.UserId == userId)
            .FirstOrDefaultAsync();
    }

    // POST
    public async Task<Subscription> CreateAsync(Subscription subscription)
    {
        _db.Subscriptions.Add(subscription);
        await _db.SaveChangesAsync();

        return subscription;
    }

    // PUT
    public async Task<Subscription?> UpdateAsync(int id, int userId, Subscription subscription)
    {
        var updated = await _db.Subscriptions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (updated is null) return null;

        updated.Name = subscription.Name;
        updated.Price = subscription.Price;
        updated.Currency = subscription.Currency;
        updated.BillingCycle = subscription.BillingCycle;
        updated.Status = subscription.Status;
        updated.NextBillingDate = subscription.NextBillingDate;
        updated.StartDate = subscription.StartDate;
        updated.ServiceUrl = subscription.ServiceUrl;

        await _db.SaveChangesAsync();
        return updated;
    }

    // DELETE
    public async Task<bool> DeleteByIdAsync(int id, int userId)
    {
        int rowsDeleted = await _db.Subscriptions
            .Where(s => s.Id == id && s.UserId == userId)
            .ExecuteDeleteAsync();

        return rowsDeleted > 0;
    }

    public async Task<IEnumerable<Subscription>> GetActiveWithBillingDateAsync(DateOnly reminderDate)
    {
        return await _db.Subscriptions
            .Include(s => s.User)
            .Where(s => s.Status == Domain.Emums.Status.Active && s.NextBillingDate == reminderDate)
            .ToListAsync();
    }

    public async Task<int> CountByUserIdAsync(int userId)
    {
        return await _db.Subscriptions
            .CountAsync(s => s.UserId == userId);
    }
}
