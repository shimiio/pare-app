using MediatR;
using Pare.Application.Exceptions;
using Pare.Application.Subscriptions.DTOs;
using Pare.Application.Interfaces;

namespace Pare.Application.Subscriptions.Queries.GetSubscriptionById;

public class GetSubscriptionByIdHandler(ISubscriptionRepository repo)
        : IRequestHandler<GetSubscriptionByIdQuery, SubscriptionDto>
{
    private readonly ISubscriptionRepository _repo = repo;

    public async Task<SubscriptionDto> Handle(
        GetSubscriptionByIdQuery query,
        CancellationToken ct)
    {
        var subscription = await _repo.GetByIdAsync(query.Id, query.UserId) ?? throw new NotFoundException("Subscription not found");
        return SubscriptionDto.FromEntity(subscription);
    }
}
