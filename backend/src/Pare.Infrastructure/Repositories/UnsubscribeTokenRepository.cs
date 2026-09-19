using Microsoft.EntityFrameworkCore;
using Pare.Application.Interfaces;
using Pare.Infrastructure.Data;
using Pare.Domain.Entities;

namespace Pare.Infrastructure.Repositories;

public class UnsubscribeTokenRepository(AppDbContext db) : IUnsubscribeTokenRepository
{
    private readonly AppDbContext _db = db;

    public async Task<UnsubscribeToken> CreateAsync(UnsubscribeToken token, CancellationToken ct)
    {
        _db.UnsubscribeToken.Add(token);
        await _db.SaveChangesAsync(ct);

        return token;
    }

    public async Task<UnsubscribeToken?> GetByUserIdAsync(int userId, CancellationToken ct)
    {
        return await _db.UnsubscribeToken.FirstOrDefaultAsync(u => u.UserId == userId, ct);
    }

    public async Task<UnsubscribeToken?> GetByTokenAsync(string token, CancellationToken ct)
    {
        return await _db.UnsubscribeToken.FirstOrDefaultAsync(u => u.Token == token, ct);
    }
}
