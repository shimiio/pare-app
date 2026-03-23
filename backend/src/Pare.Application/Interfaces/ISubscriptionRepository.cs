using Pare.Domain.Entities;

namespace Pare.Application.Interfaces;

public interface ISubscriptionRepository
{
    // GET all
    Task<IEnumerable<Subscription>> GetAllAsync();
    // GET by id
    Task<Subscription?> GetByIdAsync(int id);
    // POST
    Task<Subscription> CreateAsync(Subscription subscription);
    // PUT
    Task<Subscription?> UpdateAsync(int id, Subscription subscription);
    // DELETE
    Task<bool> DeleteByIdAsync(int id);
}
