const API_KEY = import.meta.env.VITE_CURRENCY_RATES_API_KEY;

export const fetchCurrencyRates = async (
  currency: string,
): Promise<Record<string, number>> => {
  const response = await fetch(
    `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${currency}`,
  );
  const data = await response.json();
  return data.conversion_rates;
};
