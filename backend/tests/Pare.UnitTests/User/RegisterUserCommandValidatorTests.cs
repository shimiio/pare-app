using FluentValidation.TestHelper;
using Pare.Application.User.Commands.RegisterUser;
using Pare.Application.User.DTOs;

namespace Pare.UnitTests.User;

public class RegisterUserCommandValidatorTests
{
    private readonly RegisterUserCommandValidator _validator = new();

    [Fact]
    public void Validate_WithValidRequest_ShouldHaveNoErrors()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Name = "user",
            Email = "user@email.com",
            Password = "123456Aa"
        };

        // Act
        var result = _validator.TestValidate(new RegisterUserCommand(request));

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WithInvalidEmailFormat_ShouldHaveEmailError()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "invalid-email",
        };

        // Act
        var result = _validator.TestValidate(new RegisterUserCommand(request));

        // Assert
        result.ShouldHaveValidationErrorFor(s => s.Request.Email);
    }

    [Fact]
    public void Validate_WithShortPassword_ShouldHavePasswordError()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Password = "short",
        };

        // Act
        var result = _validator.TestValidate(new RegisterUserCommand(request));

        // Assert
        result.ShouldHaveValidationErrorFor(s => s.Request.Password);
    }

    [Fact]
    public void Validate_WithoutUppercaseLetter_ShouldHavePasswordError()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Password = "12345678",
        };

        // Act
        var result = _validator.TestValidate(new RegisterUserCommand(request));

        // Assert
        result.ShouldHaveValidationErrorFor(s => s.Request.Password);
    }

    [Fact]
    public void Validate_WithoutOneNumber_ShouldHavePasswordError()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Password = "qwertyui",
        };

        // Act
        var result = _validator.TestValidate(new RegisterUserCommand(request));

        // Assert
        result.ShouldHaveValidationErrorFor(s => s.Request.Password);
    }
}
