import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuth } from "../useAuth";
import { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/stores/useAuthStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type User } from "@/features/auth/types/types";

vi.mock("@/features/auth/services/auth.service", () => ({
  authService: { logout: vi.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe("useAuth Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("handles login correctly via store", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    const mockUser: User = {
      id: 1,
      email: "test@test.com",
      name: "Test",
      role: "USER",
      preferredCurrency: "USD",
    };

    act(() => {
      result.current.login(mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it("handles logout correctly", async () => {
    const mockUser = {
      id: 1,
      email: "test@test.com",
      name: "Test",
      role: "USER",
      preferredCurrency: "USD",
    } as User;

    useAuthStore.setState({
      isAuthenticated: true,
      user: mockUser,
      isLoading: false,
    });

    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(window.location.href).toContain("/auth?tab=login");
  });
});
