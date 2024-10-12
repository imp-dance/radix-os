import { CameraIcon, GlobeIcon } from "@radix-ui/react-icons";
import { createCodeWindow } from "../components/apps/Code/Code.window";
import { createTerminalWindow } from "../components/apps/Terminal/Terminal.window";
import { WebBrowser } from "../components/apps/WebBrowser/WebBrowser";
import { ImageViewer } from "../components/ImageViewer/ImageViewer";
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

export function openFile(
  file: FsFile,
  path: string,
  launcher?: Launcher
) {
  const state = useWindowStore.getState();
  let newWindow;
  switch (launcher ?? file.launcher[0]!) {
    case "code":
      newWindow = createCodeWindow({ path, file });
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
      newWindow = createTerminalWindow(file.data);
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

export function joinQuotedArgs(args: string[]) {
  const quote = ["'", '"', "`"];
  const nextArgs: string[] = [];
  let argBuilder: string | null = null;
  args.forEach((arg) => {
    const hasStartQuote = quote.some((quoteSymbol) =>
      arg.startsWith(quoteSymbol)
    );
    const hasEndQuote = quote.some((quoteSymbol) =>
      arg.endsWith(quoteSymbol)
    );
    if (hasStartQuote && argBuilder === null) {
      argBuilder = arg.slice(1);
    } else if (hasEndQuote && argBuilder !== null) {
      argBuilder += ` ${arg.slice(0, -1)}`;
      nextArgs.push(argBuilder);
      argBuilder = null;
    } else if (argBuilder !== null) {
      argBuilder += ` ${arg}`;
    } else {
      nextArgs.push(arg);
    }
  });
  return nextArgs;
}
