import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ModeToggle } from "../mode-toggle";

const mockSetTheme = vi.fn();

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ setTheme: mockSetTheme }),
}));

describe("ModeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the toggle button", () => {
    render(<ModeToggle />);
    expect(
      screen.getByRole("button", { name: /toggle theme/i }),
    ).toBeInTheDocument();
  });

  it("opens menu and changes theme", async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);

    const triggerBtn = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(triggerBtn);

    const darkOption = screen.getByText("Dark");
    expect(darkOption).toBeInTheDocument();

    await user.click(darkOption);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });
});
