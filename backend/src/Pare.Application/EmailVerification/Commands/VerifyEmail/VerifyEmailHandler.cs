using System.Security.Cryptography;
using MediatR;
using Pare.Application.Common;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Domain.Entities;

namespace Pare.Application.EmailVerification.Commands.VerifyEmail;

public class VerifyEmailHandler(IUserRepository userRepo, IEmailVerificationRepository emailRepo, IUnsubscribeTokenRepository unsubscribeRepo)
    : IRequestHandler<VerifyEmailCommand>
{
    private readonly IUserRepository _userRepo = userRepo;
    private readonly IEmailVerificationRepository _emailRepo = emailRepo;
    private readonly IUnsubscribeTokenRepository _unsubscribeRepo = unsubscribeRepo;

    public async Task Handle(VerifyEmailCommand command, CancellationToken cancellationToken)
    {
        var user = await _userRepo.GetByIdAsync(command.UserId) ?? throw new NotFoundException("User not found");

        if (user.IsEmailVerified) throw new ConflictException("Email already verified");

        // find valid token
        var token = await _emailRepo.GetValidTokenByUserIdAsync(user.Id)
            ?? throw new NotFoundException("Valid token not found");

        // hash derived code
        var derivedHashCode = TokenHasher.Hash(command.Verify.Code);

        // compare with user token
        if (derivedHashCode != token.CodeHash) throw new BadRequestException("Invalid verification code");

        // change & save
        token.UsedAtUtc = DateTime.UtcNow;
        user.IsEmailVerified = true;

        await _userRepo.UpdateAsync(user);
        await _emailRepo.UpdateUsedAtUtcAsync(user.Id, token);

        // generate unsubcribe token
        var unsubcribeToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');

        // create unsubscribe token
        var existingToken = await _unsubscribeRepo.GetByUserIdAsync(user.Id);
        if (existingToken == null)
        {
            var unsubscribeToken = new UnsubscribeToken
            {
                UserId = user.Id,
                Token = unsubcribeToken,
                CreatedAtUtc = DateTime.UtcNow,
            };

            // save
            await _unsubscribeRepo.CreateAsync(unsubscribeToken);
        }
    }
}
