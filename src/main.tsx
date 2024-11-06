import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import "@radix-ui/themes/styles.css";
import {
  createUseAppLauncher,
  createZustandFsIntegration,
  RadixOS,
  setupApps,
} from "radix-os";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ExampleApp } from "./applications/ExampleApp.tsx";
import "./index.css";

export const applications = setupApps(
  [
    {
      component: ExampleApp,
      appId: "example-app",
      appName: "Example App",
      defaultWindowSettings: {
        title: "Example App",
        icon: <QuestionMarkCircledIcon />,
      },
    },
  ],
  {
    defaultAppsOnDesktop: ["explorer", "settings", "terminal"],
  }
);

const fs = createZustandFsIntegration({});

export const useAppLauncher = createUseAppLauncher(applications);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RadixOS
      fs={fs}
      applications={applications}
      desktopShortcuts={[]}
      radius="none"
      accentColor="bronze"
    />
  </StrictMode>
);
