import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SettingsStore = {
  theme: "light" | "dark";
  toggleTheme: () => void;
  panelBackground: "solid" | "translucent";
  togglePanelBackground: () => void;
  bg: string;
  setBg: (bg: string) => void;
};

export const SETTINGS_LS_KEY = "settings";

export const useSettingsStore = create(
  persist<SettingsStore>(
    (set) => ({
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
        } as SettingsStore),
    }
  )
);
