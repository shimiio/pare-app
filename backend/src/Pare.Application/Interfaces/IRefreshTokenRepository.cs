using Pare.Domain.Entities;

namespace Pare.Application.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken> CreateAsync(RefreshToken token, CancellationToken ct);

    // Finds the session whose current OR previous hash matches. Includes the owning user,
    // which the caller needs to issue a JWT.
    Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken ct);

    // Swaps the hash only if it is still currentHash, keeping currentHash as the previous one:
    // of two requests racing with the same token, exactly one rotates. Returns false for the other.
    Task<bool> RotateAsync(int id, string currentHash, string newHash, DateTime newExpiresAtUtc, CancellationToken ct);

    Task DeleteByHashAsync(string tokenHash, CancellationToken ct);

    // Ends every session of the user except the one with keepTokenHash (null ends all of them)
    Task DeleteAllForUserExceptAsync(int userId, string? keepTokenHash, CancellationToken ct);
}
