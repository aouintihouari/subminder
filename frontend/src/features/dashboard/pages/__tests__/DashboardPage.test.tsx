import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { DashboardPage } from "../DashboardPage";
import { subscriptionService } from "@/features/subscriptions/services/subscription.service";
import { Category, Frequency } from "@/features/subscriptions/types/types";

vi.mock("@/features/subscriptions/services/subscription.service", () => ({
  subscriptionService: {
    getAll: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/hooks/authContext", () => ({
  useAuth: () => ({
    user: { email: "test@user.com" },
    logout: vi.fn(),
  }),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading spinner initially", () => {
    (subscriptionService.getAll as Mock).mockReturnValue(new Promise(() => {}));

    render(<DashboardPage />);

    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("shows empty state when no subscriptions exist", async () => {
    (subscriptionService.getAll as Mock).mockResolvedValue({
      status: "success",
      data: { subscriptions: [] },
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/No subscriptions yet/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Add your first subscription/i),
      ).toBeInTheDocument();
    });
  });

  it("renders a list of subscriptions correctly", async () => {
    const mockSubscriptions = [
      {
        id: 1,
        name: "Netflix",
        price: 15.99,
        currency: "EUR",
        frequency: Frequency.MONTHLY,
        category: Category.ENTERTAINMENT,
        startDate: "2024-01-01T00:00:00.000Z",
        isActive: true,
      },
      {
        id: 2,
        name: "Gym",
        price: 30.0,
        currency: "EUR",
        frequency: Frequency.MONTHLY,
        category: Category.HEALTH,
        startDate: "2024-01-01T00:00:00.000Z",
        isActive: true,
      },
    ];

    (subscriptionService.getAll as Mock).mockResolvedValue({
      status: "success",
      data: { subscriptions: mockSubscriptions },
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Netflix")).toBeInTheDocument();
      expect(screen.getByText("Gym")).toBeInTheDocument();
      expect(screen.getByText("15.99")).toBeInTheDocument();
      expect(screen.getByText("30.00")).toBeInTheDocument();
    });
  });

  it("shows error message if API fails", async () => {
    (subscriptionService.getAll as Mock).mockRejectedValue(
      new Error("API Error"),
    );

    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to load subscriptions/i),
      ).toBeInTheDocument();
    });
  });
});
