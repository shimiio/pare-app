using MediatR;
using Pare.Domain.Entities;
using Pare.Application.Subscriptions.DTOs;
using Pare.Application.Interfaces;

namespace Pare.Application.Subscriptions.Commands.CreateSubscription;

public class CreateSubscriptionHandler
    : IRequestHandler<CreateSubscriptionCommand, SubscriptionDto>
{
    private readonly ISubscriptionRepository _repo;

    public CreateSubscriptionHandler(ISubscriptionRepository repo)
        => _repo = repo;

    public async Task<SubscriptionDto> Handle(
        CreateSubscriptionCommand command,
        CancellationToken ct)
    {
        var subscription = new Subscription
        {
            UserId = command.UserId,
            Name = command.CreateDto.Name,
            Price = command.CreateDto.Price,
            Currency = command.CreateDto.Currency,
            BillingCycle = command.CreateDto.BillingCycle,
            Status = command.CreateDto.Status,
            NextBillingDate = command.CreateDto.NextBillingDate,
            StartDate = command.CreateDto.StartDate,
            ServiceUrl = command.CreateDto.ServiceUrl,
        };

        var created = await _repo.CreateAsync(subscription);
        return SubscriptionDto.FromEntity(created);
    }
}
