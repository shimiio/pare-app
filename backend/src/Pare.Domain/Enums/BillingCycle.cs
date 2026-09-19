namespace Pare.Domain.Enums;

// Stored in the database and sent to the frontend as numbers: never reorder or renumber
public enum BillingCycle
{
    Monthly = 0,
    Yearly = 1,
    Weekly = 2
}
