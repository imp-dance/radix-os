import {
  CollisionDetection,
  DndContext,
  DragOverlay,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor
} from "@dnd-kit/core";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CameraIcon,
  CardStackIcon,
  CaretRightIcon,
  CodeIcon,
  Cross1Icon,
  FileIcon,
  GlobeIcon,
  StarIcon
} from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Code,
  ContextMenu,
  Dialog,
  Flex,
  Select,
  Spinner,
  Text,
  TextField
} from "@radix-ui/themes";
import React, {
  ReactNode,
  useEffect,
  useRef,
  useState
} from "react";
import {
  useCreateDirMutation,
  useCreateFileMutation,
  useFileSystemQuery,
  useMoveMutation,
  useRemoveFileMutation,
  useUpdateFileMutation
} from "../../../api/fs/fs-api";
import { useUntypedAppContext } from "../../../services/applications/launcher";
import {
  isFile,
  isFolder,
  parsePath
} from "../../../services/fs/tree-helpers";
import { useFavouriteFolderStore } from "../../../stores/explorer";
import { FsFile, FsNode, Launcher } from "../../../stores/fs";
import {
  RadixOsApp,
  RadixOsAppComponent,
  useWindowStore
} from "../../../stores/window";
import { useQueryClient } from "@tanstack/react-query";
import { useFileDrop } from "../../../hooks/useFileDrop";
import { createFile } from "../../../services/fs/upload";
import { useFs } from "../../../services/fs/fs-integration";

export const ExplorerApp: RadixOsAppComponent = (props) => (
  <Explorer
    windowId={props.appWindow.id}
    initialPath={props.file?.file?.data}
  />
);

