namespace Pare.Application.User.DTOs;

public sealed class AuthResponseDto
{
    public string JwtToken { get; set; } = string.Empty;

    // Null when the refresh cookie must stay as it is (a request that lost a rotation race)
    public string? RefreshToken { get; set; }
}
