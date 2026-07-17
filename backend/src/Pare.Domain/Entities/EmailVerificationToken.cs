namespace Pare.Domain.Entities;

public class EmailVerificationToken
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string CodeHash { get; set; } = null!;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? UsedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
