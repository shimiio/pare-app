using Pare.Application.DTOs;

namespace Pare.Application.Interfaces;

public interface IUserService
{
    Task<AuthResponseDto?> RegisterAsync(RegisterRequest request);
    Task<AuthResponseDto?> LoginAsync(LoginRequest request);
    Task<UserDto?> GetByIdAsync(int id);
    Task<UpdateUsernameDto> UpdateUsernameAsync(int id, UpdateUsernameDto change);
    Task<ChangeEmailDto> ChangeEmailAsync(int id, ChangeEmailDto change);
    Task<ChangePasswordDto> ChangePasswordAsync(int id, ChangePasswordDto change);
    Task<UpdateCurrencyDto> UpdateCurrencyAsync(int id, UpdateCurrencyDto change);
    Task<bool> DeleteByIdAsync(int id);
}
