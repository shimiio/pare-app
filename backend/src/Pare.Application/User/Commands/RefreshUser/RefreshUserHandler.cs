using System.Security.Cryptography;
using MediatR;
using Pare.Application.Common;
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
        var user = await _repo.GetByHashedRefreshTokenAsync(TokenHasher.Hash(request.RefreshToken))
            ?? throw new UnauthorizedException("Unauthorized");

        // Validate DateTime of refresh token
        if (user.RefreshTokenExpiry < DateTime.UtcNow)
            throw new UnauthorizedException("Unauthorized");

        // Generate new refresh token
        var plainToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var hashedToken = TokenHasher.Hash(plainToken);

        // Update user
        user.RefreshToken = hashedToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(30);

        await _repo.UpdateAsync(user);

        // Generate JWT token
        var token = _jwtService.GenerateToken(user.Id, user.Email);
        return new AuthResponseDto
        {
            JwtToken = token,
            RefreshToken = plainToken
        };
    }
}
