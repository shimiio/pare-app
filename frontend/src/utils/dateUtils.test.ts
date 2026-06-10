import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDaysUtil, getLabelColor } from "./dateUtils";

describe("getDaysUtil", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-02"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return 8 days for date 8 days in the future", () => {
    expect(getDaysUtil("2026-06-10")).toBe(8);
  });

  it("should return 0 days for current date", () => {
    expect(getDaysUtil("2026-06-02")).toBe(0);
  });

  it("should return -33 days for date 32 days in the past", () => {
    expect(getDaysUtil("2026-05-01")).toBe(-32);
  });
});

describe("getLabelColor", () => {
  it("should return red color for 3 days or less", () => {
    expect(getLabelColor(0)).toBe(
      "bg-red-500/10 border-red-500/20 text-red-400",
    );
    expect(getLabelColor(3)).toBe(
      "bg-red-500/10 border-red-500/20 text-red-400",
    );
  });

  it("should return yellow color for 4-7 days", () => {
    expect(getLabelColor(4)).toBe(
      "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    );
    expect(getLabelColor(7)).toBe(
      "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    );
  });

  it("should return green color for 8+ days", () => {
    expect(getLabelColor(8)).toBe(
      "bg-green-500/10 border-green-500/20 text-green-400",
    );
    expect(getLabelColor(10)).toBe(
      "bg-green-500/10 border-green-500/20 text-green-400",
    );
  });
});
