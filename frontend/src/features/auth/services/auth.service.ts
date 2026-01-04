import { apiClient } from "@/lib/axios";
import { type SignupFormValues } from "../schemas/signup.schema";
import { type LoginFormValues } from "../schemas/login.schema";
import { type AuthResponse, type User } from "../types/types";

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
    return response.data;
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
    localStorage.removeItem("user");
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await apiClient.get<AuthResponse>("/auth/me");
    if (!response.data.data?.user) throw new Error("User not found");
    return { user: response.data.data.user };
  },
};
