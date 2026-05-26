using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Pare.Infrastructure.Data;

namespace Pare.Infrastructure.Jobs;

public class TokenCleanupJob(AppDbContext db, ILogger<TokenCleanupJob> logger)
{
    public async Task ExecuteAsync()
    {
        var today = DateTime.UtcNow;

        var count = await db.Users
            .Where(u => u.RefreshToken != null && u.RefreshTokenExpiry <= today)
            .ExecuteUpdateAsync(u => u
                .SetProperty(x => x.RefreshToken, (string?)null)
                .SetProperty(x => x.RefreshTokenExpiry, (DateTime?)null));

        logger.LogInformation("TokenCleanupJob: cleaned {Count} expired tokens", count);
    }
}
