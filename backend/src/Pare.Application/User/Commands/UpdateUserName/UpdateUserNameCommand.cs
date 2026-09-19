using MediatR;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.UpdateUserName;

public sealed record UpdateUserNameCommand(int Id, UpdateNameDto Update) : IRequest<UpdateNameDto>;
