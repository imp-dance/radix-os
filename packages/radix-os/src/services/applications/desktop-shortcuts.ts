import { ReactNode } from "react";

export type DesktopShortcut = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
};
export const setupDesktopShortcuts = (
  ...shortcuts: Array<DesktopShortcut>
) => {
  return shortcuts;
};
