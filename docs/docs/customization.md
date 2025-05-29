---
sidebar_position: 6
---

# Customization

## Hard-coding through props

You can pass a couple of options directly to the `RadixOS` component to customize the Radix theme:

- `accentColor`: The preferred accent color of the Radix theme
- `radius`: The preferred radius of the Radix theme
- `panelBackground`: `"solid" | "translucent"` Determines if translucency is activated
- `theme`: (`light` | `dark`) Determines if dark-mode is enabled

## Programatically setting settings

You can utilize the hook `useSettingsStore` to change the customization settings from within an application running in the system.

```ts
type SettingsStore = {
  theme: "light" | "dark";
  toggleTheme: () => void;
  panelBackground: "solid" | "translucent";
  togglePanelBackground: () => void;
  bg: string;
  setBg: (bg: string) => void;
  radius: Radius;
  setRadius: (value: Radius) => void;
  accentColor: AccentColor;
  setAccentColor: (value: AccentColor) => void;
  overrides: (keyof SettingsStore)[];
  setOverrides: (overrides: (keyof SettingsStore)[]) => void;
}
```

:::warning
Passing props to `RadixOS` overrides the dynamic values set by `useSettingsStore`, unless `overrides` are manually set to an empty array.
:::
