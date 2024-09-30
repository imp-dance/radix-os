import Editor from "@monaco-editor/react";
import {
  Box,
  Button,
  Dialog,
  DropdownMenu,
  Flex,
} from "@radix-ui/themes";
import { useRef, useState } from "react";
import { useKeydown } from "../../hooks/useKeyboard";
import { findNodeByPath, parsePath } from "../../services/fs";
import { FsFile, useFileSystemStore } from "../../stores/fs";
import { useSettingsStore } from "../../stores/settings";
import { useWindowStore } from "../../stores/window";

export function CodeApp(props: {
  file: FsFile;
  path: string;
  windowId: symbol;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const fs = useFileSystemStore((s) => s.tree);
  const [value, setValue] = useState(props.file.data);
  const editorRef = useRef<{ getValue: () => string } | null>(
    null
  );
  const theme = useSettingsStore((s) => s.theme);
  const save = useFileSystemStore((s) => s.updateFile);
  const deleteFile = useFileSystemStore((s) => s.remove);
  const windows = useWindowStore((s) => s.windows);
  const win = windows.find((win) => win.id === props.windowId);
  const removeWindow = useWindowStore((s) => s.removeWindow);
  const node = findNodeByPath(props.path, fs);
  const touched = node && "data" in node && node.data !== value;

  useKeydown({
    key: "s",
    metaKey: true,
    callback: () => {
      save(props.path, value);
    },
    windowId: props.windowId,
    deps: [value],
  });

  return (
    <Flex
      direction="column"
      style={{
        height: "100%",
        maxWidth: "calc(100% - 0.5px)",
        overflow: "hidden",
      }}
    >
      <Box style={{ background: "var(--gray-2)" }}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button
              variant={"soft"}
              size={"1"}
              ml={"0"}
              color={touched ? "indigo" : "gray"}
              style={{ borderRadius: 0 }}
            >
              File
              <DropdownMenu.TriggerIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content size="1">
            <DropdownMenu.Item
              shortcut="⌘ S"
              onClick={() => {
                save(props.path, value);
              }}
              color={touched ? "indigo" : "gray"}
              disabled={!touched}
            >
              Save {touched ? "changes" : ""}
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            {props.file.title !== "__new" && (
              <DropdownMenu.Item
                color="red"
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <Dialog.Root
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        >
          <Dialog.Content>
            <Dialog.Title>Delete file</Dialog.Title>
            <Dialog.Description>
              Are you sure you want to delete this file?
            </Dialog.Description>
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Dialog.Close>
                <Button
                  variant="solid"
                  color="crimson"
                  onClick={() => {
                    deleteFile(parsePath(props.path));
                    if (win) removeWindow(win);
                  }}
                >
                  Delete file
                </Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Box>
      <div
        style={{
          height: "var(--space-3)",
          background: theme === "dark" ? "#1e1e1e" : "#fff",
        }}
      />
      <Editor
        height="calc(100% - 2.5rem)"
        width="100%"
        className="editor"
        theme={theme === "dark" ? "vs-dark" : "light"}
        defaultLanguage="html"
        onChange={(v) => setValue(v ?? "")}
        value={value}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
        defaultValue={props.file.data}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
        }}
      />
    </Flex>
  );
}
