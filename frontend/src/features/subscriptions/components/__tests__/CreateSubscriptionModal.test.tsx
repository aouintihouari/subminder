import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

import { CreateSubscriptionModal } from "../CreateSubscriptionModal";
import { subscriptionService } from "../../services/subscription.service";
import { Category, Frequency } from "../../types/types";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../services/subscription.service", () => ({
  subscriptionService: {
    create: vi.fn(),
  },
}));

describe("CreateSubscriptionModal", () => {
  const mockOnSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly when open", () => {
    render(
      <CreateSubscriptionModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /New Subscription/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for invalid inputs", async () => {
    const user = userEvent.setup();
    render(
      <CreateSubscriptionModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    const nameInput = screen.getByPlaceholderText(/Netflix/i);
    await user.type(nameInput, "a");

    const submitButton = screen.getByRole("button", {
      name: /Create Subscription/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/must be at least 2 characters/i),
      ).toBeInTheDocument();

      expect(
        screen.getByText(/Price must be greater than 0/i),
      ).toBeInTheDocument();
    });

    expect(subscriptionService.create).not.toHaveBeenCalled();
  });

  it("submits the form with valid data", async () => {
    const user = userEvent.setup();

    (subscriptionService.create as Mock).mockResolvedValue({
      status: "success",
      data: { subscription: { id: 1, name: "Netflix" } },
    });

    render(
      <CreateSubscriptionModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    const nameInput = screen.getByPlaceholderText(/Netflix/i);
    await user.type(nameInput, "Netflix Premium");

    const spinButtons = screen.getAllByRole("spinbutton");
    const priceInput = spinButtons[0];
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
          category: Category.OTHER,
        }),
      );

      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
