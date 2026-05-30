using Pare.Domain.Entities;

namespace Pare.Application.Interfaces;

public interface IEmailService
{
    Task SendReminderAsync(string toEmail, string toName, IEnumerable<Subscription> subscriptions);
}
