using Microsoft.EntityFrameworkCore;
using Pare.Application.Interfaces;
using Pare.Domain.Entities;
using Pare.Infrastructure.Data;

namespace Pare.Infrastructure.Repositories;

public sealed class EmailVerificationRepository(AppDbContext db) : IEmailVerificationRepository
{
    private readonly AppDbContext _db = db;

    public async Task<EmailVerificationToken> CreateAsync(EmailVerificationToken token, CancellationToken ct)
    {
        _db.EmailVerificationsToken.Add(token);
        await _db.SaveChangesAsync(ct);

        return token;
    }

    public async Task<EmailVerificationToken?> UpdateUsedAtUtcAsync(int userId, EmailVerificationToken token, CancellationToken ct)
    {
        var updated = await _db.EmailVerificationsToken
            .FirstOrDefaultAsync(s => s.Id == token.Id && s.UserId == userId, ct);

        if (updated is null) return null;

        updated.UsedAtUtc = token.UsedAtUtc;

        await _db.SaveChangesAsync(ct);
        return updated;
    }

    public async Task<EmailVerificationToken?> GetValidTokenByUserIdAsync(int userId, CancellationToken ct)
    {
        return await _db.EmailVerificationsToken
            .Where(t => t.UserId == userId && t.UsedAtUtc == null && t.ExpiresAtUtc > DateTime.UtcNow)
            .OrderByDescending(t => t.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);
    }
}
