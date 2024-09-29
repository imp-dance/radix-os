import { ArrowRightIcon } from "@radix-ui/react-icons";
import {
  Box,
  Code,
  Flex,
  ScrollArea,
  Text,
  TextField,
} from "@radix-ui/themes";
import React, {
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  findNodeByPath,
  isFile,
  isFolder,
  openFile,
  useFileSystemStore,
} from "../../stores/fs";

export function Terminal() {
  const currentCommandIndex = useRef(0);
  const prevCommands = useRef<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tree = useFileSystemStore((s) => s.tree);
  const move = useFileSystemStore((s) => s.move);
  const createFolder = useFileSystemStore((s) => s.createFolder);
  const setDefaultLauncher = useFileSystemStore(
    (s) => s.setDefaultLauncher
  );
  const rename = useFileSystemStore((s) => s.renameFile);
  const path = useRef<string[]>(["Home"]);
  const [output, setOutput] = useState<ReactNode[]>([
    <Code size="1">Type "help" to get started</Code>,
  ]);

  function pushOutput(...output: ReactNode[]) {
    setOutput((prev) => [...prev, ...output]);
  }

  function dirNotFound(dir?: string) {
    pushOutput(
      <Code
        size="1"
        variant="soft"
        color="crimson"
        key={output.length}
      >
        Directory not found: "{dir}"
      </Code>
    );
  }

  function notAFolder() {
    pushOutput(
      <Code
        size="1"
        variant="soft"
        color="crimson"
        key={output.length}
      >
        Not a directory
      </Code>
    );
  }

  const parseInput = (input: string) => {
    prevCommands.current.push(input);
    const parts = input.split(" ");
    const [command, ...args] = parts;
    if (command === "") return pushOutput(<></>);
    switch (command) {
      case "echo": {
        pushOutput(
          <Code
            size="1"
            key={output.length}
            variant="soft"
            color="gray"
          >
            {args.join(" ")}
          </Code>
        );
        break;
      }
      case "clear": {
        setOutput([]);
        break;
      }
      case "help": {
        pushOutput(
          <Command command="help" />,
          <Code size="1" variant="soft" color="gray">
            <pre style={{ margin: 0, textWrap: "wrap" }}>
              {helpText}
            </pre>
          </Code>
        );
        break;
      }
      case "ls": {
        const currentNode =
          path.current.length === 0
            ? tree
            : findNodeByPath(path.current.join("/"), tree);
        if (isFolder(currentNode)) {
          pushOutput(
            <Command command="ls" />,
            ...currentNode.children.map((child) => (
              <Code
                size="1"
                key={child.name}
                variant="ghost"
                color="gray"
              >
                {child.name}
              </Code>
            ))
          );
        } else {
          notAFolder();
        }
        break;
      }
      default: {
        pushOutput(
          <Code size="1" variant="soft" color="crimson">
            Command not found: {command}
          </Code>
        );
        break;
      }
      case "mkdir": {
        const name = args[0];
        if (!name) {
          return pushOutput(
            <Code size="1" variant="soft" color="crimson">
              mkdir needs a name as argument
            </Code>
          );
        }
        createFolder(name);
        pushOutput(<Command command={`mkdir ${name}`} />);
        break;
      }
      case "mv": {
        const [from, to] = args;
        if (!from || !to) {
          return pushOutput(
            <Code size="1" variant="soft" color="crimson">
              mv needs two paths as arguments
            </Code>
          );
        }
        move(from, to);
        pushOutput(<Command command={`mv ${from} ${to}`} />);
        break;
      }
      case "fs": {
        const [path, flag, ...restArgs] = args;
        const node = findNodeByPath(path, tree);
        if (!node) {
          dirNotFound(path);
          break;
        }
        switch (flag) {
          case "-R": {
            const name = quotableRestArgs(restArgs);
            if (!name) {
              pushOutput(
                <Code size="1" variant="soft" color="crimson">
                  fs -R needs a name as argument
                </Code>
              );
              break;
            }
            rename(path, name);
            pushOutput(
              <Command command={`fs ${path} -R ${name}`} />
            );
            break;
          }
          case "-O": {
            const launcher = restArgs[0];
            if (!isFile(node)) {
              return pushOutput(
                <Code size="1" variant="soft" color="crimson">
                  Not a file
                </Code>
              );
            }
            const validLaunchers = node.launcher;
            if (
              launcher &&
              !validLaunchers.includes(launcher as "code")
            ) {
              pushOutput(
                <Code size="1" variant="soft" color="crimson">
                  Invalid launcher
                </Code>
              );
              break;
            }
            openFile(node, path, launcher as "code");
            pushOutput(
              <Command
                command={`fs ${path} -O ${launcher ?? ""}`}
              />
            );
            break;
          }
          case "-L": {
            const launcher = restArgs[0];
            if (!launcher) {
              pushOutput(
                <Code size="1" variant="soft" color="crimson">
                  fs --L needs a launcher as argument
                </Code>
              );
              break;
            }
            if (!isFile(node)) {
              pushOutput(
                <Code size="1" variant="soft" color="crimson">
                  Not a file
                </Code>
              );
              break;
            }
            const validLaunchers = node.launcher;
            if (!validLaunchers.includes(launcher as "code")) {
              pushOutput(
                <Code size="1" variant="soft" color="crimson">
                  Invalid launcher
                </Code>
              );
              break;
            }
            setDefaultLauncher(path, launcher as "code");
            pushOutput(
              <Command command={`fs ${path} --L ${launcher}`} />
            );
            break;
          }
          case "--ll": {
            break;
          }
          case "--sl": {
            break;
          }
        }
        break;
      }
      case "cd": {
        const nextPath = quotableRestArgs(args);
        if (!nextPath) {
          path.current = ["Home"];
          return pushOutput(
            <Command command={`cd ${args[1]}`} />
          );
        }
        if (nextPath === "..") {
          if (path.current.length > 1) {
            path.current.pop();
          }
          return pushOutput(
            <Command command={`cd ${nextPath}`} />
          );
        }
        try {
          if (nextPath.startsWith("/")) {
            let newState = path.current;
            if (nextPath === "/") {
              newState = ["Home"];
            } else {
              newState = nextPath.split("/").filter(Boolean);
            }
            if (
              newState.length === 1 &&
              newState[0] !== "Home"
            ) {
              return dirNotFound(nextPath);
            }
            const node = findNodeByPath(
              newState.join("/"),
              tree
            );
            if (!node || !isFolder(node)) {
              return dirNotFound(nextPath);
            }
            path.current = newState;
            return pushOutput(
              <Command command={`cd ${nextPath}`} />
            );
          }
          const nextNode = findNodeByPath(
            `${path.current.join("/")}/${nextPath}`,
            tree
          );
          if (isFolder(nextNode)) {
            path.current.push(nextPath);
            pushOutput(<Command command={`cd ${nextPath}`} />);
          } else {
            return notAFolder();
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_e) {
          dirNotFound(nextPath);
        }
        break;
      }
    }
  };

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
    currentCommandIndex.current = prevCommands.current.length;
  }, [output.length]);

  return (
    <Box
      p="2"
      style={{
        height: "100%",
        display: "grid",
        gridTemplateRows: "1fr min-content",
      }}
    >
      <ScrollArea
        ref={scrollRef}
        scrollbars="both"
        type="auto"
        style={{ minHeight: 0 }}
      >
        <Flex p="5" pt="0" pl="3" gap="1" direction="column">
          {output.map((o, i) => (
            <React.Fragment key={i}>{o}</React.Fragment>
          ))}
        </Flex>
      </ScrollArea>
      <Flex align="center" mt="auto" gap="2">
        <Text
          size="1"
          color="gray"
          style={{ fontFamily: "var(--code-font-family)" }}
        >
          {path.current.map((p) => `/${p}`).join("")}
        </Text>
        <ArrowRightIcon color="gray" style={{ flexShrink: 0 }} />
        <TextField.Root
          variant="surface"
          color="gray"
          autoFocus
          data-returnfocus="true"
          size="1"
          style={{
            width: "100%",
            fontFamily: "var(--code-font-family)",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              parseInput(e.currentTarget.value);
              e.currentTarget.value = "";
            }
            if (e.key === "ArrowUp") {
              if (currentCommandIndex.current !== 0) {
                currentCommandIndex.current -= 1;
              }
              const prev =
                prevCommands.current[
                  currentCommandIndex.current
                ];
              if (prev) {
                e.currentTarget.value = prev;
              }
            }
            if (e.key === "ArrowDown") {
              if (
                currentCommandIndex.current !==
                prevCommands.current.length
              ) {
                currentCommandIndex.current += 1;
              }
              const next =
                prevCommands.current[
                  currentCommandIndex.current
                ];
              if (next) {
                e.currentTarget.value = next;
              } else {
                e.currentTarget.value = "";
              }
            }
          }}
        />
      </Flex>
    </Box>
  );
}

