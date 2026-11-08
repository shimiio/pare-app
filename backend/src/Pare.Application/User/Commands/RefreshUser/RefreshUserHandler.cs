using MediatR;
using Pare.Application.Common;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.RefreshUser;

public sealed class RefreshUserHandler(IRefreshTokenRepository refreshTokens, IJwtTokenService jwtService)
        : IRequestHandler<RefreshUserCommand, AuthResponseDto>
{
    private readonly IRefreshTokenRepository _refreshTokens = refreshTokens;
    private readonly IJwtTokenService _jwtService = jwtService;

    public async Task<AuthResponseDto> Handle(RefreshUserCommand command, CancellationToken ct)
    {
        var request = command.RefreshToken;

        // Find this browser's session
        var session = await _refreshTokens.GetByHashAsync(TokenHasher.Hash(request.RefreshToken), ct)
            ?? throw new UnauthorizedException("Unauthorized");

        // Validate DateTime of refresh token
        if (session.ExpiresAtUtc < DateTime.UtcNow)
            throw new UnauthorizedException("Unauthorized");

        // Rotate only this session; the user's other devices keep their own tokens
        var plainToken = RefreshTokenGenerator.NewPlainToken();
        var rotated = await _refreshTokens.RotateAsync(
            session.Id,
            session.TokenHash,
            TokenHasher.Hash(plainToken),
            DateTime.UtcNow + RefreshTokenGenerator.Lifetime,
            ct);

        // Another request already rotated this token between the read and the update
        if (!rotated) throw new UnauthorizedException("Unauthorized");

        // Generate JWT token
        var token = _jwtService.GenerateToken(session.User.Id, session.User.Email);
        return new AuthResponseDto
        {
            JwtToken = token,
            RefreshToken = plainToken
        };
    }
}
