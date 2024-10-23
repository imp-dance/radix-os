import { Button, Card, Flex, TextField } from "@radix-ui/themes";
import { useRef, useState } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useKeydown } from "../../hooks/useKeyboard";
import { useUntypedAppContext } from "../../services/applications/launcher";
import { RadixOsApp } from "../../stores/window";

export function AppLauncher(props: {
  applications: readonly RadixOsApp<string>[];
}) {
  const container = useRef<HTMLDivElement | null>(null);
  const { launch } = useUntypedAppContext();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);

  useKeydown({
    key: "p",
    ctrlKey: true,
    callback: () => {
      setOpen(true);
    },
  });

  const close = () => {
    setOpen(false);
    setValue("");
    setSelectedIndex(0);
  };

  useClickOutside(container, close);

  if (!open) return null;

  const matchingApps = value
    ? props.applications
        .filter(
          (app) =>
            app.appName
              .toLowerCase()
              .search(value.toLowerCase()) > -1
        )
        .slice(0, 3)
    : [];
  return (
    <Card
      ref={container}
      size="1"
      style={{
        left: "50%",
        top: "var(--space-3)",
        margin: "auto",
        position: "absolute",
        transform: "translateX(-50%)",
        minWidth: 450,
      }}
      variant="surface"
    >
      <Flex direction="column" gap="3">
        <TextField.Root
          size="2"
          autoFocus
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              close();
            }

            if (e.key === "ArrowUp" && selectedIndex !== 0) {
              setSelectedIndex((p) => p - 1);
            } else if (e.key === "ArrowUp") {
              setSelectedIndex(matchingApps.length - 1);
            }
            if (
              e.key === "ArrowDown" &&
              selectedIndex === matchingApps.length - 1
            ) {
              setSelectedIndex(0);
            } else if (e.key === "ArrowDown") {
              setSelectedIndex((p) => p + 1);
            }
            if (e.key === "Enter") {
              const appId = matchingApps[selectedIndex].appId;
              if (appId) {
                launch(appId);
                close();
              }
            }
          }}
        />
        {matchingApps.map((app, i) => (
          <Button
            color={i === selectedIndex ? undefined : "gray"}
            variant="soft"
            style={{ textAlign: "left" }}
            onFocus={close}
            onClick={() => {
              launch(app.appId);
              close();
            }}
            size="2"
          >
            <Flex
              gap="2"
              align="center"
              justify="start"
              style={{ marginRight: "auto" }}
            >
              {app.defaultWindowSettings.icon}
              {app.appName}
            </Flex>
          </Button>
        ))}
      </Flex>
    </Card>
  );
}
