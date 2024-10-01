import {
  DndContext,
  Modifier,
  MouseSensor,
  useDroppable,
  useSensor,
} from "@dnd-kit/core";
import { Box } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { Desktop } from "./components/Desktop/Desktop";
import { MultiTaskBar } from "./components/MultiTaskBar/MultiTaskBar";
import { useKeydown } from "./hooks/useKeyboard";
import { restrictToBoundingRect } from "./lib/dnd-kit/restrictToBoundingRect";
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
  const shiftHeld = useKeyHeld("Shift");
  const [showDropzones, setShowDropzones] = useState(false);
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
          setShowDropzones(false);
          const window = windows.find(
            (win) => win.key === event.active.id?.toString()
          );
          if (!window) return;
          const over = event.over?.id?.toString() ?? "";
          if (event.over && over.startsWith("dropzone")) {
            const win = document.querySelector(
              `[data-key="${event.active.id}"]`
            ) as HTMLElement;
            if (win) {
              const halfScreen =
                document.body.clientWidth / 2 + "px";
              win.style.width = halfScreen;
              win.style.height = "100%";
              if (over.endsWith("right")) {
                win.style.left = halfScreen;
              } else {
                win.style.left = "0px";
              }
              win.style.top = "0px";
              return;
            }
          }
          setPosition(
            window,
            event.active.rect.current.translated?.left ?? 0,
            event.active.rect.current.translated?.top ?? 0
          );
        }}
        onDragStart={() => {
          if (shiftHeld) setShowDropzones(true);
        }}
      >
        <Desktop />
        {showDropzones && (
          <>
            <Dropzone dir="left" />
            <Dropzone dir="right" />
          </>
        )}
        <MultiTaskBar />
      </DndContext>
    </div>
  );
}

export default App;

function Dropzone(props: { dir?: "left" | "right" }) {
  const droppable = useDroppable({
    id: "dropzone-" + props.dir,
  });
  return (
    <Box
      position="absolute"
      top="2"
      bottom="2"
      right={props.dir === "left" ? undefined : "2"}
      left={props.dir === "left" ? "2" : undefined}
      width="40%"
      height="auto"
      style={{ background: "var(--gray-4)", opacity: 0.6 }}
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
