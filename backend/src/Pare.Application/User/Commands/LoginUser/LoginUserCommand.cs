using MediatR;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.LoginUser;

public record LoginUserCommand(LoginRequest Request) : IRequest<AuthResponseDto>;
