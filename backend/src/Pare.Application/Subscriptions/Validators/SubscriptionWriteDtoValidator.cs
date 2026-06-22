using FluentValidation;
using Pare.Application.Subscriptions.DTOs;

namespace Pare.Application.Subscriptions.Validators;

public class SubscriptionWriteDtoValidator : AbstractValidator<SubscriptionWriteDto>
{
    public SubscriptionWriteDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(100).WithMessage("Name cannot exceed 100 characters");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than 0")
            .LessThanOrEqualTo(1000000).WithMessage("Price is unrealistically high");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required")
            .Length(3).WithMessage("Currency must be a 3-letter code (e.g. EUR)");

        RuleFor(x => x.NextBillingDate)
            .GreaterThanOrEqualTo(x => DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Next billing date cannot be in the past")
            .GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("Next billing date cannot be earlier than the start date");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required")
            .LessThanOrEqualTo(x => DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Start date cannot be in the future");

        RuleFor(x => x.ServiceUrl)
            .MaximumLength(200).WithMessage("Service URL cannot exceed 200 characters");
    }
}
