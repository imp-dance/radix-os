import { ConfettiEmitter } from "./components/ConfettiEmitter/ConfettiEmitter";
import { Desktop } from "./components/Desktop/Desktop";
import { MultiTaskBar } from "./components/MultiTaskBar/MultiTaskBar";
import { WindowDragManager } from "./components/WindowDragManager/WindowDragManager";
import { WindowDropzones } from "./components/WindowDropzones/WindowDropzones";
import { WindowRenderer } from "./components/WindowRenderer/WindowRenderer";

function RadixOS(props: { applications?: Array<unknown> }) {
  return (
    <div id="app">
      <WindowDragManager>
        <Desktop />
        <MultiTaskBar />
        <WindowRenderer />
        <WindowDropzones />
      </WindowDragManager>
      <ConfettiEmitter />
    </div>
  );
}

export default RadixOS;
