import RadixOSComponent from "./components/RadixOS/RadixOS";
import { FsIntegration as TFsIntegration } from "./services/fs/fs-integration";
export { Explorer } from "./components/apps/Explorer/Explorer";
export { OpenFileDialog } from "./components/OpenFileDialog/OpenFileDialog";
export { SaveAsDialog } from "./components/SaveAsDialog/SaveAsDialog";
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
  createLocalFileSystem,
  createZustandFsIntegration,
  fsZustandIntegration,
  useFs,
} from "./services/fs/fs-integration";
export { useSettingsStore } from "./stores/settings";
export { useWindowStore } from "./stores/window";
export type { RadixOsAppComponent } from "./stores/window";
export const RadixOS = RadixOSComponent;
export type FsIntegration = TFsIntegration;
