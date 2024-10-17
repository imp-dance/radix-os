import { Theme } from "@radix-ui/themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { queryClient } from "./lib/react-query/client";
import { FsIntegration, FsProvider } from "./services/fs";
import { useSettingsStore } from "./stores/settings";

export function Providers(props: {
  children: ReactNode;
  fs: FsIntegration;
}) {
  const settingsStore = useSettingsStore();
  return (
    <Theme
      appearance={settingsStore.theme}
      accentColor="indigo"
      style={{ height: "100%" }}
      panelBackground={settingsStore.panelBackground}
    >
      <FsProvider value={props.fs}>
        <QueryClientProvider client={queryClient}>
          {props.children}
        </QueryClientProvider>
      </FsProvider>
    </Theme>
  );
}
