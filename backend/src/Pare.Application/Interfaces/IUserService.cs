using Pare.Application.DTOs;
using Pare.Domain.Entities;

namespace Pare.Application.Interfaces;

public interface IUserService
{
    Task<AuthResponseDto?> RegisterAsync(RegisterRequest request);
    Task<AuthResponseDto?> LoginAsync(LoginRequest request);
}
