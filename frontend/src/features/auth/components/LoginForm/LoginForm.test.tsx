import { BrowserRouter } from "react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { LoginForm } from ".";
import { authService } from "../../services/auth.service";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockLoginContext = vi.fn();
vi.mock("@/hooks/authContext", () => ({
  useAuth: () => ({
    login: mockLoginContext,
    isAuthenticated: false,
    isLoading: false,
    user: null,
  }),
}));

describe("LoginForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithRouter = () => {
    return render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>,
    );
  };

  it("renders email and password inputs correctly", () => {
    renderWithRouter();
    expect(
      screen.getByPlaceholderText(/name@example.com/i),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign In/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Please enter a valid email address/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Please enter a password/i)).toBeInTheDocument();
    });
  });

  it("shows error message when API fails (Invalid Credentials)", async () => {
    const user = userEvent.setup();

    const loginSpy = vi.spyOn(authService, "login").mockRejectedValue({
      response: {
        data: { message: "Invalid email or password." },
      },
    });

    renderWithRouter();

    await user.type(
      screen.getByPlaceholderText(/name@example.com/i),
      "wrong@test.com",
    );
    await user.type(screen.getByPlaceholderText(/••••••••/i), "wrongpass");

    await user.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Invalid email or password."),
      ).toBeInTheDocument();
    });

    expect(loginSpy).toHaveBeenCalled();
  });

  it("calls login service, updates context and redirects on success", async () => {
    const user = userEvent.setup();

    const loginSpy = vi.spyOn(authService, "login").mockResolvedValue({
      status: "success",
      message: "Login successful",
      token: "fake-jwt-token",
      data: {
        user: { id: 1, email: "valid@test.com", name: "Tester", role: "USER" },
      },
    });

    renderWithRouter();

    await user.type(
      screen.getByPlaceholderText(/name@example.com/i),
      "valid@test.com",
    );
    await user.type(screen.getByPlaceholderText(/••••••••/i), "password123");

    await user.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith({
        email: "valid@test.com",
        password: "password123",
      });

      expect(mockLoginContext).toHaveBeenCalledWith(
        "fake-jwt-token",
        expect.objectContaining({ email: "valid@test.com" }),
      );

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
