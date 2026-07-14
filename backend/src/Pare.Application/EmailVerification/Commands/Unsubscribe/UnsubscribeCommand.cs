using MediatR;

namespace Pare.Application.EmailVerification.Commands.Unsubscribe;

public record UnsubscribeCommand(string Token) : IRequest;
