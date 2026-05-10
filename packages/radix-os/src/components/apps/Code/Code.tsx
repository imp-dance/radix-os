import Editor, { Monaco } from "@monaco-editor/react";
import { Cross1Icon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Link,
  ScrollArea,
  Text,
} from "@radix-ui/themes";
import {
  CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import { Explorer } from "../../..";
import {
  useCreateFileMutation,
  useFileSystemQuery,
  useRemoveFileMutation,
  useUpdateFileMutation,
} from "../../../api/fs/fs-api";
import { useKeydown } from "../../../hooks/useKeyboard";
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
import { useToast } from "../../Toast/Toast";

type EditorType = Parameters<
  NonNullable<Parameters<typeof Editor>[0]["onMount"]>
>[0];

type CodeAppView = "editor" | "home";

type ViewOpts = {
  minimap: boolean;
  foldingControls: boolean;
  explorer: boolean;
};

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
  const path =
    openedFile?.path ?? props.file?.path ?? createdPath;
  const [viewOpts, setViewOpts] = useState<ViewOpts>({
    minimap: false,
    foldingControls: true,
    explorer: true,
  });
  const [currentLanguage, setCurrentLanguage] = useState("html");
  const [monacoLanguages, setMonacoLanguages] = useState<
    {
      id: string;
      name: string;
      extensions?: string[];
    }[]
  >([]);
  const [currentView, setCurrentView] = useState<CodeAppView>(
    path ? "editor" : "home"
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [tabs, setTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(
    null
  );
  const [values, setValues] = useState<
    Record<string, [string, boolean]>
  >({});
  const hasOpenedRef = useRef(false);
  const editorRef = useRef<EditorType | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const theme = useSettingsStore((s) => s.theme);
  const updateFileMutation = useUpdateFileMutation({
    onSuccess: () => {
      if (activeTab) {
        toast({
          title: `"${pathToName(activeTab)}" saved`,
          type: "background",
          dismissText: null,
          duration: 1500,
        });
        setValue(activeTab, getValue(activeTab), false);
      }
    },
  });
  const createFileMutation = useCreateFileMutation();
  const deleteFileMutation = useRemoveFileMutation();
  const { toast } = useToast();
  const nodeQuery = useFileSystemQuery(activeTab ?? "");
  const windows = useWindowStore((s) => s.windows);
  const win = windows.find(
    (win) => win.id === props.appWindow.id
  );
  const removeWindow = useWindowStore((s) => s.removeWindow);
  const node =
    path && nodeQuery.isSuccess ? nodeQuery.data : null;

  const getValue = (path: string | null) => {
    if (!path) return "";
    return values[path]?.[0] ?? "";
  };

  const getTouched = (path: string | null) => {
    if (!path) return false;
    return values[path]?.[1] ?? false;
  };

  const setValue = (
    path: string | null,
    value: string,
    touched?: boolean
  ) => {
    if (!path) return;
    setValues((p) => ({
      ...p,
      [path]: [
        value,
        touched ?? (path in p ? p[path][1] : false),
      ],
    }));
  };

  const touched =
    activeTab && node
      ? node &&
        "data" in node &&
        node.data !== getValue(activeTab)
      : getValue("__new") !== "";

  const requestSave = () => {
    if (activeTab) {
      updateFileMutation.mutate({
        path: activeTab,
        file: { data: getValue(activeTab) },
      });
      return;
    }
    setCreateDialogOpen(true);
  };

  const setLanguage = (lang: string) => {
    if (monacoRef.current && editorRef.current) {
      monacoRef.current.editor.setModelLanguage(
        editorRef.current.getModel()!,
        lang
      );
      setCurrentLanguage(lang);
    }
  };

  const createFile = async (path: string) => {
    const parent = getParentPath(path);
    const name = pathToName(path);
    await createFileMutation.mutateAsync({
      path: parent,
      file: {
        name,
        data: getValue("__new"),
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
      data: getValue("__new"),
      launcher: ["code"],
      name: pathToName(path),
    });
    const extension = path.split(".").pop();
    const lang = monacoLanguages.find((l) =>
      l.extensions?.includes(`.${extension}`)
    );
    openFile(
      {
        data: getValue("__new"),
        launcher: ["code"],
        name: pathToName(path),
      },
      path
    );
  };

  const openFile = (file: FsFile, path: string) => {
    setOpenedFile({ file, path });
    if (!tabs.includes(path)) {
      setValue(path, file.data);
    }
    setCurrentView("editor");
    const winState = useWindowStore.getState();
    const winObj = winState.windows.find(
      (w) => w.id === props.appWindow.id
    );
    if (winObj) {
      winState.setTitle(winObj, `Code - ${pathToName(path)}`);
    }
    if (!tabs.includes(path)) {
      setTabs((p) => [...p, path]);
    }
    setActiveTab(path);
  };

  useEffect(() => {
    if (
      props.file?.path &&
      !tabs.includes(props.file.path) &&
      !hasOpenedRef.current
    ) {
      openFile(props.file.file, props.file.path);
      hasOpenedRef.current = true;
    }
  }, [props.file?.path, openedFile?.path]);

  useEffect(() => {
    const winState = useWindowStore.getState();
    const winObj = winState.windows.find(
      (w) => w.id === props.appWindow.id
    );
    if (winObj) {
      if (activeTab) {
        winState.setTitle(winObj, pathToName(activeTab));
      } else if (currentView === "home") {
        winState.setTitle(winObj, "Code");
      } else if (currentView === "editor") {
        winState.setTitle(winObj, "Code - New file");
      }
    }
  }, [currentView, activeTab]);

  useKeydown({
    key: "w",
    ctrlKey: true,
    disabled: tabs.length === 0 || activeTab === null,
    callback: () => {
      if (!activeTab) return;
      const index = tabs.indexOf(activeTab);
      setTabs((p) => p.filter((v) => v !== activeTab));
      if (tabs[index + 1]) setActiveTab(tabs[index + 1]);
      else if (tabs[index - 1]) setActiveTab(tabs[index - 1]);
      else setActiveTab(null);
    },
    windowId: props.appWindow.id,
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
      {currentView === "editor" && (
        <>
          <Box
            style={{
              borderBottom: "1px solid var(--gray-a4)",
            }}
          >
            <MenuBar
              windowId={props.appWindow.id}
              menu={createMenu({
                touched,
                path,
                launch,
                value: getValue(activeTab ?? "__new"),
                languages: monacoLanguages,
                editor: editorRef.current,
                onDeleteFile: () => setDeleteOpen(true),
                onNewFile: () => launch("code"),
                onOpenFile: () => setOpenDialogOpen(true),
                onSaveFile: () => requestSave(),
                onSetLanguage: setLanguage,
                currentLanguage,
                setViewOpts,
                viewOpts,
              })}
            />
          </Box>
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
          <Flex dir="row" height="100%">
            {viewOpts.explorer ? (
              <Box
                pl="3"
                ml="3"
                style={{
                  width: 220,
                  minWidth: 220,
                  maxWidth: 220,
                  flexShrink: 0,
                  flexGrow: 0,
                }}
                height="100%"
              >
                <Explorer
                  hideFavourites
                  onRequestOpenFile={(file, path) => {
                    openFile(file, path);
                  }}
                  initialPath={
                    path ? getParentPath(path) : undefined
                  }
                />
              </Box>
            ) : null}{" "}
            <Box
              height="100%"
              width="100%"
              style={{
                borderLeft: "1px solid var(--gray-a4)",
              }}
            >
              <Box>
                <ScrollArea
                  type="hover"
                  scrollbars="horizontal"
                  size="1"
                >
                  <Flex justify="start" align="end" pb="1">
                    {tabs.length === 0 ? (
                      <Button
                        variant={"ghost"}
                        size="1"
                        style={{
                          borderRadius: 0,
                          borderBottom: "0px solid transparent",
                          margin: 0,
                        }}
                      >
                        New file
                      </Button>
                    ) : null}
                    {tabs.map((tab) => (
                      <Button
                        variant={
                          tab === activeTab ? "ghost" : "ghost"
                        }
                        color={
                          getTouched(tab)
                            ? "green"
                            : tab === activeTab
                            ? undefined
                            : "gray"
                        }
                        size="1"
                        onClick={() => setActiveTab(tab)}
                        style={{
                          borderRadius: 0,
                          borderBottom: "0px solid transparent",
                          margin: 0,
                        }}
                        title={tab}
                      >
                        {getTouched(tab) ? "· " : null}
                        {tab.split("/").pop() || "New file"}
                        <Button
                          size="1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTabs((p) =>
                              p.filter((v) => v !== tab)
                            );
                            setValues((p) => {
                              const newValues = { ...p };
                              delete newValues[tab];
                              return newValues;
                            });
                            if (openedFile?.path === tab) {
                              setOpenedFile(null);
                            }
                            if (activeTab === tab) {
                              const index = tabs.indexOf(tab);
                              if (tabs[index + 1])
                                setActiveTab(tabs[index + 1]);
                              else if (tabs[index - 1])
                                setActiveTab(tabs[index - 1]);
                              else setActiveTab(null);
                            }
                          }}
                          variant="ghost"
                          style={{
                            marginLeft: 0,
                            borderRadius: 0,
                            height: "100%",
                          }}
                        >
                          <Cross1Icon
                            style={{
                              width: "1em",
                              height: "1em",
                            }}
                          />
                        </Button>
                      </Button>
                    ))}
                  </Flex>
                </ScrollArea>
              </Box>

              <EditorInstance
                key={activeTab}
                fileExtension={
                  activeTab
                    ? activeTab.split(".").pop()
                    : undefined
                }
                value={getValue(activeTab ?? "__new")}
                setValue={(v) =>
                  setValue(
                    activeTab ?? "__new",
                    v,
                    v !==
                      (node && "data" in node ? node.data : "")
                  )
                }
                active
                viewOpts={viewOpts}
                language={currentLanguage}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                  monacoRef.current = monaco;
                  const langs =
                    monaco.languages.getLanguages() as {
                      id: string;
                      aliases: string[];
                      extensions?: string[];
                    }[];
                  setMonacoLanguages(
                    langs.map((lang) => ({
                      id: lang.id,
                      name: lang.aliases?.[0] || lang.id,
                      extensions: lang.extensions,
                    }))
                  );
                  if (activeTab) {
                    const extension = activeTab.split(".").pop();
                    const lang = langs.find((l) =>
                      l.extensions?.includes(`.${extension}`)
                    );
                    if (lang) {
                      setLanguage(lang.id);
                    } else {
                      setLanguage("plaintext");
                    }
                  }
                }}
              />
            </Box>
          </Flex>
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
            openFile(file, path);
          }}
          fileDisabled={(file) =>
            !file.launcher.includes("code")
          }
        />
      )}
    </Flex>
  );
};

