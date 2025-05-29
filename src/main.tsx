import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import "@radix-ui/themes/styles.css";
import {
  createUseAppLauncher,
  createZustandFsIntegration,
  RadixOS,
  setupApps
} from "../packages/radix-os/src/index";
// from "radix-os";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

export const applications = setupApps([]);

const fs = createZustandFsIntegration({});

export const useAppLauncher = createUseAppLauncher(applications);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RadixOS
      fs={fs}
      applications={applications}
      desktopShortcuts={[
        {
          label: "Tissefant example",
          icon: <ExclamationTriangleIcon />,
          onClick: (appLauncher) => {
            appLauncher.launch("tissefant");
          }
        }
      ]}
    />
  </StrictMode>
);
