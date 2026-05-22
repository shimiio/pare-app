using FluentValidation;
using Pare.Application.Subscriptions.Validators;

namespace Pare.Application.Subscriptions.Commands.UpdateSubscription;

public class UpdateSubscriptionCommandValidator : AbstractValidator<UpdateSubscriptionCommand>
{
    public UpdateSubscriptionCommandValidator()
    {
        RuleFor(x => x.UpdateDto).SetValidator(new SubscriptionWriteDtoValidator());
    }
}
