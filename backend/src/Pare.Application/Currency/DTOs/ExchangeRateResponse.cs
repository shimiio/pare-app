using System.Text.Json.Serialization;

namespace Pare.Application.Currency.DTOs;

public sealed class ExchangeRateResponse
{
    [JsonPropertyName("conversion_rates")]
    public Dictionary<string, decimal> ConversionRates { get; set; } = [];
}
