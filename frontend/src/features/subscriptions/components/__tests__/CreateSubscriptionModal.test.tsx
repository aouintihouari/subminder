import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

import { CreateSubscriptionModal } from "../CreateSubscriptionModal";
import { subscriptionService } from "../../services/subscription.service";
import { Category, Frequency } from "../../types/types";

vi.mock("../../services/subscription.service", () => ({
  subscriptionService: {
    create: vi.fn(),
  },
}));

describe("CreateSubscriptionModal", () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens the modal when clicking the add button", async () => {
    const user = userEvent.setup();
    render(<CreateSubscriptionModal onSuccess={mockOnSuccess} />);

    const openButton = screen.getByRole("button", {
      name: /Add Subscription/i,
    });
    await user.click(openButton);

    expect(
      screen.getByRole("heading", { name: /New Subscription/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    render(<CreateSubscriptionModal onSuccess={mockOnSuccess} />);

    await user.click(screen.getByRole("button", { name: /Add Subscription/i }));

    const submitButton = screen.getByRole("button", {
      name: /Create Subscription/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    });

    expect(subscriptionService.create).not.toHaveBeenCalled();
  });

  it("submits the form with valid data", async () => {
    const user = userEvent.setup();

    (subscriptionService.create as Mock).mockResolvedValue({
      status: "success",
      data: { subscription: { id: 1, name: "Netflix" } },
    });

    render(<CreateSubscriptionModal onSuccess={mockOnSuccess} />);

    await user.click(screen.getByRole("button", { name: /Add Subscription/i }));

    const nameInput = screen.getByLabelText(/Name/i);
    await user.type(nameInput, "Netflix Premium");

    const priceInput = screen.getByLabelText(/Price/i);
    await user.clear(priceInput);
    await user.type(priceInput, "19.99");

    await user.click(
      screen.getByRole("button", { name: /Create Subscription/i }),
    );

    await waitFor(() => {
      expect(subscriptionService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Netflix Premium",
          price: 19.99,
          currency: "EUR",
          frequency: Frequency.MONTHLY,
          category: Category.ENTERTAINMENT,
        }),
      );

      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
