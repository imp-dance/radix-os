---
sidebar_position: 2
---

# File system

Radix OS comes with a preconfigured client-side file system that can be imported and passed directly:

```tsx
import { createLocalFileSystem, RadixOS } from "radix-os";

const fs = createLocalFileSystem();

createRoot(...).render(
    <StrictMode>
        <RadixOS fs={fs} />
    </StrictMode>
);
```

You can optionally pass an object with `initialTree`, or `onAction` (to listen to actions) to `createLocalFileSystem`. This will set up a file system that uses zustand internally, and persists the data through IndexedDB (via a web worker).

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

## System file upload

You can drag and drop files from your desktop onto Radix OS. By default, Radix OS handles simple file types like text and some image types, but you can extend this functionality by passing a `fileUploadHandler` prop to `<RadixOS />`:

```tsx
const uploadHandler = async (
  file: File
): Promise<FsFile | null> => {
  switch (true) {
    case file.type.startsWith("image/"):
      return {
        name: file.name,
        launcher: ["my-custom-image-app"],
        data: await pdfFileToFsFile(file),
      };
      break;
    default:
      return null; // pass through other types
  }
};

function App() {
  return (
    <RadixOS {...otherProps} fileUploadHandler={uploadHandler} />
  );
}
```
