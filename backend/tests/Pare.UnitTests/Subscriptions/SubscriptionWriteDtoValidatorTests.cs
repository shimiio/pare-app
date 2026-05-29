using FluentValidation.TestHelper;
using Pare.Application.Subscriptions.DTOs;
using Pare.Application.Subscriptions.Validators;

namespace Pare.UnitTests.Subscriptions;

public class SubscriptionWriteDtoValidatorTests
{
    private readonly SubscriptionWriteDtoValidator _validator = new();

    [Fact]
    public void Validate_WithValidDto_ShouldHaveNoErrors()
    {
        DateOnly startDate = DateOnly.FromDateTime(DateTime.UtcNow);
        DateOnly nextBillingDate = startDate.AddMonths(1);

        // Arrange
        var dto = new SubscriptionWriteDto
        {
            Name = "sub",
            Price = 9.99M,
            Currency = "EUR",
            BillingCycle = Domain.Emums.BillingCycle.Monthly,
            Status = Domain.Emums.Status.Active,
            NextBillingDate = nextBillingDate,
            StartDate = startDate,
            ServiceUrl = "sub.com"
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WithEmptyName_ShouldHaveNameError()
    {
        // Arrange
        var dto = new SubscriptionWriteDto
        {
            Name = "",
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(s => s.Name);
    }

    [Fact]
    public void Validate_WithZeroPrice_ShouldHavePriceError()
    {
        // Arrange
        var dto = new SubscriptionWriteDto
        {
            Price = 0,
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(s => s.Price);
    }

    [Fact]
    public void Validate_WithPastNextBillingDate_ShouldHaveError()
    {
        DateOnly pastDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-1);

        // Arrange
        var dto = new SubscriptionWriteDto
        {
            NextBillingDate = pastDate,
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(s => s.NextBillingDate);
    }
}
