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

    // POST register
    public async Task<User?> RegisterAsync(RegisterRequest request)
    {
        // Check if email already exists
        var existing = await _repo.GetByEmailAsync(request.Email);
        if (existing != null) return null;

        // Hash the password
        string hash = _hasher.Hash(request.Password);

        // Create the user
        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = hash
        };

        var created = await _repo.CreateAsync(user);

        return created;
    }
}
