using MediatR;
using Pare.Application.Common;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;

namespace Pare.Application.User.Commands.ChangeUserPassword;

public sealed class ChangeUserPasswordHandler(
    IUserRepository repo,
    IRefreshTokenRepository refreshTokens,
    IPasswordHasher hasher,
    ITransactionManager transactionManager)
        : IRequestHandler<ChangeUserPasswordCommand, Unit>
{
    private readonly IUserRepository _repo = repo;
    private readonly IRefreshTokenRepository _refreshTokens = refreshTokens;
    private readonly IPasswordHasher _hasher = hasher;
    private readonly ITransactionManager _transactionManager = transactionManager;

    public async Task<Unit> Handle(
        ChangeUserPasswordCommand command,
        CancellationToken ct)
    {
        // Get user data
        var existing = await _repo.GetByIdAsync(command.Id, ct) ?? throw new NotFoundException("User not found");

        // Verify password
        bool verify = _hasher.Verify(command.Change.CurrentPassword, existing.PasswordHash);
        if (!verify) throw new UnauthorizedException("Invalid current password");

        // Hash the new password
        string hash = _hasher.Hash(command.Change.NewPassword);
        existing.PasswordHash = hash;

        var keepTokenHash = command.CurrentRefreshToken is null
            ? null
            : TokenHasher.Hash(command.CurrentRefreshToken);

        // A new password must also lock out every other session, or a stolen one would survive it.
        // Both writes commit together, or not at all.
        await _transactionManager.ExecuteInTransactionAsync(async () =>
        {
            await _repo.UpdateAsync(existing, ct);
            await _refreshTokens.DeleteAllForUserExceptAsync(existing.Id, keepTokenHash, ct);
        }, ct);

        // Nothing to return: echoing the DTO would send both passwords back in plain text
        return Unit.Value;
    }
}
