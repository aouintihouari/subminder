import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { ModeToggle } from "../mode-toggle";
import { ThemeProvider } from "@/context/ThemeProvider";

describe("ModeToggle", () => {
  const renderWithTheme = () => {
    return render(
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme-test">
        <ModeToggle />
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  it("changes theme to dark when selected", async () => {
    const user = userEvent.setup();
    renderWithTheme();

    const triggerBtn = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(triggerBtn);

    const darkOption = screen.getByText("Dark");
    await user.click(darkOption);

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("vite-ui-theme-test")).toBe("dark");
  });

  it("changes theme to light when selected", async () => {
    const user = userEvent.setup();
    document.documentElement.classList.add("dark");
    renderWithTheme();

    const triggerBtn = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(triggerBtn);

    const lightOption = screen.getByText("Light");
    await user.click(lightOption);

    expect(document.documentElement).toHaveClass("light");
    expect(localStorage.getItem("vite-ui-theme-test")).toBe("light");
  });
});