function EditorInstance(props: {
  viewOpts: ViewOpts;
  value: string;
  setValue: (v: string) => void;
  active: boolean;
  fileExtension?: string;
  onMount?: (editor: EditorType, monaco: Monaco) => void;
  language?: string;
}) {
  const { viewOpts } = props;
  const editorRef = useRef<EditorType | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const theme = useSettingsStore((s) => s.theme);

  if (!props.active) return null;

  return (
    <>
      <div
        style={{
          height: "var(--space-3)",
          background: theme === "dark" ? "#1e1e1e" : "#fff",
        }}
      />
      <Editor
        key={props.language}
        height="calc(100% - 2.9rem)"
        width="calc(100% - 8px)"
        className="rxos-editor"
        theme={theme === "dark" ? "vs-dark" : "light"}
        defaultLanguage={props.language ?? "html"}
        language={props.language}
        defaultValue={props.value}
        wrapperProps={{
          "data-returnfocus": true,
        }}
        value={props.value}
        onChange={(v) => props.setValue(v ?? "")}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          monacoRef.current = monaco;
          props.onMount?.(editor, monaco);
        }}
        options={{
          automaticLayout: true,
          minimap: { enabled: viewOpts.minimap },
          showFoldingControls: viewOpts.foldingControls
            ? "mouseover"
            : "never",
        }}
      />
    </>
  );
}

