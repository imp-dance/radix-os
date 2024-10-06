import Editor from "@monaco-editor/react";
import {
  Box,
  Button,
  Card,
  Dialog,
  DropdownMenu,
  Flex,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useRef, useState } from "react";
import { useKeydown } from "../../hooks/useKeyboard";
import {
  findNodeByPath,
  parsePath,
  pathToName,
} from "../../services/fs";
import { FsFile, useFileSystemStore } from "../../stores/fs";
import { useSettingsStore } from "../../stores/settings";
import { useWindowStore } from "../../stores/window";
import { Explorer } from "../Explorer/Explorer";
import { createCodeWindow } from "./Code.window";

export function CodeApp(props: {
  file?: FsFile;
  path?: string;
  windowId: symbol;
}) {
  const [createdFile, setCreatedFile] = useState<FsFile | null>(
    null
  );
  const [createdPath, setCreatedPath] = useState<string | null>(
    null
  );
  const [createDialogOpen, setCreateDialogOpen] =
    useState(false);
  const file = props.file ?? createdFile;
  const path = props.path ?? createdPath;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const fs = useFileSystemStore((s) => s.tree);
  const [value, setValue] = useState(file?.data ?? "");
  const editorRef = useRef<{
    getValue: () => string;
    focus: () => void;
  } | null>(null);
  const theme = useSettingsStore((s) => s.theme);
  const save = useFileSystemStore((s) => s.updateFile);
  const deleteFile = useFileSystemStore((s) => s.remove);
  const newFile = useFileSystemStore((s) => s.createFile);
  const windows = useWindowStore((s) => s.windows);
  const win = windows.find((win) => win.id === props.windowId);
  const removeWindow = useWindowStore((s) => s.removeWindow);
  const node = path ? findNodeByPath(path, fs) : null;
  const touched = node
    ? node && "data" in node && node.data !== value
    : value !== "";

  const requestSave = () => {
    if (path) return save(path, value);
    setCreateDialogOpen(true);
  };

  useKeydown({
    key: "s",
    metaKey: true,
    callback: () => {
      requestSave();
    },
    windowId: props.windowId,
    deps: [value, createdFile],
  });

  useKeydown({
    key: "n",
    altKey: true,
    callback: () => {
      const winState = useWindowStore.getState();
      winState.addWindow(createCodeWindow({}));
    },
    windowId: props.windowId,
    deps: [value, createdFile],
  });
  useKeydown({
    key: "‘",
    altKey: true,
    callback: () => {
      const winState = useWindowStore.getState();
      winState.addWindow(createCodeWindow({}));
    },
    windowId: props.windowId,
    deps: [value, createdFile],
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
              shortcut="Alt N"
              onClick={(e) => {
                e.stopPropagation();
                const winState = useWindowStore.getState();
                winState.addWindow(createCodeWindow({}));
              }}
            >
              New file
            </DropdownMenu.Item>
            <DropdownMenu.Item
              shortcut="⌘ S"
              onClick={() => {
                requestSave();
              }}
              color={touched ? "indigo" : "gray"}
              disabled={!touched}
            >
              Save {!file ? "as" : ""}
            </DropdownMenu.Item>
            {file && path && (
              <>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                  color="red"
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete
                </DropdownMenu.Item>
              </>
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
                    deleteFile(parsePath(path!));
                    if (win) removeWindow(win);
                  }}
                >
                  Delete file
                </Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
        <SaveAsDialog
          open={createDialogOpen}
          setOpen={setCreateDialogOpen}
          onPathCreate={(path) => {
            newFile(path, value);
            const winState = useWindowStore.getState();
            const winObj = winState.windows.find(
              (w) => w.id === props.windowId
            );
            if (winObj) {
              winState.setTitle(winObj, pathToName(path));
            }
            setCreatedPath(path);
            setCreatedFile({
              data: value,
              launcher: ["code"],
              name: pathToName(path),
              title: pathToName(path),
            });
          }}
        />
      </Box>
      <div
        style={{
          height: "var(--space-3)",
          background: theme === "dark" ? "#1e1e1e" : "#fff",
        }}
      />
      <button
        data-returnfocus="true"
        style={{
          opacity: 0,
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
        onFocus={(e) => {
          e.preventDefault();
          if (editorRef.current) {
            editorRef.current.focus();
          } else {
            setTimeout(() => {
              if (editorRef.current) {
                editorRef.current.focus();
              }
            }, 500);
          }
        }}
      />
      <Editor
        height="calc(100% - 2.5rem)"
        width="100%"
        className="editor"
        theme={theme === "dark" ? "vs-dark" : "light"}
        defaultLanguage="html"
        defaultValue={value}
        wrapperProps={{ "data-returnfocus": true }}
        value={value}
        onChange={(v) => setValue(v ?? "")}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
        }}
      />
    </Flex>
  );
}

function SaveAsDialog(props: {
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