export function Explorer({
  initialPath = "",
  windowId,
  onPathChange,
  disableFiles,
  fileDisabled,
  onRequestOpenFile
}: {
  initialPath?: string;
  windowId?: symbol;
  onPathChange?: (path: string) => void;
  disableFiles?: boolean;
  fileDisabled?: (file: FsFile) => boolean;
  onRequestOpenFile?: (file: FsFile, path: string) => void;
}) {
  const { openFile } = useUntypedAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10
    }
  });
  const [isDragging, setIsDragging] = useState<false | string>(
    false
  );
  const fs = useFs();
  const prevSelected = useRef<string>("");
  const windows = useWindowStore((s) => s.windows);
  const window = windows.find((w) => w.id === windowId);
  const [selected, setSelected] = useState<string[]>([]);
  const [createFolderOpen, setCreateFolderOpen] =
    useState(false);
  const [createFileOpen, setCreateFileOpen] = useState(false);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(
    "asc"
  );
  const [renameFileOpen, setRenameFileOpen] = useState(false);
  const [renamingNode, setRenamingNode] = useState<string>("");
  const treeQuery = useFileSystemQuery("");
  const tree = treeQuery.data ?? null;
  const favourites = useFavouriteFolderStore(
    (s) => s.favouriteFolders
  );
  const { finishDrop, isDroppingFile } = useFileDrop(
    containerRef.current
  );

  const moveMutation = useMoveMutation();
  const queryClient = useQueryClient();
  const [path, _setPath] = useState(initialPath);

  const steps = path.split("/").filter(Boolean);
  const currentFolder = steps.reduce((acc, step) => {
    if (!acc || !("children" in acc)) return acc as FsNode;
    return acc.children.find((c) => c.name === step)!;
  }, tree as FsNode);

  const sortedChildren = (() => {
    if (!currentFolder) return [];
    if (!isFolder(currentFolder)) return [];
    return [...currentFolder.children].sort((a, b) =>
      sortDir === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
  })();

  const setPath = (
    newPath: string | ((prev: string) => string)
  ) => {
    _setPath(newPath);
    setSelected([]);
    const nextValue =
      typeof newPath === "string" ? newPath : newPath(path);
    onPathChange?.(nextValue);
  };

  return (
    <DndContext
      sensors={[mouseSensor]}
      collisionDetection={pointerWithinPlus}
      onDragEnd={(event) => {
        let active = event.active.id.toString();
        let over = event.over?.id.toString();
        while (active.startsWith(":")) {
          active = active.substring(1);
        }
        setIsDragging(false);
        if (!over) return;
        while (over.startsWith(":")) {
          over = over.substring(1);
        }
        if (parsePath(active) === parsePath(over)) return;
        if (selected.length > 1) {
          Promise.all(
            selected.map((s) =>
              moveMutation.mutateAsync({
                fromPath: s,
                toPath: over
              })
            )
          );
        } else {
          moveMutation.mutateAsync({
            fromPath: active,
            toPath: over
          });
        }
      }}
      onDragStart={(event) => {
        setIsDragging(event.active.id.toString());
      }}
    >
      <Flex
        gap="3"
        style={{ height: "100%", position: "relative" }}
        ref={containerRef}
      >
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
            onDrop={async (e) => {
              finishDrop();
              try {
                const file = await createFile(
                  e.dataTransfer.files[0]
                );
                await fs.makeFile(path, file).then(() => {
                  queryClient.invalidateQueries({
                    predicate: (r) => r.queryKey.includes("fs")
                  });
                });
              } catch (e) {
                console.log(e);
              }
            }}
            pt="5"
          >
            <div style={{ margin: "auto" }}>
              <Text size="4" weight="bold">
                Upload to directory
              </Text>
            </div>
          </Flex>
        )}
        <CreateFolderDialog
          open={createFolderOpen}
          onOpenChange={setCreateFolderOpen}
          path={path}
        />
        <CreateFileDialog
          open={createFileOpen}
          onOpenChange={setCreateFileOpen}
          path={path}
        />
        <RenameFileDialog
          open={renameFileOpen}
          onOpenChange={setRenameFileOpen}
          path={renamingNode}
        />
        <Flex
          direction="column"
          gap="2"
          style={{
            width: 200,
            borderRight: "1px solid var(--gray-5)",
            height: "100%"
          }}
          p="2"
          pr="4"
        >
          {favourites.map((favourite) => (
            <FavouriteItem
              key={
                favourite +
                (isDragging === favourite ||
                (isDragging !== false &&
                  selected.find(
                    (s) => parsePath(s) === parsePath(favourite)
                  ))
                  ? true
                  : false)
              }
              favourite={favourite}
              onClick={() => setPath(parsePath(favourite))}
              disabled={
                isDragging === favourite ||
                (isDragging !== false &&
                  selected.find(
                    (s) => parsePath(s) === parsePath(favourite)
                  ))
                  ? true
                  : false
              }
              onRename={() => {
                setRenamingNode(favourite);
                setRenameFileOpen(true);
              }}
            />
          ))}
        </Flex>
        <ContextMenu.Root key={path}>
          <ContextMenu.Trigger>
            <div
              style={{
                height: "100%",
                width: "100%"
              }}
              onClick={() => setSelected([])}
            >
              <Flex
                style={{ width: "100%" }}
                direction="column"
                pr="2"
                pt="2"
              >
                <Flex
                  gap="1"
                  mb="3"
                  align="center"
                  height="24px"
                >
                  <Step
                    path={""}
                    name="Home"
                    isCurrent={steps.length === 0}
                    onClick={() => setPath("")}
                  />
                  {steps.map((_, i) => (
                    <React.Fragment key={i}>
                      <CaretRightIcon color="gray" />
                      <Step
                        key={i}
                        path={steps.slice(0, i + 1).join("/")}
                        isCurrent={i === steps.length - 1}
                        onClick={() =>
                          setPath(
                            steps.slice(0, i + 1).join("/")
                          )
                        }
                      />
                    </React.Fragment>
                  ))}
                  {treeQuery.isFetching ? (
                    <Spinner size="1" ml="auto" />
                  ) : null}
                  <Button
                    onClick={() =>
                      setSortDir((p) =>
                        p === "asc"
                          ? "desc"
                          : p === "desc"
                            ? null
                            : "asc"
                      )
                    }
                    variant="ghost"
                    color={sortDir === null ? "gray" : undefined}
                    size="2"
                    ml={treeQuery.isFetching ? "3" : "auto"}
                    mr="2"
                    style={{
                      display: "block",
                      marginLeft: treeQuery.isFetching
                        ? undefined
                        : "auto",
                      marginTop: treeQuery.isFetching
                        ? "calc(var(--space-2) * -1)"
                        : "calc(var(--space-1) * -1)"
                    }}
                  >
                    {sortDir === "asc" ? (
                      <ArrowDownIcon
                        style={{
                          width: "0.875em",
                          height: "0.875em"
                        }}
                      />
                    ) : (
                      <ArrowUpIcon
                        style={{
                          width: "0.875em",
                          height: "0.875em"
                        }}
                      />
                    )}
                  </Button>
                </Flex>

                <Flex gap="3" direction="column">
                  <DragOverlay
                    adjustScale={false}
                    wrapperElement="div"
                    style={{
                      pointerEvents: "none"
                    }}
                  >
                    <Box
                      p="1"
                      px="2"
                      style={{
                        background: "var(--gray-1)",
                        cursor: "default",
                        pointerEvents: "none",
                        width: "max-content",
                        transform: `translate(-${(window?.x ?? 0) + 0}px, -${(window?.y ?? 0) + 22}px)`,
                        borderRadius: "var(--radius-2)",
                        opacity: 0.8
                      }}
                    >
                      <Text size="1" color="gray">
                        Moving {selected.length || 1} item
                        {selected.length !== 1 ? "s" : ""}{" "}
                      </Text>
                    </Box>
                  </DragOverlay>
                  {currentFolder && isFolder(currentFolder)
                    ? sortedChildren.map((child, i) => {
                        const isDisabled =
                          (disableFiles && isFile(child)) ||
                          (isFile(child) &&
                            fileDisabled?.(child));
                        let draggedChild = null;
                        if (isDragging) {
                          const split = isDragging.split("/");
                          draggedChild = split[split.length - 1];
                        }

                        const itemIsBeingDragged =
                          (selected.length > 1 &&
                            selected.includes(
                              `${path}/${child.name}`
                            ) &&
                            isDragging !== false) ||
                          draggedChild === child.name;
                        return (
                          <ExplorerItem
                            key={child.name}
                            disabled={isDisabled}
                            item={child}
                            path={`${path}/${child.name}`}
                            selected={selected}
                            isDragging={itemIsBeingDragged}
                            hidden={
                              itemIsBeingDragged &&
                              selected.length > 1
                            }
                            onSelect={({
                              shiftKey,
                              metaKey
                            }) => {
                              if (
                                onRequestOpenFile &&
                                isFile(child)
                              ) {
                                setSelected([
                                  `${path}/${child.name}`
                                ]);
                                return onRequestOpenFile(
                                  child,
                                  `${path}/${child.name}`
                                );
                              }
                              setSelected((prev) => {
                                if (shiftKey) {
                                  const start =
                                    prevSelected.current ||
                                    `${path}/${child.name}`;
                                  const end = `${path}/${child.name}`;
                                  const startIdx =
                                    sortedChildren.findIndex(
                                      (c) =>
                                        c.name ===
                                        start.split("/").pop()
                                    );
                                  const endIdx =
                                    sortedChildren.findIndex(
                                      (c) =>
                                        c.name ===
                                        end.split("/").pop()
                                    );
                                  const [a, b] =
                                    startIdx < endIdx
                                      ? [startIdx, endIdx]
                                      : [endIdx, startIdx];
                                  return sortedChildren
                                    .slice(a, b + 1)
                                    .map(
                                      (c) => `${path}/${c.name}`
                                    );
                                } else if (metaKey) {
                                  return prev.includes(
                                    `${path}/${child.name}`
                                  )
                                    ? prev.filter(
                                        (p) =>
                                          p !==
                                          `${path}/${child.name}`
                                      )
                                    : [
                                        ...prev,
                                        `${path}/${child.name}`
                                      ];
                                } else {
                                  prevSelected.current = `${path}/${child.name}`;
                                  return [
                                    `${path}/${child.name}`
                                  ];
                                }
                              });
                            }}
                            onClick={(e) => {
                              if (isFolder(child)) {
                                setPath(
                                  (prev) =>
                                    `${prev}/${child.name}`
                                );
                              } else if (isFile(child)) {
                                e.stopPropagation();
                                if (onRequestOpenFile) {
                                  onRequestOpenFile(
                                    child,
                                    `${path}/${child.name}`
                                  );
                                } else {
                                  openFile({
                                    file: child,
                                    path: `${path}/${child.name}`
                                  });
                                }
                              }
                            }}
                            returnFocus={i === 0 ? true : false}
                            onRename={() => {
                              setRenamingNode(
                                `${path}/${child.name}`
                              );
                              setRenameFileOpen(true);
                            }}
                          />
                        );
                      })
                    : null}
                </Flex>
              </Flex>
            </div>
          </ContextMenu.Trigger>

          <ContextMenu.Content size="1">
            <ContextMenu.Item
              onClick={() => setCreateFolderOpen(true)}
            >
              Create folder
            </ContextMenu.Item>
            <ContextMenu.Item
              onClick={() => setCreateFileOpen(true)}
            >
              Create file
            </ContextMenu.Item>
            <ContextMenu.Item
              onClick={(e) => {
                e.stopPropagation();
                openFile({
                  file: {
                    data: path,
                    launcher: ["terminal"],
                    name: path
                  },
                  path
                });
              }}
            >
              Open in terminal
            </ContextMenu.Item>

            <ContextMenu.Item
              onClick={(e) => {
                e.stopPropagation();
                treeQuery.refetch();
              }}
            >
              Reload
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Root>
      </Flex>
    </DndContext>
  );
}

