---
sidebar_position: 2
---

# File system

Radix OS comes with a preconfigured client-side file system that can be imported and passed directly:

```tsx
import { fsZustandIntegration, RadixOS } from "radix-os";

createRoot(...).render(
    <StrictMode>
        <RadixOS fs={fsZustandIntegration} />
    </StrictMode>
);
```

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
