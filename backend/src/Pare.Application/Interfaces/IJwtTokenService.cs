namespace Pare.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(int userId, string email);
}
