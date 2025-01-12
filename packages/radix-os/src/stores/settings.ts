import { Theme } from "@radix-ui/themes";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Radius = "small" | "none" | "medium" | "large" | "full";
type AccentColor = Parameters<typeof Theme>[0]["accentColor"];

type SettingsStore = {
  theme: "light" | "dark";
  toggleTheme: () => void;
  panelBackground: "solid" | "translucent";
  togglePanelBackground: () => void;
  bg: string;
  setBg: (bg: string) => void;
  radius: Radius;
  setRadius: (value: Radius) => void;
  accentColor: AccentColor;
  setAccentColor: (value: AccentColor) => void;
  overrides: (keyof SettingsStore)[];
  setOverrides: (overrides: (keyof SettingsStore)[]) => void;
};

export const SETTINGS_LS_KEY = "settings";

export const useSettingsStore = create(
  persist<SettingsStore>(
    (set) => ({
      radius: "medium",
      overrides: [],
      setOverrides: (overrides) => set(() => ({ overrides })),
      setRadius: (radius) => set(() => ({ radius })),
      accentColor: "indigo",
      setAccentColor: (clr) => set(() => ({ accentColor: clr })),
      theme: "dark" as const,
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
      panelBackground: "solid" as const,
      togglePanelBackground: () =>
        set((state) => ({
          panelBackground:
            state.panelBackground === "solid"
              ? "translucent"
              : "solid",
        })),
      bg: "gray",
      setBg: (bg) =>
        set(() => ({
          bg,
        })),
    }),
    {
      name: SETTINGS_LS_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        ({
          theme: state.theme,
          panelBackground: state.panelBackground,
          bg: state.bg,
          accentColor: state.accentColor,
          radius: state.radius,
        } as SettingsStore),
    }
  )
);
