import { useWindowStore } from "../../stores/window";
import { Window } from "../Window/Window";

export function WindowManager() {
  const {
    windows,
    minimizedWindows,
    activeWindow,
    bringToFront,
    clearActiveWindow,
    minimizeWindow,
    windowOrder,
  } = useWindowStore();

  return (
    <>
      {windowOrder.map((winId) => {
        const win = windows.find((win) => win.id === winId);
        if (!win) return null;
        return (
          <Window
            key={win.key}
            window={win}
            active={activeWindow?.id === win.id}
            minimized={minimizedWindows.includes(win.id)}
            onMinimize={() => {
              minimizeWindow(win);
              if (activeWindow?.id === win.id) {
                const nextWindow = windows.find(
                  (w) =>
                    w.id !== win.id &&
                    !minimizedWindows.includes(w.id)
                );
                if (nextWindow) {
                  bringToFront(nextWindow);
                } else {
                  clearActiveWindow();
                }
              }
            }}
            onFocused={() => {
              bringToFront(win);
            }}
          />
        );
      })}
    </>
  );
}
