import type { Subscription } from "../types";

// price input validation
export const sanitizePriceInput = (value: string): string | null => {
  const input = value.replace(",", ".");
  if (input.length > 6) return null;
  if (/^\d*\.?\d{0,2}$/.test(input) || input === "") return input;
  return null;
};

// calculate the next billing date between start date and cycle
export const calculateNextBilling = (
  startDate: string | undefined,
  cycle: number | undefined,
) => {
  const date = new Date(startDate ?? new Date().toISOString());
  if (cycle === 0) date.setMonth(date.getMonth() + 1);
  if (cycle === 1) date.setFullYear(date.getFullYear() + 1);
  if (cycle === 2) date.setDate(date.getDate() + 7);
  return date.toISOString().split("T")[0];
};

// format the next billing
export const formatNextBilling = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

// get monthly amount from subscription
export const getMonthlyAmount = (
  sub: Subscription,
  toDefaultCurrency: (amount: number, fromCurrency: string) => number,
): number => {
  const price = sub.price ?? 0;
  const inDefault = toDefaultCurrency(price, sub.currency);

  switch (sub.billingCycle) {
    case 0:
      return inDefault;
    case 1:
      return inDefault / 12;
    case 2:
      return inDefault * 4.33;
    default:
      return inDefault;
  }
};
