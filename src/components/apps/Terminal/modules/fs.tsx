import { Code } from "@radix-ui/themes";
import { ReactNode } from "react";
import {
  findNodeByPath,
  isFile,
  openFile,
  parseRelativePath,
} from "../../../../services/fs";
import {
  launcherSchema,
  useFileSystemStore,
} from "../../../../stores/fs";
import { Command, DirNotFound } from "../constants";
import { quotableRestArgs } from "../utils";

export function parseFs({
  pushOutput,
  args,
  currentPath,
}: {
  pushOutput: (...output: ReactNode[]) => void;
  args: string[];
  currentPath: string;
}) {
  const {
    tree,
    renameFile: rename,
    setDefaultLauncher,
    makeExecutableWith,
  } = useFileSystemStore.getState();
  // eslint-disable-next-line prefer-const
  let [path, flag, ...restArgs] = args;
  path = parseRelativePath(currentPath, path);
  const node = findNodeByPath(path, tree);
  if (!node) {
    return pushOutput(<DirNotFound dir={path} />);
  }
  switch (flag) {
    case "-R": {
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
    case "-O": {
      const launcher = restArgs[0];
      if (!isFile(node)) {
        return pushOutput(
          <Code size="1" variant="soft" color="crimson">
            Not a file
          </Code>
        );
      }
      const validLaunchers = node.launcher;
      if (
        launcher &&
        !validLaunchers.includes(launcher as "code")
      ) {
        return pushOutput(
          <Code size="1" variant="soft" color="crimson">
            Invalid launcher
          </Code>
        );
      }
      openFile(node, path, launcher as "code");
      return pushOutput(
        <Command command={`fs ${path} -O ${launcher ?? ""}`} />
      );
    }
    case "-L": {
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
    case "--ll": {
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
    case "--ex": {
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
      const launcher = launcherSchema.safeParse(restArgs[0]);
      if (!launcher.success) {
        return pushOutput(
          <Code size="1" variant="soft" color="crimson">
            Not a valid launcher
          </Code>
        );
      }
      makeExecutableWith(path, launcher.data);
      return pushOutput(
        <Command command={`fs ${path} --ex ${restArgs[0]}`} />
      );
      break;
    }
  }
}
