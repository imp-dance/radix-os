import { useDroppable } from "@dnd-kit/core";
import { Box } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import { useWindowStore } from "../../stores/window";
import styles from "./WindowDropzones.module.css";

export function WindowDropzones() {
  const [hoverTile, setHoverTile] = useState("");
  const shiftHeld = useKeyHeld("Shift");
  const isDragging = useWindowStore((s) => s.isDragging);

  return (
    <>
      {shiftHeld && isDragging && (
        <>
          <Dropzone
            id="left"
            left="2"
            top="2"
            bottom="7"
            width="calc(50% - var(--space-3)"
            height="auto"
            onDragEnter={() => setHoverTile("left")}
          />
          <Dropzone
            id="right"
            right="2"
            top="2"
            bottom="7"
            width="calc(50% - var(--space-3)"
            height="auto"
            onDragEnter={() => setHoverTile("right")}
          />
          {hoverTile === "left" && (
            <>
              <Dropzone
                id="topleft"
                left="5"
                top="5"
                height="calc(50% - var(--space-7))"
                width="calc(45% - var(--space-5) * 2)"
                className={styles.showOnHover}
              />
              <Dropzone
                id="bottomleft"
                left="5"
                bottom="8"
                height="calc(50% - var(--space-7))"
                width="calc(45% - var(--space-5) * 2)"
                className={styles.showOnHover}
              />
            </>
          )}
          {hoverTile === "right" && (
            <>
              <Dropzone
                id="topright"
                right="5"
                top="5"
                height="calc(50% - var(--space-7))"
                width="calc(45% - var(--space-5) * 2)"
                className={styles.showOnHover}
              />
              <Dropzone
                id="bottomright"
                right="5"
                bottom="8"
                height="calc(50% - var(--space-7))"
                width="calc(45% - var(--space-5) * 2)"
                className={styles.showOnHover}
              />
            </>
          )}
        </>
      )}
    </>
  );
}

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
  className?: string;
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
      className={props.className}
      style={{
        background: droppable.isOver
          ? "var(--gray-9)"
          : "var(--gray-7)",
        opacity: 0.3,
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

  const stopKeyPress = () => setKeyHeld(false);

  function upHandler({ key }: KeyboardEvent) {
    if (key === targetKey) {
      stopKeyPress();
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    window.addEventListener("blur", stopKeyPress);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
      window.removeEventListener("blur", stopKeyPress);
    };
  }, []);

  return keyHeld;
}
