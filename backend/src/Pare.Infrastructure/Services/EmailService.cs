using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Resend;
using Pare.Application.Interfaces;

namespace Pare.Infrastructure.Services;

public class EmailService(IConfiguration config, ILogger<EmailService> logger) : IEmailService
{
    public async Task SendReminderAsync(string toEmail, string toName, IEnumerable<Domain.Entities.Subscription> subscriptions)
    {
        var apiKey = config["Resend:ApiKey"]
            ?? throw new InvalidOperationException("Resend:ApiKey not configured");

        var emailSender = config["Resend:EmailSender"]
            ?? throw new InvalidOperationException("Resend:EmailSender not configured");

        var client = ResendClient.Create(apiKey);

        var nextBillingDate = subscriptions.First().NextBillingDate;

        var rows = string.Join("", subscriptions.Select(s =>
            $"<p>- <strong>{s.Name} - {s.Price} {s.Currency}</strong></p>"));

        var message = new EmailMessage
        {
            From = $"Pare <{emailSender}>",
            To = { toEmail },
            Subject = $"Upcoming charges on {nextBillingDate}",
            HtmlBody = $"""
                <h2>Subscription Reminder</h2>
                <p>Hi {toName},</p>
                <p>Your subscriptions billing on <strong>{nextBillingDate}</strong>:</p>
                {rows}
                <p>— Pare App</p>
                """
        };

        await client.EmailSendAsync(message);

        logger.LogInformation("Reminder sent to {Email}", toEmail);
    }
}