function FavouriteItem(props: {
  favourite: string;
  onClick: () => void;
  onRename: () => void;
  disabled?: boolean;
}) {
  const favQuery = useFileSystemQuery(props.favourite);
  const deleteMutation = useRemoveFileMutation();
  const removeFolderFromFavourites = useFavouriteFolderStore(
    (s) => s.removeFolderFromFavourites
  );
  const favouriteNode = favQuery.data ?? null;
  const droppable = useDroppable({
    id: ":" + removeStartingSlash(props.favourite),
    disabled: props.disabled
  });

  useEffect(() => {
    if (favQuery.isError) {
      removeFolderFromFavourites(props.favourite);
    }
  }, [favQuery.isError]);

  if (!favouriteNode) return null;
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Button
          style={{
            justifyContent: "flex-start",
            paddingInline: "var(--space-4)",
            cursor: props.disabled ? "not-allowed" : undefined
          }}
          variant="ghost"
          size="1"
          color={
            droppable.isOver && !props.disabled
              ? "indigo"
              : "gray"
          }
          ml="1"
          onClick={() => props.onClick()}
          ref={droppable.setNodeRef}
        >
          {favouriteNode.name ?? props.favourite}
        </Button>
      </ContextMenu.Trigger>
      <ContextMenu.Content size="1">
        <ContextMenu.Item
          onClick={() => {
            props.onClick();
          }}
        >
          Open
        </ContextMenu.Item>
        <ContextMenu.Item onClick={props.onRename}>
          Rename
        </ContextMenu.Item>
        {props.favourite !== "Home" && (
          <ContextMenu.Item
            onClick={() => {
              removeFolderFromFavourites(props.favourite);
            }}
          >
            Remove from favourites
          </ContextMenu.Item>
        )}
        {props.favourite !== "Home" && (
          <ContextMenu.Item
            onClick={() => {
              deleteMutation.mutate(props.favourite);
            }}
            color="crimson"
          >
            Delete
          </ContextMenu.Item>
        )}
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

const launcherToIcon: Record<Launcher, ReactNode> = {
  code: <CodeIcon />,
  web: <GlobeIcon />,
  terminal: <CardStackIcon />,
  image: <CameraIcon />
};

function ExplorerItem(props: {
  returnFocus?: boolean;
  item: FsNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  path: string;
  onRename: () => void;
  selected?: string[];
  onSelect?: (opts: {
    shiftKey: boolean;
    metaKey: boolean;
  }) => void;
  isDragging?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}) {
  const [addLauncherModalOpen, setAddLauncherModalOpen] =
    useState(false);
  const { openFile } = useUntypedAppContext();
  const droppable = useDroppable({
    id: removeStartingSlash(props.path),
    disabled: isFile(props.item) || props.isDragging
  });
  const draggable = useDraggable({
    id: removeStartingSlash(props.path)
  });
  const deleteMutation = useRemoveFileMutation();
  const {
    addFolderToFavourites: addToFavourites,
    removeFolderFromFavourites: removeFromFavourites,
    favouriteFolders: favourites
  } = useFavouriteFolderStore();
  const isFavorite = favourites.some(
    (f) => parsePath(f) === parsePath(props.path)
  );
  const isSelected = props.selected?.includes(props.path);

  const getTargets = () => {
    if (!props.selected || props.selected?.length === 0)
      return [props.path];
    return props.selected;
  };

  return (
    <ContextMenu.Root>
      <EditLaunchersDialog
        onOpenChange={setAddLauncherModalOpen}
        open={addLauncherModalOpen}
        path={props.path}
      />
      <ContextMenu.Trigger>
        <Button
          style={{
            justifyContent: "flex-start",
            paddingInline: "var(--space-4)",
            // transform: CSS.Transform.toString(
            //   draggable.transform
            // ),
            background: droppable.isOver
              ? "rgba(0,0,0,0.25)"
              : undefined,
            outline: isSelected
              ? "2px solid var(--focus-8)"
              : "none",
            outlineOffset: "-1px",
            opacity: props.hidden
              ? 0
              : props.disabled
                ? 0.5
                : props.isDragging
                  ? 0.2
                  : 1
          }}
          data-returnfocus={
            props.returnFocus ? "true" : undefined
          }
          variant="ghost"
          size="1"
          color={droppable.isOver ? "indigo" : "gray"}
          onDoubleClick={(e) => {
            if (props.disabled) return;
            props.onClick?.(e);
          }}
          onClick={(e) => {
            if (props.disabled) return;
            e.stopPropagation();
            if (props.onSelect) {
              props.onSelect({
                shiftKey: e.shiftKey,
                metaKey: e.metaKey
              });
            } else {
              props.onClick?.(e);
            }
          }}
          disabled={props.disabled}
          ref={(el) => {
            draggable.setNodeRef(el);
            droppable.setNodeRef(el);
          }}
          {...draggable.attributes}
          {...draggable.listeners}
        >
          {isFolder(props.item) && <FileIcon />}
          {isFile(props.item) &&
            launcherToIcon[
              (props.item.launcher[0] as "code") ?? "code"
            ]}
          {props.item.name}
        </Button>
      </ContextMenu.Trigger>
      <ContextMenu.Content size="1">
        {isFile(props.item) && (
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger disabled={props.disabled}>
              Open with
            </ContextMenu.SubTrigger>
            <ContextMenu.SubContent>
              {props.item.launcher.map((launcher, i) => (
                <ContextMenu.Item
                  key={launcher}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isFile(props.item))
                      openFile(
                        { file: props.item, path: props.path },
                        { launcher }
                      );
                  }}
                >
                  {launcherToLabel[launcher as "code"] ??
                    launcher}{" "}
                  {i === 0 && "(default)"}
                </ContextMenu.Item>
              ))}
              <ContextMenu.Item
                onClick={() => setAddLauncherModalOpen(true)}
              >
                Edit launchers
              </ContextMenu.Item>
            </ContextMenu.SubContent>
          </ContextMenu.Sub>
        )}
        {props.onRename && (
          <ContextMenu.Item onClick={props.onRename}>
            Rename
          </ContextMenu.Item>
        )}
        {isFolder(props.item) && (
          <ContextMenu.Item
            onClick={() => {
              if (isFavorite) {
                removeFromFavourites(props.path);
              } else {
                addToFavourites(props.path);
              }
            }}
          >
            {isFavorite ? "Remove from" : "Add to"} favourites
          </ContextMenu.Item>
        )}
        <ContextMenu.Separator />
        <ContextMenu.Item
          onClick={() => {
            Promise.all(
              getTargets().map((t) => deleteMutation.mutate(t))
            );
          }}
          color="crimson"
        >
          Delete
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

