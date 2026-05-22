using FluentValidation;
using Pare.Application.Subscriptions.Commands.UpdateSubscription;

namespace Pare.Application.Subscriptions.Validators;

public class UpdateSubscriptionCommandValidator : AbstractValidator<UpdateSubscriptionCommand>
{
    public UpdateSubscriptionCommandValidator()
    {
        RuleFor(x => x.UpdateDto).SetValidator(new SubscriptionWriteDtoValidator());
    }
}
