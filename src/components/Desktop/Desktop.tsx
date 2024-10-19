import {
  DndContext,
  DragOverlay,
  Modifier,
  MouseSensor,
  useDraggable,
  useSensor,
} from "@dnd-kit/core";
import {
  createSnapModifier,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import {
  CardStackIcon,
  CodeIcon,
  GearIcon,
  GlobeIcon,
  HomeIcon,
} from "@radix-ui/react-icons";
import { Button, ContextMenu, Tooltip } from "@radix-ui/themes";
import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useUntypedAppContext } from "../../integration/setupApps";
import { useSettingsStore } from "../../stores/settings";
import { throttle } from "../../utils";
import desktopStyles from "./Desktop.module.css";

const gridSize = 64; // pixels
const gridPad = 16;
const snapToGridModifier = createSnapModifier(gridSize);
const padModifier: Modifier = (args) => {
  const newValue = { ...args.transform };
  const x =
    (args.draggingNodeRect?.left ?? 0) + args.transform.x;
  const y = (args.draggingNodeRect?.top ?? 0) + args.transform.y;
  if (x < gridPad) {
    newValue.x = gridPad - (args.draggingNodeRect?.left ?? 0);
  }
  if (y < gridPad) {
    newValue.y = gridPad - (args.draggingNodeRect?.top ?? 0);
  }
  return newValue;
};

export function Desktop() {
  const bg = useSettingsStore((s) => s.bg);
  const { launch, openFile } = useUntypedAppContext();
  const [dragTarget, setDragTarget] = useState<string | null>(
    null
  );
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const [applications, setApplications] = useState([
    {
      icon: <HomeIcon />,
      title: "Explorer",
      id: "explorer",
      onClick: () => {
        launch("explorer");
      },
      position: {
        x: gridPad,
        y: gridPad,
      },
    },
    {
      icon: <GearIcon />,
      title: "Settings",
      id: "settings",
      onClick: () => {
        launch("settings");
      },
      position: {
        x: gridPad,
        y: gridSize * 1 + gridPad,
      },
    },
    {
      icon: <CardStackIcon />,
      title: "Terminal",
      id: "terminal",
      onClick: () => {
        launch("terminal");
      },
      position: {
        x: gridPad,
        y: gridSize * 2 + gridPad,
      },
    },
    {
      icon: <CodeIcon />,
      title: "Code",
      id: "code",
      onClick: () => {
        launch("code");
      },
      position: {
        x: gridPad,
        y: gridSize * 3 + gridPad,
      },
    },

    {
      icon: <GlobeIcon />,
      title: "Web Browser",
      id: "webbrowser",
      onClick: () => {
        launch("web");
      },
      position: {
        x: gridPad,
        y: gridSize * 4 + gridPad,
      },
    },
  ]);
  const positionDependency = applications.reduce((acc, app) => {
    return (
      acc + app.position.x.toString() + app.position.y.toString()
    );
  }, "");

  const draggedApp = applications.find(
    (app) => app.id === dragTarget
  );

  const detectionModifiers: Modifier = useCallback(
    (args) => {
      const x = args.transform.x + (draggedApp?.position.x ?? 0);
      const y = args.transform.y + (draggedApp?.position.y ?? 0);
      const over = applications.find(
        (app) => app.position.x === x && app.position.y === y
      );
      const nextX = x + gridSize;
      if (over && over.id !== dragTarget) {
        return {
          ...args.transform,
          x: Math.ceil(nextX / gridSize) * gridSize,
          y: Math.ceil(y / gridSize) * gridSize,
        };
      }
      return { ...args.transform };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [positionDependency, draggedApp?.id]
  );

  return (
    <DndContext
      modifiers={[
        restrictToParentElement,
        padModifier,
        snapToGridModifier,
        detectionModifiers,
      ]}
      sensors={[mouseSensor]}
      onDragStart={(event) => {
        setDragTarget(event.active.id?.toString());
      }}
      onDragEnd={(event) => {
        setApplications((applications) => {
          const index = applications.findIndex(
            (app) => app.id === event.active.id
          );
          if (index === -1) return applications;
          applications[index].position = {
            x: applications[index].position.x + event.delta.x,
            y: applications[index].position.y + event.delta.y,
          };
          return [...applications];
        });
      }}
    >
      <DragOverlay wrapperElement="div" adjustScale={false}>
        <div
          style={{
            width: 50,
            height: 50,
            background: "rgba(0,0,0,0.1)",
            zIndex: -1,
          }}
        />
      </DragOverlay>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <div
            id="desktop"
            style={{
              background: bg.startsWith("data:")
                ? `url(${bg})`
                : `linear-gradient(
    -270deg,
    var(--${bg}-4) 0%,
    var(--${bg}-3) 100%
  )`,
              backgroundSize: bg.startsWith("data:")
                ? "cover"
                : undefined,
            }}
          >
            {applications.map((application) => (
              <Application
                key={application.id}
                {...application}
              />
            ))}
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Content size="1">
          <ContextMenu.Item
            onClick={() => {
              openFile({
                file: {
                  data: "customize",
                  launcher: ["settings"],
                  name: "settings",
                  title: "Settings",
                },
                path: "customize",
              });
            }}
          >
            Customize
          </ContextMenu.Item>
          <ContextMenu.Item
            onClick={() => {
              openFile({
                file: {
                  data: "storage",
                  launcher: ["settings"],
                  name: "settings",
                  title: "Settings",
                },
                path: "storage",
              });
            }}
          >
            Storage
          </ContextMenu.Item>
          <ContextMenu.Item
            onClick={() => {
              openFile({
                file: {
                  data: "shortcuts",
                  launcher: ["settings"],
                  name: "settings",
                  title: "Settings",
                },
                path: "shortcuts",
              });
            }}
          >
            View shortcuts
          </ContextMenu.Item>
          <ContextMenu.Item
            onClick={() => {
              openFile({
                file: {
                  data: "about",
                  launcher: ["settings"],
                  name: "settings",
                  title: "Settings",
                },
                path: "about",
              });
            }}
          >
            About
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    </DndContext>
  );
}

function Application(props: {
  icon: ReactNode;
  title: string;
  id: string;
  onClick: () => void;
  position: { x: number; y: number };
}) {
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const draggable = useDraggable({
    id: props.id,
  });
  const style = {
    left: draggable.isDragging
      ? mousePosition?.x ?? props.position.x
      : props.position.x,
    top: draggable.isDragging
      ? mousePosition?.y ?? props.position.y
      : props.position.y,
  } as CSSProperties;

  useEffect(() => {
    if (draggable.isDragging) {
      const listener = throttle((e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }, 20);
      document.body.addEventListener("mousemove", listener);
      return () => {
        document.body.removeEventListener("mousemove", listener);
        setMousePosition(null);
      };
    } else {
      setMousePosition(null);
    }
  }, [draggable.isDragging]);

  return (
    <Tooltip content={props.title} side="bottom">
      <Button
        ref={draggable.setNodeRef}
        className={desktopStyles.appicon}
        variant="soft"
        color="gray"
        style={style}
        {...draggable.attributes}
        {...draggable.listeners}
        onClick={props.onClick}
      >
        {props.icon}
      </Button>
    </Tooltip>
  );
}
