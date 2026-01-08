import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { VerifyEmailPage } from "../VerifyEmailPage";
import { authService } from "../../services/auth.service";

vi.mock("../../services/auth.service", () => ({
  authService: { verifyEmail: vi.fn() },
}));

const renderWithRouter = (token: string | null) => {
  const initialEntry = token ? `/verify-email?token=${token}` : "/verify-email";

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("VerifyEmailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows error state immediately if token is missing", () => {
    renderWithRouter(null);
    expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/Missing verification token/i)).toBeInTheDocument();
    expect(authService.verifyEmail).not.toHaveBeenCalled();
  });

  it("shows success state when API call succeeds", async () => {
    (authService.verifyEmail as Mock).mockResolvedValue({
      status: "success",
      message: "Email verified successfully!",
    });

    renderWithRouter("valid-token-123");

    await waitFor(() => {
      expect(screen.getByText(/You're all set!/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Email verified successfully/i),
      ).toBeInTheDocument();
    });

    expect(authService.verifyEmail).toHaveBeenCalledWith("valid-token-123");
  });

  it("shows error state when API call fails", async () => {
    const error = new AxiosError();

    error.response = {
      data: { message: "Invalid or expired verification token" },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };

    (authService.verifyEmail as Mock).mockRejectedValue(error);

    renderWithRouter("invalid-token");

    await waitFor(() => {
      expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Invalid or expired verification token/i),
      ).toBeInTheDocument();
    });
  });
});
