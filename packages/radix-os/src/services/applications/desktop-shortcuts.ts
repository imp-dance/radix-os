import { ReactNode } from "react";
import { UseAppLauncherReturn } from "./launcher";

export type DesktopShortcut = {
  icon: ReactNode;
  label: string;
  onClick: (appLauncher: UseAppLauncherReturn<string>) => void;
};
export const setupDesktopShortcuts = (
  ...shortcuts: Array<DesktopShortcut>
) => {
  return shortcuts;
};
