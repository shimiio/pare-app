using MediatR;
using Pare.Application.Common;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;

namespace Pare.Application.EmailVerification.Commands.VerifyEmail;

public class VerifyEmailHandle(IUserRepository userRepo, IEmailVerificationRepository emailRepo)
    : IRequestHandler<VerifyEmailCommand>
{
    private readonly IUserRepository _userRepo = userRepo;
    private readonly IEmailVerificationRepository _emailRepo = emailRepo;

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
    }
}
