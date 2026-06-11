using FluentValidation;

namespace Pare.Application.User.Commands.ChangeUserPassword;

public class ChangeUserPasswordCommandValidator : AbstractValidator<ChangeUserPasswordCommand>
{
    public ChangeUserPasswordCommandValidator()
    {
        RuleFor(x => x.Change.CurrentPassword)
            .NotEmpty().WithMessage("Current password is required");

        RuleFor(x => x.Change.NewPassword)
            .NotEmpty().WithMessage("New Password is required")
            .MinimumLength(8).WithMessage("New Password must be at least 8 characters")
            .Matches("[A-Z]").WithMessage("New Password must contain at least one uppercase letter")
            .Matches("[0-9]").WithMessage("New Password must contain at least one number");
    }
}
