using Microsoft.EntityFrameworkCore;
using Pare.Application.Interfaces;
using Pare.Domain.Entities;
using Pare.Infrastructure.Data;

namespace Pare.Infrastructure.Repositories;

public class EmailVerificationRepository(AppDbContext db) : IEmailVerificationRepository
{
    private readonly AppDbContext _db = db;

    public async Task<EmailVerificationToken> CreateAsync(EmailVerificationToken token)
    {
        _db.EmailVerificationsToken.Add(token);
        await _db.SaveChangesAsync();

        return token;
    }

    public async Task<EmailVerificationToken?> UpdateUsedAtUtcAsync(int userId, EmailVerificationToken token)
    {
        var updated = await _db.EmailVerificationsToken
            .FirstOrDefaultAsync(s => s.Id == token.Id && s.UserId == userId);

        if (updated is null) return null;

        updated.UsedAtUtc = token.UsedAtUtc;

        await _db.SaveChangesAsync();
        return updated;
    }

    public async Task<EmailVerificationToken?> GetValidTokenByUserIdAsync(int userId)
    {
        return await _db.EmailVerificationsToken
            .Where(t => t.UserId == userId && t.UsedAtUtc == null && t.ExpiresAtUtc > DateTime.UtcNow)
            .OrderByDescending(t => t.CreatedAtUtc)
            .FirstOrDefaultAsync();
    }
}
