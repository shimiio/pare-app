namespace Pare.Application.Interfaces;

public interface IEmailService
{
    Task SendReminderAsync(string toEmail, string toName, string subscriptionName, decimal price, string currency, DateOnly billingDate);
}
