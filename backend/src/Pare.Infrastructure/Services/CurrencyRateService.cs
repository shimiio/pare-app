using System.Net.Http.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Pare.Application.Currency.DTOs;
using Pare.Application.Interfaces;

namespace Pare.Infrastructure.Services;

public sealed class CurrencyRateService(IConfiguration config, ILogger<CurrencyRateService> logger, IHttpClientFactory httpClientFactory, IMemoryCache cache) : ICurrencyRateService
{
    public async Task<Dictionary<string, decimal>> GetRatesAsync(string baseCurrency)
    {
        var cacheKey = $"currency_rates_{baseCurrency}";

        if (cache.TryGetValue(cacheKey, out Dictionary<string, decimal>? cached) && cached is not null)
            return cached;

        var apiKey = config["ExchangeRate:ApiKey"]
            ?? throw new InvalidOperationException("ExchangeRate:ApiKey not configured");

        HttpClient client = httpClientFactory.CreateClient();

        try
        {
            var response = await client.GetFromJsonAsync<ExchangeRateResponse>(
                $"https://v6.exchangerate-api.com/v6/{apiKey}/latest/{baseCurrency}",
                new System.Text.Json.JsonSerializerOptions(System.Text.Json.JsonSerializerDefaults.Web));

            if (response?.ConversionRates is null)
                throw new InvalidOperationException("Failed to deserialize exchange rate response");

            cache.Set(cacheKey, response.ConversionRates, TimeSpan.FromHours(12));

            return response.ConversionRates;
        }
        catch (Exception ex)
        {
            logger.LogError("Error to get currency: {Error}", ex);
            throw;
        }
    }
}
