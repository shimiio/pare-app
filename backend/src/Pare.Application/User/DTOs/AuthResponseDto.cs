namespace Pare.Application.User.DTOs;

public sealed class AuthResponseDto
{
    public string JwtToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}
