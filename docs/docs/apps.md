---
sidebar_position: 3
---

# Applications

Applications in RadixOS are components that are mounted in controlled windows, which are able to interact with the operating system through the use of hooks. Applications can be moved around the screen bounds, resized, minimized and tiled.

## Default applications

There are 5 apps by default that come with RadixOS:

| Name         | `appId`    | Description                                | Launch interface           |
| ------------ | ---------- | ------------------------------------------ | -------------------------- |
| Terminal     | `terminal` | Can modify and read file system            | Path                       |
| Explorer     | `explorer` | Can modify and read file system            | Path                       |
| Web Browser  | `web`      | Can launch html files and navigate to urls | URL or HTML                |
| Code         | `code`     | Monaco editor for code and text            | Text                       |
| Settings     | `settings` | System customization and formatting        | Tab-id                     |
| Image Viewer | `image`    | Can open images                            | [data:image](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data) or SVG          |
| Audio Player | `audio`    | Can open audio files                       | `"${mimeType} B64 ${base64}"`|
| Video Player | `video`    | Can open video files                       | `"${mimeType} B64 ${base64}"`|

If you are interested in more detail in regards to how different file types are processed and encoded into RadixOS's file objects, you
can look at [this file](https://github.com/imp-dance/radix-os/blob/main/packages/radix-os/src/services/fs/upload.ts) from our source code.

### Configuration

You can configure some apps by passing a second argument to `setupApps`:

```tsx
const apps = setupApps([], {
  terminalPlugins: [],
  defaultAppsOnDesktop: ["terminal", "explorer"],
});
```

### Terminal plugins

You can pass extra matchers as plugins to the terminal application. This allows you to respond to commands and push output back to the terminal.

```tsx
const terminalPluginOpen: TerminalPlugin = {
  matcher: (command) => command === "open",
  exec: (pushOutput, command, args) => {
    // do some stuff, then
    pushOutput(
      <Code size="sm" variant="soft">
        Opening "{args.join(" ")}"
      </Code>
    );
  },
};

const apps = setupApps([], {
  terminalPlugins: [terminalPluginOpen],
});
```

## Creating your own applications

You can create apps by using `createApp`:

```tsx title="SomeApp.tsx"
export const SomeApp = createApp((props) => {
  return <div>...</div>;
});
```

In the component passed to `createApp`, you have access to the following props:

- **`appWindow`**: The window object that the app is mounted in
  - Contains readable properties for things like the window id and position
- **`file?`**: An object that if not `undefined` contains:
  - `.file` The file object that the app was launched by
  - `.path` The path of the file object that the app was launched by
  - [See more](#launching-files)

To add your custom application to the operating system and make it launchable, supply it to the `setupApps` function:

```tsx title="App.tsx"
import { SomeApp } from "./SomeApp";

const applications = setupApps([
  {
    appId: "some-app",
    appName: "Some App",
    component: SomeApp,
    defaultWindowSettings: {},
  },
  {
    appId: "some-other-app",
    /* ... */
  },
]);

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

:::warning
Do not call `setupApps` inside a React component, as this will cause excessive rerendering. If you have to, make sure to properly memoize the value.

:::

You can now launch the application from within other applications by utilizing `useAppLauncher`, which should be type-safe as well:

```tsx
const { launch } = useAppLauncher();
// ...
launch("some-app", { ...settings });
```

### Set default focus element

To configure which element should be focused when the title-bar is clicked, or when the app is initially opened, you can set the following attribute on the HTML element: `data-returnfocus="true"`. Example:

```tsx
<Button data-returnfocus="true">Call to action</Button>
```

### Reacting to launched files

If your application was launched with a file, it will have a `file` prop that looks something like this:

```json
{
  "file": {
    "name": "Some file",
    "launcher": ["code", "some-app-id"],
    "data": "a string of data",
  },
  "path": "/Documents/Some file",
}
```

This means that `if (props.file !== undefined)`, then a file was launched.

If you want to do something with that file, like for example creating a `Blob` from the data and trying to play it as audio - you totally can. What you expect from the string of data and how you use it is completely up to you.

If you want to handle file uploads so that you can encode them into whatever format you want and add your `appId` as a launcher, you should read about [system file upload](/fs#system-file-upload).

## Application Hooks

The app components are mounted inside `RadixOS`, which gives them access to a few hooks to control the operating system.

### `useFs`

This hook gives you access to the file system integration methods.

```typescript
type FsIntegration = {
  readDir: (path: string) => Promise<FsNode | null>;
  makeDir: (path: string) => Promise<boolean>;
  makeFile: (
    path: string,
    file: {
      name: string;
    } & Partial<FsFile>
  ) => Promise<boolean>;
  move: (from: string, to: string) => Promise<boolean>;
  updateFile: (
    path: string,
    file: Partial<FsFile>
  ) => Promise<boolean>;
  removeFile: (path: string) => Promise<boolean>;
};
```

### `useAppLauncher`

This hook will let you launch applications and open files from within your own applications.

    * `launch(appId, settings)` - Launches given app in new window with given settings
    * `open(file, settings)` - Opens a file with appropriate launcher and settings

### `useAppWindow`

Exposes methods you can run on a given app window.

    * `close` Closes the window
    * `bringToFront` - Un-minimizes window and focuses it
    * `minimize` - Minimizes window
    * `setTitle(title)` - Sets window title
    * `setDimensions(dim)` - Sets window dimensions (x/y/w/h)

### `useSettingsStore`

Gives you direct access to the internal zustand settings store.

### `useWindowStore`

Gives you direct access to the internal zustand window store, allowing you to interact with open windows.


### `useToast`

This hook will let you fire off system toasts.

    * `toast(toastOpts)` - Fires off a toast with given options
        ```ts
        type ToastOptions = {
          title: string;
          type?: "foreground" | "background";
          description?: string;
          dismissText?: string;
          action?: {
            onClick: () => void;
            altText?: string;
            label: string;
          };
        };
        ```
    * `toasts` - Returns a list of toasts stored in memory


## Overwriting default components

You may overwrite existing applications by giving your own applications matching appIds.

```tsx
const applications = setupApps([
  {
    appId: "code",
    component: CustomCodeComponent,
    defaultWindowSettings: {},
  },
  {
    appId: "explorer",
    component: CustomExplorerComponent,
    defaultWindowSettings: {},
  },
]);
```
