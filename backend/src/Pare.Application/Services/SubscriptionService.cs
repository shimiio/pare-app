using Pare.Application.Interfaces;
using Pare.Domain.Entities;

namespace Pare.Application.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly ISubscriptionRepository _repo;

    public SubscriptionService(ISubscriptionRepository repo)
    {
        _repo = repo;
    }

    // GET all
    public async Task<IEnumerable<Subscription>> GetAllAsync()
    {
        var subscriptions = await _repo.GetAllAsync();
        return subscriptions.Select(ToSubscription);
    }

    // GET by id
    public async Task<Subscription?> GetByIdAsync(int id)
    {
        var subscription = await _repo.GetByIdAsync(id);
        return subscription is null ? null : ToSubscription(subscription);
    }

    // POST
    public async Task<Subscription> CreateAsync(Subscription subscription)
    {
        var created = await _repo.CreateAsync(subscription);
        return ToSubscription(created);
    }

    // PUT
    public async Task<Subscription?> UpdateAsync(int id, Subscription subscription)
    {
        var updated = await _repo.UpdateAsync(id, subscription);
        return updated is null ? null : ToSubscription(updated);
    }

    // DELETE
    public async Task<bool> DeleteByIdAsync(int id)
    {
        return await _repo.DeleteByIdAsync(id);
    }

    private static Subscription ToSubscription(Subscription subscription) => new Subscription
    {
        Id = subscription.Id,
        Name = subscription.Name,
        Price = subscription.Price,
        Currency = subscription.Currency,
        NextBillingDate = subscription.NextBillingDate,
        StartDate = subscription.StartDate
    };
}
