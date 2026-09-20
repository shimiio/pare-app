using MediatR;

namespace Pare.Application.EmailVerification.Commands.Unsubscribe;

public sealed record UnsubscribeCommand(string Token) : IRequest;
