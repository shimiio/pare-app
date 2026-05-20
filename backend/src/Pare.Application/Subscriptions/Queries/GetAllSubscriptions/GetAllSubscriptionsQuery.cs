using MediatR;
using Pare.Application.Subscriptions.DTOs;

namespace Pare.Application.Subscriptions.Queries.GetAllSubscriptions;

public record GetAllSubscriptionsQuery(int UserId) : IRequest<IEnumerable<SubscriptionDto>>;
