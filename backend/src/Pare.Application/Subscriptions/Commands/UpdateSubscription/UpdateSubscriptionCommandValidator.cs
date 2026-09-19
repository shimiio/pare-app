using FluentValidation;
using Pare.Application.Subscriptions.Validators;

namespace Pare.Application.Subscriptions.Commands.UpdateSubscription;

public sealed class UpdateSubscriptionCommandValidator : AbstractValidator<UpdateSubscriptionCommand>
{
    public UpdateSubscriptionCommandValidator()
    {
        RuleFor(x => x.UpdateDto).SetValidator(new SubscriptionWriteDtoValidator());
    }
}
