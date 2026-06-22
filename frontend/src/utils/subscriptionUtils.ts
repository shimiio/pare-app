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
  startDateStr: string,
  cycle: number,
): string => {
  if (!startDateStr) return "";

  const [year, month, day] = startDateStr.split("-").map(Number);
  const nextBilling = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0),
  );

  while (nextBilling <= todayUTC) {
    if (cycle === 0) {
      // Monthly
      nextBilling.setUTCMonth(nextBilling.getUTCMonth() + 1);
    } else if (cycle === 1) {
      // Yearly
      nextBilling.setUTCFullYear(nextBilling.getUTCFullYear() + 1);
    } else if (cycle === 2) {
      // Weekly
      nextBilling.setUTCDate(nextBilling.getUTCDate() + 7);
    }
  }

  const yyyy = nextBilling.getUTCFullYear();
  const mm = String(nextBilling.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(nextBilling.getUTCDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
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

// get monthly expenses subscription
export const getMonthlyExpenses = (
  subs: Subscription[],
  toDefaultCurrency: (amount: number, fromCurrency: string) => number,
) => {
  return subs.reduce(
    (sum, sub) => sum + getMonthlyAmount(sub, toDefaultCurrency),
    0,
  );
};

// get yearly expenses subscription
export const getYearlyExpenses = (
  subscription: Subscription[],
  toDefaultCurrency: (amount: number, fromCurrency: string) => number,
) => {
  const monthly = getMonthlyExpenses(subscription, toDefaultCurrency);
  return monthly * 12;
};
