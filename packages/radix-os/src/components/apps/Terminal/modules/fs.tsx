import { Code } from "@radix-ui/themes";
import { ReactNode } from "react";
import {
  findNodeByPath,
  isFile,
  parseRelativePath,
} from "../../../../services/fs/tree-helpers";
import {
  FsFile,
  FsFolder,
  Launcher,
} from "../../../../stores/fs";
import { Command, DirNotFound } from "../constants";
import { quotableRestArgs } from "../utils";

export function parseFs({
  pushOutput,
  args,
  currentPath,
  updateFile,
  tree,
}: {
  pushOutput: (...output: ReactNode[]) => void;
  args: string[];
  currentPath: string;
  tree: FsFolder;
  updateFile: (
    path: string,
    file: Partial<FsFile>
  ) => Promise<boolean>;
}) {
  // eslint-disable-next-line prefer-const
  let [path, flag, ...restArgs] = args;
  path = parseRelativePath(currentPath, path);
  const node = findNodeByPath(path, tree);
  if (!node) {
    return pushOutput(<DirNotFound dir={path} />);
  }
  const setDefaultLauncher = (
    path: string,
    launcher: Launcher
  ) => {
    const node = findNodeByPath(path, tree);
    if (!node || !isFile(node)) return null;
    updateFile(path, {
      launcher: [
        launcher,
        ...node.launcher.filter((l) => l !== launcher),
      ],
    });
  };
  const makeExecutableWith = (
    path: string,
    launcher: Launcher
  ) => {
    const node = findNodeByPath(path, tree);
    if (!node || !isFile(node)) return null;
    updateFile(path, {
      launcher: [
        ...node.launcher.filter((l) => l !== launcher),
        launcher,
      ],
    });
  };
  const rename = (path: string, name: string) => {
    const node = findNodeByPath(path, tree);
    if (!node || !isFile(node)) return null;
    updateFile(path, { name });
  };
  switch (flag) {
    case "-R":
    case "-r": {
      const name = quotableRestArgs(restArgs);
      if (!name) {
        pushOutput(
          <Code size="1" variant="soft" color="crimson">
            fs -R needs a name as argument
          </Code>
        );
        break;
      }
      if (name.includes("/")) {
        pushOutput(
          <Code size="1" variant="soft" color="crimson">
            Name cannot contain "/"
          </Code>
        );
        break;
      }
      rename(path, name);
      return pushOutput(
        <Command command={`fs ${path} -R ${name}`} />
      );
    }
    case "-L":
    case "-l": {
      const launcher = restArgs[0];
      if (!launcher) {
        return pushOutput(
          <Code size="1" variant="soft" color="crimson">
            fs --L needs a launcher as argument
          </Code>
        );
      }
      if (!isFile(node)) {
        return pushOutput(
          <Code size="1" variant="soft" color="crimson">
            Not a file
          </Code>
        );
      }
      const validLaunchers = node.launcher;
      if (!validLaunchers.includes(launcher as "code")) {
        return pushOutput(
          <Code size="1" variant="soft" color="crimson">
            Invalid launcher
          </Code>
        );
      }
      setDefaultLauncher(path, launcher as "code");
      return pushOutput(
        <Command command={`fs ${path} --L ${launcher}`} />
      );
    }
    case "--ll":
    case "--LL": {
      const node = findNodeByPath(path, tree);
      if (!node) {
        return pushOutput(<DirNotFound dir={path} />);
      }
      if (!isFile(node)) {
        return pushOutput(
          <Code size="1" variant="soft" color="crimson">
            Not a file
          </Code>
        );
      }

      return pushOutput(
        <Command command={`fs ${path} --ll`} />,
        ...node.launcher.map((launcher) => (
          <Code
            size="1"
            key={launcher}
            variant="ghost"
            color="gray"
          >
            {launcher}
          </Code>
        ))
      );
      break;
    }
    case "--ex":
    case "--EX": {
      const node = findNodeByPath(path, tree);
      if (!node) {
        return pushOutput(<DirNotFound dir={path} />);
      }
      if (!isFile(node)) {
        return pushOutput(
          <Code size="1" variant="soft" color="crimson">
            Not a file
          </Code>
        );
      }
      const launcher = restArgs[0];
      if (!launcher) {
        return pushOutput(
          <Code size="1" variant="soft" color="crimson">
            No launcher supplied
          </Code>
        );
      }
      makeExecutableWith(path, launcher as "code");
      return pushOutput(
        <Command command={`fs ${path} --ex ${restArgs[0]}`} />
      );
      break;
    }
  }
}
