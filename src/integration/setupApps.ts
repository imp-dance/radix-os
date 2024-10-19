import { Context, createContext, useContext } from "react";
import { FsFile } from "../stores/fs";
import {
  RadixOsApp,
  RadixOsAppComponent,
  RadixOsAppWindow,
} from "../stores/window";

type RadixAppList<T extends string> = readonly RadixOsApp<T>[];

export const setupApps = <T extends string>(
  ...apps: RadixAppList<T>
): {
  applications: RadixAppList<T>;
  useAppLauncher: () => AppContext<T>;
} => {
  return {
    applications: apps,
    useAppLauncher: createUseAppContext<T>(),
  };
};

export const createApp = (
  arg: RadixOsAppComponent
): RadixOsAppComponent => arg;

type AppWindowSettings = Partial<
  Omit<RadixOsAppWindow, "id" | "key" | "content">
> & {
  file?: { file: FsFile; path: string };
};

export type AppContext<T extends string> = {
  launch: (app: T, settings?: AppWindowSettings) => void;
  openFile: (
    file: { file: FsFile; path: string },
    settings?: Omit<AppWindowSettings, "file"> & { launcher?: T }
  ) => void;
};

const appContext = createContext<AppContext<string> | null>(
  null
);

export const AppContextProvider = appContext.Provider;

export const useUntypedAppContext = () => {
  const context = useContext(appContext);
  if (context === null)
    throw new Error(
      "Application context used outside of provider"
    );
  return context;
};

export const createUseAppContext =
  <T extends string>() =>
  () => {
    const context = useContext<AppContext<T>>(
      appContext as unknown as Context<AppContext<T>>
    );
    if (context === null)
      throw new Error(
        "Application context used outside of provider"
      );
    return context;
  };
