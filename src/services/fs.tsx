import { createContext, useContext } from "react";
import { FsFile, FsFolder, FsNode } from "../stores/fs";

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

export function findNode(
  name: string,
  node: FsNode
): FsNode | null {
  if ("children" in node) {
    for (const child of node.children) {
      if (child.name === name) {
        return child;
      }
      const found = findNode(name, child);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function findNodeByPath(
  path: string,
  node: FsNode
): FsNode {
  path = parsePath(path);
  if (path === "") {
    return node;
  }
  const parts = path.split("/");
  let current: FsNode = node;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    current = (current as FsFolder).children.find(
      (c) => c.name === part
    ) as FsNode;
  }
  return current;
}

export function isFile(node: FsNode): node is FsFile {
  return "data" in node;
}

export function isFolder(node: FsNode): node is FsFolder {
  return "children" in node;
}

export function getParentPath(path: string) {
  const parts = path.split("/");
  return parts.slice(0, parts.length - 1).join("/");
}

export function pathToName(path: string) {
  return path.split("/").pop() ?? "";
}

export function parsePath(path: string) {
  if (path.startsWith("/")) {
    path = path.substring(1);
  }
  if (path.startsWith("Home")) {
    path = path.substring(5);
  }
  return path;
}

export function parseRelativePath(cd: string, nd: string) {
  if (nd.startsWith("/")) {
    return nd;
  }
  const segments = cd.split("/").filter(Boolean);
  const nextSegments = nd.split("/").filter(Boolean);
  nextSegments.forEach((segment) => {
    if (segment === "..") {
      if (segments.length === 0) return;
      segments.pop();
    } else {
      segments.push(segment);
    }
  });
  return segments.join("/");
}
