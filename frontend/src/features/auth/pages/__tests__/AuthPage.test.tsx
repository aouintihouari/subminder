import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { AuthPage } from "../AuthPage";

vi.mock("../../components/LoginForm", () => ({
  LoginForm: () => <div data-testid="login-form">Mock Login Form</div>,
}));

vi.mock("../../components/SignupForm", () => ({
  SignupForm: () => <div data-testid="signup-form">Mock Signup Form</div>,
}));

describe("AuthPage", () => {
  it("renders login tab by default", () => {
    render(
      <MemoryRouter initialEntries={["/auth"]}>
        <AuthPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("SubMinder")).toBeInTheDocument();
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("renders signup tab based on URL query param", () => {
    render(
      <MemoryRouter initialEntries={["/auth?tab=signup"]}>
        <AuthPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("signup-form")).toBeVisible();
  });

  it("switches tabs when clicking triggers", async () => {
    const user = userEvent.setup(); // 👈 Setup userEvent
    render(
      <MemoryRouter initialEntries={["/auth"]}>
        <AuthPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("login-form")).toBeVisible();
    const signupTab = screen.getByRole("tab", { name: /Sign Up/i });

    await user.click(signupTab);
    expect(await screen.findByTestId("signup-form")).toBeVisible();
  });
});
