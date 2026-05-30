using Pare.Domain.Emums;
using Pare.Domain.Entities;

namespace Pare.Application.Subscriptions.DTOs;

public class SubscriptionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public BillingCycle BillingCycle { get; set; }
    public Status Status { get; set; }
    public DateOnly NextBillingDate { get; set; }
    public DateOnly StartDate { get; set; }
    public string ServiceUrl { get; set; } = string.Empty;

    public static SubscriptionDto FromEntity(Subscription s) => new()
    {
        Id = s.Id,
        Name = s.Name,
        Price = s.Price,
        Currency = s.Currency,
        BillingCycle = s.BillingCycle,
        Status = s.Status,
        NextBillingDate = s.NextBillingDate,
        StartDate = s.StartDate,
        ServiceUrl = s.ServiceUrl
    };
}
