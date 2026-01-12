import { useThemeStore } from "@/stores/useThemeStore";

export const useTheme = () => {
  const { theme, setTheme } = useThemeStore();
  return { theme, setTheme };
};

export type { Theme } from "@/stores/useThemeStore";
