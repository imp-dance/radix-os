import { GearIcon } from "@radix-ui/react-icons";
import { createWindow } from "../../stores/window";
import { Settings } from "./Settings";
const windowId = Symbol("window");

const height = 268;
const width = 459;

export const createSettingsWindow = () => ({
  ...createWindow({
    content: <Settings />,
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
