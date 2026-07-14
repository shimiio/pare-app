using Microsoft.Extensions.Logging;
using Moq;
using Pare.Application.Interfaces;
using Pare.Application.Services;
using Pare.Domain.Entities;

namespace Pare.UnitTests.Services;

public class ReminderServiceTests
{
    private readonly Mock<ISubscriptionRepository> _repoMock = new();
    private readonly Mock<IUnsubscribeTokenRepository> _unsubscribeRepoMock = new();
    private readonly Mock<IEmailService> _emailMock = new();
    private readonly Mock<ILogger<ReminderService>> _loggerMock = new();
    private readonly ReminderService _service;

    public ReminderServiceTests()
    {
        _service = new ReminderService(_emailMock.Object, _repoMock.Object, _unsubscribeRepoMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task ExecuteAsync_WhenNoSubscriptions_ShouldNotSendEmail()
    {
        // Arrange — tells the repository to return the empty list
        _repoMock.Setup(r => r.GetActiveWithBillingDateAsync(It.IsAny<DateOnly>()))
            .ReturnsAsync(Enumerable.Empty<Subscription>());

        // Act — tells the service to execute
        await _service.ExecuteAsync();

        // Assert — tells us to check that the email was not sent
        _emailMock.Verify(
            e => e.SendReminderAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<IEnumerable<Subscription>>(),
                It.IsAny<string>()),
            Times.Never);

        _unsubscribeRepoMock.Verify(r => r.GetByUserIdAsync(It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_WhenSubscriptionsDueSoon_ShouldSendEmail()
    {
        // Arrange
        var user = new Domain.Entities.User { Email = "test@test.com", Name = "Test" };
        var subscription = new Subscription
        {
            Name = "Netflix",
            Price = 9.99m,
            Currency = "EUR",
            NextBillingDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(3),
            User = user
        };

        _repoMock.Setup(r => r.GetActiveWithBillingDateAsync(It.IsAny<DateOnly>()))
            .ReturnsAsync(new[] { subscription });

        _unsubscribeRepoMock.Setup(r => r.GetByUserIdAsync(user.Id))
            .ReturnsAsync(new UnsubscribeToken { UserId = user.Id, Token = "token" });

        // Act
        await _service.ExecuteAsync();

        // Assert
        _emailMock.Verify(
            e => e.SendReminderAsync(
                toEmail: user.Email,
                toName: user.Name,
                subscriptions: It.Is<IEnumerable<Subscription>>(list => list.Single() == subscription),
                unsubscribeToken: "token"),
            Times.Once);
    }
}