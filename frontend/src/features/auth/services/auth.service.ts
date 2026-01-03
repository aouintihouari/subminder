import { apiClient } from "@/lib/axios";
import { type SignupFormValues } from "../schemas/signup.schema";
import { type LoginFormValues } from "../schemas/login.schema";
import { type AuthResponse } from "../types/types";

export const authService = {
  signup: async (data: SignupFormValues): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/signup", data);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/verify-email", {
      token,
    });
    return response.data;
  },

  login: async (data: LoginFormValues): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);
    if (response.data.token) localStorage.setItem("token", response.data.token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  },
};
