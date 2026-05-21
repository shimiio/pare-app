using Pare.Domain.Emums;

namespace Pare.Application.Subscriptions.DTOs;

public class SubscriptionWriteDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public BillingCycle BillingCycle { get; set; }
    public Status Status { get; set; }
    public DateOnly NextBillingDate { get; set; }
    public DateOnly StartDate { get; set; }
    public string ServiceUrl { get; set; } = string.Empty;
}
