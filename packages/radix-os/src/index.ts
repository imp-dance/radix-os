import RadixOSComponent from "./components/RadixOS/RadixOS";
import { FsIntegration as TFsIntegration } from "./services/fs";

export {
  createApp,
  createUseAppLauncher,
  fsZustandIntegration,
  setupApps,
  setupDesktopShortcuts,
  useUntypedAppContext as useRawAppLauncher,
} from "./integration/setupApps";
export { useFs } from "./services/fs";
export { useSettingsStore } from "./stores/settings";
export { useWindowStore } from "./stores/window";
export const RadixOS = RadixOSComponent;

export type { RadixOsAppComponent } from "./stores/window";

export type FsIntegration = TFsIntegration;
