using MediatR;

namespace Pare.Application.User.Commands.DeleteUser;

public record DeleteUserCommand(int Id) : IRequest<bool>;
