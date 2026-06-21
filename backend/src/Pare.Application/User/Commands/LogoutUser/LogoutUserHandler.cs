using MediatR;
using Pare.Application.Common;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;

namespace Pare.Application.User.Commands.LogoutUser;

public class LogoutUserHandler(IUserRepository repo)
        : IRequestHandler<LogoutUserCommand, Unit>
{
    private readonly IUserRepository _repo = repo;

    public async Task<Unit> Handle(LogoutUserCommand command, CancellationToken ct)
    {
        var request = command.RefreshToken;

        // Get user data by refresh token
        var user = await _repo.GetByHashedRefreshTokenAsync(TokenHasher.Hash(request.RefreshToken))
            ?? throw new UnauthorizedException("Unauthorized");

        // Update refresh token
        user.RefreshToken = null;
        user.RefreshTokenExpiry = null;

        await _repo.UpdateAsync(user);

        return Unit.Value;
    }
}
