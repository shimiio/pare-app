using MediatR;
using Pare.Application.Common;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.ChangeUserEmail;

public class ChangeUserEmailHandler(IUserRepository repo)
        : IRequestHandler<ChangeUserEmailCommand, ChangeEmailDto>
{
    private readonly IUserRepository _repo = repo;

    public async Task<ChangeEmailDto> Handle(
        ChangeUserEmailCommand command,
        CancellationToken ct)
    {
        // Get user data
        var existing = await _repo.GetByIdAsync(command.Id) ?? throw new NotFoundException("User not found");

        var email = EmailNormalizer.Normalize(command.Change.Email);

        // Check if email already exists (fast path; the unique index is the real guarantee)
        var emailExists = await _repo.GetByEmailAsync(email);
        if (emailExists != null) throw new ConflictException("Email already exists");

        // Update email
        existing.Email = email;
        existing.IsEmailVerified = false;
        await _repo.UpdateAsync(existing);

        return command.Change;
    }
}
