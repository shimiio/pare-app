using MediatR;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.ChangeUserEmail;

public class ChangeUserEmailHandle(IUserRepository repo)
        : IRequestHandler<ChangeUserEmailCommand, ChangeEmailDto>
{
    private readonly IUserRepository _repo = repo;

    public async Task<ChangeEmailDto> Handle(
        ChangeUserEmailCommand command,
        CancellationToken ct)
    {
        // Get user data
        var existing = await _repo.GetByIdAsync(command.Id) ?? throw new NotFoundException("User not found");

        // Check if email already exists
        var emailExists = await _repo.GetByEmailAsync(command.Change.Email);
        if (emailExists != null) throw new ConflictException("Email already exists");

        // Update email
        existing.Email = command.Change.Email;
        await _repo.UpdateAsync(existing);

        return command.Change;
    }
}
