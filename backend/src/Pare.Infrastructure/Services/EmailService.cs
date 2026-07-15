using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Resend;
using Pare.Application.Interfaces;

namespace Pare.Infrastructure.Services;

public class EmailService(IConfiguration config, ILogger<EmailService> logger) : IEmailService
{
    public async Task SendReminderAsync(string toEmail, string toName, IEnumerable<Domain.Entities.Subscription> subscriptions, string unsubscribeToken)
    {
        var apiKey = config["Resend:ApiKey"]
            ?? throw new InvalidOperationException("Resend:ApiKey not configured");

        var emailSender = config["Resend:EmailSender"]
            ?? throw new InvalidOperationException("Resend:EmailSender not configured");

        var client = ResendClient.Create(apiKey);

        var nextBillingDate = subscriptions.First().NextBillingDate.ToString("dd/MM/yyyy");

        var baseUrl = config["App:BaseUrl"] ?? "http://localhost:5000";
        var unsubscribeUrl = $"{baseUrl}/unsubscribe?token={unsubscribeToken}";

        // html
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

        // text
        var textRows = string.Join("\n", subscriptions.Select(s =>
            $"- {s.Name}: {s.Price} {s.Currency}"));

        var textBody = $"""
            Subscription Reminder

            Hi {toName},

            Your subscriptions billing on {nextBillingDate}:

            {textRows}

            — Pare App

            Unsubscribe: {unsubscribeUrl}
            """;

        var message = new EmailMessage
        {
            From = $"Pare <{emailSender}>",
            To = { toEmail },
            Subject = $"Upcoming charges on {nextBillingDate}",
            HtmlBody = EmailTemplate.Wrap("Subscription Reminder", body, footer),
            TextBody = textBody
        };

        await client.EmailSendAsync(message);

        logger.LogInformation("Reminder sent to {Email}", toEmail);
    }

    public async Task SendVerificationCodeAsync(string toEmail, string toName, string code)
    {
        var apiKey = config["Resend:ApiKey"]
            ?? throw new InvalidOperationException("Resend:ApiKey not configured");

        var emailSender = config["Resend:EmailSender"]
            ?? throw new InvalidOperationException("Resend:EmailSender not configured");

        var client = ResendClient.Create(apiKey);

        // html
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

        // text
        var textBody = $"""
            Email Verification

            Hi {toName},

            Your verification code is: {code}

            This code expires in 10 minutes. If you didn't request this, just ignore this email.

            — Pare App
            """;

        var message = new EmailMessage
        {
            From = $"Pare <{emailSender}>",
            To = { toEmail },
            Subject = "Your verification code",
            HtmlBody = EmailTemplate.Wrap("Email Verification", body),
            TextBody = textBody
        };

        await client.EmailSendAsync(message);

        logger.LogInformation("Verification code sent to {Email}", toEmail);
    }
}
