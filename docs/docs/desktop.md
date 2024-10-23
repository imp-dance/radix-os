---
sidebar_position: 4
---

# Desktop

The desktop in RadixOS is very minimal and simple, mostly used to launch applications and shortcuts.

:::info
You can also launch applications by using the command palette, opened with the keyboard shortcut `CTRL + P`.
:::

## Application shortcuts

You can add apps to the desktop by configuring them to be added in `setupApps`. You can also configure which of the default apps appear in the desktop by passing a second argument.

```tsx
const applications = setupApps(
  [
    {
      appId: "some-app",
      appName: "Some App",
      component: SomeApp,
      addToDesktop: true,
      defaultWindowSettings: {},
    },
  ],
  {
    defaultAppsOnDesktop: ["explorer", "code"],
  }
);
```

## Custom shortcuts

You can also create desktop items that execute any code you want. You add these directly to the RadixOS component:

```tsx
const applications = setupApps();

const desktopItems = setupDesktopItems({
  icon: <QuestionMarkCircledIcon />,
  label: "Boop",
  onClick: () => {
    alert("boop");
  },
});

function App() {
  return (
    <RadixOS
      applications={applications}
      desktopItems={desktopItems}
    />
  );
}
```
