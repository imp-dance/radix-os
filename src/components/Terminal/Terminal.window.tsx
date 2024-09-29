import { CardStackIcon } from "@radix-ui/react-icons";
import { createWindow } from "../../stores/window";
import { Terminal } from "./Terminal";

export const createTerminalWindow = () =>
  createWindow({
    content: <Terminal />,
    title: "Terminal",
    icon: <CardStackIcon />,
    initialHeight: 350,
    initialWidth: 515,
    scrollable: false,
  });
