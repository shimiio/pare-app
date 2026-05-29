using Microsoft.Extensions.Logging;
using Pare.Application.Interfaces;

namespace Pare.Application.Services;

public class ReminderService(IEmailService emailService, ISubscriptionRepository subscriptionRepository, ILogger<ReminderService> logger) : IReminderService
{
    public async Task ExecuteAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var reminderDate = today.AddDays(3);

        var subscriptions = await subscriptionRepository.GetActiveWithBillingDateAsync(reminderDate);

        if (!subscriptions.Any())
        {
            logger.LogInformation("ReminderService: no reminders to send today");
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

        logger.LogInformation("ReminderService: sent {Count} reminders", subscriptions.Count());
    }
}
