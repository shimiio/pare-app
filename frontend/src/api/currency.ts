import { apiClient } from "./client";

export const getCurrencyRates = async (
  currency: string,
): Promise<Record<string, number>> => {
  // Axios сам сделает JSON.parse, поэтому берем сразу response.data
  const response = await apiClient.get(`/currency/${currency}`);
  return response.data;
};
