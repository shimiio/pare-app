using System.Security.Cryptography;
using MediatR;
using Pare.Application.Common;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Application.EmailVerification.DTOs;
using Pare.Domain.Entities;

namespace Pare.Application.EmailVerification.Commands.SendEmailVerification;

public class EmailVerificationHandler(IUserRepository userRepo, IEmailVerificationRepository emailRepo, IEmailService emailService) :
        IRequestHandler<SendEmailVerificationCommand, NextEmailAllowed>
{
    private readonly IUserRepository _userRepo = userRepo;
    private readonly IEmailVerificationRepository _emailRepo = emailRepo;

    public async Task<NextEmailAllowed> Handle(SendEmailVerificationCommand command, CancellationToken cancellationToken)
    {
        var user = await _userRepo.GetByIdAsync(command.UserId) ?? throw new NotFoundException("User not found");

        if (user.IsEmailVerified) // true or false
            throw new ConflictException("Email already verified");

        // Request limits
        var cooldown = TimeSpan.FromSeconds(60);
        if (user.LastVerificationRequestAtUtc.HasValue &&
            DateTime.UtcNow - user.LastVerificationRequestAtUtc.Value < cooldown)
        {
            throw new TooManyRequestsException("Too many request");
        }

        // Generate & hash code
        var code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        var codeHash = TokenHasher.Hash(code);

        // Update user
        user.LastVerificationRequestAtUtc = DateTime.UtcNow;
        await _userRepo.UpdateAsync(user);

        // Add email verification token
        var token = new EmailVerificationToken
        {
            UserId = command.UserId,
            CodeHash = codeHash,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(10)
        };

        await _emailRepo.CreateAsync(token);

        // Send code
        await emailService.SendVerificationCodeAsync(user.Email, user.Name, code);

        return new NextEmailAllowed
        {
            NextEmailAllowedAtUtc = user.LastVerificationRequestAtUtc.Value.Add(cooldown)
        };
    }
}
