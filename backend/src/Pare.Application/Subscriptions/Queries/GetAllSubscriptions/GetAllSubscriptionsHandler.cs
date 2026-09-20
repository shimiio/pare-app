using MediatR;
using Pare.Application.Subscriptions.DTOs;
using Pare.Application.Interfaces;

namespace Pare.Application.Subscriptions.Queries.GetAllSubscriptions;

public sealed class GetAllSubscriptionsHandler(ISubscriptionRepository repo)
        : IRequestHandler<GetAllSubscriptionsQuery, IEnumerable<SubscriptionDto>>
{
    private readonly ISubscriptionRepository _repo = repo;

    public async Task<IEnumerable<SubscriptionDto>> Handle(
        GetAllSubscriptionsQuery query,
        CancellationToken ct)
    {
        var subscriptions = await _repo.GetAllAsync(query.UserId, ct);
        return subscriptions.Select(SubscriptionDto.FromEntity);
    }
}
