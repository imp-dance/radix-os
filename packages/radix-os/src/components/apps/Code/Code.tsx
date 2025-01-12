import Editor from "@monaco-editor/react";
import {
  Button,
  Card,
  Flex,
  Heading,
  Link,
  Text,
} from "@radix-ui/themes";
import {
  CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
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
import { MenuBar, MenubarMenu } from "../../MenuBar/MenuBar";
import { OpenFileDialog } from "../../OpenFileDialog/OpenFileDialog";
import { SaveAsDialog } from "../../SaveAsDialog/SaveAsDialog";

type EditorType = Parameters<
  NonNullable<Parameters<typeof Editor>[0]["onMount"]>
>[0];

type CodeAppView = "editor" | "home";

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
  const [currentView, setCurrentView] = useState<CodeAppView>(
    path ? "editor" : "home"
  );
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
    });
  };

  useEffect(() => {
    const winState = useWindowStore.getState();
    const winObj = winState.windows.find(
      (w) => w.id === props.appWindow.id
    );
    if (winObj) {
      if (path) {
        winState.setTitle(winObj, pathToName(path));
      } else if (currentView === "home") {
        winState.setTitle(winObj, "Code");
      } else if (currentView === "editor") {
        winState.setTitle(winObj, "Code - New file");
      }
    }
  }, [currentView]);

  return (
    <Flex
      direction="column"
      style={{
        height: "100%",
        maxWidth: "calc(100% - 0.5px)",
        overflow: "hidden",
      }}
    >
      {currentView === "editor" && (
        <>
          <MenuBar
            windowId={props.appWindow.id}
            menu={createMenu({
              touched,
              path,
              launch,
              value,
              editor: editorRef.current,
              onDeleteFile: () => setDeleteOpen(true),
              onNewFile: () => launch("code"),
              onOpenFile: () => setOpenDialogOpen(true),
              onSaveFile: () => requestSave(),
            })}
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
        </>
      )}
      {currentView === "home" && (
        <Flex
          align="center"
          width="100%"
          height="100%"
          justify="center"
          direction="column"
        >
          <Card
            variant="surface"
            size="3"
            style={
              {
                "--card-background-color": "var(--gray-a2)",
              } as CSSProperties
            }
          >
            <Flex direction="column" gap="1">
              <Heading size="5">Code for Radix OS</Heading>
              <Text size="1" color="gray" mb="3">
                Made using Microsoft's{" "}
                <Link
                  href="https://microsoft.github.io/monaco-editor/"
                  target="_blank"
                >
                  Monaco Editor
                </Link>
              </Text>
              <Flex direction="column" gap="2">
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "var(--space-4)",
                  }}
                >
                  <li>
                    {" "}
                    <div>
                      <Button
                        variant="ghost"
                        ml="2"
                        mb="2"
                        onClick={() => setCurrentView("editor")}
                      >
                        Create a new file
                      </Button>
                    </div>
                  </li>
                  <li>
                    <div>
                      <Button
                        color="gray"
                        ml="2"
                        mb="2"
                        variant="ghost"
                        onClick={() => setOpenDialogOpen(true)}
                      >
                        Open an existing file
                      </Button>
                    </div>
                  </li>
                </ul>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      )}
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
      {openDialogOpen && (
        <OpenFileDialog
          open
          setOpen={setOpenDialogOpen}
          onFileOpened={(file, path) => {
            setOpenedFile({ file, path });
            setValue(file.data);
            setCurrentView("editor");
            const winState = useWindowStore.getState();
            const winObj = winState.windows.find(
              (w) => w.id === props.appWindow.id
            );
            if (winObj) {
              winState.setTitle(
                winObj,
                `Code - ${pathToName(path)}`
              );
            }
          }}
          fileDisabled={(file) =>
            !file.launcher.includes("code")
          }
        />
      )}
    </Flex>
  );
};

const createMenu = (args: {
  onOpenFile: () => void;
  onSaveFile: () => void;
  onNewFile: () => void;
  onDeleteFile: () => void;
  launch: (appName: string) => void;
  touched: boolean;
  editor: EditorType | null;
  path: string | null;
  value: string;
}): MenubarMenu => {
  return [
    {
      label: "File",
      color: args.touched ? "grass" : "gray",
      options: [
        {
          label: "New file",
          onClick: args.onNewFile,
          shortcut: {
            key: "N",
            modifiers: ["ctrl"],
            label: "ctrl N",
          },
        },
        {
          label: "Open file",
          onClick: args.onOpenFile,
          shortcut: {
            key: "O",
            modifiers: ["ctrl"],
            label: "ctrl O",
          },
        },
        {
          label: "Save",
          onClick: args.onSaveFile,
          disabled: !args.touched,
          shortcut: {
            key: "S",
            modifiers: ["ctrl"],
            label: "ctrl S",
            dependency: args.value,
          },
          color: args.touched ? "grass" : "gray",
        },
        "separator",
        {
          label: "Delete",
          onClick: args.onDeleteFile,
          color: "red",
          disabled: !args.path,
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
            if (args.editor) {
              args.editor.trigger("myapp", "undo", {});
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
            if (args.editor) {
              args.editor.trigger("myapp", "redo", {});
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
            if (args.editor) {
              args.editor.trigger("myapp", "editor.fold", {});
            }
          },
        },
        {
          label: "Unfold",
          onClick: () => {
            if (args.editor) {
              args.editor.trigger("myapp", "editor.unfold", {});
            }
          },
        },
        "separator",
        {
          label: "Find",
          onClick: () => {
            if (args.editor) {
              args.editor.trigger("myapp", "actions.find", {});
            }
          },
        },
        {
          label: "Replace",
          onClick: () => {
            if (args.editor) {
              args.editor.trigger(
                "myapp",
                "editor.action.startFindReplaceAction",
                {}
              );
            }
          },
        },
      ],
    },
  ];
};
