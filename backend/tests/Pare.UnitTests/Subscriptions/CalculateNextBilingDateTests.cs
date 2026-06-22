using FluentAssertions;
using Pare.Domain.Emums;
using Pare.Domain.Entities;

namespace Pare.UnitTests.Subscriptions;

public class CalculateNextBilingDateTests
{
    [Fact]
    public void CalculateNextBillingDate_WhenMonthly_ShouldAddOneMonth()
    {
        var startDate = new DateOnly(2020, 1, 1);

        // Arrange
        var subscription = new Subscription
        {
            BillingCycle = BillingCycle.Monthly,
            NextBillingDate = startDate
        };

        // Act
        var result = subscription.CalculateNextBillingDate();

        // Assert
        result.Should().Be(startDate.AddMonths(1));
    }

    [Fact]
    public void CalculateNextBillingDate_WhenYearly_ShouldAddOneYear()
    {
        var startDate = new DateOnly(2020, 1, 1);

        // Arrange
        var subscription = new Subscription
        {
            BillingCycle = BillingCycle.Yearly,
            NextBillingDate = startDate
        };

        // Act
        var result = subscription.CalculateNextBillingDate();

        // Assert
        result.Should().Be(startDate.AddYears(1));
    }

    [Fact]
    public void CalculateNextBillingDate_WhenWeekly_ShouldAddOneWeek()
    {
        var startDate = new DateOnly(2020, 1, 1);

        // Arrange
        var subscription = new Subscription
        {
            BillingCycle = BillingCycle.Weekly,
            NextBillingDate = startDate
        };

        // Act
        var result = subscription.CalculateNextBillingDate();

        // Assert
        result.Should().Be(startDate.AddDays(7));
    }

    [Fact]
    public void CalculateNextBillingDate_WhenDefault_ShouldNotChangeDate()
    {
        var startDate = new DateOnly(2020, 1, 1);

        // Arrange
        var subscription = new Subscription
        {
            BillingCycle = (BillingCycle)99,
            NextBillingDate = startDate
        };

        // Act
        var result = subscription.CalculateNextBillingDate();

        // Assert
        result.Should().Be(startDate);
    }
}
