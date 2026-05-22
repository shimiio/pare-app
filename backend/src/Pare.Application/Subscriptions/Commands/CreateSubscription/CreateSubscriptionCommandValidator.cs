using FluentValidation;
using Pare.Application.Subscriptions.Validators;

namespace Pare.Application.Subscriptions.Commands.CreateSubscription;

public class CreateSubscriptionCommandValidator : AbstractValidator<CreateSubscriptionCommand>
{
    public CreateSubscriptionCommandValidator()
    {
        RuleFor(x => x.CreateDto).SetValidator(new SubscriptionWriteDtoValidator());
    }
}
