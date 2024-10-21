import { ReactNode } from "react";
import { create } from "zustand";
import { FsFile } from "./fs";

export type RadixOsAppComponent = (props: {
  appWindow: RadixOsAppWindow;
  file?: { file: FsFile; path: string };
}) => ReactNode;

export type RadixOsApp<T extends string> = {
  appId: T;
  appName: string;
  component: RadixOsAppComponent;
  addToDesktop?: boolean;
  defaultWindowSettings: Partial<
    Omit<RadixOsAppWindow, "content" | "id" | "key">
  > & {
    unique?: boolean;
  };
};

export type RadixOsAppWindow = {
  id: symbol;
  key: string;
  content: ReactNode;
  title: string;
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
  windows: RadixOsAppWindow[];
  windowOrder: symbol[];
  activeWindow: RadixOsAppWindow | null;
  minimizedWindows: symbol[];
  isDragging: boolean;
  setDragging: (dragging: boolean) => void;
  minimizeWindow: (win: RadixOsAppWindow) => void;
  minimizeAll: () => void;
  addWindow: (win: RadixOsAppWindow) => void;
  removeWindow: (win: RadixOsAppWindow) => void;
  setWindowPosition: (
    win: RadixOsAppWindow,
    x: number,
    y: number
  ) => void;
  setWindowSize: (
    win: RadixOsAppWindow,
    width: number,
    height: number
  ) => void;
  bringToFront: (win: RadixOsAppWindow) => void;
  clearActiveWindow: () => void;
  invalidateWindows: () => void;
  setTitle: (win: RadixOsAppWindow, title: string) => void;
};

export const useWindowStore = create<WindowStore>((set) => ({
  windows: [] as RadixOsAppWindow[],
  minimizedWindows: [],
  isDragging: false,
  setDragging: (dragging) => set({ isDragging: dragging }),
  minimizeAll: () =>
    set((state) => ({
      minimizedWindows: state.windows.map((w) => w.id),
      activeWindow: null,
    })),
  minimizeWindow: (win) =>
    set((state) => {
      return {
        minimizedWindows: [
          ...state.minimizedWindows.filter(
            (id) => id !== win.id
          ),
          win.id,
        ],
        activeWindow:
          win.id === state.activeWindow?.id
            ? null
            : state.activeWindow,
      };
    }),
  addWindow: (win) =>
    set((state) => {
      if (state.windows.find((w) => w.id === win.id)) {
        const newWindows = state.windows.map((w) => {
          if (w.id === win.id) {
            return win;
          }
          return w;
        });
        return {
          windows: newWindows,
          windowOrder: [
            ...state.windowOrder.filter((w) => w !== win.id),
            win.id,
          ],
          activeWindow: win,
        };
      }
      return {
        windows: [...state.windows, win],
        windowOrder: [...state.windowOrder, win.id],
        activeWindow: win,
      };
    }),
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
  setWindowSize: (win, width, height) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === win.id
          ? { ...w, initialWidth: width, initialHeight: height }
          : w
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
      minimizedWindows: state.minimizedWindows.filter(
        (id) => id !== win.id
      ),
    })),
  clearActiveWindow: () =>
    set(() => ({
      activeWindow: null,
    })),
  invalidateWindows: () =>
    set((state) => ({
      windows: state.windows.map((w) => ({ ...w })),
    })),
  setTitle: (win, title) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === win.id ? { ...w, title } : w
      ),
    })),
}));

let incrementer = 0;

export const createWindow = (
  arg: Omit<Partial<RadixOsAppWindow>, "id">
): RadixOsAppWindow => ({
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
  window: Omit<Partial<RadixOsAppWindow>, "id">
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
