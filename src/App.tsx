import {
  DndContext,
  Modifier,
  MouseSensor,
  useSensor,
} from "@dnd-kit/core";
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
          const window = windows.find(
            (win) => win.key === event.active.id?.toString()
          );
          if (!window) return;
          setPosition(
            window,
            event.active.rect.current.translated?.left ?? 0,
            event.active.rect.current.translated?.top ?? 0
          );
        }}
      >
        <Desktop />
        <MultiTaskBar />
      </DndContext>
    </div>
  );
}

export default App;
