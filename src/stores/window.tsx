import { ReactNode } from "react";
import { create } from "zustand";

export type Window = {
  id: symbol;
  key: string;
  title: string;
  content: ReactNode;
  icon: ReactNode;
  x: number;
  y: number;
  maxWidth: number;
  maxHeight: number;
  initialWidth?: number;
  initialHeight?: number;
  resizeable?: boolean;
  scrollable?: boolean;
};

type WindowStore = {
  windows: Window[];
  addWindow: (win: Window) => void;
  removeWindow: (win: Window) => void;
  setWindowPosition: (win: Window, x: number, y: number) => void;
  activeWindow: Window | null;
  windowOrder: symbol[];
  bringToFront: (win: Window) => void;
  clearActiveWindow: () => void;
};

export const useWindowStore = create<WindowStore>((set) => ({
  windows: [] as Window[],
  addWindow: (win) =>
    set((state) =>
      state.windows.find((w) => w.id === win.id)
        ? {
            windowOrder: [
              ...state.windowOrder.filter((w) => w !== win.id),
              win.id,
            ],
            activeWindow: win,
          }
        : {
            windows: [...state.windows, win],
            windowOrder: [...state.windowOrder, win.id],
            activeWindow: win,
          }
    ),
  removeWindow: (win) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== win.id),
      windowOrder: state.windowOrder.filter(
        (id) => id !== win.id
      ),
    })),
  activeWindow: null,
  setWindowPosition: (win, x, y) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === win.id ? { ...w, x, y } : w
      ),
    })),
  windowOrder: [],
  bringToFront: (win) =>
    set((state) => ({
      windowOrder: [
        ...state.windowOrder.filter((id) => id !== win.id),
        win.id,
      ],
      activeWindow: win,
    })),
  clearActiveWindow: () =>
    set(() => ({
      activeWindow: null,
    })),
}));

let incrementer = 0;

export const createWindow = (
  arg: Omit<Partial<Window>, "id">
): Window => ({
  key: `window${incrementer++}`,
  id: Symbol("window"),
  title: "",
  content: null,
  icon: null,
  x: 0,
  y: 0,
  ...determinePosition(arg),
  maxHeight: 9999,
  maxWidth: 9999,
  scrollable: true,
  resizeable: true,
  ...arg,
});

const determinePosition = (
  window: Omit<Partial<Window>, "id">
) => {
  const width = window.initialWidth ?? window.maxWidth ?? 0;
  const height = window.initialHeight ?? window.maxHeight ?? 0;
  if (!window.x && !window.y) {
    return {
      x: document.body.clientWidth / 2 - width / 2,
      y: document.body.clientHeight / 2 - height / 2,
    };
  }
  return {};
};
