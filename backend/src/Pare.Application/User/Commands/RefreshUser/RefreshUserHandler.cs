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
        var presentedHash = TokenHasher.Hash(command.RefreshToken.RefreshToken);
        var now = DateTime.UtcNow;

        // Find this browser's session
        var session = await _refreshTokens.GetByHashAsync(presentedHash, ct)
            ?? throw new UnauthorizedException("Unauthorized");

        // Validate DateTime of refresh token
        if (session.ExpiresAtUtc < now)
            throw new UnauthorizedException("Unauthorized");

        // The cookie holds the token this session had before its last rotation: another tab, or a
        // duplicate request, rotated it a moment ago. The browser already has the new cookie from
        // that response (all tabs share one), so answer with a JWT and leave the cookie alone.
        if (session.TokenHash != presentedHash)
        {
            if (session.RotatedAtUtc is null || now - session.RotatedAtUtc > RefreshTokenGenerator.RotationGracePeriod)
                throw new UnauthorizedException("Unauthorized");

            return JwtOnly(session.User);
        }

        // Rotate only this session; the user's other devices keep their own tokens
        var plainToken = RefreshTokenGenerator.NewPlainToken();
        var rotated = await _refreshTokens.RotateAsync(
            session.Id,
            presentedHash,
            TokenHasher.Hash(plainToken),
            now + RefreshTokenGenerator.Lifetime,
            ct);

        // Another request rotated this token between our read and our update: the same race as
        // above, just a few milliseconds later, so it gets the same answer
        if (!rotated) return JwtOnly(session.User);

        return new AuthResponseDto
        {
            JwtToken = _jwtService.GenerateToken(session.User.Id, session.User.Email),
            RefreshToken = plainToken
        };
    }

    private AuthResponseDto JwtOnly(Domain.Entities.User user) => new()
    {
        JwtToken = _jwtService.GenerateToken(user.Id, user.Email),
        RefreshToken = null
    };
}
