using FluentValidation;
using Pare.Application.Subscriptions.Commands.CreateSubscription;

namespace Pare.Application.Subscriptions.Validators;

public class CreateSubscriptionCommandValidator : AbstractValidator<CreateSubscriptionCommand>
{
    public CreateSubscriptionCommandValidator()
    {
        RuleFor(x => x.CreateDto).SetValidator(new SubscriptionWriteDtoValidator());
    }
}
