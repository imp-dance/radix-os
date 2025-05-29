import { Flex, Text } from "@radix-ui/themes";
import React, { useEffect, useState } from "react";
import { useFs } from "../../services/fs/fs-integration";
import {
  getParentPath,
  pathToName
} from "../../services/fs/tree-helpers";
import { createFile } from "../../services/fs/upload";
import { FsFile } from "../../stores/fs";
import { SaveAsDialog } from "../SaveAsDialog/SaveAsDialog";
import { useFileDrop } from "../../hooks/useFileDrop";

export function SystemFileUpload(props: {
  handler?: (file: File) => Promise<FsFile | null>;
}) {
  const fs = useFs();
  const [uploadOpen, setUploadOpen] = useState<false | FsFile>(
    false
  );
  const [, rerender] = useState(0);
  const { isDroppingFile, finishDrop } = useFileDrop(
    typeof document !== "undefined"
      ? document.getElementById("rxosdesktop")
      : undefined
  );
  useEffect(() => {
    let el = document.getElementById("rxosdesktop");
    rerender((p) => p + 1);
    if (el) return;
    let interval = setInterval(() => {
      el = document.getElementById("rxosdesktop");
      if (el) {
        clearInterval(interval);
        rerender((p) => p + 1);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    finishDrop();
    try {
      const file = await createFile(
        e.dataTransfer.files[0],
        props.handler
      );
      setUploadOpen(file);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {uploadOpen && (
        <SaveAsDialog
          onPathCreate={async (path) => {
            await fs.makeFile(getParentPath(path), {
              ...uploadOpen,
              name: pathToName(path)
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
            animation: "rxosFadeIn 0.15s ease-out"
          }}
          onClick={() => finishDrop()}
          onDragLeave={() => finishDrop()}
          onDrop={onDrop}
          pt="5"
        >
          <div style={{ margin: "auto", marginTop: 0 }}>
            <Text size="6" weight="bold">
              Drop file to upload
            </Text>
          </div>
        </Flex>
      )}
    </>
  );
}
