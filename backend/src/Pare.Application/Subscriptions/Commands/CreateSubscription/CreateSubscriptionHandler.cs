using MediatR;
using Pare.Domain.Entities;
using Pare.Application.Subscriptions.DTOs;
using Pare.Application.Interfaces;
using Pare.Application.Exceptions;

namespace Pare.Application.Subscriptions.Commands.CreateSubscription;

public class CreateSubscriptionHandler(ISubscriptionRepository repo)
        : IRequestHandler<CreateSubscriptionCommand, SubscriptionDto>
{
    private readonly ISubscriptionRepository _repo = repo;

    public async Task<SubscriptionDto> Handle(
        CreateSubscriptionCommand command,
        CancellationToken ct)
    {
        var count = await _repo.CountByUserIdAsync(command.UserId);
        if (count >= 50)
            throw new UnprocessableEntityException("Subscription limit reached");

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
