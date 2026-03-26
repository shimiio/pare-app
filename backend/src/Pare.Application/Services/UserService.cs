using Pare.Application.Interfaces;
using Pare.Domain.Entities;

namespace Pare.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repo;

    public UserService(IUserRepository repo)
    {
        _repo = repo;
    }

    // POST
    public async Task<User> CreateAsync(User user)
    {
        var created = await _repo.CreateAsync(user);
        return created;
    }
}
