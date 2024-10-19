import { useDraggable } from "@dnd-kit/core";
import {
  Cross1Icon,
  MinusIcon,
  SizeIcon,
  ViewNoneIcon,
} from "@radix-ui/react-icons";
import {
  Box,
  Card,
  ContextMenu,
  Flex,
  Heading,
  IconButton,
  ScrollArea,
  Text,
} from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import { setWindowDimensions } from "../../services/window";
import {
  useWindowStore,
  type RadixOsAppWindow,
} from "../../stores/window";
import { ErrorBoundary } from "../ErrorBoundary/ErrorBoundary";

export function AppWindow(props: {
  window: RadixOsAppWindow;
  active?: boolean;
  minimized?: boolean;
  onMinimize?: () => void;
  onFocused?: () => void;
}) {
  const lastSizeRef = useRef({
    width: props.window.initialWidth ?? 0,
    height: props.window.initialHeight ?? 0,
    x: 0,
    y: 0,
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const closeWindow = useWindowStore((s) => s.removeWindow);
  const draggable = useDraggable({
    id: props.window.key,
  });

  const toggleMax = () => {
    if (!draggable.node.current) return;
    if (
      draggable.node.current &&
      draggable.node.current.style.width === "100%"
    ) {
      // Revert to last size
      return setWindowDimensions(
        props.window.key,
        lastSizeRef.current
      );
    }
    const rect = draggable.node.current.getBoundingClientRect();
    lastSizeRef.current = {
      width: rect.width,
      height: rect.height,
      x: rect.left,
      y: rect.top,
    };
    setWindowDimensions(props.window.key, {
      x: 0,
      y: 0,
      width: "100%",
      height: "100%",
    });
  };

  useEffect(() => {
    const el = draggable.node.current;
    if (
      draggable.isDragging &&
      el &&
      el.style.height === "100%"
    ) {
      // Reset to last size after being maximized or in a window tile
      setWindowDimensions(props.window.key, {
        width: lastSizeRef.current.width,
        height: lastSizeRef.current.height,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggable.isDragging]);

  return (
    <Card
      variant="classic"
      size="1"
      onClick={() => props.onFocused?.()}
      ref={(el) => {
        draggable.setNodeRef(el);
      }}
      data-key={props.window.key}
      style={{
        position: "absolute",
        left: props.window.x,
        top: props.window.y,
        width: props.window.initialWidth,
        height: props.window.initialHeight,
        transform: draggable.transform
          ? `translate(${draggable.transform.x}px, ${draggable.transform.y}px)`
          : undefined,
        maxWidth: `min(100vw, ${props.window.maxWidth}px)`,
        maxHeight: `min(calc(100vh - var(--space-6)), ${props.window.maxHeight}px)`,
        animation: !hasAnimated
          ? "fadeIn 0.1s ease-in-out"
          : undefined,
        resize:
          props.window.resizeable === false ? undefined : "both",
        display: "grid",
        gridTemplateRows: "min-content 1fr",
        gap: "var(--space-2)",
        opacity: props.minimized ? 0 : 1,
        pointerEvents: props.minimized ? "none" : "auto",
        transition: "opacity 0.1s ease-in-out",
      }}
      onAnimationEnd={() => setHasAnimated(true)}
    >
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <Box
            style={{
              background: "var(--gray-3)",
            }}
            m="-3"
            p="3"
            px="3"
            mb="0"
            onDoubleClick={
              props.window.resizeable === false
                ? undefined
                : toggleMax
            }
          >
            <Flex
              justify="between"
              align="center"
              style={{ flexGrow: 2 }}
            >
              <Heading
                size="1"
                color="gray"
                {...draggable.attributes}
                {...draggable.listeners}
                tabIndex={-1}
                style={{
                  userSelect: "none",
                  width: "100%",
                  paddingBlock: "var(--space-3)",
                  cursor: "-moz-grab",
                  outline: "none",
                }}
                my="-3"
                onMouseUp={(e) => {
                  draggable.listeners?.onMouseUp?.(e);
                  if (draggable.node.current) {
                    const target =
                      draggable.node.current.querySelector<HTMLButtonElement>(
                        "[data-returnfocus]"
                      );
                    setTimeout(() => {
                      target?.focus();
                    }, 100);
                  }
                }}
              >
                <Flex gap="2" align="center">
                  {props.window.icon}
                  {props.window.title}
                </Flex>
              </Heading>
              <Flex
                gap="2"
                align="center"
                onClick={(e) => e.stopPropagation()}
              >
                <IconButton
                  variant="ghost"
                  size="1"
                  color="gray"
                  onClick={props.onMinimize}
                >
                  <MinusIcon />
                </IconButton>
                <IconButton
                  variant="ghost"
                  size="1"
                  color="gray"
                  onClick={toggleMax}
                  disabled={props.window.resizeable === false}
                >
                  <SizeIcon />
                </IconButton>
                <IconButton
                  variant="ghost"
                  size="1"
                  color="red"
                  onClick={() => {
                    closeWindow(props.window);
                  }}
                >
                  <Cross1Icon />
                </IconButton>
              </Flex>
            </Flex>
          </Box>
        </ContextMenu.Trigger>
        <ContextMenu.Content size="1">
          <ContextMenu.Item onSelect={props.onMinimize}>
            Minimize
          </ContextMenu.Item>
          <ContextMenu.Item onSelect={toggleMax}>
            Maximize
          </ContextMenu.Item>
          <ContextMenu.Item
            onSelect={() => {
              closeWindow(props.window);
            }}
            color="crimson"
          >
            Close
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
      <ErrorBoundary
        onError={() => {
          return (
            <Flex
              direction="column"
              gap="3"
              align="center"
              style={{ height: "100%" }}
              justify="center"
            >
              <Flex align="center" gap="2">
                <ViewNoneIcon />
                <Heading size="5">Error</Heading>
              </Flex>
              <Text size="3">Something broke!</Text>
            </Flex>
          );
        }}
      >
        <Box
          m="-2"
          mx="-3"
          style={{ minWidth: 0, minHeight: 0 }}
        >
          {props.window.scrollable === false ? (
            props.window.content
          ) : (
            <ScrollArea scrollbars="both" type="hover">
              {props.window.content}
            </ScrollArea>
          )}
        </Box>
      </ErrorBoundary>
    </Card>
  );
}
