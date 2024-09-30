import { useEffect } from "react";
import { useWindowStore } from "../stores/window";

export function useKeydown({
  key,
  callback,
  windowId,
  metaKey,
  altKey,
  deps = [],
}: {
  key: string;
  callback: (e: KeyboardEvent) => void;
  metaKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  windowId?: symbol;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps?: any[];
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
        (!metaKey || e.metaKey) &&
        (!altKey || e.altKey) &&
        (!e.shiftKey || e.shiftKey) &&
        (!e.ctrlKey || e.ctrlKey)
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        callback(e);
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, callback, isActive, metaKey, windowId, ...deps]);
}
