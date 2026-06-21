using MediatR;
using Pare.Application.Interfaces;

namespace Pare.Application.Currency.Queries.GetCurrencyRates;

public class GetCurrencyRatesQueryHandler(ICurrencyRateService currencyRateService)
    : IRequestHandler<GetCurrencyRatesQuery, Dictionary<string, decimal>>
{
    public async Task<Dictionary<string, decimal>> Handle(
        GetCurrencyRatesQuery request,
        CancellationToken cancellationToken)
    {
        return await currencyRateService.GetRatesAsync(request.BaseCurrency);
    }
}
