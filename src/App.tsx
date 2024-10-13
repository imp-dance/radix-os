import {
  DndContext,
  Modifier,
  MouseSensor,
  useSensor,
} from "@dnd-kit/core";
import { ConfettiEmitter } from "./components/ConfettiEmitter/ConfettiEmitter";
import { Desktop } from "./components/Desktop/Desktop";
import { MultiTaskBar } from "./components/MultiTaskBar/MultiTaskBar";
import { WindowManager } from "./components/WindowManager/WindowManager";
import { WindowTiling } from "./components/WindowTiling/WindowTiling";
import { useKeydown } from "./hooks/useKeyboard";
import { restrictToBoundingRect } from "./lib/dnd-kit/restrictToBoundingRect";
import { handleWindowDrop } from "./services/window";
import { useWindowStore } from "./stores/window";

function App() {
  const setIsDragging = useWindowStore((s) => s.setDragging);
  const mouseSensor = useSensor(MouseSensor, {
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
          if (over.startsWith("dropzone")) {
            return handleWindowDrop(over, window);
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
        <ConfettiEmitter />
        <Desktop />
        <MultiTaskBar />
        <WindowManager />
        <WindowTiling />
      </DndContext>
    </div>
  );
}

export default App;

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
