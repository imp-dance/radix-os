import { HomeIcon } from "@radix-ui/react-icons";
import { createWindow } from "../../stores/window";
import { Explorer } from "./Explorer";

export const createExplorerWindow = (initialPath?: string) => {
  const win = createWindow({
    content: <div />,
    title: "Explorer",
    icon: <HomeIcon />,
    initialHeight: 400,
    initialWidth: 600,
  });
  win.content = (
    <Explorer windowId={win.id} initialPath={initialPath} />
  );
  return win;
};
