import { ExternalLinkIcon } from "@radix-ui/react-icons";
import {
  AlertDialog,
  Button,
  Code,
  Flex,
  Heading,
  Kbd,
  Select,
  Switch,
  Table,
  Tabs,
  Text,
  TextField
} from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { FS_LS_KEY } from "../../../stores/fs";
import {
  SETTINGS_LS_KEY,
  useSettingsStore
} from "../../../stores/settings";
import { RadixOsAppComponent } from "../../../stores/window";
import { BrowserLink } from "../../BrowserLink/BrowserLink";
import { ImageDropper } from "../../ImageDropper/ImageDropper";
import { RadixColorPicker } from "../../RadixColorPicker/RadixColorPicker";

export const Settings: RadixOsAppComponent = (props) => {
  const initialTab =
    (props.file?.file?.data as "customize") ?? "about";
  const [tab, setTab] = useState<
    "customize" | "storage" | "shortcuts" | "about"
  >(initialTab);

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
        <Tabs.Trigger value="about">About</Tabs.Trigger>
        <Tabs.Trigger value="customize">Customize</Tabs.Trigger>
        <Tabs.Trigger value="storage">Storage</Tabs.Trigger>
        <Tabs.Trigger value="shortcuts">Shortcuts</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="about" style={{ height: "100%" }}>
        <Flex p="2" direction="column" gap="3" height="100%">
          <Text size="2" color="gray">
            RadixOS is an open source project built using{" "}
            <ul>
              <li>
                <BrowserLink href="https://radix-ui.com">
                  <Code>Radix</Code>
                </BrowserLink>
              </li>
              <li>
                <BrowserLink href="https://zustand.docs.pmnd.rs/getting-started/introduction">
                  <Code>Zustand</Code>
                </BrowserLink>
              </li>
              <li>
                <BrowserLink href="https://dndkit.com/">
                  <Code>dnd kit</Code>
                </BrowserLink>
              </li>
              <li>
                <BrowserLink href="https://react.dev">
                  <Code>React</Code>
                </BrowserLink>
              </li>
            </ul>
          </Text>
          <Text size="2" color="gray">
            The file system and settings are stored in{" "}
            <Code>localStorage</Code>.
          </Text>
          <div>
            <Button
              variant="soft"
              color="ruby"
              onClick={() => {
                window.open(
                  "https://github.com/imp-dance/radix-os/issues/new",
                  "_blank"
                );
              }}
            >
              <Flex gap="3" align="center">
                Report an issue
                <ExternalLinkIcon />
              </Flex>
            </Button>
          </div>
          <Text size="1" color="gray" mt="auto">
            Made with ❤️ by{" "}
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
            ) 2024
          </Text>
        </Flex>
      </Tabs.Content>
      <CustomizeTab />
      <StorageTab />
      <Tabs.Content value="shortcuts">
        <ShortcutsTab />
      </Tabs.Content>
    </Tabs.Root>
  );
};

function ShortcutsTab() {
  const [search, setSearch] = useState("");
  const isMac = navigator.platform.toUpperCase().includes("MAC");
  const altOrOpt = isMac ? "⌥" : "Alt";

  const shortcuts: [string, string][] = [
    ["Open app launcher", "CTRL + P"],
    [
      "Switch between applications",
      (isMac ? altOrOpt : "CTRL") + " (+ Shift) + Tab"
    ],
    ["Close active window", `${altOrOpt} + W`],
    ["Toggle maximize", "Double click window"],
    ["Tile window", "Shift + drag window"]
  ].filter(([desc, scut]) => {
    if (search === "") return true;
    return (
      desc.toLowerCase().search(search.toLowerCase()) > -1 ||
      scut
        .replace("⌥", "⌥ alt option")
        .toLowerCase()
        .search(search.toLowerCase()) > -1
    );
  }) as [string, string][];

  return (
    <Flex p="2" direction="column" gap="3">
      <TextField.Root
        size="1"
        placeholder="Filter shortcuts"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Table.Root size="1">
        <Table.Header>
          <Table.Row>
            <Table.RowHeaderCell>
              <Text size="1">Description</Text>
            </Table.RowHeaderCell>
            <Table.RowHeaderCell>
              <Text size="1">Shortcut</Text>
            </Table.RowHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {shortcuts.map(([description, shortcut]) => (
            <Table.Row key={`${description}${shortcut}`}>
              <Table.Cell>
                <Text color="gray" size="1">
                  {description}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Kbd>{shortcut}</Kbd>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Flex>
  );
}

function CustomizeTab() {
  const settingsStore = useSettingsStore();
  const imgBg = settingsStore.bg.startsWith("data:")
    ? settingsStore.bg
    : undefined;
  return (
    <Tabs.Content value="customize">
      <Flex p="2" direction="column" gap="3">
        <Heading size="1" color="gray">
          Options
        </Heading>
        {!settingsStore.overrides.includes("theme") && (
          <Text
            as="label"
            size="1"
            color="gray"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)"
            }}
          >
            <Switch
              size="1"
              checked={settingsStore.theme === "dark"}
              onCheckedChange={settingsStore.toggleTheme}
            />
            Dark mode
          </Text>
        )}
        {!settingsStore.overrides.includes(
          "panelBackground"
        ) && (
          <Text
            as="label"
            size="1"
            color="gray"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)"
            }}
          >
            <Switch
              size="1"
              checked={
                settingsStore.panelBackground === "translucent"
              }
              onCheckedChange={
                settingsStore.togglePanelBackground
              }
            />
            Translucent windows
          </Text>
        )}
        {!settingsStore.overrides.includes("radius") && (
          <Text
            as="label"
            size="1"
            color="gray"
            style={{
              display: "flex",
              alignItems: "flex-start",
              flexDirection: "column",
              gap: "var(--space-2)"
            }}
          >
            Radius
            <Select.Root
              value={settingsStore.radius ?? "medium"}
              onValueChange={(value) =>
                settingsStore.setRadius(value as "small")
              }
            >
              <Select.Trigger variant="soft" />
              <Select.Content>
                <Select.Item value="none">None</Select.Item>
                <Select.Item value="small">Small</Select.Item>
                <Select.Item value="medium">Medium</Select.Item>
                <Select.Item value="large">Large</Select.Item>
                <Select.Item value="full">Full</Select.Item>
              </Select.Content>
            </Select.Root>
          </Text>
        )}
        {!settingsStore.overrides.includes("accentColor") && (
          <Text
            as="label"
            size="1"
            color="gray"
            style={{
              display: "flex",
              alignItems: "flex-start",
              flexDirection: "column",
              gap: "var(--space-2)"
            }}
          >
            Accent color
            <RadixColorPicker
              onColorSelected={(clr) =>
                settingsStore.setAccentColor(clr)
              }
              selectedColor={settingsStore.accentColor as "gray"}
              label="Select color"
            />
          </Text>
        )}
        <Heading size="1" color="gray">
          Background
        </Heading>
        <div>
          <RadixColorPicker
            onColorSelected={(clr) => settingsStore.setBg(clr)}
            selectedColor={settingsStore.bg as "gray"}
            label="Select color"
          />
        </div>
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
        <Text size="1" color="gray">
          Used space:{" "}
          {getByteSize(localStorage.getItem(FS_LS_KEY) ?? "")}
        </Text>
      </Flex>
    </Tabs.Content>
  );
}

function getByteSize(s: string) {
  return formatBytes(new Blob([s]).size);
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    "Bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB"
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${
    sizes[i]
  }`;
}
