using Microsoft.Extensions.Logging;
using Pare.Application.Interfaces;

namespace Pare.Application.Services;

public class ReminderService(IEmailService emailService, ISubscriptionRepository subscriptionRepository, ILogger<ReminderService> logger) : IReminderService
{
    public async Task ExecuteAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var reminderDate = today.AddDays(3);

        var subscriptions = (await subscriptionRepository.GetActiveWithBillingDateAsync(reminderDate)).ToList();

        if (subscriptions.Count == 0)
        {
            logger.LogInformation("ReminderService: no reminders to send today");
            return;
        }

        var grouped = subscriptions.GroupBy(s => s.User).ToList();

        foreach (var group in grouped)
        {
            await emailService.SendReminderAsync(
                toEmail: group.Key.Email,
                toName: group.Key.Name,
                subscriptions: [.. group]);
        }

        logger.LogInformation("ReminderService: sent {Count} reminder emails for {SubCount} subscriptions", 
            grouped.Count, 
            subscriptions.Count);
    }
}