const createMenu = (args: {
  onOpenFile: () => void;
  onSaveFile: () => void;
  onNewFile: () => void;
  onDeleteFile: () => void;
  onSetLanguage: (lang: string) => void;
  launch: (appName: string) => void;
  touched: boolean;
  editor: EditorType | null;
  path: string | null;
  value: string;
  languages: { id: string; name: string }[];
  currentLanguage: string;
  viewOpts: ViewOpts;
  setViewOpts: (opts: ViewOpts) => void;
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
    {
      label: "View",
      color: "gray",
      options: [
        {
          label: "Explorer",
          onClick: () =>
            args.setViewOpts({
              ...args.viewOpts,
              explorer: !args.viewOpts.explorer,
            }),
          shortcut: args.viewOpts.explorer
            ? {
                key: "",
                label: "✓",
                modifiers: [],
              }
            : undefined,
        },
        {
          label: "Minimap",
          onClick: () =>
            args.setViewOpts({
              ...args.viewOpts,
              minimap: !args.viewOpts.minimap,
            }),
          shortcut: args.viewOpts.minimap
            ? {
                key: "",
                label: "✓",
                modifiers: [],
              }
            : undefined,
        },
        {
          label: "Folding controls",
          onClick: () =>
            args.setViewOpts({
              ...args.viewOpts,
              foldingControls: !args.viewOpts.foldingControls,
            }),
          shortcut: args.viewOpts.foldingControls
            ? {
                key: "",
                label: "✓",
                modifiers: [],
              }
            : undefined,
        },
      ],
    },
    {
      label:
        args.languages.find((l) => l.id === args.currentLanguage)
          ?.name || "Language",
      color: "gray",
      options: args.languages.map((lang) => ({
        label: lang.name,
        onClick: () => {
          args.onSetLanguage(lang.id);
        },
        disabled: lang.id === args.currentLanguage,
        shortcut:
          lang.id === args.currentLanguage
            ? {
                label: "✓",
                key: "Æ",
                modifiers: [],
              }
            : undefined,
      })),
    },
  ];
};
