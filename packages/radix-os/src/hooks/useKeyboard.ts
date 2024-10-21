import { useEffect } from "react";
import { useWindowStore } from "../stores/window";

type KeydownOpts = {
  key: string;
  callback: (e: KeyboardEvent) => void;
  metaKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  windowId?: symbol;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps?: any[];
  dep?: string;
};

export function useKeydown({
  key,
  callback,
  windowId,
  metaKey,
  altKey,
  shiftKey,
  ctrlKey,
  deps = [],
}: KeydownOpts) {
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
        (!shiftKey || e.shiftKey) &&
        (!ctrlKey || e.ctrlKey)
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

export function useKeydowns(...listeners: Array<KeydownOpts>) {
  const dependency =
    listeners.reduce(
      (acc, listener) =>
        acc +
        listener.key +
        listener.shiftKey?.toString() +
        listener.ctrlKey?.toString() +
        listener.altKey?.toString() +
        listener.metaKey?.toString() +
        listener.disabled?.toString() +
        (listener.dep ?? "_nodep"),
      ""
    ) + listeners.length.toString();

  useEffect(() => {
    const handlers = listeners.map((listener) => {
      const handler = (e: KeyboardEvent) => {
        if (
          e.key.toLowerCase() === listener.key.toLowerCase() &&
          (!listener.windowId ||
            listener.windowId ===
              useWindowStore.getState().activeWindow?.id) &&
          (!listener.metaKey || e.metaKey) &&
          (!listener.altKey || e.altKey) &&
          (!listener.shiftKey || e.shiftKey) &&
          (!listener.ctrlKey || e.ctrlKey) &&
          !listener.disabled
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          listener.callback(e);
        }
      };
      window.addEventListener("keydown", handler);
      return handler;
    });

    return () => {
      handlers.forEach((handler) =>
        window.removeEventListener("keydown", handler)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependency]);
}

export function useKeySequence(
  sequence: string[],
  callback: () => void
) {
  return useEffect(() => {
    let currentSequence = [...sequence];
    const listener = (e: KeyboardEvent) => {
      if (e.key === currentSequence[0]) {
        currentSequence.shift();
        if (currentSequence.length === 0) {
          callback();
          currentSequence = [...sequence];
        }
      } else {
        currentSequence = [...sequence];
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence.join("||")]);
}
