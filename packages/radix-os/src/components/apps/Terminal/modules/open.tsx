import { Code } from "@radix-ui/themes";
import { ReactNode } from "react";
import { UseAppLauncherReturn } from "../../../../services/applications/launcher";
import {
  findNodeByPath,
  isFile,
  parseRelativePath,
} from "../../../../services/fs/tree-helpers";
import { FsNode } from "../../../../stores/fs";
import { Command, openHelpText } from "../constants";

export function parseOpen(opts: {
  flags: Record<string, string>;
  args: string[];
  pushOutput: (...output: ReactNode[]) => void;
  openFile: UseAppLauncherReturn<string>["openFile"];
  cd: string;
  tree: FsNode;
}) {
  const { flags, pushOutput, openFile, cd, args, tree } = opts;
  if (flags && "help" in flags) {
    return pushOutput(
      <Code size="1" variant="soft" color="gray">
        <pre style={{ margin: 0, textWrap: "wrap" }}>
          {openHelpText}
        </pre>
      </Code>
    );
  }
  const filePath = parseRelativePath(cd, args[0]);
  const file = findNodeByPath(filePath, tree);
  if (!isFile(file)) {
    return pushOutput(
      <Code size="1" variant="soft" color="crimson">
        Not a file
      </Code>
    );
  }
  let launcher = file.launcher[0];
  if (flags.l && file.launcher.includes(flags.l)) {
    launcher = flags.l;
  }
  openFile(
    { file, path: filePath },
    {
      launcher,
      x: flags.x ? parseInt(flags.x) : undefined,
      y: flags.y ? parseInt(flags.y) : undefined,
      initialWidth: flags.w ? parseInt(flags.w) : undefined,
      initialHeight: flags.h ? parseInt(flags.h) : undefined,
      resizeable:
        flags.r === "true"
          ? true
          : flags.r === "false"
          ? false
          : undefined,
      scrollable:
        flags.s === "true"
          ? true
          : flags.s === "false"
          ? false
          : undefined,
    }
  );
  return pushOutput(
    <Command command={`open ${filePath}`} />,
    <Command
      command={`File was opened with launcher: ${launcher}`}
    />
  );
}
