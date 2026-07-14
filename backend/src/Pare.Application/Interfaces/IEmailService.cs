using Pare.Domain.Entities;

namespace Pare.Application.Interfaces;

public interface IEmailService
{
    Task SendReminderAsync(string toEmail, string toName, IEnumerable<Subscription> subscriptions, string unsubscribeToken);
    Task SendVerificationCodeAsync(string toEmail, string toName, string code);
}
