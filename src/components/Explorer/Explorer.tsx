import {
  DndContext,
  DragOverlay,
  MouseSensor,
  useDraggable,
  useDroppable,
  useSensor,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CameraIcon,
  CardStackIcon,
  CaretRightIcon,
  CodeIcon,
  FileIcon,
  GlobeIcon,
} from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Code,
  ContextMenu,
  Dialog,
  Flex,
  Text,
  TextField,
} from "@radix-ui/themes";
import React, { ReactNode, useRef, useState } from "react";
import {
  findNodeByPath,
  isFile,
  isFolder,
  openFile,
  parsePath,
} from "../../services/fs";
import {
  FsNode,
  Launcher,
  useFileSystemStore,
} from "../../stores/fs";
import { useWindowStore } from "../../stores/window";
import { createTerminalWindow } from "../Terminal/Terminal.window";

export function Explorer({
  initialPath = "",
  windowId,
  onPathChange,
  disableFiles,
}: {
  initialPath?: string;
  windowId?: symbol;
  onPathChange?: (path: string) => void;
  disableFiles?: boolean;
}) {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const [isDragging, setIsDragging] = useState(false);
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
  const tree = useFileSystemStore((s) => s.tree);
  const favourites = useFileSystemStore(
    (s) => s.favouriteFolders
  );
  const move = useFileSystemStore((s) => s.move);
  const [path, _setPath] = useState(initialPath);

  const steps = path.split("/").filter(Boolean);
  const currentFolder = steps.reduce((acc, step) => {
    if (!("children" in acc)) return acc as FsNode;
    return acc.children.find((c) => c.name === step)!;
  }, tree as FsNode);

  let sortedChildren = isFolder(currentFolder)
    ? [...currentFolder.children]
    : [];
  if (sortDir) {
    sortedChildren = sortedChildren.sort((a, b) =>
      sortDir === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
  }

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
      onDragEnd={(event) => {
        const active = event.active.id.toString();
        const over = event.over?.id.toString();
        setIsDragging(false);
        if (!over) return;
        if (parsePath(active) === parsePath(over)) return;
        if (selected.length > 1) {
          selected.forEach((s) => {
            move(s, over);
          });
        } else {
          move(`${active}`, `${over}`);
        }
      }}
      onDragStart={() => {
        setIsDragging(true);
      }}
    >
      <Flex gap="3" style={{ height: "100%" }}>
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
            height: "100%",
          }}
          p="2"
          pr="4"
        >
          {favourites.map((favourite) => (
            <FavouriteItem
              key={favourite}
              favourite={favourite}
              onClick={() => setPath(parsePath(favourite))}
              disabled={
                selected.find(
                  (s) => parsePath(s) === parsePath(favourite)
                )
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
                width: "100%",
              }}
              onClick={() => setSelected([])}
            >
              <Flex
                style={{ width: "100%" }}
                direction="column"
                pr="2"
                pt="2"
              >
                <Flex gap="1" mb="3">
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
                  <Button
                    ml="auto"
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
                    color={sortDir === null ? "gray" : "indigo"}
                    size="2"
                    style={{
                      display: "block",
                      marginLeft: "auto",
                      marginTop: "calc(var(--space-1) * -1)",
                    }}
                  >
                    {sortDir === "asc" ? (
                      <ArrowDownIcon
                        style={{
                          width: "0.875em",
                          height: "0.875em",
                        }}
                      />
                    ) : (
                      <ArrowUpIcon
                        style={{
                          width: "0.875em",
                          height: "0.875em",
                        }}
                      />
                    )}
                  </Button>
                </Flex>

                <Flex gap="3" direction="column">
                  {selected.length > 1 && (
                    <DragOverlay
                      adjustScale={false}
                      wrapperElement="span"
                      style={{}}
                    >
                      <Box
                        p="1"
                        px="2"
                        style={{
                          background: "var(--gray-1)",
                          cursor: "default",
                          pointerEvents: "none",
                          width: "max-content",
                          transform: `translate(-${window?.x}px, -${window?.y}px)`,
                          borderRadius: "var(--radius-2)",
                          opacity: 0.8,
                        }}
                      >
                        <Text size="1" color="gray">
                          {selected.length} items selected
                        </Text>
                      </Box>
                    </DragOverlay>
                  )}
                  {isFolder(currentFolder)
                    ? sortedChildren.map((child, i) => {
                        return (
                          <ExplorerItem
                            key={child.name}
                            disabled={
                              disableFiles && isFile(child)
                            }
                            item={child}
                            path={`${path}/${child.name}`}
                            selected={selected.includes(
                              `${path}/${child.name}`
                            )}
                            isDragging={
                              selected.includes(
                                `${path}/${child.name}`
                              ) &&
                              isDragging &&
                              selected.length > 1
                            }
                            onSelect={({
                              shiftKey,
                              metaKey,
                            }) => {
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
                                        `${path}/${child.name}`,
                                      ];
                                } else {
                                  prevSelected.current = `${path}/${child.name}`;
                                  return [
                                    `${path}/${child.name}`,
                                  ];
                                }
                              });
                            }}
                            onClick={() => {
                              if (isFolder(child)) {
                                setPath(
                                  (prev) =>
                                    `${prev}/${child.name}`
                                );
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
                const { addWindow } = useWindowStore.getState();
                addWindow(createTerminalWindow(path));
              }}
            >
              Open in terminal
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
  const tree = useFileSystemStore((s) => s.tree);
  const droppable = useDroppable({
    id: removeStartingSlash(props.favourite),
    disabled: props.disabled,
  });
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Button
          style={{
            justifyContent: "flex-start",
            paddingInline: "var(--space-4)",
          }}
          variant="ghost"
          size="1"
          color={
            droppable.isOver && !props.disabled
              ? "indigo"
              : "gray"
          }
          onClick={() => props.onClick()}
          ref={droppable.setNodeRef}
        >
          {findNodeByPath(props.favourite, tree)?.name ??
            props.favourite}
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
              useFileSystemStore
                .getState()
                .removeFolderFromFavourites(props.favourite);
            }}
          >
            Remove from favourites
          </ContextMenu.Item>
        )}
        {props.favourite !== "Home" && (
          <ContextMenu.Item
            onClick={() => {
              useFileSystemStore
                .getState()
                .remove(props.favourite);
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
  image: <CameraIcon />,
};

function ExplorerItem(props: {
  returnFocus?: boolean;
  item: FsNode;
  onClick?: () => void;
  path: string;
  onRename: () => void;
  selected?: boolean;
  onSelect?: (opts: {
    shiftKey: boolean;
    metaKey: boolean;
  }) => void;
  isDragging?: boolean;
  disabled?: boolean;
}) {
  const droppable = useDroppable({
    id: removeStartingSlash(props.path),
    disabled: isFile(props.item) || props.isDragging,
  });
  const draggable = useDraggable({
    id: removeStartingSlash(props.path),
  });
  const remove = useFileSystemStore((s) => s.remove);
  const addToFavourites = useFileSystemStore(
    (s) => s.addFolderToFavourites
  );
  const removeFromFavourites = useFileSystemStore(
    (s) => s.removeFolderFromFavourites
  );
  const favourites = useFileSystemStore(
    (s) => s.favouriteFolders
  );
  const isFavorite = favourites.some(
    (f) => parsePath(f) === parsePath(props.path)
  );
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Button
          style={{
            justifyContent: "flex-start",
            paddingInline: "var(--space-4)",
            transform: CSS.Transform.toString(
              draggable.transform
            ),
            background: droppable.isOver
              ? "rgba(0,0,0,0.25)"
              : undefined,
            outline: props.selected
              ? "2px solid var(--focus-8)"
              : "none",
            outlineOffset: "-1px",
            opacity: props.isDragging
              ? 0
              : props.disabled
              ? 0.5
              : 1,
            pointerEvents: props.isDragging ? "none" : "auto",
          }}
          data-returnfocus={
            props.returnFocus ? "true" : undefined
          }
          variant="ghost"
          size="1"
          color="gray"
          onDoubleClick={(e) => {
            if (props.disabled) return;
            props.onClick?.();
            if (isFile(props.item)) {
              e.stopPropagation();
              openFile(props.item, props.path);
            }
          }}
          onClick={(e) => {
            if (props.disabled) return;
            e.stopPropagation();
            if (props.onSelect) {
              props.onSelect({
                shiftKey: e.shiftKey,
                metaKey: e.metaKey,
              });
            } else {
              props.onClick?.();
              if (isFile(props.item)) {
                e.stopPropagation();
                openFile(props.item, props.path);
              }
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
            launcherToIcon[props.item.launcher[0]]}
          {props.item.name}
        </Button>
      </ContextMenu.Trigger>
      <ContextMenu.Content size="1">
        {isFile(props.item) && (
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger>
              Open with
            </ContextMenu.SubTrigger>
            <ContextMenu.SubContent>
              {props.item.launcher.map((launcher, i) => (
                <ContextMenu.Item
                  key={launcher}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isFile(props.item))
                      openFile(props.item, props.path, launcher);
                  }}
                >
                  {launcherToLabel[launcher]}{" "}
                  {i === 0 && "(default)"}
                </ContextMenu.Item>
              ))}
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
            remove(props.path);
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
    id: removeStartingSlash(props.path),
  });
  const steps = props.path.split("/").filter(Boolean);

  return (
    <Code
      color={
        droppable.isOver
          ? "amber"
          : props.isCurrent
          ? "indigo"
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
  const createFolder = useFileSystemStore((s) => s.createFolder);
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
                createFolder(
                  `${props.path}/${
                    inputRef.current?.value ?? "New folder"
                  }`
                );
                inputRef.current!.value = "New folder";
                props.onOpenChange(false);
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

function CreateFileDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const createFile = useFileSystemStore((s) => s.createFile);
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
                createFile(
                  `${props.path}/${
                    inputRef.current?.value ?? "New file"
                  }`
                );
                inputRef.current!.value = "New file";
                props.onOpenChange(false);
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
  const tree = useFileSystemStore((s) => s.tree);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameFile = useFileSystemStore((s) => s.renameFile);
  const node = findNodeByPath(props.path, tree);
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
                renameFile(props.path, inputRef.current.value);
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
  image: "Image Viewer",
};

const removeStartingSlash = (str: string) =>
  str.startsWith("/") ? str.substring(1) : str;
