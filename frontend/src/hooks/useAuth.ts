import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react";
import { useAuthStore } from "@/stores/useAuthStore";
import { authService } from "@/features/auth/services/auth.service";
import { USER_QUERY_KEY } from "@/hooks/useUser";
import { type User } from "@/features/auth/types/types";

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, clearAuth } =
    useAuthStore();
  const queryClient = useQueryClient();

  const login = useCallback(
    (newUser: User) => {
      setAuth(newUser);
    },
    [setAuth],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      Sentry.captureException(error);
    }

    queryClient.removeQueries({ queryKey: USER_QUERY_KEY });
    queryClient.clear();
    clearAuth();
    window.location.href = "/auth?tab=login";
  }, [queryClient, clearAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
