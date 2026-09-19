using System.Security.Cryptography;
using MediatR;
using Pare.Application.Common;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Domain.Entities;

namespace Pare.Application.EmailVerification.Commands.VerifyEmail;

public class VerifyEmailHandler(
    IUserRepository userRepo,
    IEmailVerificationRepository emailRepo,
    IUnsubscribeTokenRepository unsubscribeRepo,
    ITransactionManager transactionManager)
    : IRequestHandler<VerifyEmailCommand>
{
    private readonly IUserRepository _userRepo = userRepo;
    private readonly IEmailVerificationRepository _emailRepo = emailRepo;
    private readonly IUnsubscribeTokenRepository _unsubscribeRepo = unsubscribeRepo;
    private readonly ITransactionManager _transactionManager = transactionManager;

    public async Task Handle(VerifyEmailCommand command, CancellationToken cancellationToken)
    {
        var user = await _userRepo.GetByIdAsync(command.UserId, cancellationToken) ?? throw new NotFoundException("User not found");

        if (user.IsEmailVerified) throw new ConflictException("Email already verified");

        // find valid token
        var token = await _emailRepo.GetValidTokenByUserIdAsync(user.Id, cancellationToken)
            ?? throw new NotFoundException("Valid token not found");

        // hash derived code
        var derivedHashCode = TokenHasher.Hash(command.Verify.Code);

        // compare with user token
        if (derivedHashCode != token.CodeHash) throw new BadRequestException("Invalid verification code");

        // change & save: all writes below commit together, or not at all
        await _transactionManager.ExecuteInTransactionAsync(async () =>
        {
            token.UsedAtUtc = DateTime.UtcNow;
            user.IsEmailVerified = true;

            await _userRepo.UpdateAsync(user, cancellationToken);
            await _emailRepo.UpdateUsedAtUtcAsync(user.Id, token, cancellationToken);

            // create unsubscribe token
            var existingToken = await _unsubscribeRepo.GetByUserIdAsync(user.Id, cancellationToken);
            if (existingToken == null)
            {
                var unsubscribeToken = new UnsubscribeToken
                {
                    UserId = user.Id,
                    Token = GenerateUnsubscribeToken(),
                    CreatedAtUtc = DateTime.UtcNow,
                };

                await _unsubscribeRepo.CreateAsync(unsubscribeToken, cancellationToken);
            }
        }, cancellationToken);
    }

    // URL-safe random token for the unsubscribe link
    private static string GenerateUnsubscribeToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }
}
