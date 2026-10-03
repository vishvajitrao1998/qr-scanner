import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

const lightColors = {
  background: "#F5F6FA",
  card: "#FFFFFF",
  surface: "#EEF0F6",
  text: "#0F1115",
  subtext: "#6B7280",
  border: "#E5E7EB",
  primary: "#6366F1",
};

const darkColors = {
  background: "#0B0B0F",
  card: "#16161D",
  surface: "#22222C",
  text: "#FFFFFF",
  subtext: "#9CA3AF",
  border: "#262631",
  primary: "#818CF8",
};

export type AppTheme = { dark: boolean; colors: typeof lightColors };

type ThemeContextValue = { theme: AppTheme; toggleTheme: () => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [dark, setDark] = useState(system === "dark");

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: { dark, colors: dark ? darkColors : lightColors },
      toggleTheme: () => setDark((d) => !d),
    }),
    [dark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}