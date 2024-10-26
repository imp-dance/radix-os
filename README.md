# Radix OS

Radix OS is an operating system simulated on the web, with a modular file system that can be swapped out with any async source, able to run your own custom built applications. Designed to be flexible and easily extendable so it can fit your needs.

![Preview](https://radix-os.netlify.app/assets/images/sh-22aa7102bc92ee3fccb90107fe234d72.jpg)

## Features

- Window management
- Modular file system
- Customizable UI
- App launcher
- Keyboard shortcuts
- Context menus
- System UI components
- Drag 'n drop file upload

## Getting started

### Installation

If you don't have radix ui themes installed already, install this first:

```shell
npm i @radix-ui/themes
```

Then install Radix OS:

```shell
npm i radix-os
```

We also recommend that you install `@radix-ui/react-icons` if you plan on extending the OS with your own applications.

### Quick setup

```tsx
import "@radix-ui/themes/styles.css";
import {
  createZustandFsIntegration,
  setupApps,
  RadixOS,
} from "radix-os";

// You can provide some optional config to these
const fs = createZustandFsIntegration();
const applications = setupApps([]);

export function App() {
  return (
    <RadixOS
      fs={fs}
      applications={applications}
      // You can also pass some customization options:
      radius="none"
      accentColor="crimson"
    />
  );
}
```

### Documentation

To read more about how to create your own applications for the "OS", setting up desktop items and all of the exported utilities - check out [the official docs](https://radix-os.netlify.app/).
