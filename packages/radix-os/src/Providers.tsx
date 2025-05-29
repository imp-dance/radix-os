import { Theme } from "@radix-ui/themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useMemo, useRef } from "react";
import { queryClient } from "./lib/react-query/client";
import {
  AppContextProvider,
  UseAppLauncherReturn
} from "./services/applications/launcher";
import {
  FsIntegration,
  FsProvider
} from "./services/fs/fs-integration";
import { useSettingsStore } from "./stores/settings";
import {
  createWindow,
  RadixOsApp,
  useWindowStore
} from "./stores/window";

type AccentColor = Parameters<typeof Theme>[0]["accentColor"];
type Radius = Parameters<typeof Theme>[0]["radius"];

type ProvidersProps = {
  children: ReactNode;
  fs: FsIntegration;
  applications: readonly RadixOsApp<string>[];
  accentColor?: AccentColor;
  radius?: Radius;
  theme?: "light" | "dark";
  panelBackground?: "solid" | "translucent";
};

export function Providers(props: ProvidersProps) {
  const uniqueAppRef = useRef<Record<string, symbol>>({});
  const settingsStore = useSettingsStore();
  const { addWindow, bringToFront } = useWindowStore();

  useSyncPropsWithSettings(props);

  const contextValue = useMemo(() => {
    return {
      launch: (app, settings) => {
        const content = props.applications?.find(
          (a) => a.appId === app
        );
        if (!content) {
          throw new Error("Could not find app to launch");
        }
        const win = createWindow({
          ...content.defaultWindowSettings,
          ...settings
        });
        const Component = content.component;
        win.content = (
          <Component appWindow={win} file={settings?.file} />
        );
        if (content?.defaultWindowSettings?.unique) {
          if (!uniqueAppRef.current[content.appId]) {
            uniqueAppRef.current[content.appId] =
              Symbol("window");
          }
          win.id = uniqueAppRef.current[content.appId];
        }
        addWindow(win);
        bringToFront(win);
      },
      openFile: (file, settings) => {
        contextValue.launch(
          settings?.launcher ?? file.file.launcher[0] ?? "code",
          { ...settings, file }
        );
      },
      applications: props.applications
    } as UseAppLauncherReturn<string>;
  }, [props.applications]);

  const panelBackground =
    props.panelBackground ?? settingsStore.panelBackground;
  const accentColor =
    props.accentColor ?? settingsStore.accentColor ?? "indigo";
  const theme = props.theme ?? settingsStore.theme;
  const radius =
    props.radius ?? settingsStore.radius ?? "medium";

  return (
    <Theme
      appearance={theme}
      panelBackground={panelBackground}
      accentColor={accentColor ?? "indigo"}
      radius={radius}
      style={{ height: "100%" }}
    >
      <AppContextProvider value={contextValue}>
        <FsProvider value={props.fs}>
          <QueryClientProvider client={queryClient}>
            {props.children}
          </QueryClientProvider>
        </FsProvider>
      </AppContextProvider>
    </Theme>
  );
}

function useSyncPropsWithSettings(props: ProvidersProps) {
  const settingsStore = useSettingsStore();
  const relevantKeys = [
    "theme",
    "panelBackground",
    "accentColor",
    "radius"
  ];
  const keys = Object.keys(props)
    .filter((k) => relevantKeys.includes(k))
    .filter((k) => Boolean(props[k as "theme"]));

  useEffect(() => {
    settingsStore.setOverrides(keys as "theme"[]);
  }, [keys.join("")]);
}
