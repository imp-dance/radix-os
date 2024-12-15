"use client";
import { Theme } from "@radix-ui/themes";
import { Providers } from "../../Providers";
import { DesktopShortcut } from "../../services/applications/desktop-shortcuts";
import { FsIntegration } from "../../services/fs/fs-integration";
import { RadixOsApp } from "../../stores/window";
import { AppLauncher } from "../AppLauncher/AppLauncher";
import { ConfettiEmitter } from "../ConfettiEmitter/ConfettiEmitter";
import { Desktop } from "../Desktop/Desktop";
import { MultiTaskBar } from "../MultiTaskBar/MultiTaskBar";
import { SystemFileUpload } from "../SystemFileUpload/SystemFileUpload";
import { WindowDragManager } from "../WindowDragManager/WindowDragManager";
import { WindowDropzones } from "../WindowDropzones/WindowDropzones";
import { WindowRenderer } from "../WindowRenderer/WindowRenderer";
import styles from "./RadixOS.module.css";

type AccentColor = Parameters<typeof Theme>[0]["accentColor"];
type Radius = Parameters<typeof Theme>[0]["radius"];

function RadixOS<T extends string>(props: {
  applications: readonly RadixOsApp<T>[];
  fs: FsIntegration;
  desktopShortcuts?: Array<DesktopShortcut>;
  accentColor?: AccentColor;
  radius?: Radius;
  theme?: "light" | "dark";
  panelBackground?: "solid" | "translucent";
}) {
  return (
    <div className={styles.radixOs}>
      <Providers
        fs={props.fs}
        applications={props.applications ?? []}
        accentColor={props.accentColor}
        radius={props.radius}
        theme={props.theme}
        panelBackground={props.panelBackground}
      >
        <SystemFileUpload />
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
