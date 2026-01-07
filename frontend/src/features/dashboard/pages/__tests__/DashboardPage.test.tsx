import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { DashboardPage } from "../DashboardPage";
import { subscriptionService } from "@/features/subscriptions/services/subscription.service";
import * as AuthContext from "@/hooks/authContext";
import { MemoryRouter } from "react-router";
import { toast } from "sonner";

// Mock des services
vi.mock("@/features/subscriptions/services/subscription.service", () => ({
  subscriptionService: {
    getAll: vi.fn(),
    getStats: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("DashboardPage", () => {
  const mockSubscriptions = [
    {
      id: 1,
      name: "Netflix",
      price: 15.99,
      currency: "EUR",
      frequency: "MONTHLY",
      category: "ENTERTAINMENT",
      startDate: new Date().toISOString(),
      isActive: true,
    },
    {
      id: 2,
      name: "Spotify",
      price: 9.99,
      currency: "EUR",
      frequency: "MONTHLY",
      category: "ENTERTAINMENT",
      startDate: new Date().toISOString(),
      isActive: true,
    },
  ];

  const mockStats = {
    totalMonthly: 25.98,
    totalYearly: 311.76,
    activeCount: 2,
    categoryCount: 1,
    mostExpensive: mockSubscriptions[0], // Netflix est le plus cher
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({
      user: { id: 1, email: "test@test.com", name: "Test", role: "USER" },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("shows loading state initially", () => {
    vi.mocked(subscriptionService.getAll).mockReturnValue(
      new Promise(() => {}),
    );
    vi.mocked(subscriptionService.getStats).mockReturnValue(
      new Promise(() => {}),
    );

    const { container } = render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows empty state when no subscriptions exist", async () => {
    vi.mocked(subscriptionService.getAll).mockResolvedValue({
      status: "success",
      data: { subscriptions: [] },
    });
    vi.mocked(subscriptionService.getStats).mockResolvedValue({
      status: "success",
      data: {
        totalMonthly: 0,
        totalYearly: 0,
        activeCount: 0,
        categoryCount: 0,
        mostExpensive: null,
      },
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/No subscriptions yet/i)).toBeInTheDocument();
    });
  });

  it("renders a list of subscriptions correctly", async () => {
    vi.mocked(subscriptionService.getAll).mockResolvedValue({
      status: "success",
      data: { subscriptions: mockSubscriptions },
    });
    vi.mocked(subscriptionService.getStats).mockResolvedValue({
      status: "success",
      data: mockStats,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0);
      expect(screen.getByText("Spotify")).toBeInTheDocument();
      expect(screen.getByText("€25.98")).toBeInTheDocument();
    });
  });

  it("filters subscriptions by search query", async () => {
    vi.mocked(subscriptionService.getAll).mockResolvedValue({
      status: "success",
      data: { subscriptions: mockSubscriptions },
    });
    vi.mocked(subscriptionService.getStats).mockResolvedValue({
      status: "success",
      data: mockStats,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText("Spotify")).toBeInTheDocument(),
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "Net" } });

    expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0);

    expect(screen.queryByText("Spotify")).not.toBeInTheDocument();
  });

  it("toggles between Grid and List view", async () => {
    vi.mocked(subscriptionService.getAll).mockResolvedValue({
      status: "success",
      data: { subscriptions: mockSubscriptions },
    });
    vi.mocked(subscriptionService.getStats).mockResolvedValue({
      status: "success",
      data: mockStats,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0),
    );

    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    const listButton = screen.getByLabelText("List view");
    fireEvent.click(listButton);

    expect(screen.getByRole("table")).toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(within(table).getByText("Netflix")).toBeInTheDocument();
  });

  it("shows error message if API fails", async () => {
    vi.mocked(subscriptionService.getAll).mockRejectedValue(
      new Error("API Error"),
    );
    vi.mocked(subscriptionService.getStats).mockResolvedValue({
      status: "success",
      data: mockStats,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to load dashboard data");
    });
  });
});
