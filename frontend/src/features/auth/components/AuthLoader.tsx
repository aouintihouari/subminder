import { useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useAuthStore } from "@/stores/useAuthStore";

export function AuthLoader() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    if (user) setAuth(user);
    else if (!isUserLoading && !user) clearAuth();
  }, [user, isUserLoading, setAuth, clearAuth]);

  useEffect(() => {
    setLoading(isUserLoading);
  }, [isUserLoading, setLoading]);

  return null;
}
