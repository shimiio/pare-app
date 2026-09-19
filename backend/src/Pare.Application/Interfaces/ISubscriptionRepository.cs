using Pare.Domain.Entities;

namespace Pare.Application.Interfaces;

public interface ISubscriptionRepository
{
    // GET all
    Task<IEnumerable<Subscription>> GetAllAsync(int userId, CancellationToken ct);
    // GET by id
    Task<Subscription?> GetByIdAsync(int id, int userId, CancellationToken ct);
    // POST
    Task<Subscription> CreateAsync(Subscription subscription, CancellationToken ct);
    // PUT
    Task<Subscription?> UpdateAsync(int id, int userId, Subscription subscription, CancellationToken ct);
    // DELETE
    Task<bool> DeleteByIdAsync(int id, int userId, CancellationToken ct);
    Task<IEnumerable<Subscription>> GetActiveWithBillingDateAsync(DateOnly date, CancellationToken ct);
    // Get subscriptions count by user Id
    Task<int> CountByUserIdAsync(int userId, CancellationToken ct);
}
