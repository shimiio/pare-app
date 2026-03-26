using Pare.Application.DTOs;
using Pare.Domain.Entities;

namespace Pare.Application.Interfaces;

public interface IUserService
{
    // POST
    Task<User> CreateAsync(CreateUserRequest request);
}
