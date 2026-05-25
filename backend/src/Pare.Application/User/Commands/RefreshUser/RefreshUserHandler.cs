using MediatR;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.RefreshUser;

public class RefreshUserHandler(IUserRepository repo, IJwtTokenService jwtService)
        : IRequestHandler<RefreshUserCommand, AuthResponseDto>
{
    private readonly IUserRepository _repo = repo;
    private readonly IJwtTokenService _jwtService = jwtService;

    public async Task<AuthResponseDto> Handle(RefreshUserCommand command, CancellationToken ct)
    {
        var request = command.RefreshToken;

        // Get user data by refresh token
        var user = await _repo.GetByRefreshTokenAsync(request.RefreshToken)
            ?? throw new UnauthorizedException("Unauthorized");

        // Validate DateTime of refresh token
        if (user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiry < DateTime.UtcNow)
            throw new UnauthorizedException("Unauthorized");

        // Create refresh token expiry
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(30);

        // Update user refresh token expiry
        user.RefreshTokenExpiry = refreshTokenExpiry;

        // Update refresh token expiry
        await _repo.UpdateAsync(user);

        // Generate JWT token
        var token = _jwtService.GenerateToken(user.Id, user.Email);
        var jwtToken = new AuthResponseDto
        {
            JwtToken = token,
            RefreshToken = user.RefreshToken
        };

        return jwtToken;
    }
}
