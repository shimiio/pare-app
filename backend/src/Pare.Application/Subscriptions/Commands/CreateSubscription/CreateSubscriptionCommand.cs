using MediatR;
using Pare.Application.Subscriptions.DTOs;

namespace Pare.Application.Subscriptions.Commands.CreateSubscription;

public record CreateSubscriptionCommand(int UserId, SubscriptionWriteDto CreateDto) : IRequest<SubscriptionDto>;
