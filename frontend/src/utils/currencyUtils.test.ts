import { describe, it, expect } from "vitest";
import { convertCurrency } from "./currencyUtils";

// rates as returned by the API for base currency EUR
const rates = { EUR: 1, USD: 1.25, UAH: 50 };

describe("convertCurrency", () => {
  it("should return the same amount for the same currency", () => {
    expect(convertCurrency(10, "EUR", "EUR", rates)).toBe(10);
  });

  it("should convert foreign currency to base currency", () => {
    expect(convertCurrency(12.5, "USD", "EUR", rates)).toBe(10);
  });

  it("should convert between two non-base currencies", () => {
    expect(convertCurrency(10, "USD", "UAH", rates)).toBe(400);
  });

  it("should return the amount unchanged when rates are not loaded", () => {
    expect(convertCurrency(10, "USD", "EUR", undefined)).toBe(10);
  });

  it("should treat an unknown currency as 1:1", () => {
    expect(convertCurrency(10, "XYZ", "EUR", rates)).toBe(10);
  });
});
