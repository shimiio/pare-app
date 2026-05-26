using MediatR;
using Pare.Application.User.DTOs;

namespace Pare.Application.Interfaces;

public interface IUserService
{
    Task<AuthResponseDto?> RegisterAsync(RegisterRequest request);
    Task<AuthResponseDto?> LoginAsync(LoginRequest request);
    Task<Unit> LogoutAsync(RefreshTokenDto refreshToken);
    Task<AuthResponseDto?> RefreshAsync(RefreshTokenDto refreshToken);
    Task<UserDto?> GetByIdAsync(int id);
    Task<UpdateNameDto> UpdateNameAsync(int id, UpdateNameDto change);
    Task<ChangeEmailDto> ChangeEmailAsync(int id, ChangeEmailDto change);
    Task<ChangePasswordDto> ChangePasswordAsync(int id, ChangePasswordDto change);
    Task<UpdateCurrencyDto> UpdateCurrencyAsync(int id, UpdateCurrencyDto change);
    Task<bool> DeleteByIdAsync(int id);
}
