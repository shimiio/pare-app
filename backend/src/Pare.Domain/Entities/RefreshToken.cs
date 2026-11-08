namespace Pare.Domain.Entities;

// One row per signed-in browser: logging in on a phone adds a row instead of replacing the PC's
public sealed class RefreshToken
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    // The hash this row had before its last rotation, accepted for a short grace period so that
    // requests racing with the rotation (several tabs, React StrictMode) do not log the user out
    public string? PreviousTokenHash { get; set; }
    public DateTime? RotatedAtUtc { get; set; }

    public User User { get; set; } = null!;
}
