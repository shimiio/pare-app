using Pare.Application.DTOs;
using Pare.Application.Interfaces;
using Pare.Application.Exceptions;
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
        if (existing != null) throw new ConflictException("Email already exists");

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
        if (existing is null) throw new UnauthorizedException("Invalid email or password");

        // Verify password
        bool verify = _hasher.Verify(request.Password, existing.PasswordHash);
        if (!verify) throw new UnauthorizedException("Invalid email or password");

        // Generate JWT token
        var token = _jwtService.GenerateToken(existing.Id, existing.Email);
        var jwtToken = new AuthResponseDto
        {
            JwtToken = token
        };

        return jwtToken;
    }

    // GET user data
    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _repo.GetByIdAsync(id);
        if (user is null) throw new NotFoundException("User not found");

        return new UserDto
        {
            Name = user.Name,
            Email = user.Email,
        };
    }

    // PUT update username
    public async Task<UpdateUsernameDto> UpdateUsernameAsync(int id, UpdateUsernameDto change)
    {
        // Get user data
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) throw new NotFoundException("User not found");

        // Update username
        existing.Name = change.Username;
        await _repo.UpdateAsync(existing);

        return change;
    }

    // PUT change email
    public async Task<ChangeEmailDto> ChangeEmailAsync(int id, ChangeEmailDto change)
    {
        return change;
    }

    // PUT change password
    public async Task<ChangePasswordDto> ChangePasswordAsync(int id, ChangePasswordDto change)
    {
        return change;
    }

    // PUT update default currency
    public async Task<UpdateDefaultCurrencyDto> UpdateDefaultCurrencyAsync(int id, UpdateDefaultCurrencyDto change)
    {
        return change;
    }

    // DELETE user
    public async Task<bool> DeleteByIdAsync(int id)
    {
        return false;
    }
}
