using System.Security.Cryptography;

namespace Pare.Application.Common;

public static class RefreshTokenGenerator
{
    public static readonly TimeSpan Lifetime = TimeSpan.FromDays(30);

    // How long the token replaced by a rotation keeps working. Long enough for every tab that
    // sent the old cookie at the same moment to get its answer, short enough to be no real gift
    // to someone holding a stolen old token.
    public static readonly TimeSpan RotationGracePeriod = TimeSpan.FromSeconds(30);

    // The plain value goes to the browser cookie; only its TokenHasher hash is stored
    public static string NewPlainToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
}
