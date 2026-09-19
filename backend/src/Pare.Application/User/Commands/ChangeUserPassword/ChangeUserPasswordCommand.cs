using MediatR;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.ChangeUserPassword;

public sealed record ChangeUserPasswordCommand(int Id, ChangePasswordDto Change) : IRequest<ChangePasswordDto>;
