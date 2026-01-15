import { apiClient } from "@/lib/axios";
import { API_ROUTES } from "@/config/api.routes";
import { type SignupFormValues } from "../schemas/signup.schema";
import { type LoginFormValues } from "../schemas/login.schema";
import { type ForgotPasswordFormValues } from "../schemas/forgotPassword.schema";
import { type ResetPasswordFormValues } from "../schemas/resetPassword.schema";
import {
  type AuthResponse,
  type User,
  type UpdateProfileDTO,
  type UpdatePasswordDTO,
} from "../types/types";

export const authService = {
  signup: async (data: SignupFormValues): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ROUTES.AUTH.SIGNUP,
      data,
    );
    return response.data;
  },

  verifyEmail: async (token: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ROUTES.AUTH.VERIFY_EMAIL,
      { token },
    );
    return response.data;
  },

  login: async (data: LoginFormValues): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ROUTES.AUTH.LOGIN,
      data,
    );
    return response.data;
  },

  forgotPassword: async (
    data: ForgotPasswordFormValues,
  ): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ROUTES.AUTH.FORGOT_PASSWORD,
      data,
    );
    return response.data;
  },

  resetPassword: async (
    token: string,
    data: ResetPasswordFormValues,
  ): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      `${API_ROUTES.AUTH.RESET_PASSWORD}/${token}`,
      data,
    );
    return response.data;
  },

  logout: async () => {
    await apiClient.post(API_ROUTES.AUTH.LOGOUT);
    localStorage.removeItem("user");
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await apiClient.get<AuthResponse>(API_ROUTES.AUTH.ME);
    if (!response.data.data?.user) throw new Error("User not found");
    return { user: response.data.data.user };
  },

  updateProfile: async (data: UpdateProfileDTO): Promise<AuthResponse> => {
    const response = await apiClient.patch<AuthResponse>(
      API_ROUTES.USERS.UPDATE_PROFILE,
      data,
    );
    return response.data;
  },

  updatePassword: async (data: UpdatePasswordDTO): Promise<AuthResponse> => {
    const response = await apiClient.patch<AuthResponse>(
      API_ROUTES.USERS.UPDATE_PASSWORD,
      data,
    );
    return response.data;
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete(API_ROUTES.USERS.DELETE_ACCOUNT);
    localStorage.removeItem("user");
  },

  requestEmailChange: async (newEmail: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ROUTES.USERS.REQUEST_EMAIL_CHANGE,
      { newEmail },
    );
    return response.data;
  },

  verifyEmailChange: async (token: string): Promise<AuthResponse> => {
    const response = await apiClient.patch<AuthResponse>(
      `${API_ROUTES.USERS.VERIFY_EMAIL_CHANGE}/${token}`,
    );
    return response.data;
  },
};
