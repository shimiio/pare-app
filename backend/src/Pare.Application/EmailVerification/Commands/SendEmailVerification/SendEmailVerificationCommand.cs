using MediatR;
using Pare.Application.EmailVerification.DTOs;

namespace Pare.Application.EmailVerification.Commands.SendEmailVerification;

public sealed record SendEmailVerificationCommand(int UserId) : IRequest<NextEmailAllowed>;
