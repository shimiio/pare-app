import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";

describe("LoadingState", () => {
  it("should render the default message", () => {
    const html = renderToStaticMarkup(<LoadingState />);
    expect(html).toContain("Loading");
    expect(html).toContain('role="status"');
  });

  it("should render a custom message", () => {
    const html = renderToStaticMarkup(<LoadingState message="Loading settings" />);
    expect(html).toContain("Loading settings");
  });
});

describe("ErrorState", () => {
  it("should render the retry button when onRetry is given", () => {
    const html = renderToStaticMarkup(<ErrorState onRetry={vi.fn()} />);
    expect(html).toContain("Try again");
    expect(html).toContain('role="alert"');
  });

  it("should not render a button without onRetry", () => {
    const html = renderToStaticMarkup(<ErrorState />);
    expect(html).not.toContain("<button");
  });

  it("should show the retrying label while a retry is in flight", () => {
    const html = renderToStaticMarkup(<ErrorState onRetry={vi.fn()} isRetrying />);
    expect(html).toContain("Retrying...");
    expect(html).toContain("disabled");
  });
});
