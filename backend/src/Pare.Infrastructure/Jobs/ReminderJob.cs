using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Pare.Domain.Emums;
using Pare.Infrastructure.Data;
using Pare.Infrastructure.Services;

namespace Pare.Infrastructure.Jobs;

public class ReminderJob(AppDbContext db, EmailService emailService, ILogger<ReminderJob> logger)
{
    public async Task ExecuteAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var reminderDate = today.AddDays(3);

        var subscriptions = await db.Subscriptions
            .Include(s => s.User)
            .Where(s => s.Status == Status.Active && s.NextBillingDate == reminderDate)
            .ToListAsync();

        if (subscriptions.Count == 0)
        {
            logger.LogInformation("ReminderJob: no reminders to send today");
            return;
        }

        foreach (var subscription in subscriptions)
        {
            await emailService.SendReminderAsync(
                toEmail: subscription.User.Email,
                toName: subscription.User.Name,
                subscriptionName: subscription.Name,
                price: subscription.Price,
                currency: subscription.Currency,
                billingDate: subscription.NextBillingDate
            );
        }

        logger.LogInformation("ReminderJob: sent {Count} reminders", subscriptions.Count);
    }
}
