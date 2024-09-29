import { Theme } from "@radix-ui/themes";
import { ReactNode } from "react";
import { useSettingsStore } from "./stores/settings";

export function Providers(props: { children: ReactNode }) {
  const settingsStore = useSettingsStore();
  return (
    <Theme
      appearance={settingsStore.theme}
      accentColor="indigo"
      style={{ height: "100%" }}
      panelBackground={settingsStore.panelBackground}
    >
      {props.children}
    </Theme>
  );
}
