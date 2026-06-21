export const fetchCurrencyRates = async (
  currency: string,
): Promise<Record<string, number>> => {
  const response = await fetch(
    `api/currency/${currency}`,
  );
  const data = await response.json();
  return data;
};
