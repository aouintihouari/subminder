import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignupForm } from "./SignupForm";
import { authService } from "../services/auth.service";

vi.mock("../services/auth.service", () => ({
  authService: {
    signup: vi.fn(),
  },
}));

describe("SignupForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields correctly", () => {
    render(<SignupForm />);
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("name@example.com")).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText("••••••••")).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /Create Account/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for invalid inputs (Empty Fields)", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 8 characters/i),
      ).toBeInTheDocument();
    });
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwordInputs[0], "password123");
    await user.type(passwordInputs[1], "differentPassword");

    await user.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("handles server-side errors (e.g., email already exists)", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const mockError = {
      response: {
        data: { message: "This email is already in use." },
      },
    };
    (authService.signup as any).mockRejectedValue(mockError);

    await user.type(screen.getByPlaceholderText("John Doe"), "Houari");
    await user.type(
      screen.getByPlaceholderText("name@example.com"),
      "existing@example.com",
    );
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwordInputs[0], "password123");
    await user.type(passwordInputs[1], "password123");

    await user.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(
        screen.getByText("This email is already in use."),
      ).toBeInTheDocument();
    });
  });

  it("submits valid data to API and shows success message", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    (authService.signup as any).mockResolvedValue({ status: "success" });

    await user.type(screen.getByPlaceholderText("John Doe"), "Houari");
    await user.type(
      screen.getByPlaceholderText("name@example.com"),
      "test@example.com",
    );

    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwordInputs[0], "password123");
    await user.type(passwordInputs[1], "password123");

    await user.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(authService.signup).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          password: "password123",
          passwordConfirm: "password123",
        }),
      );
      expect(screen.getByText("Account Created!")).toBeInTheDocument();
    });
  });
});
