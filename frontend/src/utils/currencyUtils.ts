// convert an amount between currencies using rates relative to one base currency
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number> | undefined,
): number => {
  if (!rates) return amount;
  const inBase = amount / (rates[fromCurrency] ?? 1);
  return inBase * (rates[toCurrency] ?? 1);
};
