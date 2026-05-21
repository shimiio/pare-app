using MediatR;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;

namespace Pare.Application.Subscriptions.Commands.DeleteSubscription;

public class DeleteSubscriptionHandler(ISubscriptionRepository repo)
        : IRequestHandler<DeleteSubscriptionCommand, bool>
{
    private readonly ISubscriptionRepository _repo = repo;

    public async Task<bool> Handle(
        DeleteSubscriptionCommand command,
        CancellationToken ct)
    {
        var deleted = await _repo.DeleteByIdAsync(command.Id, command.UserId);
        if (deleted is false) throw new NotFoundException("Subscription not found");
        return deleted;
    }
}
