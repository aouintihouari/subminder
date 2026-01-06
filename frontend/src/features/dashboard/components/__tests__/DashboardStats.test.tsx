import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DashboardStats } from "../DashboardStats";
import { Frequency, Category } from "@/features/subscriptions/types/types";

describe("DashboardStats", () => {
  const mockSubscriptions = [
    {
      id: 1,
      name: "Monthly App",
      price: 10,
      currency: "EUR",
      frequency: Frequency.MONTHLY,
      category: Category.ENTERTAINMENT,
      startDate: "2024-01-01",
      isActive: true,
      userId: 1,
      createdAt: "",
    },
    {
      id: 2,
      name: "Yearly App",
      price: 120,
      currency: "EUR",
      frequency: Frequency.YEARLY,
      category: Category.UTILITIES,
      startDate: "2024-01-01",
      isActive: true,
      userId: 1,
      createdAt: "",
    },
    {
      id: 3,
      name: "Weekly App",
      price: 10,
      currency: "EUR",
      frequency: Frequency.WEEKLY,
      category: Category.FOOD,
      startDate: "2024-01-01",
      isActive: true,
      userId: 1,
      createdAt: "",
    },
    {
      id: 4,
      name: "One Time Purchase",
      price: 50,
      currency: "EUR",
      frequency: Frequency.ONCE,
      category: Category.LEARNING,
      startDate: "2024-01-01",
      isActive: true,
      userId: 1,
      createdAt: "",
    },
    {
      id: 5,
      name: "Inactive App",
      price: 100,
      currency: "EUR",
      frequency: Frequency.MONTHLY,
      category: Category.OTHER,
      startDate: "2024-01-01",
      isActive: false,
      userId: 1,
      createdAt: "",
    },
  ];

  it("calculates monthly recurring costs correctly", () => {
    render(<DashboardStats subscriptions={mockSubscriptions} />);
    expect(screen.getByText("€63.33")).toBeInTheDocument();
  });

  it("identifies the most expensive subscription correctly", () => {
    render(<DashboardStats subscriptions={mockSubscriptions} />);
    // Correction : Format €120.00
    expect(screen.getByText("€120.00")).toBeInTheDocument();
    expect(screen.getByText("Yearly App")).toBeInTheDocument();
  });

  it("counts active subscriptions correctly", () => {
    render(<DashboardStats subscriptions={mockSubscriptions} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
