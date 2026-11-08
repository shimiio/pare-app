using MediatR;
using Pare.Application.Common;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Application.User.DTOs;
using Pare.Domain.Entities;

namespace Pare.Application.User.Commands.RegisterUser;

public sealed class RegisterUserHandler(IUserRepository repo, IPasswordHasher hasher, IJwtTokenService jwtService)
        : IRequestHandler<RegisterUserCommand, AuthResponseDto>
{
    private readonly IUserRepository _repo = repo;
    private readonly IPasswordHasher _hasher = hasher;
    private readonly IJwtTokenService _jwtService = jwtService;

    public async Task<AuthResponseDto> Handle(
        RegisterUserCommand command,
        CancellationToken ct)
    {
        var request = command.Request;
        var email = EmailNormalizer.Normalize(request.Email);

        // Check if email already exists (fast path; the unique index is the real guarantee)
        var existing = await _repo.GetByEmailAsync(email, ct);
        if (existing != null) throw new ConflictException("Email already exists");

        // Hash the password
        string hash = _hasher.Hash(request.Password);

        var plainToken = RefreshTokenGenerator.NewPlainToken();
        var now = DateTime.UtcNow;

        // Create the user with its first session: both rows are saved together
        var user = new Domain.Entities.User
        {
            Name = request.Name,
            Email = email,
            PasswordHash = hash,
            Currency = "EUR",
            RefreshTokens =
            [
                new RefreshToken
                {
                    TokenHash = TokenHasher.Hash(plainToken),
                    ExpiresAtUtc = now + RefreshTokenGenerator.Lifetime,
                    CreatedAtUtc = now
                }
            ]
        };

        // Create user
        await _repo.CreateAsync(user, ct);

        // Generate JWT token
        var token = _jwtService.GenerateToken(user.Id, user.Email);
        return new AuthResponseDto
        {
            JwtToken = token,
            RefreshToken = plainToken
        };
    }
}
