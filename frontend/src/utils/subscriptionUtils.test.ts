import { describe, it, expect, vi } from "vitest";
import type { Subscription } from "../types";
import {
  sanitizePriceInput,
  calculateNextBilling,
  getMonthlyAmount,
  getYearlyExpenses,
  getMonthlyExpenses,
} from "./subscriptionUtils";

const createSubscription = (partial: Partial<Subscription>): Subscription => ({
  id: 1,
  name: "Test Service",
  currency: "EUR",
  billingCycle: 0,
  status: 0,
  nextBillingDate: "2026-06-02",
  startDate: "2026-06-02",
  serviceUrl: "https://example.com",
  ...partial,
});

describe("sanitizePriceInput", () => {
  it("should return valid price with dot", () => {
    expect(sanitizePriceInput("9.99")).toBe("9.99");
  });

  it("should replace comma with dot", () => {
    expect(sanitizePriceInput("9,99")).toBe("9.99");
  });

  it("should return null for non-numeric input", () => {
    expect(sanitizePriceInput("abc")).toBe(null);
  });

  it("should return null for length greater than 6 characters", () => {
    expect(sanitizePriceInput("1234567")).toBe(null);
  });

  it("should return valid input for exactly 6 characters", () => {
    expect(sanitizePriceInput("123456")).toBe("123456");
  });

  it("should return null for more than 2 decimal places", () => {
    expect(sanitizePriceInput("123.123")).toBe(null);
  });
});

describe("calculateNextBilling", () => {
  it("should calculate next billing date for monthly cycle", () => {
    expect(calculateNextBilling("2026-06-02", 0)).toBe("2026-07-02");
  });

  it("should calculate next billing date for yearly cycle", () => {
    expect(calculateNextBilling("2026-06-02", 1)).toBe("2027-06-02");
  });
});

describe("Subscription Expenses Calculations", () => {
  const mockToDefaultCurrency = vi.fn(
    (amount: number, fromCurrency: string) => {
      if (fromCurrency === "USD") return amount * 2;
      return amount;
    },
  );

  describe("getMonthlyAmount", () => {
    it("should return monthly amount for monthly subscription (cycle 0)", () => {
      const sub = createSubscription({
        price: 100,
        currency: "EUR",
        billingCycle: 0,
      });
      expect(getMonthlyAmount(sub, mockToDefaultCurrency)).toBe(100);
    });

    it("should correctly divide the amount for the annual subscription (cycle 1)", () => {
      const sub = createSubscription({
        price: 120,
        currency: "EUR",
        billingCycle: 1,
      });
      expect(getMonthlyAmount(sub, mockToDefaultCurrency)).toBe(10); // 120 / 12
    });

    it("should correctly multiply the amount for a weekly subscription (cycle 2)", () => {
      const sub = createSubscription({
        price: 10,
        currency: "EUR",
        billingCycle: 2,
      });
      expect(getMonthlyAmount(sub, mockToDefaultCurrency)).toBe(43.3); // 10 * 4.33
    });

    it("should return 0 if price is not specified (undefined)", () => {
      const sub = createSubscription({
        currency: "EUR",
        billingCycle: 0,
        price: undefined,
      });
      expect(getMonthlyAmount(sub, mockToDefaultCurrency)).toBe(0);
    });

    it("should apply currency conversion", () => {
      const sub = createSubscription({
        price: 100,
        currency: "USD",
        billingCycle: 0,
      });
      expect(getMonthlyAmount(sub, mockToDefaultCurrency)).toBe(200);
    });
  });

  describe("getMonthlyExpenses", () => {
    it("should add up the monthly subscription mass costs", () => {
      const subs: Subscription[] = [
        createSubscription({ price: 100, currency: "EUR", billingCycle: 0 }), // 100 per month
        createSubscription({ price: 120, currency: "EUR", billingCycle: 1 }), // 10 per month
      ];

      expect(getMonthlyExpenses(subs, mockToDefaultCurrency)).toBe(110);
    });

    it("should return 0 for empty array", () => {
      expect(getMonthlyExpenses([], mockToDefaultCurrency)).toBe(0);
    });
  });

  describe("getYearlyExpenses", () => {
    it("should multiply monthly expenses by 12", () => {
      const subs: Subscription[] = [
        createSubscription({ price: 100, currency: "EUR", billingCycle: 0 }), // 100 per month
        createSubscription({ price: 10, currency: "EUR", billingCycle: 0 }), // 10 per month
      ];

      expect(getYearlyExpenses(subs, mockToDefaultCurrency)).toBe(1320);
    });
  });
});
