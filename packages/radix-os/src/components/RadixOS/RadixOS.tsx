"use client";
import { DesktopShortcut } from "../../integration/setupApps";
import { Providers } from "../../Providers";
import { FsIntegration } from "../../services/fs";
import { RadixOsApp } from "../../stores/window";
import { AppLauncher } from "../AppLauncher/AppLauncher";
import { ConfettiEmitter } from "../ConfettiEmitter/ConfettiEmitter";
import { Desktop } from "../Desktop/Desktop";
import { MultiTaskBar } from "../MultiTaskBar/MultiTaskBar";
import { WindowDragManager } from "../WindowDragManager/WindowDragManager";
import { WindowDropzones } from "../WindowDropzones/WindowDropzones";
import { WindowRenderer } from "../WindowRenderer/WindowRenderer";
import styles from "./RadixOS.module.css";

function RadixOS<T extends string>(props: {
  applications: readonly RadixOsApp<T>[];
  fs: FsIntegration;
  desktopShortcuts?: Array<DesktopShortcut>;
}) {
  return (
    <div className={styles.radixOs}>
      <Providers
        fs={props.fs}
        applications={props.applications ?? []}
      >
        <WindowDragManager>
          <Desktop
            applications={props.applications}
            shortcuts={props.desktopShortcuts ?? []}
          />
          <MultiTaskBar />
          <WindowRenderer />
          <WindowDropzones />
        </WindowDragManager>
        <AppLauncher applications={props.applications} />
        <ConfettiEmitter />
      </Providers>
    </div>
  );
}

export default RadixOS;
