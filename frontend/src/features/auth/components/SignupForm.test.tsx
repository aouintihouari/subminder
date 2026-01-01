import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignupForm } from "./SignupForm";
import { authService } from "../api/auth.service";

// Mock du service
vi.mock("../api/auth.service", () => ({
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

  // --- NOUVEAU TEST : Mots de passe différents ---
  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    // On remplit des mots de passe différents
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwordInputs[0], "password123");
    await user.type(passwordInputs[1], "differentPassword"); // Différent

    await user.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      // Le message doit venir de Zod (défini dans ton schema)
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  // --- NOUVEAU TEST : Erreur API (Ex: Email déjà pris) ---
  it("handles server-side errors (e.g., email already exists)", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    // On simule une erreur 409 (Conflict) venant du backend
    const mockError = {
      response: {
        data: { message: "This email is already in use." },
      },
    };
    (authService.signup as any).mockRejectedValue(mockError);

    // Remplissage valide
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
      // On vérifie que le message d'erreur du backend s'affiche en rouge
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
