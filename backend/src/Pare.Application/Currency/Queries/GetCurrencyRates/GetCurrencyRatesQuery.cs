using MediatR;

namespace Pare.Application.Currency.Queries.GetCurrencyRates;

public sealed record GetCurrencyRatesQuery(string BaseCurrency) : IRequest<Dictionary<string, decimal>>;
