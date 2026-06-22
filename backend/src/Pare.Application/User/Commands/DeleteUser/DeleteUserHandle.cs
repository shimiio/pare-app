using MediatR;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;

namespace Pare.Application.User.Commands.DeleteUser;

public class DeleteUserHandler(IUserRepository repo)
        : IRequestHandler<DeleteUserCommand, bool>
{
    private readonly IUserRepository _repo = repo;

    public async Task<bool> Handle(
        DeleteUserCommand command,
        CancellationToken ct)
    {
        var isDeleted = await _repo.DeleteByIdAsync(command.Id);

        if (!isDeleted)
        {
            throw new NotFoundException("User not found");
        }

        return true;
    }
}