const helpText = `help                       - Show this help message
echo [...text]             - Print text to the terminal
clear                      - Clear the terminal 

mkdir [name]               - Create a new directory
ls                         - List files in current directory
cd [path]                  - Change directory
mv [path1] [path2]         - Move file/folder from [path1] to [path2]

fs [path] -R [name]        - Rename a file or folder
fs [path] -O [launcher?]   - Open a file
fs [path] -L [launcher]    - Set a file's default launcher
fs [path] --ll             - List a file's available launchers
fs [path] --sl [launcher]  - Make file executable in given launcher`;

function Command(props: { command: string }) {
  return (
    <Code size="1" variant="ghost" color="indigo">
      <Flex align="center" gap="2">
        <ArrowRightIcon
          style={{ width: "1em", height: "1em" }}
        />{" "}
        {props.command}
      </Flex>
    </Code>
  );
}

function quotableRestArgs(args: string[]) {
  let nextPath = args[0];
  if (nextPath.startsWith('"')) {
    nextPath = nextPath.substring(1);
    if (nextPath.endsWith('"')) {
      nextPath = nextPath.slice(0, -1);
    }
    for (let i = 1; i < args.length; i++) {
      if (args[i].endsWith('"')) {
        nextPath += " " + args[i].slice(0, -1);
        break;
      } else {
        nextPath += " " + args[i];
      }
    }
  }
  return nextPath;
}
