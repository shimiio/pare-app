using FluentValidation;

namespace Pare.Application.User.Commands.UpdateUserName;

public sealed class UpdateUserNameCommandValidator : AbstractValidator<UpdateUserNameCommand>
{
    public UpdateUserNameCommandValidator()
    {
        RuleFor(x => x.Update.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(50);
    }
}
