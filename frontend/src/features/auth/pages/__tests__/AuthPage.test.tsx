import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AuthPage } from "../AuthPage";
import { useAuth } from "@/hooks/useAuth";
import { MemoryRouter, Route, Routes } from "react-router";
import { type User } from "@/features/auth/types/types";

vi.mock("@/hooks/useAuth");
vi.mock("../../components/LoginForm", () => ({
  LoginForm: () => <div>Login Form</div>,
}));
vi.mock("../../components/SignupForm", () => ({
  SignupForm: () => <div>Signup Form</div>,
}));

const useAuthMock = vi.mocked(useAuth);

describe("AuthPage", () => {
  const createMockAuth = (isAuthenticated: boolean) => ({
    isAuthenticated,
    user: isAuthenticated
      ? ({ id: 1, email: "test@test.com", name: "User", role: "USER" } as User)
      : null,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
  });

  it("renders Login form by default", () => {
    useAuthMock.mockReturnValue(createMockAuth(false));

    render(
      <MemoryRouter initialEntries={["/auth"]}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Form")).toBeInTheDocument();
  });

  it("renders Signup form when tab is signup", () => {
    useAuthMock.mockReturnValue(createMockAuth(false));

    render(
      <MemoryRouter initialEntries={["/auth?tab=signup"]}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Signup Form")).toBeInTheDocument();
  });

  it("redirects to dashboard if authenticated", () => {
    useAuthMock.mockReturnValue(createMockAuth(true));
    render(
      <MemoryRouter initialEntries={["/auth"]}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/auth" element={<AuthPage />} />
          </Route>
          <Route path="/" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });
});
