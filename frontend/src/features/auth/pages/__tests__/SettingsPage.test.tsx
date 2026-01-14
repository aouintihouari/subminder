import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { SettingsPage } from "../SettingsPage";
import { authService } from "../../services/auth.service";
import * as AuthContext from "@/hooks/useAuth";
import { renderWithProviders } from "@/test/utils";
import { type User } from "@/features/auth/types/types";

const mockUserData = {
  id: 1,
  email: "test@example.com",
  name: "John Doe",
  role: "USER",
  preferredCurrency: "USD",
};

vi.mock("../../services/auth.service");
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/hooks/useUser", () => ({
  useUser: () => ({
    data: mockUserData,
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

describe("SettingsPage", () => {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();
  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    name: "John Doe",
    role: "USER",
    preferredCurrency: "USD",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: mockLogin,
      logout: mockLogout,
    });
  });

  it("should render user information correctly", async () => {
    renderWithProviders(<SettingsPage />);

    expect(
      await screen.findByRole("heading", { name: "Settings" }),
    ).toBeInTheDocument();

    const emailInput = screen.getByDisplayValue("test@example.com");
    expect(emailInput).toBeDisabled();
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
  });

  it("should update profile successfully", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.updateProfile).mockResolvedValue({
      status: "success",
      message: "Profile updated successfully",
      data: { user: { ...mockUser, name: "Jane Doe" } },
    });

    renderWithProviders(<SettingsPage />);
    const nameInput = await screen.findByDisplayValue("John Doe");

    await user.clear(nameInput);
    await user.type(nameInput, "Jane Doe");

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(authService.updateProfile).toHaveBeenCalledWith({
        name: "Jane Doe",
        preferredCurrency: "USD",
      });
    });
  });

  it("should validate password matching", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    await screen.findByRole("heading", { name: "Settings" });
    await user.type(screen.getByTestId("current-password"), "password123");
    await user.type(screen.getByTestId("new-password"), "newpassword123");
    await user.type(
      screen.getByTestId("confirm-password"),
      "differentpassword",
    );

    const updateBtn = screen.getByRole("button", { name: /update password/i });
    await user.click(updateBtn);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    expect(authService.updatePassword).not.toHaveBeenCalled();
  });

  it("should delete account after confirmation", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.deleteAccount).mockResolvedValue(undefined);

    renderWithProviders(<SettingsPage />);

    const deleteBtn = await screen.findByRole("button", {
      name: /delete account/i,
    });
    await user.click(deleteBtn);

    expect(screen.getByText(/are you absolutely sure/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", {
      name: "Yes, delete my account",
    });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(authService.deleteAccount).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
