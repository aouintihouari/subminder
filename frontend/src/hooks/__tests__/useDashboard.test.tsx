import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDashboard } from "../useDashboard";
import { subscriptionService } from "@/features/subscriptions/services/subscription.service";
import { Category, Frequency } from "@/features/subscriptions/types/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

vi.mock("@/features/subscriptions/services/subscription.service", () => ({
  subscriptionService: {
    getAll: vi.fn(),
    getStats: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockSubscriptions = [
  {
    id: 1,
    name: "Netflix",
    price: 15,
    currency: "EUR",
    frequency: Frequency.MONTHLY,
    category: Category.ENTERTAINMENT,
    startDate: "2024-01-01",
    isActive: true,
  },
  {
    id: 2,
    name: "Gym",
    price: 30,
    currency: "EUR",
    frequency: Frequency.MONTHLY,
    category: Category.HEALTH,
    startDate: "2024-01-01",
    isActive: true,
  },
];

const mockStats = {
  totalMonthly: 45,
  totalYearly: 540,
  activeCount: 2,
  categoryCount: 2,
  mostExpensive: mockSubscriptions[1],
};

describe("useDashboard Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(subscriptionService.getAll).mockResolvedValue({
      status: "success",
      data: { subscriptions: mockSubscriptions },
    });
    vi.mocked(subscriptionService.getStats).mockResolvedValue({
      status: "success",
      data: mockStats,
    });
  });

  it("should fetch data on mount", async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.subscriptions).toHaveLength(2);
    expect(result.current.stats.totalMonthly).toBe(45);
  });

  it("should filter subscriptions by search query", async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.actions.setSearchQuery("Net");
    });

    expect(result.current.subscriptions).toHaveLength(1);
    expect(result.current.subscriptions[0].name).toBe("Netflix");
  });

  it("should filter subscriptions by category", async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.actions.setCategoryFilter(Category.HEALTH);
    });

    expect(result.current.subscriptions).toHaveLength(1);
    expect(result.current.subscriptions[0].name).toBe("Gym");
  });

  it("should handle delete action flow", async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.actions.requestDelete(1);
    });

    expect(result.current.uiState.deleteDialogOpen).toBe(true);

    await act(async () => {
      await result.current.actions.confirmDelete();
    });

    expect(subscriptionService.delete).toHaveBeenCalledWith(1);
    expect(result.current.uiState.deleteDialogOpen).toBe(false);
  });
});
