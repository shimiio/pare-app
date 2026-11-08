using System.Security.Cryptography;

namespace Pare.Application.Common;

public static class RefreshTokenGenerator
{
    public static readonly TimeSpan Lifetime = TimeSpan.FromDays(30);

    // The plain value goes to the browser cookie; only its TokenHasher hash is stored
    public static string NewPlainToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
}
