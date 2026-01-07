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

// Mock the dependencies correctly
vi.mock("@/features/subscriptions/services/subscription.service", () => ({
  subscriptionService: {
    getAll: vi.fn(),
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

  beforeEach(() => {
    vi.clearAllMocks();
    // Simulate a connected user
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({
      user: { id: 1, email: "test@test.com", name: "Test", role: "USER" },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("shows loading state initially", () => {
    // Mock getAll to never resolve to simulate loading
    vi.mocked(subscriptionService.getAll).mockReturnValue(
      new Promise(() => {}),
    );

    const { container } = render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    // Verify the presence of the loading spinner
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("shows empty state when no subscriptions exist", async () => {
    vi.mocked(subscriptionService.getAll).mockResolvedValue({
      status: "success",
      data: { subscriptions: [] },
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

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      // Netflix appears in the List AND in the Stats (as Top expense)
      // So we expect at least one occurrence, or length 2
      expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0);

      // Spotify is not the top expense, so it appears once in the list
      expect(screen.getByText("Spotify")).toBeInTheDocument();

      // Verify the monthly total calculation (15.99 + 9.99 = 25.98)
      expect(screen.getByText("€25.98")).toBeInTheDocument();
    });
  });

  it("filters subscriptions by search query", async () => {
    vi.mocked(subscriptionService.getAll).mockResolvedValue({
      status: "success",
      data: { subscriptions: mockSubscriptions },
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    // Wait for initial load
    await waitFor(() =>
      expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0),
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "Net" } });

    // Netflix should still be visible (In stats + filtered list)
    expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0);

    // Spotify should NOT be visible
    expect(screen.queryByText("Spotify")).not.toBeInTheDocument();
  });

  it("toggles between Grid and List view", async () => {
    vi.mocked(subscriptionService.getAll).mockResolvedValue({
      status: "success",
      data: { subscriptions: mockSubscriptions },
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    // Wait for initial load
    await waitFor(() =>
      expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0),
    );

    // Default is Grid view (Table should NOT be present)
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    const listButton = screen.getByLabelText("List view");
    fireEvent.click(listButton);

    // Should now show Table
    expect(screen.getByRole("table")).toBeInTheDocument();

    // Validate content inside the table
    const table = screen.getByRole("table");
    expect(within(table).getAllByText("Netflix").length).toBeGreaterThan(0);
  });

  it("shows error message if API fails", async () => {
    vi.mocked(subscriptionService.getAll).mockRejectedValue(
      new Error("API Error"),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to load subscriptions");
    });
  });
});
