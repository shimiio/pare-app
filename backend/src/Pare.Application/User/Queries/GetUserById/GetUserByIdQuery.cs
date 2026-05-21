using MediatR;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Queries.GetUserById;

public record GetUserByIdQuery(int Id) : IRequest<UserDto>;
