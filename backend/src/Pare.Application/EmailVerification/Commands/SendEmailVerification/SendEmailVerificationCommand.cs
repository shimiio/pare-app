using MediatR;
using Pare.Application.EmailVerification.DTOs;

namespace Pare.Application.EmailVerification.Commands.SendEmailVerification;

public record SendEmailVerificationCommand(int UserId) : IRequest<NextEmailAllowed>;
