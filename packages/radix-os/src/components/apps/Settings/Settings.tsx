import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  AlertDialog,
  Badge,
  Button,
  Callout,
  Code,
  Flex,
  Grid,
  Heading,
  Kbd,
  Switch,
  Tabs,
  Text,
} from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { FS_LS_KEY } from "../../../stores/fs";
import {
  SETTINGS_LS_KEY,
  useSettingsStore,
} from "../../../stores/settings";
import { RadixOsAppComponent } from "../../../stores/window";
import { BrowserLink } from "../../BrowserLink/BrowserLink";
import { ImageDropper } from "../../ImageDropper/ImageDropper";

export const Settings: RadixOsAppComponent = (props) => {
  const initialTab =
    (props.file?.file?.data as "customize") ?? "customize";
  const [tab, setTab] = useState<
    "customize" | "storage" | "shortcuts" | "about"
  >(initialTab);
  const isMac = navigator.platform.toUpperCase().includes("MAC");
  const altOrOpt = isMac ? "⌥" : "Alt";

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);
  return (
    <Tabs.Root
      defaultValue={initialTab}
      value={tab}
      onValueChange={(v) => setTab(v as "customize")}
      style={{ height: "calc(100% - 3rem)" }}
    >
      <Tabs.List mb="1">
        <Tabs.Trigger value="customize">Customize</Tabs.Trigger>
        <Tabs.Trigger value="storage">Storage</Tabs.Trigger>
        <Tabs.Trigger value="shortcuts">Shortcuts</Tabs.Trigger>
        <Tabs.Trigger value="about">About</Tabs.Trigger>
      </Tabs.List>
      <CustomizeTab />
      <StorageTab />
      <Tabs.Content value="shortcuts">
        <Flex p="2" direction="column" gap="3">
          <Callout.Root size="1">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              Shortcuts have varying support across browsers and
              operating systems.
            </Callout.Text>
          </Callout.Root>
          <Flex gap="2" align="center">
            <Kbd>{isMac ? altOrOpt : "CTRL"} + Tab</Kbd>
            <Text size="2" color="gray">
              Switch between applications
            </Text>
          </Flex>
          <Flex gap="2" align="center">
            <Kbd>{isMac ? altOrOpt : "CTRL"} + Shift + Tab</Kbd>
            <Text size="2" color="gray">
              Switch between applications
            </Text>
          </Flex>
          <Flex gap="2" align="center">
            <Kbd>{altOrOpt} + W</Kbd>
            <Text size="2" color="gray">
              Close active window
            </Text>
          </Flex>
          <Flex gap="2" align="center">
            <Kbd>Double click window title</Kbd>
            <Text size="2" color="gray">
              Toggle maximize
            </Text>
          </Flex>
          <Flex gap="2" align="center">
            <Kbd>Shift + Drag window</Kbd>
            <Text size="2" color="gray">
              Tile window
            </Text>
          </Flex>
        </Flex>
      </Tabs.Content>
      <Tabs.Content value="about" style={{ height: "100%" }}>
        <Flex p="2" direction="column" gap="3" height="100%">
          <Text size="2" color="gray">
            RadixOS is an open source project built using{" "}
            <Code>React</Code>, <Code>Radix</Code>,{" "}
            <Code>Zustand</Code> & <Code>dnd kit</Code>.
          </Text>
          <Text size="2" color="gray">
            The file system and settings are stored in{" "}
            <Code>localStorage</Code>.
          </Text>
          <Text size="2" color="gray">
            Written in 2024.
          </Text>
          <Text size="1" color="gray" mt="auto">
            Made by{" "}
            <BrowserLink
              target="_blank"
              href="https://haakon.dev"
            >
              Håkon Underbakke
            </BrowserLink>{" "}
            (
            <BrowserLink
              target="_blank"
              color="gray"
              href="https://ryfylke.dev"
            >
              Ryfylke React AS
            </BrowserLink>
            )
          </Text>
        </Flex>
      </Tabs.Content>
    </Tabs.Root>
  );
};

function CustomizeTab() {
  const settingsStore = useSettingsStore();
  const imgBg = settingsStore.bg.startsWith("data:")
    ? settingsStore.bg
    : undefined;
  return (
    <Tabs.Content value="customize">
      <Flex p="2" direction="column" gap="3">
        <Text
          as="label"
          size="1"
          color="gray"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <Switch
            size="1"
            checked={settingsStore.theme === "dark"}
            onCheckedChange={settingsStore.toggleTheme}
          />
          Dark mode
        </Text>
        <Text
          as="label"
          size="1"
          color="gray"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <Switch
            size="1"
            checked={
              settingsStore.panelBackground === "translucent"
            }
            onCheckedChange={settingsStore.togglePanelBackground}
          />
          Translucency
        </Text>
        <Heading size="1" color="gray">
          Background
        </Heading>
        <Grid
          columns="4"
          gap="0"
          style={{ minWidth: 420, background: "var(--gray-1)" }}
        >
          {(
            [
              "gray",
              "cyan",
              "blue",
              "indigo",
              "crimson",
              "pink",
              "plum",
              "violet",
              "teal",
              "jade",
              "green",
              "grass",
              "gold",
              "bronze",
              "yellow",
              "amber",
            ] as const
          ).map((color) => (
            <Badge
              color={color}
              key={color}
              asChild
              style={{ minWidth: 100 }}
              variant={
                color === settingsStore.bg ? "solid" : "soft"
              }
              onClick={() => settingsStore.setBg(color)}
            >
              <Button
                style={{
                  borderRadius: 0,
                  cursor: "pointer",
                }}
              >
                {color}
              </Button>
            </Badge>
          ))}
        </Grid>
        <Text size="1" color="gray">
          or
        </Text>
        <ImageDropper
          onChange={(img) => {
            settingsStore.setBg(img);
          }}
          value={imgBg}
        />
      </Flex>
    </Tabs.Content>
  );
}

function StorageTab() {
  return (
    <Tabs.Content value="storage">
      <Flex p="2" direction="column" gap="3">
        <AlertDialog.Root>
          <AlertDialog.Trigger>
            <Button color="gray" variant="outline">
              Reset customizations
            </Button>
          </AlertDialog.Trigger>
          <AlertDialog.Content maxWidth="450px">
            <AlertDialog.Title>
              Reset customizations
            </AlertDialog.Title>
            <AlertDialog.Description size="2">
              Are you sure? Your background color and theme will
              be reset to default and the application will
              reload.
            </AlertDialog.Description>

            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button
                  variant="solid"
                  color="red"
                  onClick={() => {
                    localStorage.removeItem(SETTINGS_LS_KEY);
                    window.location.reload();
                  }}
                >
                  Reset customizations
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>

        <AlertDialog.Root>
          <AlertDialog.Trigger>
            <Button color="crimson" variant="outline">
              Format file system
            </Button>
          </AlertDialog.Trigger>
          <AlertDialog.Content maxWidth="450px">
            <AlertDialog.Title>
              Format file system
            </AlertDialog.Title>
            <AlertDialog.Description size="2">
              Are you sure? Any modifications to the file system
              will be lost and the application will reload.
            </AlertDialog.Description>

            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button
                  variant="solid"
                  color="red"
                  onClick={() => {
                    localStorage.removeItem(FS_LS_KEY);
                    window.location.reload();
                  }}
                >
                  Format file system
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </Flex>
    </Tabs.Content>
  );
}
