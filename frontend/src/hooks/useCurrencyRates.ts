import { useQuery } from "react-query";
import { getCurrencyRates } from "../api/currency";

export const useCurrencyRates = (currency: string) => {
  return useQuery<Record<string, number>, Error>({
    queryKey: ["currencyRates", currency],
    queryFn: async () => {
      return getCurrencyRates(currency);
    },
    staleTime: 1000 * 60 * 60,
    retry: false,
  });
};
