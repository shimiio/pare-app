using FluentValidation;

namespace Pare.Application.Currency.Queries.GetCurrencyRates;

public class GetCurrencyRatesQueryValidator : AbstractValidator<GetCurrencyRatesQuery>
{
    private static readonly string[] AllowedCurrencies = ["USD", "EUR", "UAH"];

    public GetCurrencyRatesQueryValidator()
    {
        RuleFor(x => x.BaseCurrency)
            .NotEmpty()
            .Must(c => AllowedCurrencies.Contains(c.ToUpper()))
            .WithMessage("Currency not supported. Allowed: USD, EUR, UAH");
    }
}
