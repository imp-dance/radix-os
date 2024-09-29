import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Cross1Icon,
  MinusIcon,
  SizeIcon,
  ViewNoneIcon,
} from "@radix-ui/react-icons";
import {
  Box,
  Card,
  Flex,
  Heading,
  IconButton,
  ScrollArea,
  Text,
} from "@radix-ui/themes";
import { useRef, useState } from "react";
import {
  useWindowStore,
  type Window,
} from "../../stores/window";
import { ErrorBoundary } from "../ErrorBoundary/ErrorBoundary";

export function Window(props: {
  window: Window;
  active?: boolean;
  minimized?: boolean;
  onMinimize?: () => void;
  onFocused?: () => void;
}) {
  const lastSizeRef = useRef({
    width: 0,
    height: 0,
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
      draggable.node.current.style.width = `${lastSizeRef.current.width}px`;
      draggable.node.current.style.height = `${lastSizeRef.current.height}px`;
      draggable.node.current.style.left = `${lastSizeRef.current.x}px`;
      draggable.node.current.style.top = `${lastSizeRef.current.y}px`;
      return;
    }
    lastSizeRef.current = {
      width: draggable.node.current.clientWidth,
      height: draggable.node.current.clientHeight,
      x: draggable.node.current.getBoundingClientRect().left,
      y: draggable.node.current.getBoundingClientRect().top,
    };
    draggable.node.current.style.setProperty("left", "0");
    draggable.node.current.style.setProperty("top", "0");
    draggable.node.current.style.setProperty("width", "100%");
    draggable.node.current.style.setProperty("height", "100%");
  };

  return (
    <Card
      variant={props.active ? "classic" : "surface"}
      size="1"
      onClick={() => props.onFocused?.()}
      ref={(el) => {
        draggable.setNodeRef(el);
      }}
      style={{
        position: "absolute",
        left: props.window.x,
        top: props.window.y,
        width: props.window.initialWidth,
        height: props.window.initialHeight,
        transform: CSS.Transform.toString(draggable.transform),
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
      <Box
        style={{
          background: "var(--gray-3)",
        }}
        m="-3"
        p="3"
        mb="0"
      >
        <Flex
          justify="between"
          align="center"
          style={{ flexGrow: 2 }}
        >
          <Heading
            size="2"
            color="gray"
            {...draggable.attributes}
            {...draggable.listeners}
            tabIndex={-1}
            style={{
              userSelect: "none",
              width: "100%",
              paddingBlock: "var(--space-3)",
              cursor: "-moz-grab",
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
