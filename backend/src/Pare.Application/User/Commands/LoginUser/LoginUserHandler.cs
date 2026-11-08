using MediatR;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Application.User.DTOs;
using Pare.Application.Common;
using Pare.Domain.Entities;

namespace Pare.Application.User.Commands.LoginUser;

public sealed class LoginUserHandler(
    IUserRepository repo,
    IRefreshTokenRepository refreshTokens,
    IPasswordHasher hasher,
    IJwtTokenService jwtService)
        : IRequestHandler<LoginUserCommand, AuthResponseDto>
{
    private readonly IUserRepository _repo = repo;
    private readonly IRefreshTokenRepository _refreshTokens = refreshTokens;
    private readonly IPasswordHasher _hasher = hasher;
    private readonly IJwtTokenService _jwtService = jwtService;

    public async Task<AuthResponseDto> Handle(
        LoginUserCommand command,
        CancellationToken ct)
    {
        var request = command.Request;

        // Get user data
        var existing = await _repo.GetByEmailAsync(EmailNormalizer.Normalize(request.Email), ct)
            ?? throw new UnauthorizedException("Invalid email or password");

        // Verify password
        bool verify = _hasher.Verify(request.Password, existing.PasswordHash);
        if (!verify) throw new UnauthorizedException("Invalid email or password");

        // Start a new session for this browser; sessions on other devices stay signed in
        var plainToken = RefreshTokenGenerator.NewPlainToken();
        var now = DateTime.UtcNow;

        await _refreshTokens.CreateAsync(new RefreshToken
        {
            UserId = existing.Id,
            TokenHash = TokenHasher.Hash(plainToken),
            ExpiresAtUtc = now + RefreshTokenGenerator.Lifetime,
            CreatedAtUtc = now
        }, ct);

        // Generate JWT token
        var token = _jwtService.GenerateToken(existing.Id, existing.Email);
        return new AuthResponseDto
        {
            JwtToken = token,
            RefreshToken = plainToken
        };
    }
}
