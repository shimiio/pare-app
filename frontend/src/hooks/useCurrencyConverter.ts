import { useUser } from "./useUser";
import { useCurrencyRates } from "./useCurrencyRates";
import { convertCurrency } from "../utils/currencyUtils";

// user's display currency and a function converting any amount into it
export const useCurrencyConverter = () => {
  const { data: user } = useUser();
  const currency = user?.currency ?? "EUR";
  const { data: rates } = useCurrencyRates(currency);

  const toDefaultCurrency = (amount: number, fromCurrency: string): number =>
    convertCurrency(amount, fromCurrency, currency, rates);

  return { currency, toDefaultCurrency };
};
