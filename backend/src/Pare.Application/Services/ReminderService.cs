using Microsoft.Extensions.Logging;
using Pare.Application.Interfaces;

namespace Pare.Application.Services;

public class ReminderService(IEmailService emailService, ISubscriptionRepository subscriptionRepository, ILogger<ReminderService> logger) : IReminderService
{
    public async Task ExecuteAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var reminderDate = today.AddDays(3);

        // get subscriptions
        var subscriptions = await subscriptionRepository.GetActiveWithBillingDateAsync(reminderDate);

        if (!subscriptions.Any())
        {
            logger.LogInformation("ReminderService: no reminders to send today");
            return;
        }

        // Group subscriptions by user
        var grouped = subscriptions.GroupBy(s => s.User);

        foreach (var group in grouped)
        {
            await emailService.SendReminderAsync(
                toEmail: group.Key.Email,
                toName: group.Key.Name,
                subscriptions: [.. group]);
        }

        logger.LogInformation("ReminderService: sent {Count} reminders", subscriptions.Count());
    }
}
