namespace Pare.Domain.Enums;

// Stored in the database and sent to the frontend as numbers: never reorder or renumber
public enum Status
{
    Active = 0,
    Cancelled = 1,
    Paused = 2
}
