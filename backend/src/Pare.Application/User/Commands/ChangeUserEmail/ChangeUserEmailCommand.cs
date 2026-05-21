using MediatR;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.ChangeUserEmail;

public record ChangeUserEmailCommand(int Id, ChangeEmailDto Change) : IRequest<ChangeEmailDto>;
