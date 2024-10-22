import { createContext, useContext } from "react";
import {
  FsFile,
  FsNode,
  useFileSystemStore,
} from "../../stores/fs";
import { findNodeByPath } from "./tree-helpers";

export type FsIntegration = {
  readDir: (path: string) => Promise<FsNode | null>;
  makeDir: (path: string) => Promise<boolean>;
  makeFile: (
    path: string,
    file: { name: string } & Partial<FsFile>
  ) => Promise<boolean>;
  move: (from: string, to: string) => Promise<boolean>;
  updateFile: (
    path: string,
    file: Partial<FsFile>
  ) => Promise<boolean>;
  removeFile: (path: string) => Promise<boolean>;
};

export const fsContext = createContext<FsIntegration | null>(
  null
);

export const FsProvider = fsContext.Provider;

export const useFs = () => {
  const context = useContext(fsContext);
  if (context === null)
    throw new Error(
      "RadixOS mounted outside file system context"
    );
  return context;
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
