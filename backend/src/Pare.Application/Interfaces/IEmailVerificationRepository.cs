using Pare.Domain.Entities;

namespace Pare.Application.Interfaces;

public interface IEmailVerificationRepository
{
    Task<EmailVerificationToken> CreateAsync(EmailVerificationToken token, CancellationToken ct);
    Task<EmailVerificationToken?> UpdateUsedAtUtcAsync(int userId, EmailVerificationToken token, CancellationToken ct);
    Task<EmailVerificationToken?> GetValidTokenByUserIdAsync(int userId, CancellationToken ct);
}
