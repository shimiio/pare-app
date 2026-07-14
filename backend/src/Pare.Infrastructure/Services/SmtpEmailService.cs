using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Pare.Application.Interfaces;

namespace Pare.Infrastructure.Services;

public class SmtpEmailService(IConfiguration config, ILogger<SmtpEmailService> logger) : IEmailService
{
    public async Task SendReminderAsync(string toEmail, string toName, IEnumerable<Domain.Entities.Subscription> subscriptions, string unsubscribeToken)
    {
        var host = config["Email:Host"] ?? "localhost";
        var port = int.Parse(config["Email:Port"] ?? "1025");

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = false,
            Credentials = CredentialCache.DefaultNetworkCredentials
        };

        var nextBillingDate = subscriptions.First().NextBillingDate.ToString("dd/MM/yyyy");

        var rows = string.Join("", subscriptions.Select(s =>
            $"<p>- <strong>{s.Name} - {s.Price} {s.Currency}</strong></p>"));

        var baseUrl = config["App:BaseUrl"] ?? "http://localhost:5000";
        var unsubscribeUrl = $"{baseUrl}/unsubscribe?token={unsubscribeToken}";

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
                <p style="font-size:12px;color:#999;">
                    <a href="{unsubscribeUrl}">Unsubscribe from these emails</a>
                </p>
                """
        };
        message.To.Add(new MailAddress(toEmail, toName));

        await client.SendMailAsync(message);

        logger.LogInformation(
            "Reminder sent to {Email}",
            toEmail);
    }

    public async Task SendVerificationCodeAsync(string toEmail, string toName, string code)
    {
        var host = config["Email:Host"] ?? "localhost";
        var port = int.Parse(config["Email:Port"] ?? "1025");

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = false,
            Credentials = CredentialCache.DefaultNetworkCredentials
        };

        var message = new MailMessage
        {
            From = new MailAddress("noreply@pare.dev", "Pare"),
            Subject = "Your verification code",
            IsBodyHtml = true,
            Body = $"""
            <h2>Email Verification</h2>
            <p>Hi {toName},</p>
            <p>Your verification code is:</p>
            <h1>{code}</h1>
            <p>This code expires in 10 minutes. If you didn't request this, just ignore this email.</p>
            <p>— Pare App</p>
            """
        };
        message.To.Add(new MailAddress(toEmail, toName));

        await client.SendMailAsync(message);

        logger.LogInformation("Verification code sent to {Email}", toEmail);
    }
}
