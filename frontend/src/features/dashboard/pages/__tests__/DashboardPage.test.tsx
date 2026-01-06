import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { DashboardPage } from "../DashboardPage";
import { subscriptionService } from "@/features/subscriptions/services/subscription.service";
import { Category, Frequency } from "@/features/subscriptions/types/types";
import { toast } from "sonner";

vi.mock("@/features/subscriptions/services/subscription.service", () => ({
  subscriptionService: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/hooks/authContext", () => ({
  useAuth: () => ({
    user: { email: "test@user.com" },
    logout: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("DashboardPage", () => {
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
    (subscriptionService.getAll as Mock).mockResolvedValue({
      status: "success",
      data: { subscriptions: mockSubscriptions },
    });

    render(<DashboardPage />);

    await waitFor(() => {
      // Utilisation de getAllByText pour gérer les doublons (Stats + Liste)
      expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Gym").length).toBeGreaterThan(0);
      expect(screen.getAllByText("€15.99").length).toBeGreaterThan(0);
      expect(screen.getAllByText("€30.00").length).toBeGreaterThan(0);
    });
  });

  it("filters subscriptions by search query", async () => {
    const user = userEvent.setup();
    (subscriptionService.getAll as Mock).mockResolvedValue({
      status: "success",
      data: { subscriptions: mockSubscriptions },
    });

    render(<DashboardPage />);

    // Attendre le chargement
    await waitFor(() =>
      expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0),
    );

    // Tape "Gym" dans la recherche
    const searchInput = screen.getByPlaceholderText(/Search.../i);
    await user.type(searchInput, "Gym");

    // CORRECTION ICI : "Gym" peut apparaître plusieurs fois (Stats + Card)
    expect(screen.getAllByText("Gym").length).toBeGreaterThan(0);

    // "Netflix" ne doit pas être visible dans la liste (ni en Top Expense car moins cher)
    expect(screen.queryByText("Netflix")).not.toBeInTheDocument();
  });

  it("toggles between Grid and List view", async () => {
    const user = userEvent.setup();
    (subscriptionService.getAll as Mock).mockResolvedValue({
      status: "success",
      data: { subscriptions: mockSubscriptions },
    });

    render(<DashboardPage />);

    await waitFor(() =>
      expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0),
    );

    // Par défaut, on ne doit pas voir de tableau (<table>)
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    // Clic sur le bouton "List view" (repéré par son aria-label)
    const listViewBtn = screen.getByLabelText("List view");
    await user.click(listViewBtn);

    // Maintenant, le tableau doit être présent
    expect(screen.getByRole("table")).toBeInTheDocument();
    // On vérifie qu'une ligne de tableau contient "Netflix"
    expect(
      screen.getAllByRole("row", { name: /Netflix/i }).length,
    ).toBeGreaterThan(0);
  });

  it("shows error message if API fails", async () => {
    (subscriptionService.getAll as Mock).mockRejectedValue(
      new Error("API Error"),
    );

    render(<DashboardPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to load subscriptions");
    });
  });
});
