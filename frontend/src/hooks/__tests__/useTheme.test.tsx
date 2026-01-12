import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";

import { useThemeStore } from "@/stores/useThemeStore";
import { useTheme } from "../useTheme";

describe("useTheme Hook (Zustand)", () => {
  const initialState = useThemeStore.getState();

  beforeEach(() => {
    useThemeStore.setState(initialState, true);
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("should return default theme (system)", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("system");
  });

  it("should update theme directly", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
  });

  it("should persist to localStorage", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("light");
    });

    expect(JSON.parse(localStorage.getItem("vite-ui-theme")!).state.theme).toBe(
      "light",
    );
  });
});
