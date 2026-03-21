namespace Pare.Domain.Models;

public class Subscription
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateOnly NextBillingDate { get; set; }
    public DateOnly StartDate { get; set; }
}
