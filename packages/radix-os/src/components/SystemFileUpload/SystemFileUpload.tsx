import { Flex, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useFs } from "../../services/fs/fs-integration";
import {
  getParentPath,
  pathToName,
} from "../../services/fs/tree-helpers";
import { createFile } from "../../services/fs/upload";
import { FsFile } from "../../stores/fs";
import { SaveAsDialog } from "../SaveAsDialog/SaveAsDialog";

export function SystemFileUpload() {
  const fs = useFs();
  const [isDroppingFile, setDroppingFile] = useState(false);
  const [uploadOpen, setUploadOpen] = useState<false | FsFile>(
    false
  );

  useEffect(() => {
    const dropStopper = (e: Event) => {
      e.preventDefault();
    };
    const onDragOver = (e: Event) => {
      e.preventDefault();
      setDroppingFile(true);
    };
    document.body.addEventListener("dragenter", onDragOver);
    window.addEventListener("dragover", dropStopper);
    window.addEventListener("drop", dropStopper);
    return () => {
      document.body.removeEventListener("dragenter", onDragOver);
      window.removeEventListener("dragover", dropStopper);
      window.removeEventListener("drop", dropStopper);
    };
  }, []);
  return (
    <>
      {uploadOpen && (
        <SaveAsDialog
          onPathCreate={async (path) => {
            await fs.makeFile(getParentPath(path), {
              ...uploadOpen,
              name: pathToName(path),
            });
            setUploadOpen(false);
          }}
          open
          initialName={uploadOpen.name}
          setOpen={(open) => {
            if (!open) setUploadOpen(false);
          }}
        />
      )}
      {isDroppingFile && (
        <Flex
          position="absolute"
          inset="0"
          style={{
            background: "rgba(0,0,0,0.5)",
            zIndex: 99,
            animation: "rxosFadeIn 0.15s ease-out",
          }}
          onClick={() => setDroppingFile(false)}
          onDragLeave={() => setDroppingFile(false)}
          onDrop={async (e) => {
            setDroppingFile(false);
            try {
              const file = await createFile(
                e.dataTransfer.files[0]
              );
              setUploadOpen(file);
            } catch (err) {
              console.log(err);
            }
          }}
        >
          <div style={{ margin: "auto" }}>
            <Text size="5">Drop file here to upload</Text>
          </div>
        </Flex>
      )}
    </>
  );
}
