import { useEffect, useState } from "react";

export function useFileDrop(element?: Element | null) {
  const [isDroppingFile, setDroppingFile] = useState(false);
  useEffect(() => {
    const dropStopper = (e: Event) => {
      e.preventDefault();
    };
    const onDragOver = (e: Event) => {
      e.preventDefault();
      setDroppingFile(true);
    };
    const onDragLeave = (e: Event) => {
      e.preventDefault();
      setDroppingFile(false);
    };
    if (!element) return;
    console.log("setting up listeners");
    element.addEventListener("dragenter", onDragOver);
    element.addEventListener("mouseleave", onDragLeave);
    window.addEventListener("dragover", dropStopper);
    window.addEventListener("drop", dropStopper);
    return () => {
      element.removeEventListener("dragenter", onDragOver);
      element.removeEventListener("mouseleave", onDragLeave);
      window.removeEventListener("dragover", dropStopper);
      window.removeEventListener("drop", dropStopper);
    };
  }, [element]);

  return {
    isDroppingFile,
    finishDrop: () => setDroppingFile(false)
  };
}
