import { Button, Card, Dialog, Flex } from "@radix-ui/themes";
import { useState } from "react";
import { useFileSystemQuery } from "../../api/fs/fs-api";
import { findNodeByPath } from "../../services/fs/tree-helpers";
import { FsFile } from "../../stores/fs";
import { Explorer } from "../apps/Explorer/Explorer";

export function OpenFileDialog(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onFileOpened: (file: FsFile, path: string) => void;
  fileDisabled?: (file: FsFile) => boolean;
}) {
  const [selectedFile, setSelectedFile] = useState<null | {
    file: FsFile;
    path: string;
  }>(null);
  const fsQuery = useFileSystemQuery("");
  const root = fsQuery?.data ?? null;
  const [path, setPath] = useState("");

  const node = root ? findNodeByPath(path, root) : null;

  const isValid = selectedFile !== null;
  return (
    <Dialog.Root open={props.open} onOpenChange={props.setOpen}>
      <Dialog.Content size="2">
        <Dialog.Title size="3">Open file</Dialog.Title>
        <Dialog.Description color="gray" size="1">
          Select file to open
        </Dialog.Description>
        <Card
          style={{
            background: "var(--gray-1)",
            minHeight: 250,
            display: "grid",
            gridTemplateRows: "1fr min-content",
            gridTemplateColumns: "1fr",
            border: "1px solid var(--gray-3)",
          }}
          size="1"
          my="3"
        >
          <Explorer
            initialPath={path}
            onPathChange={setPath}
            fileDisabled={props.fileDisabled}
            onRequestOpenFile={(file, path) => {
              setSelectedFile({ file, path });
            }}
          />
        </Card>
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              variant="solid"
              color="green"
              onClick={() => {
                if (selectedFile) {
                  const { file, path } = selectedFile;
                  props.onFileOpened(file, path);
                }
              }}
              disabled={!isValid}
            >
              Open file
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
