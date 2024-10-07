import { GlobeIcon } from "@radix-ui/react-icons";
import { createWindow } from "../../../stores/window";
import { WebBrowser } from "./WebBrowser";

export const createWebBrowserWindow = (link?: string) =>
  createWindow({
    content: (
      <WebBrowser
        launchConfig={
          link ? { data: link, title: "Web Browser" } : undefined
        }
      />
    ),
    title: "Web Browser",
    icon: <GlobeIcon />,
    initialHeight: 600,
    initialWidth: 800,
  });
