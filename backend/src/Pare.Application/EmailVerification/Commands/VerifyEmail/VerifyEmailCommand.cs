using MediatR;
using Pare.Application.EmailVerification.DTOs;

namespace Pare.Application.EmailVerification.Commands.VerifyEmail;

public record VerifyEmailCommand(int UserId, VerifyCodeDto Verify) : IRequest;
