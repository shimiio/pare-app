using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Pare.Domain.Emums;
using Pare.Infrastructure.Data;

namespace Pare.Infrastructure.Jobs;

public class RenewalJob(AppDbContext db, ILogger<RenewalJob> logger)
{
    public async Task ExecuteAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var subscriptions = await db.Subscriptions
            .Where(s => s.Status == Status.Active && s.NextBillingDate <= today)
            .ToListAsync();

        if (subscriptions.Count == 0)
        {
            logger.LogInformation("RenewalJob: no subscriptions to renew");
            return;
        }

        foreach (var subscription in subscriptions)
        {
            subscription.NextBillingDate = subscription.BillingCycle switch
            {
                BillingCycle.Monthly => subscription.NextBillingDate.AddMonths(1),
                BillingCycle.Yearly => subscription.NextBillingDate.AddYears(1),
                BillingCycle.Weekly => subscription.NextBillingDate.AddDays(7),
                _ => subscription.NextBillingDate
            };

            logger.LogInformation(
                "RenewalJob: renewed subscription {Id} for user {UserId}, next billing {Date}",
                subscription.Id, subscription.UserId, subscription.NextBillingDate);
        }

        await db.SaveChangesAsync();
    }
}
