import RadixOSComponent from "./components/RadixOS/RadixOS";
import { FsIntegration as TFsIntegration } from "./services/fs/fs-integration";

export { useAppWindow } from "./hooks/useAppWindow";
export { setupDesktopShortcuts } from "./services/applications/desktop-shortcuts";
export {
  createUseAppLauncher,
  useUntypedAppContext as useRawAppLauncher,
} from "./services/applications/launcher";
export {
  createApp,
  setupApps,
} from "./services/applications/setupApps";
export {
  fsZustandIntegration,
  useFs,
} from "./services/fs/fs-integration";
export { useSettingsStore } from "./stores/settings";
export { useWindowStore } from "./stores/window";
export const RadixOS = RadixOSComponent;

export type { RadixOsAppComponent } from "./stores/window";

export type FsIntegration = TFsIntegration;
