using MediatR;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.LogoutUser;

public record LogoutUserCommand(RefreshTokenDto RefreshToken) : IRequest<Unit>;
