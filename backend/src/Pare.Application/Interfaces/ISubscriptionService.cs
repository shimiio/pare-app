using Pare.Application.DTOs;

namespace Pare.Application.Interfaces;

public interface ISubscriptionService
{
    // GET all
    Task<IEnumerable<SubscriptionDto>> GetAllAsync(int userId);
    // GET by id
    Task<SubscriptionDto?> GetByIdAsync(int id, int userId);
    // POST
    Task<SubscriptionDto> CreateAsync(int userId, SubscriptionWriteDto createDto);
    // PUT
    Task<SubscriptionDto?> UpdateAsync(int id, int userId, SubscriptionWriteDto updateDto);
    // DELETE
    Task<bool> DeleteByIdAsync(int id, int userId);
}
