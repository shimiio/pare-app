using Pare.Application.DTOs;
using Pare.Application.Interfaces;
using Pare.Domain.Entities;

namespace Pare.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repo;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwtService;

    public UserService(IUserRepository repo, IPasswordHasher hasher, IJwtTokenService jwtService)
    {
        _repo = repo;
        _hasher = hasher;
        _jwtService = jwtService;
    }

    // POST register
    public async Task<AuthResponseDto?> RegisterAsync(RegisterRequest request)
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

        // Create user
        await _repo.CreateAsync(user);

        // Generate JWT token
        var token = _jwtService.GenerateToken(user.Id, user.Email);
        var jwtToken = new AuthResponseDto
        {
            JwtToken = token
        };

        return jwtToken;
    }

    // POST login
    public async Task<AuthResponseDto?> LoginAsync(LoginRequest request)
    {
        // Get user data
        var existing = await _repo.GetByEmailAsync(request.Email);
        if (existing == null) return null;

        // Verify password
        bool verify = _hasher.Verify(request.Password, existing.PasswordHash);
        if (!verify) return null;

        // Generate JWT token
        var token = _jwtService.GenerateToken(existing.Id, existing.Email);
        var jwtToken = new AuthResponseDto
        {
            JwtToken = token
        };

        return jwtToken;
    }
}
