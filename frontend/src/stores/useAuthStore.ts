import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { type User } from "@/features/auth/types/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      clearAuth: () =>
        set({ user: null, isAuthenticated: false, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: "AuthStore" },
  ),
);
