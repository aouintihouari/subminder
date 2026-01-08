import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ThemeProvider } from "../ThemeProvider";

describe("ThemeProvider", () => {
  const mockMatchMedia = vi.fn();

  beforeEach(() => {
    document.documentElement.className = "";
    localStorage.clear();

    mockMatchMedia.mockReturnValue({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders children correctly", () => {
    render(
      <ThemeProvider>
        <div data-testid="child">I am a child</div>
      </ThemeProvider>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("applies 'dark' class when defaultTheme is 'dark'", () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <div>Test</div>
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("applies 'light' class (no dark class) when defaultTheme is 'light'", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <div>Test</div>
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("detects system dark mode correctly", () => {
    mockMatchMedia.mockReturnValue({
      matches: true, // true = Dark mode detected
      addListener: vi.fn(),
      removeListener: vi.fn(),
    });

    render(
      <ThemeProvider defaultTheme="system">
        <div>Test</div>
      </ThemeProvider>,
    );

    expect(window.matchMedia).toHaveBeenCalledWith(
      "(prefers-color-scheme: dark)",
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("uses localStorage value if available", () => {
    localStorage.setItem("vite-ui-theme", "dark");

    render(
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div>Test</div>
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("respects custom storage key", () => {
    localStorage.setItem("my-custom-key", "dark");

    render(
      <ThemeProvider defaultTheme="light" storageKey="my-custom-key">
        <div>Test</div>
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
