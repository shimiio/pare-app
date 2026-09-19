namespace Pare.Application.Common;

public static class EmailNormalizer
{
    // Emails are compared case-insensitively, so they are always stored and looked up in lowercase
    public static string Normalize(string email)
    {
        return email.Trim().ToLowerInvariant();
    }
}
