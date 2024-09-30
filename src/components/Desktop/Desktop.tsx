import {
  DndContext,
  Modifier,
  MouseSensor,
  useDraggable,
  useSensor,
} from "@dnd-kit/core";
import {
  createSnapModifier,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
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
  useState,
} from "react";
import { useSettingsStore } from "../../stores/settings";
import {
  createWindow,
  useWindowStore,
} from "../../stores/window";
import { createCodeWindow } from "../Code/Code.window";
import { createExplorerWindow } from "../Explorer/Explorer.window";
import { createSettingsWindow } from "../Settings/Settings.window";
import { createTerminalWindow } from "../Terminal/Terminal.window";
import { WebBrowser } from "../WebBrowser/WebBrowser";
import appIconStyles from "./appicon.module.css";

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
  const addWindow = useWindowStore((s) => s.addWindow);
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
        addWindow(createExplorerWindow());
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
        addWindow(createSettingsWindow());
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
        addWindow(createTerminalWindow());
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
        addWindow(
          createCodeWindow({
            path: "",
            file: {
              data: "",
              launcher: [],
              name: "Note",
              title: "__new",
            },
          })
        );
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
        addWindow(
          createWindow({
            content: <WebBrowser />,
            title: "Web Browser",
            icon: <GlobeIcon />,
            initialHeight: 600,
            initialWidth: 800,
          })
        );
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
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <div
            id="desktop"
            style={{
              background: `linear-gradient(
    -180deg,
    var(--${bg}-2) 0%,
    var(--${bg}-3) 100%
  )`,
            }}
          >
            {applications.map((application) => (
              <Application
                key={application.title}
                {...application}
              />
            ))}
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Content size="1">
          <ContextMenu.Item
            onClick={() => {
              addWindow(createSettingsWindow());
            }}
          >
            Open Settings
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
  const draggable = useDraggable({
    id: props.id,
  });
  const style = {
    left: props.position.x,
    top: props.position.y,
    opacity: draggable.isDragging ? 0.5 : 1,
    transform: CSS.Transform.toString(draggable.transform),
  } as CSSProperties;
  return (
    <Tooltip content={props.title}>
      <Button
        ref={draggable.setNodeRef}
        className={appIconStyles.appicon}
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
