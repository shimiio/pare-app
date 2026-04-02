using Pare.Domain.Emums;

namespace Pare.Domain.Entities;

public class Subscription
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public BillingCycle BillingCycle { get; set; }
    public Status Status { get; set; }
    public DateOnly NextBillingDate { get; set; }
    public DateOnly StartDate { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
