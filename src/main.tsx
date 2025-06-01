import { InfoCircledIcon } from "@radix-ui/react-icons";
import "@radix-ui/themes/styles.css";
import {
  createUseAppLauncher,
  createZustandFsIntegration,
  RadixOS,
  setupApps,
  //} from "../packages/radix-os/src/index";
} from "radix-os";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  Box,
  Flex,
  Heading,
  Link,
  Text,
} from "@radix-ui/themes";

function InfoApp() {
  return (
    <Flex direction="column" p="3" gap="1">
      <Heading>About Radix OS</Heading>
      <Text size="2" color="gray">
        RadixOS lets you build your own operating system by using
        React and Radix Themes.
      </Text>
      <Box mt="1" />
      <Heading size="3">👨‍💻 Build your own applications</Heading>
      <Text color="gray" size="1">
        Write and add your own custom components as applications,
        with the ability to interact with the OS's file system
        and window management.
      </Text>
      <Heading size="3">⚙ Comes with default apps</Heading>
      <Text size="1" color="gray">
        RadixOS contains a file explorer, terminal, image viewer,
        code editor and web browser by default.
      </Text>
      <Heading size="3">🚀 Get started</Heading>
      <Text size="1" color="gray">
        Get started by following the{" "}
        <Link
          href="https://radix-os.netlify.app/"
          target="_blank"
        >
          official docs
        </Link>
        .
      </Text>
    </Flex>
  );
}

export const applications = setupApps([
  {
    appId: "info",
    appName: "Information",
    defaultWindowSettings: {
      initialWidth: 450,
      maxWidth: 450,
      initialHeight: 320,
      resizeable: false,
      icon: <InfoCircledIcon />,
      title: "Information",
    },
    component: InfoApp,
    addToDesktop: true,
  },
]);

const fs = createZustandFsIntegration({});

export const useAppLauncher = createUseAppLauncher(applications);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RadixOS fs={fs} applications={applications} />
  </StrictMode>,
);
