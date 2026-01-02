import { apiClient } from "@/lib/axios";
import { type SignupFormValues } from "../schemas/signup.schema";

interface AuthResponse {
  status: string;
  message: string;
  data?: unknown;
}

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
};
