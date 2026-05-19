using Pare.Domain.Entities;

namespace Pare.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(int id);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task<bool> DeleteByIdAsync(int id);
}
