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

type FileSystemStore = {
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

const initialTree: FileSystemStore["tree"] = {
  name: "Home" as const,
  children: [
    {
      children: [
        {
          title: "Hello World",
          name: "index",
          launcher: ["web", "code"] as Launcher[],
          data: `<!DOCTYPE HTML>
<html>
<head>
  <title>Testing</title>
</head>
<body>
  <h1 style='font-family:sans-serif;'>Hello World</h1>
</body>
</html>`,
        },
        {
          title: "Ryfylke React AS",
          name: "Ryfylke React",
          launcher: ["image", "code"] as Launcher[],
          data: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUzMSIgaGVpZ2h0PSIxNTMxIiB2aWV3Qm94PSIwIDAgMTUzMSAxNTMxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTUzMSIgaGVpZ2h0PSIxNTMxIiByeD0iNzY1LjUiIGZpbGw9IiMxMzIxMkIiLz4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwKSI+CjxwYXRoIGQ9Ik0xMTU5LjY0IDkyMi4zMzRDMTIwMS4xOSAxMDYxLjQ1IDEwMTcuNzIgMTIzMy4yNSA4MzAuNjMyIDEyMzMuMjVDNjQzLjU0IDEyMzMuMjUgNzM3LjMyNyAxMDU0LjUyIDY2Ni44OSA5MjcuNTkzQzYwMi40MjkgODExLjQzMiA4MzcuMDQ2IDkyNC41OSA5MzguMjU2IDcxMy44MTZDMTA0MC43MSA3MjcuNjQ2IDExMzkuNyA4NTAuNjMyIDExNTkuNjQgOTIyLjMzNFoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcikiLz4KPHBhdGggZD0iTTYyMC4yNTEgMTYxLjAwMUM2MjAuMjUxIDE2MS4wMDEgNjEyLjUzNyAxODkuNTUyIDYxMS4xNzUgMjA4Ljc1NUM2MDkuODg1IDIyNi45MzUgNjI2Ljc5NiAyNjEuMDM1IDYyNi43OTYgMjYxLjAzNUw0ODYuNDc1IDI1OC45MDRDNDg2LjQ3NSAyNTguOTA0IDQzNy45ODkgMzA3LjU5NyA0MDkuNzM4IDMyNi43NzJDMzg2LjAxNSAzNDIuODczIDMzMyAzNjUuNiAzMzMgMzY1LjZDMzMzIDM2NS42IDMzMi45ODMgNDI1LjA4NCAzODQuMTU2IDQ4NS4xMDFDNDIzLjYzIDUzMS4zOTggNDk3LjM0NyA1MjcuOTk2IDQ5Ny4zNDcgNTI3Ljk5Nkw2MDguMzQyIDQzMi40NTRMNjQ1LjQ3OSA0MzIuMjYyTDY3My44MTcgNDQ3LjE1NUwzNzQuNTE4IDEwMTAuNTVDNDAyLjI3OSAxMjU3LjM4IDU2Mi41ODYgMTM2My43NCA3NjEuMTc1IDEzNjkuNzlDOTU5Ljc2NCAxMzc1Ljg1IDExNDEuOTEgMTI0OS40NyAxMTk4IDEwMTAuNTVDMTE4My4xOCA5MTUuNzcgMTEyNi4yNSA4NDUuMTc3IDEwOTIuNjEgODE1LjQzMkwxMDM0Ljg0IDgyOS40MThDMTA3MC42IDgzOS4xOTIgOTk5LjgxNiA4NTMuNzUgMTAxOS40MiA4ODUuMjVDMTAzOS4wMiA5MTYuNzUxIDEwNDYuMjQgOTU1Ljc0NyAxMDM5LjI0IDk5Mi4xOUMxMDMyLjIzIDEwMjguNjMgMTAxMC4zNyAxMDYyLjY2IDk4MS4xODIgMTA4NC4xMkM5NTEuOTk0IDExMDUuNTggOTEzLjAxOCAxMTE2LjI4IDg3Ni4xODcgMTExMi4wN0M4NDUuMjYgMTEwOC41MyA4MzcuNDE1IDExMDQuMjUgODEzLjMxNCAxMDg0LjUzQzc4OS4yMTMgMTA2NC44MSA3NzAuNDIzIDEwMzguOTMgNzU3LjU2MiAxMDEwLjU2QzczMS44NCA5NTMuNzk4IDczMC4wMjYgODg4LjY1NSA3MzkuOCA4MjcuMTAyQzc0OS41NzQgNzY1LjU1IDc3MC4yODUgNzA2LjM3NSA3ODguMzA3IDY0Ni43MThDODA2LjMyOSA1ODcuMDYxIDgyMS44NTIgNTI1LjY5MyA4MjAuNzQzIDQ2My4zNzhDODE5LjkyMiA0MTcuMjQ4IDgwOS41NzYgMzcxLjU3IDc5MS4zNzkgMzI5LjE5M0M3NjEuNTUgMjc3LjYxNSA3MTYuNjg3IDI2MS4wMzUgNzE2LjY4NyAyNjEuMDM1QzcxNi42ODcgMjYxLjAzNSA3MTAuMjMxIDI1My45NTEgNzA3LjU2NiAyNDkuOTg2QzY5Ny4yNjQgMjM0LjY1NiA2OTIuODM2IDIxOC4yMzkgNjgxLjMyNCAyMDEuMTc5QzY1Ni4zNDUgMTY0LjE2MyA2MjAuMjUxIDE2MSA2MjAuMjUxIDE2MVYxNjEuMDAxWiIgZmlsbD0idXJsKCNwYWludDFfbGluZWFyKSIvPgo8cGF0aCBvcGFjaXR5PSIwLjM5MTAyNiIgZD0iTTM2MS45NTYgNDUzLjY4Nkw1NTEuNDY3IDM3OS4zMzhMNjM5LjU1OCAyNjkuMTk2TDYyNi43OTYgMjYxLjAzNkw0ODYuNDc2IDI1OC45MDNDNDg2LjQ3NiAyNTguOTAzIDQzOC4xNiAzMDguMzM5IDQwOS43MzggMzI3LjU3OEMzODYuMDk0IDM0My41ODEgMzMzIDM2NS41OTkgMzMzIDM2NS41OTlDMzMzIDM2NS41OTkgMzMzLjExNSAzNzUuNjk2IDMzNi43OTQgMzkxLjc1NkMzNDAuNDcyIDQwNy44MTYgMzYxLjk1NiA0MjkuODM3IDM2MS45NTYgNDUzLjY4NlY0NTMuNjg2WiIgZmlsbD0idXJsKCNwYWludDJfbGluZWFyKSIvPgo8cGF0aCBkPSJNOTM3Ljc3MiA3MjUuNjlMOTMxLjc0MyA2NTMuMjYxQzkzMS43NDMgNjUzLjI2MSA5NzkuMjg2IDYzMi4wNTcgMTAzMi44OSA2MzMuODcyQzEwODIuNjYgNjM1LjU1NiAxMTI0LjY0IDY4MC40NTMgMTEyNC42NCA2ODAuNDUzQzExMjQuNjQgNjgwLjQ1MyAxMDc4LjQ5IDcxNS41MTQgMTA1OS4yOCA3MzYuOTg1QzEwNDEuMTYgNzU3LjIzOCAxMDEzLjEgODA0LjE4NiAxMDEzLjEgODA0LjE4Nkw5MzcuNzcyIDcyNS42OVoiIGZpbGw9IiNGRkE5NDUiLz4KPC9nPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyIiB4MT0iOTgyLjIwMyIgeTE9Ijg0MC44NjIiIHgyPSI3NTAuMTU1IiB5Mj0iMTAyMS4xIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRkE5NDUiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjN0QxRTAzIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQxX2xpbmVhciIgeDE9IjE2Mi4zNjMiIHkxPSIxMTA4Ljc4IiB4Mj0iMTAxOC40NSIgeTI9IjEwMTQuMDYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0ZGODEzOCIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRkE5NDUiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDJfbGluZWFyIiB4MT0iNTM1LjI0OCIgeTE9IjM3Ni40NjQiIHgyPSI1MDIuMTk3IiB5Mj0iMjUzLjI1IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRjVCMDkiIHN0b3Atb3BhY2l0eT0iMCIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRjU4NTgiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMCI+CjxyZWN0IHg9IjMzMyIgeT0iMTYxIiB3aWR0aD0iODY1IiBoZWlnaHQ9IjEyMDkiIHJ4PSI0MzIuNSIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K`,
        },
      ],
      name: "Documents",
    },
    {
      children: [] as FsNode[],
      name: "Images",
    },
  ],
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
