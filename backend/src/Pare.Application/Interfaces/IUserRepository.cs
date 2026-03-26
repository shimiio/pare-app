using Pare.Domain.Entities;

namespace Pare.Application.Interfaces;

public interface IUserRepository
{
    // POST
    Task<User> CreateAsync(User user);
}
