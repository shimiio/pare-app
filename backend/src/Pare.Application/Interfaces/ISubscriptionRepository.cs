using Pare.Domain.Entities;

namespace Pare.Application.Interfaces;

public interface ISubscriptionRepository
{
    // GET all
    Task<IEnumerable<Subscription>> GetAllAsync(int userId);
    // GET by id
    Task<Subscription?> GetByIdAsync(int id, int userId);
    // POST
    Task<Subscription> CreateAsync(Subscription subscription);
    // PUT
    Task<Subscription?> UpdateAsync(int id, int userId, Subscription subscription);
    // DELETE
    Task<bool> DeleteByIdAsync(int id, int userId);
    Task<IEnumerable<Subscription>> GetActiveWithBillingDateAsync(DateOnly date);
}
