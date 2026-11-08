using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Pare.Infrastructure.Data;

namespace Pare.Infrastructure.Jobs;

public sealed class TokenCleanupJob(AppDbContext db, ILogger<TokenCleanupJob> logger)
{
    public async Task ExecuteAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;

        // Sessions nobody refreshed for the whole lifetime: the browser is gone or was never reopened
        var count = await db.RefreshTokens
            .Where(t => t.ExpiresAtUtc <= now)
            .ExecuteDeleteAsync(ct);

        logger.LogInformation("TokenCleanupJob: deleted {Count} expired refresh tokens", count);
    }
}
