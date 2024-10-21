---
sidebar_position: 3
---

# Applications

Applications in RadixOS are components that are mounted in controlled windows, which are able to interact with the operating system through the use of hooks. Applications can be moved around the screen bounds, resized, minimized and tiled.

## Default applications

There are 5 apps by default that come with RadixOS:

| Name        | `appId`    | Description                                |
| ----------- | ---------- | ------------------------------------------ |
| Terminal    | `terminal` | Can modify and read file system            |
| Explorer    | `explorer` | Can modify and read file system            |
| Web Browser | `web`      | Can launch html files and navigate to urls |
| Code        | `code`     | Monaco editor for code and text            |
| Settings    | `settings` | System customization and formatting        |

## Creating your own applications

:::info Use @radix-ui/themes

> We recommend that you install and utilize `@radix-ui/themes` when designing your own applications to match the design system already implemented.

```shell
npm i @radix-ui/themes
```

You do not need to add the css file or `Theme` component, is this is handled internally in `RadixOS`.

:::

You can create apps like such:

```tsx title="SomeApp.tsx"
export const SomeApp = createApp((props) => {
  return <div>...</div>;
});
```

In the component, you have access to the following props:

- **`appWindow`**: The window object that the app is mounted in
  - Contains readable properties for things like the window id and position
- **`file?`**: An object that if not `undefined` contains:
  - `.file` The file object that the app was launched by
  - `.path` The path of the file object that the app was launched by

To add your custom application to the operating system and make it launchable, supply it to the `setupApps` function:

```tsx title="App.tsx"
import { SomeApp } from "./SomeApp";

const applications = setupApps(
  {
    appId: "some-app",
    appName: "Some App",
    component: SomeApp,
    defaultWindowSettings: {},
  },
  {
    appId: "some-other-app",
    /* ... */
  }
);

const useAppLauncher = createUseAppLauncher(applications);

function App() {
  return (
    <RadixOS
      fs={fsZustandIntegration}
      applications={applications}
    />
  );
}
```

You can now launch the application from within other applications by utilizing `useAppLauncher`, which should be type-safe as well:

```tsx
const { launch } = useAppLauncher();
// ...
launch("some-app", { ...settings });
```

### Available Hooks

The app components are mounted inside `RadixOS`, which gives them access to a few hooks to control the operating system.

#### `useFs`

This hook gives you access to the file system integration and methods such as `readDir`.

#### `useAppLauncher`

This hook will let you launch applications and open files from within your own applications.

#### `useSettingsStore`

Gives you direct access to the zustand settings store.

#### `useWindowStore`

Gives you direct access to the zustand window store, allowing you to interact with open windows.

## Overwrite default components

You may overwrite existing applications by giving your own applications matching appIds.

```tsx
const applications = setupApps(
  {
    appId: "code",
    component: CustomCodeComponent,
    defaultWindowSettings: {},
  },
  {
    appId: "explorer",
    component: CustomExplorerComponent,
    defaultWindowSettings: {},
  }
);
```
