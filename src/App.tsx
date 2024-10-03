import {
  DndContext,
  Modifier,
  MouseSensor,
  useDroppable,
  useSensor,
} from "@dnd-kit/core";
import { Box } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import { Desktop } from "./components/Desktop/Desktop";
import { MultiTaskBar } from "./components/MultiTaskBar/MultiTaskBar";
import { useKeydown } from "./hooks/useKeyboard";
import { restrictToBoundingRect } from "./lib/dnd-kit/restrictToBoundingRect";
import { setWindowDimensions } from "./services/window";
import { useWindowStore } from "./stores/window";

const restrictToDesktopEdges: Modifier = ({
  containerNodeRect,
  draggingNodeRect,
  transform,
}) => {
  if (!draggingNodeRect || !containerNodeRect) {
    return transform;
  }
  return restrictToBoundingRect(
    transform,
    draggingNodeRect,
    document.getElementById("desktop")!.getBoundingClientRect()
  );
};

function App() {
  const [hoverTile, setHoverTile] = useState("");
  const shiftHeld = useKeyHeld("Shift");
  const [isDragging, setIsDragging] = useState(false);
  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 10,
    },
  });
  const setPosition = useWindowStore((s) => s.setWindowPosition);
  const windows = useWindowStore((s) => s.windows);

  useKeydown({
    key: "Tab",
    altKey: true,
    callback: (e) => {
      const state = useWindowStore.getState();
      const activeWindow = state.activeWindow;
      if (!activeWindow) return;
      const index = state.windows.findIndex(
        (win) => win.id === activeWindow.id
      );
      const nextIndex = e.shiftKey ? index - 1 : index + 1;
      const nextWindow = state.windows[nextIndex];
      if (!nextWindow) {
        state.bringToFront(
          state.windows[
            e.shiftKey ? state.windows.length - 1 : 0
          ]
        );
      } else {
        state.bringToFront(nextWindow);
      }
    },
    deps: [],
  });

  return (
    <div id="app">
      <DndContext
        modifiers={[restrictToDesktopEdges]}
        sensors={[mouseSensor]}
        onDragEnd={(event) => {
          setIsDragging(false);
          const window = windows.find(
            (win) => win.key === event.active.id?.toString()
          );
          if (!window) return;
          const over = event.over?.id?.toString() ?? "";
          if (event.over && over.startsWith("dropzone")) {
            const halfWidth =
              document.body.clientWidth / 2 + "px";
            const halfHeight =
              document.getElementById("desktop")!.clientHeight /
                2 +
              "px";
            switch (over) {
              case "dropzone-left":
                setWindowDimensions(window.key, {
                  width: halfWidth,
                  height: "100%",
                  x: "0px",
                  y: "0px",
                });
                break;
              case "dropzone-topleft":
                setWindowDimensions(window.key, {
                  width: halfWidth,
                  height: halfHeight,
                  x: "0px",
                  y: "0px",
                });
                break;
              case "dropzone-bottomleft":
                setWindowDimensions(window.key, {
                  width: halfWidth,
                  height: halfHeight,
                  x: "0px",
                  y: halfHeight,
                });
                break;
              case "dropzone-right":
                setWindowDimensions(window.key, {
                  width: halfWidth,
                  height: "100%",
                  x: halfWidth,
                  y: "0px",
                });
                break;
              case "dropzone-topright":
                setWindowDimensions(window.key, {
                  width: halfWidth,
                  height: halfHeight,
                  x: halfWidth,
                  y: "0px",
                });
                break;
              case "dropzone-bottomright":
                setWindowDimensions(window.key, {
                  width: halfWidth,
                  height: halfHeight,
                  x: halfWidth,
                  y: halfHeight,
                });
                break;
            }
            return;
          }
          setPosition(
            window,
            event.active.rect.current.translated?.left ?? 0,
            event.active.rect.current.translated?.top ?? 0
          );
        }}
        onDragStart={() => {
          setIsDragging(true);
        }}
      >
        <Desktop />
        <MultiTaskBar />
        {shiftHeld && isDragging && (
          <>
            <Dropzone
              id="left"
              left="2"
              top="2"
              bottom="7"
              width="50%"
              height="auto"
              onDragEnter={() => setHoverTile("left")}
            />
            <Dropzone
              id="right"
              right="2"
              top="2"
              bottom="7"
              width="50%"
              height="auto"
              onDragEnter={() => setHoverTile("right")}
            />
            {hoverTile === "left" && (
              <>
                <Dropzone
                  id="topleft"
                  left="5"
                  top="5"
                  height="40%"
                  width="calc(50% - var(--space-5) * 2)"
                />
                <Dropzone
                  id="bottomleft"
                  left="5"
                  bottom="8"
                  height="40%"
                  width="calc(50% - var(--space-5) * 2)"
                />
              </>
            )}
            {hoverTile === "right" && (
              <>
                <Dropzone
                  id="topright"
                  right="5"
                  top="5"
                  height="40%"
                  width="calc(50% - var(--space-5) * 2)"
                />
                <Dropzone
                  id="bottomright"
                  right="5"
                  bottom="8"
                  height="40%"
                  width="calc(50% - var(--space-5) * 2)"
                />
              </>
            )}
          </>
        )}
      </DndContext>
    </div>
  );
}

export default App;

type DirNum = Parameters<typeof Box>[0]["left"];

function Dropzone(props: {
  id: string;
  top?: DirNum;
  bottom?: DirNum;
  left?: DirNum;
  right?: DirNum;
  width: string;
  height: string;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
}) {
  const isInside = useRef(false);
  const droppable = useDroppable({
    id: "dropzone-" + props.id,
  });
  useEffect(() => {
    if (droppable.isOver) {
      props.onDragEnter?.();
      isInside.current = true;
    } else if (isInside.current) {
      props.onDragLeave?.();
      isInside.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [droppable.isOver]);
  return (
    <Box
      position="absolute"
      top={props.top}
      bottom={props.bottom}
      right={props.right}
      left={props.left}
      width={props.width}
      height={props.height}
      style={{
        background: droppable.isOver
          ? "var(--gray-9)"
          : "var(--gray-7)",
        opacity: 0.5,
      }}
      ref={droppable.setNodeRef}
    ></Box>
  );
}

function useKeyHeld(targetKey: string) {
  const [keyHeld, setKeyHeld] = useState(false);
  function downHandler({ key }: KeyboardEvent) {
    if (key === targetKey) {
      setKeyHeld(true);
    }
  }

  function upHandler({ key }: KeyboardEvent) {
    if (key === targetKey) {
      setKeyHeld(false);
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []);

  return keyHeld;
}
