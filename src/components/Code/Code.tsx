import Editor from "@monaco-editor/react";
import {
  Box,
  Button,
  DropdownMenu,
  Flex,
} from "@radix-ui/themes";
import { useRef, useState } from "react";
import { useOnKeyDown } from "../../hooks/useKeyboard";
import { findNodeByPath } from "../../services/fs";
import { FsFile, useFileSystemStore } from "../../stores/fs";
import { useSettingsStore } from "../../stores/settings";

export function Code(props: {
  file: FsFile;
  path: string;
  windowId: symbol;
}) {
  const fs = useFileSystemStore((s) => s.tree);
  const [value, setValue] = useState(props.file.data);
  const editorRef = useRef<{ getValue: () => string } | null>(
    null
  );
  const theme = useSettingsStore((s) => s.theme);
  const save = useFileSystemStore((s) => s.updateFile);
  const node = findNodeByPath(props.path, fs);
  const touched = node && "data" in node && node.data !== value;

  useOnKeyDown({
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
              shortcut="⌘ N"
              onClick={() => {
                // ...
              }}
            >
              New
            </DropdownMenu.Item>
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
            <DropdownMenu.Item color="red">
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
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
