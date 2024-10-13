import {
  DndContext,
  MouseSensor,
  useSensor,
} from "@dnd-kit/core";
import { ConfettiEmitter } from "./components/ConfettiEmitter/ConfettiEmitter";
import { Desktop } from "./components/Desktop/Desktop";
import { MultiTaskBar } from "./components/MultiTaskBar/MultiTaskBar";
import { WindowManager } from "./components/WindowManager/WindowManager";
import { WindowTiling } from "./components/WindowTiling/WindowTiling";
import { useKeydown } from "./hooks/useKeyboard";
import { restrictToDesktopEdges } from "./lib/dnd-kit/restrictToBoundingRect";
import { handleWindowDrop, tabWindow } from "./services/window";
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
      tabWindow(e.shiftKey ? "backward" : "forward");
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
