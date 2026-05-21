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
        // Get user data
        var existing = await _repo.GetByIdAsync(command.Id) ?? throw new NotFoundException("User not found");

        // Delete user
        return await _repo.DeleteByIdAsync(command.Id);
    }
}
