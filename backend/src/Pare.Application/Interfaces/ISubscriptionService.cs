using Pare.Application.DTOs;

namespace Pare.Application.Interfaces;

public interface ISubscriptionService
{
    // GET all
    Task<IEnumerable<SubscriptionDto>> GetAllAsync();
    // GET by id
    Task<SubscriptionDto?> GetByIdAsync(int id);
    // POST
    Task<SubscriptionDto> CreateAsync(SubscriptionWriteDto createDto);
    // PUT
    Task<SubscriptionDto?> UpdateAsync(int id, SubscriptionWriteDto updateDto);
    // DELETE
    Task<bool> DeleteByIdAsync(int id);
}
