import {
  Button,
  Card,
  Dialog,
  Flex,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useState } from "react";
import { Explorer } from "../apps/Explorer/Explorer";

export function SaveAsDialog(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onPathCreate: (path: string) => void;
}) {
  const [path, setPath] = useState("");
  const [fileName, setFileName] = useState("");

  const isValid = path !== undefined && fileName;
  return (
    <Dialog.Root open={props.open} onOpenChange={props.setOpen}>
      <Dialog.Content size="2">
        <Dialog.Title size="3">Save as</Dialog.Title>
        <Dialog.Description color="gray" size="1">
          Choose a location to save the file
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
            disableFiles
          />
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
              padding: "var(--space-2)",
              flexGrow: 0,
              paddingTop: "0",
            }}
          >
            <Separator size="4" mt="0" />
            <Text size="1" color="gray">
              File name
            </Text>
            <TextField.Root
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              size="1"
              placeholder="New file"
            />
          </label>
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
                props.setOpen(false);
                props.onPathCreate(`${path}/${fileName}`);
              }}
              disabled={!isValid}
            >
              Save
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
