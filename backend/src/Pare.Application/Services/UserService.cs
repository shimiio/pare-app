using Pare.Application.DTOs;
using Pare.Application.Interfaces;
using Pare.Domain.Entities;

namespace Pare.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repo;
    private readonly IPasswordHasher _hasher;

    public UserService(IUserRepository repo, IPasswordHasher hasher)
    {
        _repo = repo;
        _hasher = hasher;
    }

    // POST
    public async Task<User> CreateAsync(CreateUserRequest request)
    {
        string hash = _hasher.Hash(request.Password);

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = hash
        };

        return await _repo.CreateAsync(user);
    }
}
