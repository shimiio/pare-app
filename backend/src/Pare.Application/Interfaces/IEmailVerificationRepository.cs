using Pare.Domain.Entities;

namespace Pare.Application.Interfaces;

public interface IEmailVerificationRepository
{
    Task<EmailVerificationToken> CreateAsync(EmailVerificationToken token);
    Task<EmailVerificationToken?> UpdateUsedAtUtcAsync(int userId, EmailVerificationToken token);
    Task<EmailVerificationToken?> GetValidTokenByUserIdAsync(int userId);
}
