using MediatR;
using Pare.Application.Common;
using Pare.Application.Interfaces;

namespace Pare.Application.User.Commands.LogoutUser;

public sealed class LogoutUserHandler(IRefreshTokenRepository refreshTokens)
        : IRequestHandler<LogoutUserCommand, Unit>
{
    private readonly IRefreshTokenRepository _refreshTokens = refreshTokens;

    public async Task<Unit> Handle(LogoutUserCommand command, CancellationToken ct)
    {
        // End only this browser's session. An unknown token (already expired, or revoked by a
        // password change elsewhere) is not an error: the result is the same, the user is logged out.
        await _refreshTokens.DeleteByHashAsync(TokenHasher.Hash(command.RefreshToken.RefreshToken), ct);

        return Unit.Value;
    }
}
