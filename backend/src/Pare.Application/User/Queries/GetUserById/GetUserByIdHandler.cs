using MediatR;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Queries.GetUserById;

public class GetUserByIdHandler(IUserRepository repo)
        : IRequestHandler<GetUserByIdQuery, UserDto>
{
    private readonly IUserRepository _repo = repo;

    public async Task<UserDto> Handle(
        GetUserByIdQuery query,
        CancellationToken ct)
    {
        var user = await _repo.GetByIdAsync(query.Id) ?? throw new NotFoundException("User not found");
        return new UserDto
        {
            Name = user.Name,
            Email = user.Email,
            Currency = user.Currency
        };
    }
}
