import {
  CardStackIcon,
  CodeIcon,
  GlobeIcon,
  HomeIcon,
} from "@radix-ui/react-icons";
import "@radix-ui/themes/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CodeApp } from "./components/apps/Code/Code.tsx";
import { ExplorerApp } from "./components/apps/Explorer/Explorer.tsx";
import { Terminal } from "./components/apps/Terminal/Terminal.tsx";
import { WebBrowser } from "./components/apps/WebBrowser/WebBrowser.tsx";
import "./index.css";
import { setupApps } from "./integration/setupApps.ts";
import RadixOS from "./RadixOS.tsx";
import { fsZustandIntegration } from "./stores/fs.tsx";

const { applications, useAppLauncher } = setupApps(
  {
    component: ExplorerApp,
    appId: "explorer",
    defaultWindowSettings: {
      title: "Explorer",
      icon: <HomeIcon />,
      initialHeight: 400,
      initialWidth: 600,
    },
  },
  {
    component: Terminal,
    appId: "terminal",
    defaultWindowSettings: {
      title: "Terminal",
      icon: <CardStackIcon />,
      initialHeight: 350,
      initialWidth: 515,
      scrollable: false,
    },
  },
  {
    component: CodeApp,
    appId: "code",
    defaultWindowSettings: {
      title: "New file",
      icon: <CodeIcon />,
      initialHeight: 600,
      initialWidth: 800,
    },
  },
  {
    component: WebBrowser,
    appId: "web",
    defaultWindowSettings: {
      title: "Web Browser",
      icon: <GlobeIcon />,
      initialHeight: 600,
      initialWidth: 800,
    },
  }
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RadixOS
      fs={fsZustandIntegration}
      applications={applications}
    />
  </StrictMode>
);
