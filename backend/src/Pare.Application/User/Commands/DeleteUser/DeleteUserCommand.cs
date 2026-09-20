using MediatR;

namespace Pare.Application.User.Commands.DeleteUser;

public sealed record DeleteUserCommand(int Id) : IRequest<bool>;
