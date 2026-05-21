using MediatR;
using Pare.Application.Subscriptions.DTOs;

namespace Pare.Application.Subscriptions.Queries.GetSubscriptionById;

public record GetSubscriptionByIdQuery(int Id, int UserId) : IRequest<SubscriptionDto>;
