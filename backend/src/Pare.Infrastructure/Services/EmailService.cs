using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Task = System.Threading.Tasks.Task;
using brevo_csharp.Api;
using BrevoConfiguration = brevo_csharp.Client.Configuration;
using brevo_csharp.Model;
using Pare.Application.Interfaces;

namespace Pare.Infrastructure.Services;

public class EmailService(IConfiguration config, ILogger<EmailService> logger) : IEmailService
{
    public async Task SendReminderAsync(string toEmail, string toName, IEnumerable<Domain.Entities.Subscription> subscriptions)
    {
        var emailSender = config["Brevo:EmailSender"]
            ?? throw new InvalidOperationException("Brevo:EmailSender not configured");

        BrevoConfiguration.Default.ApiKey["api-key"] = config["Brevo:ApiKey"]
            ?? throw new InvalidOperationException("Brevo:ApiKey not configured");

        var apiInstance = new TransactionalEmailsApi();

        var nextBillingDate = subscriptions.First().NextBillingDate;

        var rows = string.Join("", subscriptions.Select(s =>
            $"<p>- <strong>{s.Name} — {s.Price} {s.Currency}</strong></p>"));

        var email = new SendSmtpEmail(
            sender: new SendSmtpEmailSender(name: "Pare", email: emailSender),
            to: [new SendSmtpEmailTo(email: toEmail, name: toName)],
            subject: $"Upcoming charges on {nextBillingDate}",
            htmlContent: $"""
                <h2>Subscription Reminder</h2>
                <p>Hi {toName},</p>
                <p>Your subscriptions billing on <strong>{nextBillingDate}</strong>:</p>
                {rows}
                <p>— Pare App</p>
                """
        );

        await apiInstance.SendTransacEmailAsync(email);

        logger.LogInformation(
            "Reminder sent to {Email}",
            toEmail);
    }
}
