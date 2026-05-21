using MediatR;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Application.User.DTOs;

namespace Pare.Application.User.Commands.RegisterUser;

public class RegisterUserHandler(IUserRepository repo, IPasswordHasher hasher, IJwtTokenService jwtService)
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

        // Check if email already exists
        var existing = await _repo.GetByEmailAsync(request.Email);
        if (existing != null) throw new ConflictException("Email already exists");

        // Hash the password
        string hash = _hasher.Hash(request.Password);

        // Create the user
        var user = new Domain.Entities.User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = hash,
            Currency = "EUR"
        };

        // Create user
        await _repo.CreateAsync(user);

        // Generate JWT token
        var token = _jwtService.GenerateToken(user.Id, user.Email);
        var jwtToken = new AuthResponseDto
        {
            JwtToken = token
        };

        return jwtToken;
    }
}
