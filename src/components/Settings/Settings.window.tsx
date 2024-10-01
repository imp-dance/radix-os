import { GearIcon } from "@radix-ui/react-icons";
import { createWindow } from "../../stores/window";
import { Settings } from "./Settings";
const windowId = Symbol("window");

const height = 358;
const width = 459;

export const createSettingsWindow = (
  tab?: "customize" | "storage" | "shortcuts" | "about"
) => ({
  ...createWindow({
    content: <Settings initialTab={tab} />,
    title: "Settings",
    icon: <GearIcon />,
    initialHeight: height,
    initialWidth: width,
    maxHeight: height,
    maxWidth: width,
    resizeable: false,
  }),
  key: "settings",
  id: windowId,
});
