using MediatR;
using Pare.Application.EmailVerification.DTOs;

namespace Pare.Application.EmailVerification.Commands.VerifyEmail;

public sealed record VerifyEmailCommand(int UserId, VerifyCodeDto Verify) : IRequest;
