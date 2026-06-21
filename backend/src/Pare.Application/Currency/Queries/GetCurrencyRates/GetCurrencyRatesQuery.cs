using MediatR;

namespace Pare.Application.Currency.Queries.GetCurrencyRates;

public record GetCurrencyRatesQuery(string BaseCurrency) : IRequest<Dictionary<string, decimal>>;
