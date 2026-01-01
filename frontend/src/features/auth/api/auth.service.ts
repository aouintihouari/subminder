import { apiClient } from "@/lib/axios";
import { type SignupFormValues } from "../schemas/signup.schema";

export const authService = {
  signup: async (data: SignupFormValues) => {
    const response = await apiClient.post("/auth/signup", data);
    return response.data;
  },
};
