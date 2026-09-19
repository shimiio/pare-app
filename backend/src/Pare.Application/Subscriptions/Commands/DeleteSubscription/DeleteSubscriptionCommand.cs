using MediatR;

namespace Pare.Application.Subscriptions.Commands.DeleteSubscription;

public sealed record DeleteSubscriptionCommand(int Id, int UserId) : IRequest<bool>;
