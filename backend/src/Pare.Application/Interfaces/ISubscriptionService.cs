using Pare.Domain.Models;

namespace Pare.Application.Interfaces;

public interface ISubscriptionService
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
