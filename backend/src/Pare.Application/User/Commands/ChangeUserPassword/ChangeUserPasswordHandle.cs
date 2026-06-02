using MediatR;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.ChangeUserPassword;

public class ChangeUserPasswordHandle(IUserRepository repo, IPasswordHasher hasher)
        : IRequestHandler<ChangeUserPasswordCommand, ChangePasswordDto>
{
    private readonly IUserRepository _repo = repo;
    private readonly IPasswordHasher _hasher = hasher;

    public async Task<ChangePasswordDto> Handle(
        ChangeUserPasswordCommand command,
        CancellationToken ct)
    {
        // Get user data
        var existing = await _repo.GetByIdAsync(command.Id) ?? throw new NotFoundException("User not found");

        // Verify password
        bool verify = _hasher.Verify(command.Change.CurrentPassword, existing.PasswordHash);
        if (!verify) throw new UnauthorizedException("Invalid current password");

        // Hash the new password
        string hash = _hasher.Hash(command.Change.NewPassword);
        existing.PasswordHash = hash;

        // Update user data
        await _repo.UpdateAsync(existing);

        return command.Change;
    }
}
