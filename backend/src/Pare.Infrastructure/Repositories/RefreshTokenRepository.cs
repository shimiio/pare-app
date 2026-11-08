using Microsoft.EntityFrameworkCore;
using Pare.Application.Interfaces;
using Pare.Domain.Entities;
using Pare.Infrastructure.Data;

namespace Pare.Infrastructure.Repositories;

public sealed class RefreshTokenRepository(AppDbContext db) : IRefreshTokenRepository
{
    private readonly AppDbContext _db = db;

    public async Task<RefreshToken> CreateAsync(RefreshToken token, CancellationToken ct)
    {
        _db.RefreshTokens.Add(token);
        await _db.SaveChangesAsync(ct);

        return token;
    }

    public async Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken ct)
    {
        return await _db.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, ct);
    }

    public async Task<bool> RotateAsync(int id, string currentHash, string newHash, DateTime newExpiresAtUtc, CancellationToken ct)
    {
        // A single conditional UPDATE: the database decides the race, not two reads in the app
        var updated = await _db.RefreshTokens
            .Where(t => t.Id == id && t.TokenHash == currentHash)
            .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.TokenHash, newHash)
                .SetProperty(t => t.ExpiresAtUtc, newExpiresAtUtc), ct);

        return updated == 1;
    }

    public async Task DeleteByHashAsync(string tokenHash, CancellationToken ct)
    {
        await _db.RefreshTokens
            .Where(t => t.TokenHash == tokenHash)
            .ExecuteDeleteAsync(ct);
    }

    public async Task DeleteAllForUserExceptAsync(int userId, string? keepTokenHash, CancellationToken ct)
    {
        await _db.RefreshTokens
            .Where(t => t.UserId == userId && t.TokenHash != keepTokenHash)
            .ExecuteDeleteAsync(ct);
    }
}
