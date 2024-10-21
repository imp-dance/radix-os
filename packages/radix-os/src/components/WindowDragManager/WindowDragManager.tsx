import {
  DndContext,
  MouseSensor,
  useSensor,
} from "@dnd-kit/core";
import { ReactNode } from "react";
import { restrictToDesktopEdges } from "../../lib/dnd-kit/restrictToBoundingRect";
import { handleWindowDrop } from "../../services/window";
import { useWindowStore } from "../../stores/window";

export function WindowDragManager(props: {
  children: ReactNode;
}) {
  const setIsDragging = useWindowStore((s) => s.setDragging);
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const setPosition = useWindowStore((s) => s.setWindowPosition);
  const windows = useWindowStore((s) => s.windows);

  return (
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
      {props.children}
    </DndContext>
  );
}
