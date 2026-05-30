using System.Security.Cryptography;
using MediatR;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.LoginUser;

public class LoginUserHandler(IUserRepository repo, IPasswordHasher hasher, IJwtTokenService jwtService)
        : IRequestHandler<LoginUserCommand, AuthResponseDto>
{
    private readonly IUserRepository _repo = repo;
    private readonly IPasswordHasher _hasher = hasher;
    private readonly IJwtTokenService _jwtService = jwtService;

    public async Task<AuthResponseDto> Handle(
        LoginUserCommand command,
        CancellationToken ct)
    {
        var request = command.Request;

        // Get user data
        var existing = await _repo.GetByEmailAsync(request.Email) ?? throw new UnauthorizedException("Invalid email or password");

        // Verify password
        bool verify = _hasher.Verify(request.Password, existing.PasswordHash);
        if (!verify) throw new UnauthorizedException("Invalid email or password");

        // Generate refresh token
        var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        // Create refresh token expiry
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(30);

        // Update user with new refresh token and expiry
        existing.RefreshToken = refreshToken;
        existing.RefreshTokenExpiry = refreshTokenExpiry;

        // Add generated token
        await _repo.UpdateAsync(existing);

        // Generate JWT token
        var token = _jwtService.GenerateToken(existing.Id, existing.Email);
        var jwtToken = new AuthResponseDto
        {
            JwtToken = token,
            RefreshToken = refreshToken
        };

        return jwtToken;
    }
}
