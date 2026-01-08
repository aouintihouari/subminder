import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAuth } from "@/hooks/useAuth";
import { AuthProvider } from "@/context/AuthProvider";
import { authService } from "@/features/auth/services/auth.service";
import { type ReactNode } from "react";

vi.mock("@/features/auth/services/auth.service", () => ({
  authService: {
    getMe: vi.fn(),
    logout: vi.fn(),
  },
}));

describe("useAuth & AuthProvider", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "" },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it("throws error if used outside AuthProvider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within an AuthProvider",
    );

    consoleSpy.mockRestore();
  });

  it("initializes as loading then unauthenticated if getMe fails", async () => {
    vi.mocked(authService.getMe).mockRejectedValue(new Error("Unauthorized"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("initializes as authenticated if getMe succeeds", async () => {
    const mockUser = {
      id: 1,
      email: "test@test.com",
      name: "Test",
      role: "USER",
    };
    vi.mocked(authService.getMe).mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it("handles login updates correctly", async () => {
    vi.mocked(authService.getMe).mockRejectedValue(new Error("No user"));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const newUser = { id: 2, email: "new@test.com", name: "New", role: "USER" };

    act(() => {
      result.current.login(newUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(newUser);
  });

  it("handles logout correctly", async () => {
    const mockUser = {
      id: 1,
      email: "test@test.com",
      name: "Test",
      role: "USER",
    };
    vi.mocked(authService.getMe).mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.logout();
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(window.location.href).toContain("/auth?tab=login");
  });
});
