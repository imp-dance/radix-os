import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  findNodeByPath,
  getParentPath,
  isFile,
  isFolder,
  parsePath,
  pathToName,
} from "../services/fs";
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
  createFile: (path: string, content?: string) => void;
  updateFile: (path: string, data: string) => void;
  renameFile: (path: string, name: string) => void;
  addFolderToFavourites: (path: string) => void;
  removeFolderFromFavourites: (path: string) => void;
  favouriteFolders: string[];
  setDefaultLauncher: (path: string, launcher: Launcher) => void;
  makeExecutableWith: (path: string, launcher: Launcher) => void;
};

// TODO: Zod validation

export const useFileSystemStore = create(
  persist<FileSystemStore>(
    (set) => ({
      tree: initialTree,
      favouriteFolders: [
        "Home",
        "Home/Documents",
        "Home/Images",
      ],
      addFolderToFavourites: (path) =>
        set((state) => {
          if (!state.favouriteFolders.includes(path)) {
            return {
              ...state,
              favouriteFolders: [
                ...state.favouriteFolders,
                path,
              ],
            };
          }
          return state;
        }),
      removeFolderFromFavourites: (path) =>
        set((state) => {
          return {
            ...state,
            favouriteFolders: state.favouriteFolders.filter(
              (f) => f !== path
            ),
          };
        }),
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
      createFile: (path, content) =>
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
            data: content ?? "",
            launcher: ["code"],
            title: "New file",
          });
          return { ...state, tree: { ...newState.tree } };
        }),
      move: (from, to) =>
        set((state) => {
          const newTree = { ...state.tree };
          let newFavourites = [...state.favouriteFolders];
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

          return {
            tree: { ...newTree },
            favouriteFolders: [...newFavourites],
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

          return {
            favouriteFolders: [
              ...state.favouriteFolders.filter(
                (f) => parsePath(f) !== parsePath(path)
              ),
            ],
            tree: {
              ...newTree,
            },
          };
        }),
      setDefaultLauncher: (path: string, launcher: Launcher) =>
        set((state) => {
          const newTree = { ...state.tree };
          const node = findNodeByPath(path, newTree);
          if (!isFile(node)) {
            return state;
          }
          node.launcher = [
            launcher,
            ...node.launcher.filter((l) => l !== launcher),
          ];
          return { tree: { ...newTree } };
        }),
      updateFile: (path: string, data: string) =>
        set((state) => {
          const newTree = { ...state.tree };
          const node = findNodeByPath(path, newTree);
          if (!isFile(node)) {
            return state;
          }
          node.data = data;
          return { tree: { ...newTree } };
        }),

      renameFile: (path: string, name: string) =>
        set((state) => {
          const newState = { ...state };
          const node = findNodeByPath(path, newState.tree);
          node.name = name;
          if (
            newState.favouriteFolders.some(
              (f) => parsePath(f) === parsePath(path)
            )
          ) {
            newState.favouriteFolders =
              newState.favouriteFolders.map((f) =>
                parsePath(f) === parsePath(path)
                  ? `${getParentPath(path)}/${name}`
                  : f
              );
          }
          return {
            favouriteFolders: newState.favouriteFolders,
            tree: { ...newState.tree },
          };
        }),
      makeExecutableWith: (path: string, launcher: Launcher) =>
        set((state) => {
          const newState = { ...state };
          const node = findNodeByPath(path, newState.tree);
          if (!isFile(node)) return state;
          if (launcherSchema.safeParse(launcher).error) {
            return state;
          }
          node.launcher = [
            ...node.launcher.filter((l) => l !== launcher),
            launcher,
          ];
          return { tree: { ...newState.tree } };
        }),
    }),
    {
      name: FS_LS_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        ({
          tree: state.tree,
          favouriteFolders: state.favouriteFolders,
        } as FileSystemStore),
    }
  )
);
