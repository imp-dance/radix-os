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

export function MultiTaskBar() {
  const {
    bringToFront,
    windows,
    removeWindow,
    activeWindow,
    minimizeWindow,
    minimizedWindows,
    minimizeAll,
  } = useWindowStore();

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
          <Box style={{ background: "var(--gray-2)" }}>
            <Flex>
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
                          color={
                            activeWindow?.id === win.id
                              ? "indigo"
                              : "gray"
                          }
                          variant={
                            activeWindow?.id === win.id
                              ? "soft"
                              : "soft"
                          }
                          style={{ borderRadius: 0 }}
                          onClick={() => {
                            const isMinimized =
                              minimizedWindows.includes(win.id);
                            if (isMinimized) {
                              bringToFront(win);
                            } else if (
                              activeWindow?.id === win.id
                            ) {
                              minimizeWindow(win);
                            } else {
                              bringToFront(win);
                            }
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

                        <ContextMenu.Item
                          onClick={() => {
                            const wasMini =
                              minimizedWindows.includes(win.id);
                            if (wasMini) {
                              bringToFront(win);
                            } else {
                              minimizeWindow(win);
                            }
                          }}
                        >
                          {minimizedWindows.includes(win.id)
                            ? "Bring to front"
                            : "Minimize window"}
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
              minimizeAll();
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