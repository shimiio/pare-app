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
            PasswordHash = hash,
            Currency = "EUR"
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
            Currency = user.Currency
        };
    }

    // PATCH update Name
    public async Task<UpdateNameDto> UpdateNameAsync(int id, UpdateNameDto update)
    {
        // Get user data
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) throw new NotFoundException("User not found");

        // Update name
        existing.Name = update.Name;
        await _repo.UpdateAsync(existing);

        return update;
    }

    // PATCH change email
    public async Task<ChangeEmailDto> ChangeEmailAsync(int id, ChangeEmailDto change)
    {
        // Get user data
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) throw new NotFoundException("User not found");

        // Check if new email already exists
        var emailExists = await _repo.GetByEmailAsync(change.Email);
        if (emailExists != null) throw new ConflictException("Email already exists");

        // Change email
        existing.Email = change.Email;
        await _repo.UpdateAsync(existing);

        return change;
    }

    // PATCH change password
    public async Task<ChangePasswordDto> ChangePasswordAsync(int id, ChangePasswordDto change)
    {
        // Get user data
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) throw new NotFoundException("User not found");

        // Verify password
        bool verify = _hasher.Verify(change.CurrentPassword, existing.PasswordHash);
        if (!verify) throw new UnauthorizedException("Invalid password");

        // Hash the new password
        string hash = _hasher.Hash(change.NewPassword);
        existing.PasswordHash = hash;

        await _repo.UpdateAsync(existing);

        return change;
    }

    // PATCH update currency
    public async Task<UpdateCurrencyDto> UpdateCurrencyAsync(int id, UpdateCurrencyDto update)
    {
        // Get user data
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) throw new NotFoundException("User not found");

        // Change currency
        existing.Currency = update.Currency;
        await _repo.UpdateAsync(existing);

        return update;
    }

    // DELETE user
    public async Task<bool> DeleteByIdAsync(int id)
    {
        // Get user data
        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) throw new NotFoundException("User not found");

        return await _repo.DeleteByIdAsync(id);
    }
}
