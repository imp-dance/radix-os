import { ConfettiEmitter } from "./components/ConfettiEmitter/ConfettiEmitter";
import { Desktop } from "./components/Desktop/Desktop";
import { MultiTaskBar } from "./components/MultiTaskBar/MultiTaskBar";
import { WindowDragManager } from "./components/WindowDragManager/WindowDragManager";
import { WindowDropzones } from "./components/WindowDropzones/WindowDropzones";
import { WindowRenderer } from "./components/WindowRenderer/WindowRenderer";
import { Providers } from "./Providers";
import { FsIntegration } from "./services/fs";
import { RadixOsApp } from "./stores/window";

function RadixOS<T extends string>(props: {
  applications?: readonly RadixOsApp<T>[];
  fs: FsIntegration;
}) {
  return (
    <div id="radixos">
      <Providers
        fs={props.fs}
        applications={props.applications ?? []}
      >
        <WindowDragManager>
          <Desktop />
          <MultiTaskBar />
          <WindowRenderer />
          <WindowDropzones />
        </WindowDragManager>
        <ConfettiEmitter />
      </Providers>
    </div>
  );
}

export default RadixOS;
