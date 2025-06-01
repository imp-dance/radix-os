---
sidebar_position: 1
---

# Radix OS

* 🏗️ Build your own operating system using [React](https://react.dev) & [Radix UI](https://www.radix-ui.com/)
* 🚀 [Create applications](/apps#creating-your-own-applications) as react components
* ⚙️ [Customizable](/customization) and configurable
* 🗂️ Plug in to your own async [file system](/fs) (or use our local solution)
* 💾 Deploy wherever you want

### [🚀 Live demo](https://imp-dance.github.io/radix-os/)
> Play with a minimally configured deployed version of Radix OS.

[![Preview](/sh-2.jpg)](https://imp-dance.github.io/radix-os/)

## Getting started

### Installation

Assuming you've already set up a [React project](https://react.dev/learn)...

1. If you don't have [`@radix-ui/themes`](https://www.npmjs.com/package/@radix-ui/react-icons) installed already, install this first:

```
npm i @radix-ui/themes
```

2. Then install [`radix-os`](https://www.npmjs.com/package/radix-os)

```
npm i radix-os
```

We also recommend that you install [`@radix-ui/react-icons`](https://www.radix-ui.com/icons) if you want to add your own custom applications.

### Quick setup

Set up a few core exports in a separate file.

```tsx title="/services/radix-os.ts"
import {
  createZustandFsIntegration,
  setupApps,
  createUseAppLauncher
} from "radix-os;

// Set up your applications
export const applications = setupApps();
// Create a typed app-launching hook for your convenience.
export const useAppLauncher = createUseAppLauncher(applications);
// Set up a file system of your choice.
export const fs = createZustandFsIntegration();
```

Add the `RadixOS` app where you want to mount the OS, and import the applications and file system.

```tsx title="/main.tsx"
import '@radix-ui/themes/styles.css';
import {
  RadixOS,
} from "radix-os;
import { applications, fs } from "./services/radix-os";

export default function App(){
  return <RadixOS fs={fs} applications={applications} />
}
```

* [Learn more about creating your own applications](/apps#creating-your-own-applications)
* [Setting up a custom file system](/fs#create-custom-integration)
* [FAQ](/faq)

### Additional information

:::info What is "Radix UI"?
[Radix UI](https://www.radix-ui.com/) is the design system and component library that is heavily utilized in Radix OS. This project is not directly affiliated with the Radix team or WorkOS.
:::

:::tip What is "Radix OS"?

`radix-os` is an npm package that contains a react component, coupled with a few helper functions and hooks. Together, this package lets you create a customizable OS-like environment, where you can inject custom applications of your own.
:::
