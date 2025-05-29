import { Context, createContext, useContext } from "react";
import { FsFile } from "../../stores/fs";
import {
  RadixOsApp,
  RadixOsAppWindow
} from "../../stores/window";
import { RadixAppList } from "./setupApps";

type AppWindowSettings = Partial<
  Omit<RadixOsAppWindow, "id" | "key" | "content">
> & {
  file?: { file: FsFile; path: string };
};
export type UseAppLauncherReturn<T extends string> = {
  launch: (app: T, settings?: AppWindowSettings) => void;
  openFile: (
    file: { file: FsFile; path: string },
    settings?: Omit<AppWindowSettings, "file"> & { launcher?: T }
  ) => void;
  applications: readonly RadixOsApp<string>[];
};

const appContext =
  createContext<UseAppLauncherReturn<string> | null>(null);

export const AppContextProvider = appContext.Provider;

export const useUntypedAppContext = () => {
  const context = useContext(appContext);
  if (context === null)
    throw new Error(
      "Application context used outside of provider"
    );
  return context;
};

export const createUseAppLauncher =
  <T extends string>(_arg: RadixAppList<T>) =>
  () => {
    const context = useContext<UseAppLauncherReturn<T>>(
      appContext as unknown as Context<UseAppLauncherReturn<T>>
    );
    if (context === null)
      throw new Error(
        "Application context used outside of provider"
      );
    return context;
  };
