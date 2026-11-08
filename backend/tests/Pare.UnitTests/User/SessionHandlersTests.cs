using FluentAssertions;
using Moq;
using Pare.Application.Common;
using Pare.Application.Exceptions;
using Pare.Application.Interfaces;
using Pare.Application.User.Commands.ChangeUserPassword;
using Pare.Application.User.Commands.LoginUser;
using Pare.Application.User.Commands.LogoutUser;
using Pare.Application.User.Commands.RefreshUser;
using Pare.Application.User.Commands.RegisterUser;
using Pare.Application.User.DTOs;
using Pare.Domain.Entities;
using UserEntity = Pare.Domain.Entities.User;

namespace Pare.UnitTests.User;

// One refresh token per browser: these tests pin down that signing in, refreshing or
// logging out on one device never touches the sessions of the user's other devices.
public sealed class SessionHandlersTests
{
    private readonly Mock<IUserRepository> _users = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<IJwtTokenService> _jwt = new();
    private readonly Mock<ITransactionManager> _transaction = new();
    private readonly UserEntity _user = new() { Id = 7, Email = "user@email.com", PasswordHash = "stored-hash" };

    public SessionHandlersTests()
    {
        _jwt.Setup(j => j.GenerateToken(It.IsAny<int>(), It.IsAny<string>())).Returns("jwt");
        _users.Setup(u => u.GetByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync(_user);
        _users.Setup(u => u.GetByIdAsync(_user.Id, It.IsAny<CancellationToken>())).ReturnsAsync(_user);
        // Run the transaction body as is, so the writes inside it can be verified
        _transaction
            .Setup(t => t.ExecuteInTransactionAsync(It.IsAny<Func<Task>>(), It.IsAny<CancellationToken>()))
            .Returns((Func<Task> action, CancellationToken _) => action());
    }

    private RefreshToken Session(string plainToken, DateTime expiresAtUtc) => new()
    {
        Id = 3,
        UserId = _user.Id,
        TokenHash = TokenHasher.Hash(plainToken),
        ExpiresAtUtc = expiresAtUtc,
        User = _user
    };

    // Login

    [Fact]
    public async Task Login_WithValidCredentials_AddsSessionWithoutEndingOthers()
    {
        // Arrange
        _hasher.Setup(h => h.Verify("Password1", "stored-hash")).Returns(true);
        RefreshToken? created = null;
        _refreshTokens
            .Setup(r => r.CreateAsync(It.IsAny<RefreshToken>(), It.IsAny<CancellationToken>()))
            .Callback((RefreshToken t, CancellationToken _) => created = t)
            .ReturnsAsync((RefreshToken t, CancellationToken _) => t);
        var handler = new LoginUserHandler(_users.Object, _refreshTokens.Object, _hasher.Object, _jwt.Object);

        // Act
        var result = await handler.Handle(
            new LoginUserCommand(new LoginRequest { Email = "user@email.com", Password = "Password1" }), default);

        // Assert
        created.Should().NotBeNull();
        created!.UserId.Should().Be(_user.Id);
        created.TokenHash.Should().Be(TokenHasher.Hash(result.RefreshToken));
        created.ExpiresAtUtc.Should().BeCloseTo(DateTime.UtcNow.AddDays(30), TimeSpan.FromMinutes(1));
        _refreshTokens.Verify(r => r.CreateAsync(It.IsAny<RefreshToken>(), It.IsAny<CancellationToken>()), Times.Once);
        _refreshTokens.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task Login_WithWrongPassword_ThrowsAndCreatesNoSession()
    {
        // Arrange
        _hasher.Setup(h => h.Verify(It.IsAny<string>(), It.IsAny<string>())).Returns(false);
        var handler = new LoginUserHandler(_users.Object, _refreshTokens.Object, _hasher.Object, _jwt.Object);

        // Act
        var act = () => handler.Handle(
            new LoginUserCommand(new LoginRequest { Email = "user@email.com", Password = "wrong" }), default);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedException>();
        _refreshTokens.VerifyNoOtherCalls();
    }

    // Register

    [Fact]
    public async Task Register_CreatesUserTogetherWithItsFirstSession()
    {
        // Arrange
        _users.Setup(u => u.GetByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserEntity?)null);
        _hasher.Setup(h => h.Hash(It.IsAny<string>())).Returns("new-hash");
        UserEntity? saved = null;
        _users
            .Setup(u => u.CreateAsync(It.IsAny<UserEntity>(), It.IsAny<CancellationToken>()))
            .Callback((UserEntity u, CancellationToken _) => saved = u)
            .ReturnsAsync((UserEntity u, CancellationToken _) => u);
        var handler = new RegisterUserHandler(_users.Object, _hasher.Object, _jwt.Object);

        // Act
        var result = await handler.Handle(new RegisterUserCommand(
            new RegisterRequest { Name = "user", Email = "user@email.com", Password = "Password1" }), default);

        // Assert
        saved.Should().NotBeNull();
        saved!.RefreshTokens.Should().ContainSingle()
            .Which.TokenHash.Should().Be(TokenHasher.Hash(result.RefreshToken));
    }

    // Refresh

    [Fact]
    public async Task Refresh_WithValidToken_RotatesOnlyThisSession()
    {
        // Arrange
        var session = Session("old-token", DateTime.UtcNow.AddDays(10));
        _refreshTokens.Setup(r => r.GetByHashAsync(TokenHasher.Hash("old-token"), It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);
        _refreshTokens.Setup(r => r.RotateAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        var handler = new RefreshUserHandler(_refreshTokens.Object, _jwt.Object);

        // Act
        var result = await handler.Handle(
            new RefreshUserCommand(new RefreshTokenDto { RefreshToken = "old-token" }), default);

        // Assert
        result.RefreshToken.Should().NotBe("old-token");
        _refreshTokens.Verify(r => r.RotateAsync(
            session.Id,
            TokenHasher.Hash("old-token"),
            TokenHasher.Hash(result.RefreshToken),
            It.IsAny<DateTime>(),
            It.IsAny<CancellationToken>()), Times.Once);
        _jwt.Verify(j => j.GenerateToken(_user.Id, _user.Email), Times.Once);
    }

    [Fact]
    public async Task Refresh_WithExpiredToken_ThrowsWithoutRotating()
    {
        // Arrange
        _refreshTokens.Setup(r => r.GetByHashAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Session("old-token", DateTime.UtcNow.AddMinutes(-1)));
        var handler = new RefreshUserHandler(_refreshTokens.Object, _jwt.Object);

        // Act
        var act = () => handler.Handle(
            new RefreshUserCommand(new RefreshTokenDto { RefreshToken = "old-token" }), default);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedException>();
        _refreshTokens.Verify(r => r.RotateAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Refresh_WithUnknownToken_Throws()
    {
        // Arrange
        _refreshTokens.Setup(r => r.GetByHashAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((RefreshToken?)null);
        var handler = new RefreshUserHandler(_refreshTokens.Object, _jwt.Object);

        // Act
        var act = () => handler.Handle(
            new RefreshUserCommand(new RefreshTokenDto { RefreshToken = "unknown" }), default);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task Refresh_WhenAnotherRequestRotatedFirst_ThrowsAndIssuesNoJwt()
    {
        // Arrange
        _refreshTokens.Setup(r => r.GetByHashAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Session("old-token", DateTime.UtcNow.AddDays(10)));
        _refreshTokens.Setup(r => r.RotateAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        var handler = new RefreshUserHandler(_refreshTokens.Object, _jwt.Object);

        // Act
        var act = () => handler.Handle(
            new RefreshUserCommand(new RefreshTokenDto { RefreshToken = "old-token" }), default);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedException>();
        _jwt.Verify(j => j.GenerateToken(It.IsAny<int>(), It.IsAny<string>()), Times.Never);
    }

    // Logout

    [Fact]
    public async Task Logout_DeletesOnlyThePresentedSession()
    {
        // Arrange
        var handler = new LogoutUserHandler(_refreshTokens.Object);

        // Act
        await handler.Handle(new LogoutUserCommand(new RefreshTokenDto { RefreshToken = "this-browser" }), default);

        // Assert
        _refreshTokens.Verify(r => r.DeleteByHashAsync(TokenHasher.Hash("this-browser"), It.IsAny<CancellationToken>()), Times.Once);
        _refreshTokens.VerifyNoOtherCalls();
    }

    // Change password

    [Fact]
    public async Task ChangePassword_KeepsCurrentSessionAndEndsOthers()
    {
        // Arrange
        _hasher.Setup(h => h.Verify("Current1", "stored-hash")).Returns(true);
        _hasher.Setup(h => h.Hash("NewPassword1")).Returns("new-hash");
        var handler = new ChangeUserPasswordHandler(_users.Object, _refreshTokens.Object, _hasher.Object, _transaction.Object);
        var change = new ChangePasswordDto { CurrentPassword = "Current1", NewPassword = "NewPassword1" };

        // Act
        await handler.Handle(new ChangeUserPasswordCommand(_user.Id, change, "this-browser"), default);

        // Assert
        _users.Verify(u => u.UpdateAsync(It.Is<UserEntity>(x => x.PasswordHash == "new-hash"), It.IsAny<CancellationToken>()), Times.Once);
        _refreshTokens.Verify(r => r.DeleteAllForUserExceptAsync(_user.Id, TokenHasher.Hash("this-browser"), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ChangePassword_WithoutRefreshCookie_EndsEverySession()
    {
        // Arrange
        _hasher.Setup(h => h.Verify("Current1", "stored-hash")).Returns(true);
        _hasher.Setup(h => h.Hash(It.IsAny<string>())).Returns("new-hash");
        var handler = new ChangeUserPasswordHandler(_users.Object, _refreshTokens.Object, _hasher.Object, _transaction.Object);
        var change = new ChangePasswordDto { CurrentPassword = "Current1", NewPassword = "NewPassword1" };

        // Act
        await handler.Handle(new ChangeUserPasswordCommand(_user.Id, change, null), default);

        // Assert
        _refreshTokens.Verify(r => r.DeleteAllForUserExceptAsync(_user.Id, null, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ChangePassword_WithWrongCurrentPassword_ChangesNothing()
    {
        // Arrange
        _hasher.Setup(h => h.Verify(It.IsAny<string>(), It.IsAny<string>())).Returns(false);
        var handler = new ChangeUserPasswordHandler(_users.Object, _refreshTokens.Object, _hasher.Object, _transaction.Object);
        var change = new ChangePasswordDto { CurrentPassword = "wrong", NewPassword = "NewPassword1" };

        // Act
        var act = () => handler.Handle(new ChangeUserPasswordCommand(_user.Id, change, "this-browser"), default);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedException>();
        _users.Verify(u => u.UpdateAsync(It.IsAny<UserEntity>(), It.IsAny<CancellationToken>()), Times.Never);
        _refreshTokens.VerifyNoOtherCalls();
    }
}