function Step(props: {
  isCurrent: boolean;
  onClick: () => void;
  path: string;
  name?: string;
}) {
  const droppable = useDroppable({
    id: "::" + removeStartingSlash(props.path)
  });
  const steps = props.path.split("/").filter(Boolean);

  return (
    <Code
      color={
        droppable.isOver
          ? "amber"
          : props.isCurrent
            ? undefined
            : "gray"
      }
      size="1"
      asChild
    >
      <Button
        size="1"
        onClick={() => {
          props.onClick();
        }}
      >
        {props.name ?? steps[steps.length - 1]}
      </Button>
    </Code>
  );
}

function CreateFolderDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const createFolderMutation = useCreateDirMutation();
  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Create folder</Dialog.Title>
        <Dialog.Description size="2">
          Give your folder a name.
        </Dialog.Description>
        <Flex direction="column" gap="3">
          <label>
            <TextField.Root
              mt="3"
              autoFocus
              size="2"
              defaultValue="New folder"
              ref={inputRef}
            />
          </label>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              variant="solid"
              color="indigo"
              onClick={() => {
                createFolderMutation
                  .mutateAsync(
                    `${props.path}/${inputRef.current?.value ?? "New folder"}`
                  )
                  .then(() => {
                    inputRef.current!.value = "New folder";
                    props.onOpenChange(false);
                  });
              }}
            >
              Create folder
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function EditLaunchersDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path: string;
}) {
  const fileQuery = useFileSystemQuery(props.path);
  const file = fileQuery.data;
  if (!file) return null;
  if (isFolder(file)) return null;

  return (
    <LoadedEditLaunchersDialog
      key={file.launcher.join() + file.name}
      {...props}
      file={file}
    />
  );
}

function LoadedEditLaunchersDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path: string;
  file: FsFile;
}) {
  const [selected, setSelected] = useState<string[]>(
    props.file.launcher
  );
  const [selectedAddable, setSelectedAddable] = useState<
    string | null
  >(null);
  const appLauncher = useUntypedAppContext();
  const updateFile = useUpdateFileMutation();
  const queryClient = useQueryClient();

  const save = () => {
    updateFile.mutate(
      {
        path: props.path,
        file: {
          launcher: selected
        }
      },
      {
        onSuccess: () => {
          props.onOpenChange(false);
          queryClient.invalidateQueries({
            queryKey: ["fs", ""]
          });
        }
      }
    );
  };

  const resolvedLaunchers = selected
    .map((l) =>
      appLauncher.applications.find((a) => a.appId === l)
    )
    .filter(Boolean) as RadixOsApp<string>[];

  const addableLaunchers = appLauncher.applications.filter(
    (a) => !selected.includes(a.appId)
  );

  useEffect(() => {
    if (!props.open) {
      setSelected(props.file.launcher);
    }
  }, [props.open]);

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Edit launchers</Dialog.Title>

        <Flex direction="column" gap="3">
          <Text size="2" color="gray">
            Current launchers
          </Text>
          <Card size="1">
            <Flex direction="column" gap="3">
              {resolvedLaunchers.map((launcher, i) => (
                <Flex
                  direction="row"
                  key={launcher.appId}
                  style={{ width: "100%" }}
                  gap="3"
                  align="center"
                >
                  <Text
                    size="2"
                    color="gray"
                    style={{ width: "100%" }}
                  >
                    {launcher.appName}{" "}
                    {i === 0 ? "(default)" : ""}
                  </Text>
                  <Button
                    onClick={() =>
                      setSelected((p) =>
                        [...p].sort((v) =>
                          v === launcher.appId ? -9999 : 0
                        )
                      )
                    }
                    color={i === 0 ? undefined : "gray"}
                    size="2"
                    variant="ghost"
                  >
                    <StarIcon />
                  </Button>
                  <Button
                    onClick={() =>
                      setSelected((p) =>
                        p.filter((v) => v !== launcher.appId)
                      )
                    }
                    color="gray"
                    size="1"
                    variant="soft"
                  >
                    <Cross1Icon />
                  </Button>
                </Flex>
              ))}
            </Flex>
          </Card>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">
              Add launcher
            </Text>
            <Flex direction="row" gap="3">
              <Select.Root
                value={selectedAddable ?? undefined}
                onValueChange={(v) => {
                  setSelectedAddable(v);
                }}
              >
                <Select.Trigger style={{ flexGrow: 2 }}>
                  {selectedAddable
                    ? (appLauncher.applications.find(
                        (a) => a.appId === selectedAddable
                      )?.appName ?? selectedAddable)
                    : "-"}
                </Select.Trigger>
                <Select.Content>
                  {addableLaunchers.map((app) => (
                    <Select.Item value={app.appId}>
                      {app.appName}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <Button
                color="gray"
                disabled={selectedAddable === null}
                onClick={() => {
                  if (!selectedAddable) return;
                  setSelected((p) => [...p, selectedAddable]);
                  setSelectedAddable(null);
                }}
              >
                Add
              </Button>
            </Flex>
          </Flex>
          <Flex direction="row" gap="3">
            <Button
              onClick={() => save()}
              disabled={updateFile.isPending}
            >
              Save changes
            </Button>
            <Button
              color="gray"
              onClick={() => props.onOpenChange(false)}
            >
              Cancel
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function CreateFileDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const createFileMutation = useCreateFileMutation();
  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Create file</Dialog.Title>
        <Dialog.Description size="2">
          Give your file a name.
        </Dialog.Description>
        <Flex direction="column" gap="3">
          <label>
            <TextField.Root
              mt="3"
              autoFocus
              size="2"
              defaultValue="New file"
              ref={inputRef}
            />
          </label>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              variant="solid"
              color="indigo"
              onClick={() => {
                createFileMutation
                  .mutateAsync({
                    path: props.path,
                    file: {
                      name: inputRef.current?.value ?? "New file"
                    }
                  })
                  .then(() => {
                    inputRef.current!.value = "New file";
                    props.onOpenChange(false);
                  });
              }}
            >
              Create file
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function RenameFileDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path: string;
}) {
  const nodeQuery = useFileSystemQuery(props.path);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateFile = useUpdateFileMutation();
  const renameFile = (path: string, name: string) => {
    updateFile.mutate({ path, file: { name } });
  };
  const node = nodeQuery.data;
  if (!node) {
    return null;
  }

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Rename</Dialog.Title>
        <Dialog.Description size="2">
          Give your file or folder a new name.
        </Dialog.Description>
        <Flex direction="column" gap="3">
          <label>
            <TextField.Root
              mt="3"
              autoFocus
              size="2"
              defaultValue={node.name}
              ref={inputRef}
            />
          </label>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              variant="solid"
              color="indigo"
              onClick={() => {
                if (!inputRef.current) return;
                renameFile(
                  props.path,
                  inputRef.current.value.split("/")[0]
                );
                inputRef.current.value = "";
                props.onOpenChange(false);
              }}
            >
              Rename
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

const launcherToLabel: Record<Launcher, string> = {
  code: "Code",
  web: "Web Browser",
  terminal: "Terminal",
  image: "Image Viewer"
};

const removeStartingSlash = (str: string) =>
  str.startsWith("/") ? str.substring(1) : str;

const pointerWithinPlus: CollisionDetection = (args) => {
  // First, let's see if there are any collisions with the pointer
  const pointerCollisions = pointerWithin(args);

  // Collision detection algorithms return an array of collisions
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  // If there are no collisions with the pointer, return rectangle intersections
  return rectIntersection(args);
};
