import { HomeIcon } from "@radix-ui/react-icons";
import { createWindow } from "../../stores/window";
import { Explorer } from "./Explorer";

export const createExplorerWindow = () =>
  createWindow({
    content: <Explorer />,
    title: "Explorer",
    icon: <HomeIcon />,
    initialHeight: 400,
    initialWidth: 600,
  });
