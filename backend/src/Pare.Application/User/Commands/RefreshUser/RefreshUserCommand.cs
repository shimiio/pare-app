using MediatR;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.RefreshUser;

public record RefreshUserCommand(RefreshTokenDto RefreshToken) : IRequest<AuthResponseDto>;
