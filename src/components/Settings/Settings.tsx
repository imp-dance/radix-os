import {
  Badge,
  Button,
  Flex,
  Grid,
  Heading,
  Switch,
  Text,
} from "@radix-ui/themes";
import { useSettingsStore } from "../../stores/settings";

export function Settings() {
  const settingsStore = useSettingsStore();

  return (
    <Flex p="2" direction="column" gap="3">
      <Heading size="3">Customize</Heading>
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
      <Heading size="2" color="gray">
        Background
      </Heading>
      <Grid columns="4" gap="3" style={{ minWidth: 420 }}>
        {(
          [
            "gray",
            "crimson",
            "pink",
            "violet",
            "teal",
            "green",
            "orange",
            "yellow",
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
    </Flex>
  );
}
