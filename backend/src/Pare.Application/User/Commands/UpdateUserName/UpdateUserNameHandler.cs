using MediatR;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.UpdateUserName;

public sealed class UpdateUserNameHandler(IUserRepository repo)
        : IRequestHandler<UpdateUserNameCommand, UpdateNameDto>
{
    private readonly IUserRepository _repo = repo;

    public async Task<UpdateNameDto> Handle(
        UpdateUserNameCommand command,
        CancellationToken ct)
    {
        // Get user data
        var existing = await _repo.GetByIdAsync(command.Id, ct) ?? throw new NotFoundException("User not found");

        // Update name
        existing.Name = command.Update.Name;
        await _repo.UpdateAsync(existing, ct);

        return command.Update;
    }
}
