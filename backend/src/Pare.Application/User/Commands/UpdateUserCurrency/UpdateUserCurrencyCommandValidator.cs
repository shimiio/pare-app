using FluentValidation;

namespace Pare.Application.User.Commands.UpdateUserCurrency;

public class UpdateUserCurrencyCommandValidator : AbstractValidator<UpdateUserCurrencyCommand>
{
    public UpdateUserCurrencyCommandValidator()
    {
        RuleFor(x => x.Update.Currency)
            .NotEmpty().WithMessage("Currency is required")
            .Length(3).WithMessage("Currency must be a 3-letter code (e.g. EUR)");
    }
}
