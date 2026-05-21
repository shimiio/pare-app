using MediatR;
using Pare.Application.Subscriptions.DTOs;

namespace Pare.Application.Subscriptions.Commands.UpdateSubscription;

public record UpdateSubscriptionCommand(int Id, int UserId, SubscriptionWriteDto UpdateDto) : IRequest<SubscriptionDto>;
