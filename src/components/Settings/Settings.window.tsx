import { GearIcon } from "@radix-ui/react-icons";
import { createWindow } from "../../stores/window";
import { Settings } from "./Settings";
const windowId = Symbol("window");
export const createSettingsWindow = () => ({
  ...createWindow({
    content: <Settings />,
    title: "Settings",
    icon: <GearIcon />,
    initialHeight: 266,
    initialWidth: 459,
    maxHeight: 266,
    maxWidth: 459,
    resizeable: false,
  }),
  key: "settings",
  id: windowId,
});
