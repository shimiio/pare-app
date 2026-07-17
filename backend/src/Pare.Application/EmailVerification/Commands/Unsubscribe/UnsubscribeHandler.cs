using MediatR;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;

namespace Pare.Application.EmailVerification.Commands.Unsubscribe;

public class UnsubscribeHandler(IUnsubscribeTokenRepository unsubscribeRepo, IUserRepository userRepo)
        : IRequestHandler<UnsubscribeCommand>
{
    private readonly IUnsubscribeTokenRepository _unsubscribeRepo = unsubscribeRepo;
    private readonly IUserRepository _userRepo = userRepo;

    public async Task Handle(UnsubscribeCommand command, CancellationToken cancellationToken)
    {
        var token = await _unsubscribeRepo.GetByTokenAsync(command.Token)
            ?? throw new NotFoundException("Invalid unsubscribe token");

        var user = await _userRepo.GetByIdAsync(token.UserId)
            ?? throw new NotFoundException("User not found");

        if (!user.IsEmailVerified)
            throw new ConflictException("User already unsubscribed");

        user.IsEmailVerified = false;
        await _userRepo.UpdateAsync(user);
    }
}
