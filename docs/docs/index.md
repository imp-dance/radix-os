---
sidebar_position: 1
---

# Radix OS

Radix OS is an operating system simulated on the web, with a modular file system that can be swapped out with any async source, able to run your own custom built applications. Designed to be flexible and easily extendable so it can fit your needs.

[![Preview](/sh.jpg)](https://imp-dance.github.io/radix-os/)

:::tip So what it, really?

A React component, coupled with a few helper functions and hooks - published to NPM. Together, this package lets you create an OS-like environment, and inject custom applications of your own.
:::

## Features

- Window management
- Modular file system
- Customizable UI
- App launcher
- System UI components
- Drag 'n drop user interface
- Set of default applications
  - Explorer, terminal, code, image viewer + more.

## Getting started

### Installation

1. If you don't have radix ui themes installed already, install this first:

```
npm i @radix-ui/themes
```

2. Then install Radix OS:

```
npm i radix-os
```

We also recommend that you install `@radix-ui/react-icons` if you plan on extending the OS with your own applications.

### Quick setup

```tsx title="lib/radix-os.ts"
import {
  createZustandFsIntegration,
  setupApps,
  createUseAppLauncher
} from "radix-os;

export const applications = setupApps();
export const useAppLauncher = createUseAppLauncher(applications);
export const fs = createZustandFsIntegration();
```

```tsx title="App.tsx"
import '@radix-ui/themes/styles.css';
import {
  RadixOS,
} from "radix-os;
import { applications, fs } from "./lib/radix-os";

export default function App(){
  return <RadixOS fs={fs} applications={applications} />
}
```
