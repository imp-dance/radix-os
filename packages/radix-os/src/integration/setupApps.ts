import {
  Context,
  createContext,
  ReactNode,
  useContext,
} from "react";
import { FsIntegration } from "..";
import { defaultApps } from "../defaultApps";
import { findNodeByPath } from "../services/fs";
import { FsFile, useFileSystemStore } from "../stores/fs";
import {
  RadixOsApp,
  RadixOsAppComponent,
  RadixOsAppWindow,
} from "../stores/window";

type RadixAppList<T extends string> = readonly RadixOsApp<T>[];

type DefaultApps =
  | "explorer"
  | "terminal"
  | "web"
  | "settings"
  | "code";

export const createApp = (
  arg: RadixOsAppComponent
): RadixOsAppComponent => arg;

type AppWindowSettings = Partial<
  Omit<RadixOsAppWindow, "id" | "key" | "content">
> & {
  file?: { file: FsFile; path: string };
};

export const setupApps = <
  TProvided extends string,
  TActual extends string = string extends TProvided
    ? DefaultApps
    : TProvided | DefaultApps
>(
  ...apps: RadixAppList<TProvided>
): RadixAppList<TActual> => {
  const applications = Object.values(
    [...defaultApps, ...(apps ?? [])].reduce((acc, item) => {
      acc[item.appId] = item as RadixAppList<TActual>[number];
      return acc;
    }, {} as Record<string, RadixAppList<TActual>[number]>)
  ) as unknown as RadixAppList<TActual>;

  return applications;
};

export type UseAppLauncherReturn<T extends string> = {
  launch: (app: T, settings?: AppWindowSettings) => void;
  openFile: (
    file: { file: FsFile; path: string },
    settings?: Omit<AppWindowSettings, "file"> & { launcher?: T }
  ) => void;
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

export const fsZustandIntegration: FsIntegration = {
  makeDir: (path) =>
    new Promise((resolve) => {
      const { createFolder } = useFileSystemStore.getState();
      try {
        createFolder(path);
        resolve(true);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_err) {
        resolve(false);
      }
    }),
  makeFile: (path, file) =>
    new Promise((resolve) => {
      const { createFile } = useFileSystemStore.getState();
      try {
        createFile(path, file);
        return resolve(true);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        return resolve(false);
      }
    }),
  move: (from, to) =>
    new Promise((resolve) => {
      const { move } = useFileSystemStore.getState();
      try {
        move(from, to);
        return resolve(true);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        return resolve(false);
      }
    }),
  readDir: (path) =>
    new Promise((resolve) => {
      const { tree } = useFileSystemStore.getState();
      const target = !path ? tree : findNodeByPath(path, tree);
      return resolve(target ?? null);
    }),
  updateFile: (path, file) =>
    new Promise((resolve) => {
      const { updateFile } = useFileSystemStore.getState();
      try {
        updateFile(path, file);
        return resolve(true);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        return resolve(false);
      }
    }),
  removeFile: (path) =>
    new Promise((resolve) => {
      const { remove } = useFileSystemStore.getState();
      try {
        remove(path);
        return resolve(true);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        return resolve(false);
      }
    }),
};
