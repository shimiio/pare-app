import { describe, it, expect } from "vitest";
import { extractErrors } from "./errorUtils";

describe("extractErrors", () => {
  const mockAxiosError = {
    isAxiosError: true,
    response: {
      data: {
        errors: {
          "Request.Name": ["Name is required"],
          "Request.Email": ["Invalid email format"],
        },
      },
    },
  };

  const mockAxiosErrorNoErrors = {
    isAxiosError: true,
    response: {
      data: {},
    },
  };

  it("should extract error messages from axios error response", () => {
    expect(extractErrors(mockAxiosError)).toEqual([
      "Name is required",
      "Invalid email format",
    ]);
  });

  it("should return empty array for non-axios error", () => {
    expect(extractErrors(new Error("something"))).toEqual([]);
  });

  it("should return empty array when no errors field in response", () => {
    expect(extractErrors(mockAxiosErrorNoErrors)).toEqual([]);
  });
});
