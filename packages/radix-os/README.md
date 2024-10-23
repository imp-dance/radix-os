# Radix OS

Radix OS is a operating system simulated on the web, with a modular file system that can be swapped out with any async source, able to run your own custom built applications. Designed to be flexible and easily extendable so it can fit your needs.

Check out the [documentation](https://radix-os.netlify.app) for more in depth guides.

[![Preview](/sh.jpg)](https://imp-dance.github.io/radix-os/)

## Getting started

### Installation

1. If you don't have radix ui themes installed already, install this first:

```
npm i @radix-ui/themes @radix-ui/react-icons
```

2. Then install Radix OS:

```
npm i radix-os
```

### Quick setup

```tsx title="lib/radix-os.ts"
import {
  setupApps,
  createUseAppLauncher,
  createZustandFsIntegration
} from "radix-os;

export const useAppLauncher = createUseAppLauncher(applications);
export const applications = setupApps();
export const fs = createZustandFsIntegration();
```

```tsx title="App.tsx"
import '@radix-ui/themes/styles.css';
import {
  RadixOS,
  fsZustandIntegration
} from "radix-os;
import { applications, fs } from "./lib/radix-os";

export default function App(){
  return <RadixOS fs={fs} applications={applications} />
}
```
