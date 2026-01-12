import { useQuery } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";

export const USER_QUERY_KEY = ["user"];

export function useUser() {
  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => {
      const { user } = await authService.getMe();
      return user;
    },
    staleTime: Infinity,
    retry: false,
  });
}
