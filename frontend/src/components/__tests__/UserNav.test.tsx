import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { UserNav } from "../UserNav";
import * as AuthContext from "@/hooks/useAuth";

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock de useTheme
vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ setTheme: vi.fn() }),
}));

describe("UserNav Component", () => {
  const mockLogout = vi.fn();
  const mockUser = {
    id: 1,
    email: "test@subminder.com",
    name: "Alex Dev",
    role: "USER",
    preferredCurrency: "USD",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(AuthContext, "useAuth").mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: mockLogout,
    });
  });

  it("should render user initials", () => {
    render(<UserNav />);
    expect(screen.getByText("AD")).toBeInTheDocument();
  });

  it("should open dropdown and show user details", async () => {
    const user = userEvent.setup();
    render(<UserNav />);

    const avatarBtn = screen.getByRole("button");
    await user.click(avatarBtn);

    // Vérifications mises à jour selon ton nouveau code
    expect(screen.getByText("Alex Dev")).toBeInTheDocument();
    expect(screen.getByText("test@subminder.com")).toBeInTheDocument();

    // 👇 CORRECTION : On cherche "Profile" car "Account settings" est dans un autre span
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("should navigate to settings on click", async () => {
    const user = userEvent.setup();
    render(<UserNav />);

    await user.click(screen.getByRole("button"));

    // 👇 CORRECTION : On clique sur le texte "Profile"
    const settingsItem = screen.getByText("Profile");
    await user.click(settingsItem);

    expect(mockNavigate).toHaveBeenCalledWith("/settings");
  });

  it("should call logout on click", async () => {
    const user = userEvent.setup();
    render(<UserNav />);

    await user.click(screen.getByRole("button"));

    const logoutItem = screen.getByText("Log out");
    await user.click(logoutItem);

    expect(mockLogout).toHaveBeenCalled();
  });
});
