import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useTheme } from "../useTheme";
import { ThemeProvider } from "@/context/ThemeProvider";
import { type ReactNode } from "react";

describe("useTheme Hook", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("should return default theme (system)", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("system");
  });

  it("should use the theme provided by ThemeProvider", () => {
    // On crée un wrapper qui simule l'application entourée du Provider
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider defaultTheme="dark" storageKey="test-theme-key">
        {children}
      </ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("dark");
    // Vérifie que la classe CSS a bien été appliquée au HTML
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should update theme and persist to localStorage", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider defaultTheme="light" storageKey="test-theme-key">
        {children}
      </ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("light");

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("test-theme-key")).toBe("dark");
  });
});
