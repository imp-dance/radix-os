import { CodeIcon } from "@radix-ui/react-icons";
import { FsFile } from "../../stores/fs";
import { createWindow } from "../../stores/window";
import { CodeApp } from "./Code";

export const createCodeWindow = (args: {
  path?: string;
  file?: FsFile;
}) => {
  const win = createWindow({
    title: args.file?.name ?? "New file",
    content: <div />,
    icon: <CodeIcon />,
    initialHeight: 600,
    initialWidth: 800,
  });
  win.content = (
    <CodeApp
      file={args.file}
      path={args.path}
      windowId={win.id}
    />
  );
  return win;
};
