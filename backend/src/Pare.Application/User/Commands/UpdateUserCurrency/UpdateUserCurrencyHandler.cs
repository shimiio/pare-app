using MediatR;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.UpdateUserCurrency;

public class UpdateUserCurrencyHandler(IUserRepository repo)
        : IRequestHandler<UpdateUserCurrencyCommand, UpdateCurrencyDto>
{
    private readonly IUserRepository _repo = repo;

    public async Task<UpdateCurrencyDto> Handle(
        UpdateUserCurrencyCommand command,
        CancellationToken ct)
    {
        // Get user data
        var existing = await _repo.GetByIdAsync(command.Id) ?? throw new NotFoundException("User not found");

        // Update currency
        existing.Currency = command.Update.Currency;
        await _repo.UpdateAsync(existing);

        return command.Update;
    }
}
