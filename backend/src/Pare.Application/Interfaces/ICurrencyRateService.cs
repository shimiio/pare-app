namespace Pare.Application.Interfaces;

public interface ICurrencyRateService
{
    Task<Dictionary<string, decimal>> GetRatesAsync(string baseCurrency);
}
