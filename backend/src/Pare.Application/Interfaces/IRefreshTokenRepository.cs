using Pare.Domain.Entities;

namespace Pare.Application.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken> CreateAsync(RefreshToken token, CancellationToken ct);

    // Includes the owning user, which the caller needs to issue a JWT
    Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken ct);

    // Swaps the hash only if it is still currentHash: of two requests racing with the same
    // token, exactly one wins. Returns false for the loser.
    Task<bool> RotateAsync(int id, string currentHash, string newHash, DateTime newExpiresAtUtc, CancellationToken ct);

    Task DeleteByHashAsync(string tokenHash, CancellationToken ct);

    // Ends every session of the user except the one with keepTokenHash (null ends all of them)
    Task DeleteAllForUserExceptAsync(int userId, string? keepTokenHash, CancellationToken ct);
}
