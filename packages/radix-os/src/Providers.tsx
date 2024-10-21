import { Theme } from "@radix-ui/themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo, useRef } from "react";
import {
  AppContextProvider,
  UseAppLauncherReturn,
} from "./integration/setupApps";
import { queryClient } from "./lib/react-query/client";
import { FsIntegration, FsProvider } from "./services/fs";
import { useSettingsStore } from "./stores/settings";
import {
  createWindow,
  RadixOsApp,
  useWindowStore,
} from "./stores/window";

export function Providers(props: {
  children: ReactNode;
  fs: FsIntegration;
  applications: readonly RadixOsApp<string>[];
}) {
  const uniqueAppRef = useRef<Record<string, symbol>>({});
  const settingsStore = useSettingsStore();
  const { addWindow, bringToFront } = useWindowStore();

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
          ...settings,
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
    } as UseAppLauncherReturn<string>;
  }, [props.applications]);
  return (
    <Theme
      appearance={settingsStore.theme}
      accentColor="indigo"
      style={{ height: "100%" }}
      panelBackground={settingsStore.panelBackground}
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
