using MediatR;
using Pare.Application.Subscriptions.DTOs;
using Pare.Application.Interfaces;

namespace Pare.Application.Subscriptions.Queries.GetAllSubscriptions;

public class GetAllSubscriptionsHandler
    : IRequestHandler<GetAllSubscriptionsQuery, IEnumerable<SubscriptionDto>>
{
    private readonly ISubscriptionRepository _repo;

    public GetAllSubscriptionsHandler(ISubscriptionRepository repo)
        => _repo = repo;

    public async Task<IEnumerable<SubscriptionDto>> Handle(
        GetAllSubscriptionsQuery query,
        CancellationToken ct)
    {
        var subscriptions = await _repo.GetAllAsync(query.UserId);
        return subscriptions.Select(SubscriptionDto.FromEntity);
    }
}
