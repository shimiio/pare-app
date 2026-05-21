using MediatR;

namespace Pare.Application.Subscriptions.Commands.DeleteSubscription;

public record DeleteSubscriptionCommand(int Id, int UserId) : IRequest<bool>;
