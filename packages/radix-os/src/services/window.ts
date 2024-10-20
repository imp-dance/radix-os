import {
  RadixOsAppWindow,
  useWindowStore,
} from "../stores/window";

export function setWindowDimensions(
  key: string,
  dim: Partial<{
    width: number | string;
    height: number | string;
    x: number | string;
    y: number | string;
  }>
) {
  const winEl = document.querySelector<HTMLDivElement>(
    `[data-key="${key}"]`
  );
  if (!winEl) {
    return;
  }
  const parseVal = (val: number | string) => {
    if (typeof val === "number") {
      return `${val}px`;
    }
    return val;
  };
  if (dim.width !== undefined) {
    winEl.style.width = parseVal(dim.width);
  }
  if (dim.height !== undefined) {
    winEl.style.height = parseVal(dim.height);
  }
  if (dim.x !== undefined) {
    winEl.style.left = parseVal(dim.x);
  }
  if (dim.y !== undefined) {
    winEl.style.top = parseVal(dim.y);
  }
  useWindowStore.getState().invalidateWindows();
}

export function handleWindowDrop(
  over: string,
  window: RadixOsAppWindow
) {
  const halfWidth = document.body.clientWidth / 2 + "px";
  const halfHeight =
    document.getElementById("rxosdesktop")!.clientHeight / 2 +
    "px";
  const id = over.replace("dropzone-", "");

  switch (id) {
    case "left":
      setWindowDimensions(window.key, {
        width: halfWidth,
        height: "100%",
        x: "0px",
        y: "0px",
      });
      break;
    case "topleft":
      setWindowDimensions(window.key, {
        width: halfWidth,
        height: halfHeight,
        x: "0px",
        y: "0px",
      });
      break;
    case "bottomleft":
      setWindowDimensions(window.key, {
        width: halfWidth,
        height: halfHeight,
        x: "0px",
        y: halfHeight,
      });
      break;
    case "right":
      setWindowDimensions(window.key, {
        width: halfWidth,
        height: "100%",
        x: halfWidth,
        y: "0px",
      });
      break;
    case "topright":
      setWindowDimensions(window.key, {
        width: halfWidth,
        height: halfHeight,
        x: halfWidth,
        y: "0px",
      });
      break;
    case "bottomright":
      setWindowDimensions(window.key, {
        width: halfWidth,
        height: halfHeight,
        x: halfWidth,
        y: halfHeight,
      });
      break;
  }
}

export function tabWindow(
  direction: "backward" | "forward" = "forward"
) {
  const state = useWindowStore.getState();
  const activeWindow = state.activeWindow;
  if (!activeWindow) return;
  const index = state.windows.findIndex(
    (win) => win.id === activeWindow.id
  );
  const nextIndex =
    direction === "backward" ? index - 1 : index + 1;
  const nextWindow = state.windows[nextIndex];
  if (!nextWindow) {
    state.bringToFront(
      state.windows[
        direction === "backward" ? state.windows.length - 1 : 0
      ]
    );
  } else {
    state.bringToFront(nextWindow);
  }
}

export type Application = {};
