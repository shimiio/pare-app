using MediatR;
using Pare.Domain.Entities;
using Pare.Application.Exceptions;
using Pare.Application.Subscriptions.DTOs;
using Pare.Application.Interfaces;

namespace Pare.Application.Subscriptions.Commands.UpdateSubscription;

public class UpdateSubscriptionHandler
    : IRequestHandler<UpdateSubscriptionCommand, SubscriptionDto>
{
    private readonly ISubscriptionRepository _repo;

    public UpdateSubscriptionHandler(ISubscriptionRepository repo)
        => _repo = repo;

    public async Task<SubscriptionDto> Handle(
        UpdateSubscriptionCommand command,
        CancellationToken ct)
    {
        var subscription = new Subscription
        {
            Name = command.UpdateDto.Name,
            Price = command.UpdateDto.Price,
            Currency = command.UpdateDto.Currency,
            BillingCycle = command.UpdateDto.BillingCycle,
            Status = command.UpdateDto.Status,
            NextBillingDate = command.UpdateDto.NextBillingDate,
            StartDate = command.UpdateDto.StartDate,
            ServiceUrl = command.UpdateDto.ServiceUrl,
        };

        var updated = await _repo.UpdateAsync(command.Id, command.UserId, subscription);
        if (updated is null) throw new NotFoundException("Subscription not found");
        return SubscriptionDto.FromEntity(updated);
    }
}
