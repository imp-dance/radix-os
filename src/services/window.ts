import { useWindowStore } from "../stores/window";

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
