import {
  Box,
  Button,
  Code,
  ContextMenu,
  Flex,
  Text,
} from "@radix-ui/themes";
import React, { memo, useState } from "react";
import { useKeydown } from "../../hooks/useKeyboard";
import { useWindowStore } from "../../stores/window";
import { Window } from "../Window/Window";

export function MultiTaskBar() {
  const [minimizedWindows, setMinimizedWindows] = useState<
    symbol[]
  >([]);
  const windowOrder = useWindowStore(
    (state) => state.windowOrder
  );
  const bringToFront = useWindowStore(
    (state) => state.bringToFront
  );
  const windows = useWindowStore((state) => state.windows);
  const removeWindow = useWindowStore(
    (state) => state.removeWindow
  );
  const activeWindow = useWindowStore(
    (state) => state.activeWindow
  );
  const clearActiveWindow = useWindowStore(
    (state) => state.clearActiveWindow
  );

  const closeActiveWindow = () => {
    if (activeWindow) removeWindow(activeWindow);
  };

  useKeydown({
    key: "Ω",
    altKey: true,
    callback: closeActiveWindow,
  });

  useKeydown({
    key: "w",
    altKey: true,
    callback: closeActiveWindow,
  });

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <Box style={{ background: "var(--gray-4)" }}>
            <Flex>
              {/* <Button
                variant="soft"
                color="indigo"
                style={{ borderRadius: 0 }}
              >
                <Flex gap="2" align="center">
                  <StarFilledIcon />
                  Launch
                </Flex>
              </Button> */}
              {windows.map((win) => {
                const maxLength = 20;
                const title =
                  win.title.length > maxLength
                    ? win.title.slice(0, maxLength - 3) + "..."
                    : win.title;
                return (
                  <React.Fragment key={win.key}>
                    <ContextMenu.Root>
                      <ContextMenu.Trigger>
                        <Button
                          color="gray"
                          variant={
                            activeWindow?.id === win.id
                              ? "outline"
                              : "soft"
                          }
                          style={{ borderRadius: 0 }}
                          onClick={() => {
                            bringToFront(win);
                            setMinimizedWindows((prev) =>
                              prev.filter((id) => id !== win.id)
                            );
                          }}
                        >
                          <Flex align="center" gap="2">
                            {win.icon}
                            {title}
                          </Flex>
                        </Button>
                      </ContextMenu.Trigger>
                      <ContextMenu.Content size="1">
                        <ContextMenu.Item
                          onClick={() => removeWindow(win)}
                        >
                          Close window
                        </ContextMenu.Item>
                      </ContextMenu.Content>
                    </ContextMenu.Root>
                  </React.Fragment>
                );
              })}
              <Clock />
            </Flex>
          </Box>
        </ContextMenu.Trigger>
        <ContextMenu.Content size="1">
          <ContextMenu.Item
            onClick={() => {
              setMinimizedWindows(windows.map((win) => win.id));
            }}
          >
            Show desktop
          </ContextMenu.Item>
          <ContextMenu.Item
            onClick={() => {
              windows.forEach((win) => removeWindow(win));
            }}
          >
            Close all windows
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
      {windowOrder.map((winId) => {
        const win = windows.find((win) => win.id === winId);
        if (!win) return null;
        return (
          <Window
            key={win.key}
            window={win}
            active={activeWindow?.id === win.id}
            minimized={minimizedWindows.includes(win.id)}
            onMinimize={() => {
              if (activeWindow?.id === win.id) {
                const nextWindow = windows.find(
                  (w) =>
                    w.id !== win.id &&
                    !minimizedWindows.includes(w.id)
                );
                if (nextWindow) {
                  bringToFront(nextWindow);
                } else {
                  clearActiveWindow();
                }
              }
              setMinimizedWindows((prev) => [...prev, win.id]);
            }}
            onFocused={() => {
              bringToFront(win);
            }}
          />
        );
      })}
    </>
  );
}

const Clock = memo(() => {
  const [time, setTime] = useState(
    new Date().toLocaleTimeString()
  );
  setTimeout(() => {
    setTime(new Date().toLocaleTimeString());
  }, 1000);
  return (
    <Flex align="center" ml="auto" p="2" px="3">
      <Text
        size="1"
        color="gray"
        style={{
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <Code color="gray">{time}</Code>
      </Text>
    </Flex>
  );
});
