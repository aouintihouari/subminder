import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { SignupForm } from ".";
import { authService } from "../../services/auth.service";
import { renderWithProviders } from "@/test/utils";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("SignupForm Component", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("renders all form fields correctly", () => {
    renderWithProviders(<SignupForm />);
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/name@example.com/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create Account/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for invalid inputs (Empty Fields)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignupForm />);
    await user.click(screen.getByRole("button", { name: /Create Account/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 8 characters/i),
      ).toBeInTheDocument();
    });
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignupForm />);
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
    await user.type(passwordInputs[0], "password123");
    await user.type(passwordInputs[1], "differentPassword");
    await user.click(screen.getByRole("button", { name: /Create Account/i }));
    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("handles server-side errors (e.g., email already exists)", async () => {
    const user = userEvent.setup();
    const axiosError = new AxiosError("Conflict", "409", undefined, undefined, {
      data: { message: "This email is already in use." },
      status: 409,
      statusText: "Conflict",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });
    vi.spyOn(authService, "signup").mockRejectedValue(axiosError);

    renderWithProviders(<SignupForm />);

    await user.type(screen.getByPlaceholderText("John Doe"), "Houari");
    await user.type(
      screen.getByPlaceholderText(/name@example.com/i),
      "existing@example.com",
    );
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
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
    const signupSpy = vi.spyOn(authService, "signup").mockResolvedValue({
      status: "success",
      message: "User registered",
    });

    renderWithProviders(<SignupForm />);

    await user.type(screen.getByPlaceholderText("John Doe"), "Houari");
    await user.type(
      screen.getByPlaceholderText(/name@example.com/i),
      "test@example.com",
    );
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
    await user.type(passwordInputs[0], "password123");
    await user.type(passwordInputs[1], "password123");
    await user.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(signupSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
        }),
      );
      expect(screen.getByText(/Please verify your email/i)).toBeInTheDocument();
    });
  });
});
