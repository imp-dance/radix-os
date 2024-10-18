import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  findNodeByPath,
  FsIntegration,
  getParentPath,
  isFolder,
  parsePath,
  pathToName,
} from "../services/fs";
import { useFavouriteFolderStore } from "./explorer";
import { initialTree } from "./fs.constants";

export const FS_LS_KEY = "fs";

export type FsFolder = {
  name: string;
  children: FsNode[];
};

export const launcherSchema = z.enum([
  "code",
  "web",
  "terminal",
  "image",
]);
export type Launcher = z.infer<typeof launcherSchema>;

export type FsFile = {
  name: string;
  launcher: Launcher[];
  data: string;
  title: string;
};

export type FsNode = FsFolder | FsFile;

export type FileSystemStore = {
  tree: {
    name: "Home";
    children: FsNode[];
  };
  move: (from: string, to: string) => void;
  remove: (path: string) => void;
  createFolder: (path: string) => void;
  createFile: (
    path: string,
    file: { name: string } & Partial<FsFile>
  ) => void;
  updateFile: (path: string, file: Partial<FsFile>) => void;
};

// TODO: Zod validation

export const useFileSystemStore = create(
  persist<FileSystemStore>(
    (set) => ({
      tree: initialTree,
      createFolder: (path) =>
        set((state) => {
          const newState = { ...state };
          const parent = findNodeByPath(
            getParentPath(path),
            newState.tree
          );
          if (!isFolder(parent)) {
            return state;
          }
          parent.children.push({
            name: pathToName(path),
            children: [] as FsNode[],
          });
          return { ...state, tree: { ...newState.tree } };
        }),
      createFile: (path, file) =>
        set((state) => {
          const newState = { ...state };
          const parent = findNodeByPath(path, newState.tree);
          if (!isFolder(parent)) {
            return state;
          }
          parent.children.push({
            name: file.name,
            data: file.data ?? "",
            launcher: file.launcher ?? ["code"],
            title: file.title ?? "New file",
          });
          return { ...state, tree: { ...newState.tree } };
        }),
      move: (from, to) =>
        set((state) => {
          const newTree = { ...state.tree };
          let newFavourites = [
            ...useFavouriteFolderStore.getState()
              .favouriteFolders,
          ];
          const fromNode = findNodeByPath(from, newTree);
          const toNode = findNodeByPath(to, newTree);
          const fromParentNode = findNodeByPath(
            getParentPath(from),
            newTree
          );
          if (!isFolder(fromParentNode) || !isFolder(toNode)) {
            return state;
          }
          fromParentNode.children =
            fromParentNode.children.filter(
              (c) => c.name !== pathToName(from)
            );
          toNode.children.push(fromNode);

          if (
            newFavourites.some(
              (f) => parsePath(f) === parsePath(from)
            )
          ) {
            newFavourites = newFavourites.map((f) =>
              parsePath(f) === parsePath(from)
                ? parsePath(`${to}/${pathToName(from)}`)
                : f
            );
          }
          useFavouriteFolderStore
            .getState()
            .setFavourites(newFavourites);

          return {
            tree: { ...newTree },
          };
        }),
      remove: (path) =>
        set((state) => {
          const newTree = { ...state.tree };
          const parent = findNodeByPath(
            getParentPath(path),
            newTree
          );
          if (!isFolder(parent)) return state;

          parent.children = [
            ...parent.children.filter(
              (c) => c.name !== pathToName(path)
            ),
          ];
          const { setFavourites, favouriteFolders } =
            useFavouriteFolderStore.getState();

          setFavourites(
            favouriteFolders.filter(
              (f) => parsePath(f) !== parsePath(path)
            )
          );

          return {
            tree: {
              ...newTree,
            },
          };
        }),
      updateFile: (path, file) =>
        set((state) => {
          const newTree = { ...state.tree };
          const parent = findNodeByPath(
            getParentPath(path),
            newTree
          );
          if (!isFolder(parent)) {
            return state;
          }
          const child = parent.children.find(
            (n) => n.name === pathToName(path)
          );
          if (!child) {
            return state;
          }
          const index = parent.children.indexOf(child);
          parent.children[index] = {
            ...parent.children[index],
            ...file,
          };
          return { tree: { ...newTree } };
        }),
    }),
    {
      name: FS_LS_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        ({
          tree: state.tree,
        } as FileSystemStore),
    }
  )
);

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
      return resolve(target);
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
