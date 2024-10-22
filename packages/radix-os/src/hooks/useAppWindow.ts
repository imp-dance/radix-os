import { setWindowDimensions } from "../services/window";
import {
  RadixOsAppWindow,
  useWindowStore,
} from "../stores/window";

export function useAppWindow(win: RadixOsAppWindow) {
  const store = useWindowStore();

  return {
    setDimensions: (
      dim: Partial<{
        width: number | string;
        height: number | string;
        x: number | string;
        y: number | string;
      }>
    ) => setWindowDimensions(win.key, dim),
    bringToFront: () => store.bringToFront(win),
    minimize: () => store.minimizeWindow(win),
    close: () => store.removeWindow(win),
    setTitle: (title: string) => store.setTitle(win, title),
  };
}
