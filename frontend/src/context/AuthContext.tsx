import { useState, useEffect, useCallback, type ReactNode } from "react";
import { type User } from "@/features/auth/types/types";
import { authService } from "@/features/auth/services/auth.service";
import { apiClient } from "@/lib/axios";
import { AuthContext } from "@/hooks/authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    authService.logout();
    delete apiClient.defaults.headers.common["Authorization"];
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/auth?tab=login";
  }, []);

  const login = useCallback((token: string, newUser: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(newUser));
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(newUser);
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          apiClient.defaults.headers.common["Authorization"] =
            `Bearer ${token}`;
          const { user } = await authService.getMe();
          setUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Session expired or invalid:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
