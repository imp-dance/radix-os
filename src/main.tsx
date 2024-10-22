import "@radix-ui/themes/styles.css";
import {
  createUseAppLauncher,
  fsZustandIntegration,
  RadixOS,
  setupApps,
} from "radix-os";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ExampleApp } from "./applications/ExampleApp.tsx";
import "./index.css";

export const applications = setupApps({
  component: ExampleApp,
  appId: "example-app",
  appName: "Example App",
  addToDesktop: true,
  defaultWindowSettings: {
    title: "Example App",
  },
});

export const useAppLauncher = createUseAppLauncher(applications);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RadixOS
      fs={fsZustandIntegration}
      applications={applications}
      desktopShortcuts={[]}
    />
  </StrictMode>
);
