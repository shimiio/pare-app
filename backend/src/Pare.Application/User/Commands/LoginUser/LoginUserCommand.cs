using MediatR;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.LoginUser;

public sealed record LoginUserCommand(LoginRequest Request) : IRequest<AuthResponseDto>;
