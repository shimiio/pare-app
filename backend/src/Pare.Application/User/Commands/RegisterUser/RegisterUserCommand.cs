using MediatR;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.RegisterUser;

public record RegisterUserCommand(RegisterRequest Request) : IRequest<AuthResponseDto>;
