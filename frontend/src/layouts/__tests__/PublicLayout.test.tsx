import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PublicLayout } from "../PublicLayout";
// 👇 CORRECTION ICI : on importe depuis "react-router" au lieu de "react-router-dom"
import { MemoryRouter, Routes, Route } from "react-router";

// Mock de l'authentification
const mockUseAuth = vi.fn();
vi.mock("@/hooks/authContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("PublicLayout", () => {
  it("renders child content if user is NOT authenticated", () => {
    // Cas : Pas connecté -> On doit voir la page de Login
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<div>Login Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects to home if user IS authenticated", () => {
    // Cas : Connecté -> On doit être redirigé vers "/"
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<div>Login Page</div>} />
          </Route>
          {/* La cible de la redirection */}
          <Route path="/" element={<div>Home Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );

    // On vérifie qu'on est bien arrivés sur la Home
    expect(screen.getByText("Home Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });
});
