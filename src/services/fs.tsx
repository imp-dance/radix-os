import {
  CameraIcon,
  CardStackIcon,
  CodeIcon,
  GlobeIcon,
} from "@radix-ui/react-icons";
import { Code as CodeApp } from "../components/Code/Code";
import { ImageViewer } from "../components/ImageViewer/ImageViewer";
import { Terminal } from "../components/Terminal/Terminal";
import { WebBrowser } from "../components/WebBrowser/WebBrowser";
import {
  FsFile,
  FsFolder,
  FsNode,
  Launcher,
} from "../stores/fs";
import { createWindow, useWindowStore } from "../stores/window";

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
    console.log({ part, current });

    current = (current as FsFolder).children.find(
      (c) => c.name === part
    ) as FsNode;
    console.log({ part, current });
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

export function openFile(
  file: FsFile,
  path: string,
  launcher?: Launcher
) {
  const state = useWindowStore.getState();
  let newWindow;
  switch (launcher ?? file.launcher[0]!) {
    case "code":
      newWindow = createWindow({
        title: `${file.name}`,
        icon: <CodeIcon />,
        content: <CodeApp path={path} file={file} />,
        initialHeight: 600,
        initialWidth: 500,
      });
      break;
    case "web":
      newWindow = createWindow({
        title: "Web Browser",
        content: (
          <WebBrowser
            launchConfig={{
              data: file.data,
              title: `Home:/${path}`,
            }}
          />
        ),
        initialHeight: 600,
        initialWidth: 500,
        icon: <GlobeIcon />,
      });
      break;
    case "terminal":
      newWindow = createWindow({
        title: file.name,
        icon: <CardStackIcon />,
        content: <Terminal />,
        initialHeight: 350,
        initialWidth: 500,
      });
      break;
    case "image":
      newWindow = createWindow({
        content: <ImageViewer src={file.data} />,
        title: file.name,
        icon: <CameraIcon />,
        initialHeight: 500,
        initialWidth: 500,
      });
  }
  if (!newWindow) return;
  state.addWindow(newWindow);
  state.bringToFront(newWindow);
}
