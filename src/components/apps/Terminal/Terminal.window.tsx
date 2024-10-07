import { CardStackIcon } from "@radix-ui/react-icons";
import { createWindow } from "../../../stores/window";
import { Terminal } from "./Terminal";

export const createTerminalWindow = (initialPath?: string) =>
  createWindow({
    content: <Terminal initialPath={initialPath} />,
    title: "Terminal",
    icon: <CardStackIcon />,
    initialHeight: 350,
    initialWidth: 515,
    scrollable: false,
  });
