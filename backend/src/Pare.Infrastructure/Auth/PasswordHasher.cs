using BC = BCrypt.Net.BCrypt;
using Pare.Application.Interfaces;

namespace Pare.Infrastructure.Auth;

public class PasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        return BC.HashPassword(password);
    }
    public bool Verify(string password, string passwordHash)
    {
        return BC.Verify(password, passwordHash);
    }
}
