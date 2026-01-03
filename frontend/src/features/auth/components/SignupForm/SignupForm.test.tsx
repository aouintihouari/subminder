import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { BrowserRouter } from "react-router";

import { SignupForm } from ".";
import { authService } from "../../services/auth.service";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("SignupForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithRouter = () => {
    return render(
      <BrowserRouter>
        <SignupForm />
      </BrowserRouter>,
    );
  };

  it("renders all form fields correctly", () => {
    renderWithRouter();
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/name@example.com/i),
    ).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/••••••••/i)).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /Create Account/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for invalid inputs (Empty Fields)", async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 8 characters/i),
      ).toBeInTheDocument();
    });
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();
    renderWithRouter();

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

    const error = new AxiosError();
    error.response = {
      data: { message: "This email is already in use." },
      status: 409,
      statusText: "Conflict",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };

    const signupSpy = vi.spyOn(authService, "signup").mockRejectedValue(error);

    renderWithRouter();

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

    expect(signupSpy).toHaveBeenCalled();
  });

  it("submits valid data to API and shows success message", async () => {
    const user = userEvent.setup();

    const signupSpy = vi.spyOn(authService, "signup").mockResolvedValue({
      status: "success",
      message: "User registered",
    });

    renderWithRouter();

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
          password: "password123",
          passwordConfirm: "password123",
        }),
      );

      expect(screen.getByText(/Please verify your email/i)).toBeInTheDocument();
    });
  });
});
