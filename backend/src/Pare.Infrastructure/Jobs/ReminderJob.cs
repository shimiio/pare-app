using Microsoft.Extensions.Logging;
using Pare.Application.Interfaces;

namespace Pare.Infrastructure.Jobs;

public class ReminderJob(IEmailService emailService, ISubscriptionRepository subscriptionRepository, ILogger<ReminderJob> logger)
{
    public async Task ExecuteAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var reminderDate = today.AddDays(3);

        var subscriptions = await subscriptionRepository.GetActiveWithBillingDateAsync(reminderDate);

        if (!subscriptions.Any())
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

        logger.LogInformation("ReminderJob: sent {Count} reminders", subscriptions.Count());
    }
}
