# RadixOS

An in-browser operating system simulation built using the Radix design system.

#### TOC

1. [Documentation](#documentation)
2. [Live demo](#live-demo)
3. [Setup](#setup)
4. [Tools and technologies](#tools-and-technologies)
5. [Launch demo locally](#launch-demo-locally)

## [Documentation](https://radix-os.netlify.app/)

Read the docs for more information on how to implement Radix OS into your project, using React and the npm package `radix-os`.

See a [working example](https://stackblitz.com/edit/radix-os?file=src%2FApp.tsx) of Radix OS on Stackblitz.

## **[Live demo](https://imp-dance.github.io/radix-os/)**

![Screenshot 2024-10-06 at 18 18 09](https://github.com/user-attachments/assets/c9a063f4-bee0-45ec-95c6-bb39f621baf3)


## Setup

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
  fsZustandIntegration,
  setupApps,
  createUseAppLauncher
} from "radix-os";

export const applications = setupApps();
export const useAppLauncher = createUseAppLauncher(applications);
```

```tsx title="App.tsx"
import '@radix-ui/themes/styles.css';
import {
  RadixOS,
  fsZustandIntegration
} from "radix-os";
import { applications } from "./lib/radix-os";

export default function App(){
  return <RadixOS fs={fsZustandIntegration} applications={applications} />
}
```

## Tools and technologies

This project uses

- [`vite`](https://vitejs.dev/)
- [`react`](https://react.dev)
- [`@monaco-editor/react`](https://github.com/suren-atoyan/monaco-react)
- [`@radix-ui/themes`](https://www.radix-ui.com/)
- [`@radix-ui/react-icons`](https://www.radix-ui.com/icons)
- [`dnd-kit`](https://dndkit.com/)
- [`zustand`](https://zustand.docs.pmnd.rs/)

## Launch demo locally

Assuming you have node installed

```shell
# clone repo
git clone git@github.com:imp-dance/radix-os.git
# navigate into folder
cd radix-os
# install dependencies
npm install
# launch dev server
npm run dev
```
