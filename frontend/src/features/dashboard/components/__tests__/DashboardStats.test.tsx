import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DashboardStats } from "../DashboardStats";
import { Frequency, Category } from "@/features/subscriptions/types/types";

describe("DashboardStats", () => {
  const mockStats = {
    totalMonthly: 125.5,
    totalYearly: 1506.0,
    activeCount: 5,
    categoryCount: 3,
    mostExpensive: {
      id: 1,
      name: "Luxury Gym",
      price: 80,
      currency: "EUR",
      frequency: Frequency.MONTHLY,
      category: Category.HEALTH,
      startDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isActive: true,
      userId: 1,
    },
  };

  it("displays monthly and yearly costs correctly", () => {
    render(<DashboardStats stats={mockStats} />);
    expect(screen.getByText("€125.50")).toBeInTheDocument();
    expect(screen.getByText("€1,506.00")).toBeInTheDocument();
  });

  it("displays active count and category count", () => {
    render(<DashboardStats stats={mockStats} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText(/Across 3 categories/i)).toBeInTheDocument();
  });

  it("displays the most expensive subscription details", () => {
    render(<DashboardStats stats={mockStats} />);
    expect(screen.getByText("Luxury Gym")).toBeInTheDocument();
    expect(screen.getByText("€80.00")).toBeInTheDocument();
  });

  it("handles loading state", () => {
    render(<DashboardStats stats={mockStats} isLoading={true} />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText("€125.50")).not.toBeInTheDocument();
  });

  it("handles null mostExpensive (empty state)", () => {
    const emptyStats = {
      ...mockStats,
      mostExpensive: null,
    };
    render(<DashboardStats stats={emptyStats} />);
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText("No subscriptions")).toBeInTheDocument();
  });
});
