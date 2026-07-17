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
            $"""
                <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#e5e5e5;font-size:15px;">
                        {s.Name}
                    </td>
                    <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#e5e5e5;font-size:15px;text-align:right;font-weight:600;">
                        {s.Price} {s.Currency}
                    </td>
                </tr>
            """));

        var baseUrl = config["App:BaseUrl"] ?? "http://localhost:5000";
        var unsubscribeUrl = $"{baseUrl}/unsubscribe?token={unsubscribeToken}";

        var body = $"""
            <p style="margin:0 0 4px 0;color:#e5e5e5;font-size:15px;">
                Hi {toName},
            </p>
            <p style="margin:0 0 20px 0;color:#a3a3a3;font-size:14px;">
                Billing on <strong style="color:#e5e5e5;">{nextBillingDate}</strong>
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                {rows}
            </table>
            """;

        var footer = $"""
            <p style="margin:0 0 16px 0;color:#666;font-size:13px;">— Pare App</p>
            <a href="{unsubscribeUrl}" style="color:#666;font-size:12px;text-decoration:underline;">
                Unsubscribe from these emails
            </a>
            """;

        var message = new MailMessage
        {
            From = new MailAddress("noreply@pare.dev", "Pare"),
            Subject = $"Upcoming charges on {nextBillingDate}",
            IsBodyHtml = true,
            Body = EmailTemplate.Wrap("Subscription Reminder", body, footer)
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

        var body = $"""
            <p style="margin:0 0 4px 0;color:#e5e5e5;font-size:15px;">
                Hi {toName},
            </p>
            <p style="margin:0 0 20px 0;color:#a3a3a3;font-size:14px;">
                Your verification code is:
            </p>
            <p style="margin:0 0 20px 0;text-align:center;">
                <span style="display:inline-block;background-color:#0d0d0d;border:1px solid #262626;border-radius:8px;padding:14px 24px;color:#ffffff;font-size:32px;font-weight:700;letter-spacing:0.15em;">
                    {code}
                </span>
            </p>
            <p style="margin:0;color:#666;font-size:13px;">
                This code expires in 10 minutes. If you didn't request this, just ignore this email.
            </p>
            """;

        var message = new MailMessage
        {
            From = new MailAddress("noreply@pare.dev", "Pare"),
            Subject = "Your verification code",
            IsBodyHtml = true,
            Body = EmailTemplate.Wrap("Email Verification", body)
        };

        message.To.Add(new MailAddress(toEmail, toName));

        await client.SendMailAsync(message);

        logger.LogInformation("Verification code sent to {Email}", toEmail);
    }
}
