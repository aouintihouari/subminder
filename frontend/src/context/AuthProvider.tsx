import { useState, useEffect, useCallback, type ReactNode } from "react";
import { type User } from "@/features/auth/types/types";
import { authService } from "@/features/auth/services/auth.service";
import { AuthContext } from "@/hooks/useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/auth?tab=login";
  }, []);

  const login = useCallback((newUser: User) => {
    setUser(newUser);
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user } = await authService.getMe();
        setUser(user);
        setIsAuthenticated(true);
      } catch {
        // Silent error
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
