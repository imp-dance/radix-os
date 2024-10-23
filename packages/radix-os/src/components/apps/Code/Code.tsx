import Editor from "@monaco-editor/react";
import { Flex } from "@radix-ui/themes";
import { useRef, useState } from "react";
import {
  useCreateFileMutation,
  useFileSystemQuery,
  useRemoveFileMutation,
  useUpdateFileMutation,
} from "../../../api/fs/fs-api";
import { useUntypedAppContext } from "../../../services/applications/launcher";
import {
  getParentPath,
  parsePath,
  pathToName,
} from "../../../services/fs/tree-helpers";
import { FsFile } from "../../../stores/fs";
import { useSettingsStore } from "../../../stores/settings";
import {
  RadixOsAppComponent,
  useWindowStore,
} from "../../../stores/window";
import { ConfirmDialog } from "../../ConfirmDialog/ConfirmDialog";
import { MenuBar } from "../../MenuBar/MenuBar";
import { OpenFileDialog } from "../../OpenFileDialog/OpenFileDialog";
import { SaveAsDialog } from "../../SaveAsDialog/SaveAsDialog";

type EditorType = Parameters<
  NonNullable<Parameters<typeof Editor>[0]["onMount"]>
>[0];

export const CodeApp: RadixOsAppComponent = (props) => {
  const [openedFile, setOpenedFile] = useState<null | {
    file: FsFile;
    path: string;
  }>(null);
  const { launch } = useUntypedAppContext();
  const [createdFile, setCreatedFile] = useState<FsFile | null>(
    null
  );
  const [createdPath, setCreatedPath] = useState<string | null>(
    null
  );
  const [openDialogOpen, setOpenDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] =
    useState(false);
  const file =
    openedFile?.file ?? props.file?.file ?? createdFile;
  const path =
    openedFile?.path ?? props.file?.path ?? createdPath;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [value, setValue] = useState(file?.data ?? "");
  const editorRef = useRef<EditorType | null>(null);
  const theme = useSettingsStore((s) => s.theme);
  const updateFileMutation = useUpdateFileMutation();
  const createFileMutation = useCreateFileMutation();
  const deleteFileMutation = useRemoveFileMutation();
  const nodeQuery = useFileSystemQuery(path ?? "");
  const windows = useWindowStore((s) => s.windows);
  const win = windows.find(
    (win) => win.id === props.appWindow.id
  );
  const removeWindow = useWindowStore((s) => s.removeWindow);
  const node =
    path && nodeQuery.isSuccess ? nodeQuery.data : null;
  const touched = node
    ? node && "data" in node && node.data !== value
    : value !== "";

  const requestSave = () => {
    if (path) {
      return updateFileMutation.mutate({
        path,
        file: { data: value },
      });
    }
    setCreateDialogOpen(true);
  };

  const createFile = async (path: string) => {
    const parent = getParentPath(path);
    const name = pathToName(path);
    await createFileMutation.mutateAsync({
      path: parent,
      file: {
        name,
        data: value,
      },
    });
    const winState = useWindowStore.getState();
    const winObj = winState.windows.find(
      (w) => w.id === props.appWindow.id
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
      {openDialogOpen && (
        <OpenFileDialog
          open
          setOpen={setOpenDialogOpen}
          onFileOpened={(file, path) => {
            setOpenedFile({ file, path });
            setValue(file.data);
          }}
          fileDisabled={(file) =>
            !file.launcher.includes("code")
          }
        />
      )}
      <MenuBar
        windowId={props.appWindow.id}
        menu={[
          {
            label: "File",
            color: touched ? "grass" : "gray",
            options: [
              {
                label: "New file",
                onClick: () => {
                  launch("code");
                },
                shortcut: {
                  key: "N",
                  modifiers: ["ctrl"],
                  label: "ctrl N",
                },
              },
              {
                label: "Open file",
                onClick: () => {
                  setOpenDialogOpen(true);
                },
                shortcut: {
                  key: "O",
                  modifiers: ["ctrl"],
                  label: "ctrl O",
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
                color: touched ? "grass" : "gray",
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
        onConfirm={async () => {
          await deleteFileMutation.mutateAsync(parsePath(path!));
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
        className="rxos-editor"
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
};
