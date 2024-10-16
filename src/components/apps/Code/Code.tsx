import Editor from "@monaco-editor/react";
import { Flex } from "@radix-ui/themes";
import { useRef, useState } from "react";
import {
  findNodeByPath,
  parsePath,
  pathToName,
} from "../../../services/fs";
import { FsFile, useFileSystemStore } from "../../../stores/fs";
import { useSettingsStore } from "../../../stores/settings";
import { useWindowStore } from "../../../stores/window";
import { ConfirmDialog } from "../../ConfirmDialog/ConfirmDialog";
import { MenuBar } from "../../MenuBar/MenuBar";
import { SaveAsDialog } from "../../SaveAsDialog/SaveAsDialog";
import { createCodeWindow } from "./Code.window";

type EditorType = Parameters<
  NonNullable<Parameters<typeof Editor>[0]["onMount"]>
>[0];

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
  const editorRef = useRef<EditorType | null>(null);
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

  const createFile = (path: string) => {
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
  };

  return (
    <Flex
      direction="column"
      style={{
        height: "100%",
        maxWidth: "calc(100% - 0.5px)",
        overflow: "hidden",
      }}
    >
      <MenuBar
        windowId={props.windowId}
        menu={[
          {
            label: "File",
            color: touched ? "indigo" : "gray",
            options: [
              {
                label: "New file",
                onClick: () => {
                  const winState = useWindowStore.getState();
                  winState.addWindow(createCodeWindow({}));
                },
                shortcut: {
                  key: "N",
                  modifiers: ["ctrl"],
                  label: "ctrl N",
                },
              },
              {
                label: "Save",
                onClick: () => {
                  requestSave();
                },
                disabled: !touched,
                shortcut: {
                  key: "S",
                  modifiers: ["ctrl"],
                  label: "ctrl S",
                  dependency: value,
                },
                color: touched ? "indigo" : "gray",
              },
              "separator",
              {
                label: "Delete",
                onClick: () => setDeleteOpen(true),
                color: "red",
                disabled: !path,
              },
            ],
          },
          {
            label: "Edit",
            color: "gray",
            options: [
              {
                label: "Undo",
                onClick: () => {
                  if (editorRef.current) {
                    editorRef.current.trigger(
                      "myapp",
                      "undo",
                      {}
                    );
                  }
                },
                shortcut: {
                  key: "Z",
                  modifiers: ["ctrl"],
                  label: "ctrl Z",
                },
              },
              {
                label: "Redo",
                onClick: () => {
                  if (editorRef.current) {
                    editorRef.current.trigger(
                      "myapp",
                      "redo",
                      {}
                    );
                  }
                },
                shortcut: {
                  key: "R",
                  modifiers: ["ctrl"],
                  label: "ctrl R",
                },
              },
              "separator",
              {
                label: "Fold",
                onClick: () => {
                  if (editorRef.current) {
                    editorRef.current.trigger(
                      "myapp",
                      "editor.fold",
                      {}
                    );
                  }
                },
              },
              {
                label: "Unfold",
                onClick: () => {
                  if (editorRef.current) {
                    editorRef.current.trigger(
                      "myapp",
                      "editor.unfold",
                      {}
                    );
                  }
                },
              },
              "separator",
              {
                label: "Find",
                onClick: () => {
                  if (editorRef.current) {
                    editorRef.current.trigger(
                      "myapp",
                      "actions.find",
                      {}
                    );
                  }
                },
              },
              {
                label: "Replace",
                onClick: () => {
                  if (editorRef.current) {
                    editorRef.current.trigger(
                      "myapp",
                      "editor.action.startFindReplaceAction",
                      {}
                    );
                  }
                },
              },
            ],
          },
        ]}
      />
      <ConfirmDialog
        open={deleteOpen}
        setOpen={setDeleteOpen}
        title="Delete file"
        description="Are you sure you want to delete this file?"
        onConfirm={() => {
          deleteFile(parsePath(path!));
          if (win) removeWindow(win);
        }}
        confirmText="Delete file"
        confirmColor="crimson"
      />
      <SaveAsDialog
        open={createDialogOpen}
        setOpen={setCreateDialogOpen}
        onPathCreate={createFile}
      />
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
