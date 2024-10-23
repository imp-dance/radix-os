---
sidebar_position: 2
---

# File system

Radix OS comes with a preconfigured client-side file system that can be imported and passed directly:

```tsx
import { createZustandFsIntegration, RadixOS } from "radix-os";

const fs = createZustandFsIntegration();

createRoot(...).render(
    <StrictMode>
        <RadixOS fs={fs} />
    </StrictMode>
);
```

You can optionally pass an object with `initialTree`, or `onAction` (to listen to actions) to `createZustandFsIntegration`.

## Create custom integration

You can also create your own custom file system integration.

```tsx
import { FsIntegration } from "radix-os";

const customIntegration: FsIntegration = {
    readDir: async (path) => {/* ... */}
    ...
}

function App(){
    return <RadixOS fs={customIntegration} />;
}
```
