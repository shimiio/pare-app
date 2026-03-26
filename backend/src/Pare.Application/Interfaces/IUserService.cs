using Pare.Domain.Entities;

namespace Pare.Application.Interfaces;

public interface IUserService
{
    // POST
    Task<User> CreateAsync(User user);
}
