import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SubscriptionCard } from "../SubscriptionCard";
import { Category, Frequency } from "../../types/types";

describe("SubscriptionCard", () => {
  const mockSub = {
    id: 1,
    name: "Spotify",
    price: 9.99,
    currency: "EUR",
    frequency: Frequency.MONTHLY,
    category: Category.ENTERTAINMENT,
    startDate: "2024-01-01",
    isActive: true,
    userId: 1,
    createdAt: "",
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  it("renders subscription details correctly", () => {
    render(
      <SubscriptionCard
        subscription={mockSub}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("Spotify")).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("9.99")),
    ).toBeInTheDocument();
    expect(screen.getByText("ENTERTAINMENT")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    const subWithDesc = { ...mockSub, description: "For work projects" };
    render(
      <SubscriptionCard
        subscription={subWithDesc}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );
    expect(screen.getByText("For work projects")).toBeInTheDocument();
  });

  it("displays the formatted date correctly", () => {
    render(
      <SubscriptionCard
        subscription={mockSub}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );
    // On cherche le texte "Next: Jan 1, 2024" (ou format par défaut)
    expect(screen.getByText(/Next:/i)).toBeInTheDocument();
    expect(screen.getByText(/Jan 1, 2024/i)).toBeInTheDocument();
  });

  it("opens menu and calls delete when clicked", async () => {
    const user = userEvent.setup();
    render(
      <SubscriptionCard
        subscription={mockSub}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );
    const menuButton = screen.getByRole("button", { name: /open menu/i });
    await user.click(menuButton);
    const deleteItem = screen.getByText(/delete/i);
    await user.click(deleteItem);
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });
});
