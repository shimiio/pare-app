namespace Pare.Domain.Entities;

public class UnsubscribeToken
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }

    public User User { get; set; } = null!;
}
