using Microsoft.EntityFrameworkCore;
using Pare.Application.Interfaces;
using Pare.Infrastructure.Data;
using Pare.Domain.Entities;

namespace Pare.Infrastructure.Repositories;

public class UnsubscribeTokenRepository(AppDbContext db) : IUnsubscribeTokenRepository
{
    private readonly AppDbContext _db = db;

    public async Task<UnsubscribeToken> CreateAsync(UnsubscribeToken token)
    {
        _db.UnsubscribeToken.Add(token);
        await _db.SaveChangesAsync();

        return token;
    }

    public async Task<UnsubscribeToken?> GetByUserIdAsync(int userId)
    {
        return await _db.UnsubscribeToken.FirstOrDefaultAsync(u => u.UserId == userId);
    }

    public async Task<UnsubscribeToken?> GetByTokenAsync(string token)
    {
        return await _db.UnsubscribeToken.FirstOrDefaultAsync(u => u.Token == token);
    }
}
