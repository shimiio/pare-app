using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Pare.Application.Interfaces;

namespace Pare.Infrastructure.Services;

public class SmtpEmailService(IConfiguration config, ILogger<SmtpEmailService> logger) : IEmailService
{
    public async Task SendReminderAsync(string toEmail, string toName, IEnumerable<Domain.Entities.Subscription> subscriptions)
    {
        var host = config["Email:Host"] ?? "localhost";
        var port = int.Parse(config["Email:Port"] ?? "1025");

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = false,
            Credentials = CredentialCache.DefaultNetworkCredentials
        };

        var nextBillingDate = subscriptions.First().NextBillingDate;

        var rows = string.Join("", subscriptions.Select(s =>
            $"<p>- <strong>{s.Name} — {s.Price} {s.Currency}</strong></p>"));

        var message = new MailMessage
        {
            From = new MailAddress("noreply@pare.dev", "Pare"),
            Subject = $"Upcoming charges on {nextBillingDate}",
            IsBodyHtml = true,
            Body = $"""
                <h2>Subscription Reminder</h2>
                <p>Hi {toName},</p>
                <p>Your subscriptions billing on <strong>{nextBillingDate}</strong>:</p>
                {rows}
                <p>— Pare App</p>
                """
        };
        message.To.Add(new MailAddress(toEmail, toName));

        await client.SendMailAsync(message);

        logger.LogInformation(
            "Reminder sent to {Email}",
            toEmail);
    }
}
