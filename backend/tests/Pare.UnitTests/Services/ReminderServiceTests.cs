using Microsoft.Extensions.Logging;
using Moq;
using Pare.Application.Interfaces;
using Pare.Application.Services;
using Pare.Domain.Entities;

namespace Pare.UnitTests.Services;

public class ReminderServiceTests
{
    private readonly Mock<ISubscriptionRepository> _repoMock = new();
    private readonly Mock<IEmailService> _emailMock = new();
    private readonly Mock<ILogger<ReminderService>> _loggerMock = new();
    private readonly ReminderService _service;

    public ReminderServiceTests()
    {
        _service = new ReminderService(_emailMock.Object, _repoMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task ExecuteAsync_WhenNoSubscriptions_ShouldNotSendEmail()
    {
        // Arrange — tells the repository to return the empty list
        _repoMock.Setup(r => r.GetActiveWithBillingDateAsync(It.IsAny<DateOnly>()))
            .ReturnsAsync([]);

        // Act — tells the service to execute
        await _service.ExecuteAsync();

        // Assert — tells us to check that the email was not sent
        _emailMock.Verify(
            e => e.SendReminderAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<IEnumerable<Subscription>>()),
            Times.Never);
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
            .ReturnsAsync([subscription]);

        // Act
        await _service.ExecuteAsync();

        // Assert
        _emailMock.Verify(
            e => e.SendReminderAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<IEnumerable<Subscription>>()),
            Times.Once);
    }
}