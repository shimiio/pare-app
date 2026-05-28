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
    public async Task SendReminderAsync(string toEmail, string toName, string subscriptionName, decimal price, string currency, DateOnly billingDate)
    {
        var apiKey = config["Brevo:ApiKey"] ?? throw new InvalidOperationException("Brevo:ApiKey not configured");

        BrevoConfiguration.Default.ApiKey["api-key"] = apiKey;

        var apiInstance = new TransactionalEmailsApi();

        var email = new SendSmtpEmail(
            sender: new SendSmtpEmailSender(name: "Pare", email: "shimiio.dev@gmail.com"),
            to: [new SendSmtpEmailTo(email: toEmail, name: toName)],
            subject: $"Reminder: {subscriptionName} billing in 3 days",
            htmlContent: $"""
                <h2>Subscription Reminder</h2>
                <p>Hi {toName},</p>
                <p>Your subscription <strong>{subscriptionName}</strong> will be charged 
                <strong>{price} {currency}</strong> on <strong>{billingDate}</strong>.</p>
                <p>— Pare App</p>
                """
        );

        await apiInstance.SendTransacEmailAsync(email);

        logger.LogInformation(
            "Reminder sent to {Email} for subscription {Name}",
            toEmail, subscriptionName);
    }
}
