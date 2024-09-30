import { useEffect } from "react";
import { useWindowStore } from "../stores/window";

export function useOnKeyDown({
  key,
  callback,
  windowId,
  metaKey,
}: {
  key: string;
  callback: (e: KeyboardEvent) => void;
  metaKey?: boolean;
  windowId?: symbol;
}) {
  const activeWindow = useWindowStore(
    (state) => state.activeWindow
  );
  const isActive = windowId === activeWindow?.id;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === key &&
        (!windowId || isActive) &&
        (!metaKey || e.metaKey)
      ) {
        callback(e);
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [key, callback, isActive, metaKey, windowId]);
}
