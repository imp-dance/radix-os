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
  isFolder,
  parseRelativePath,
} from "../../../services/fs";
import { useFileSystemStore } from "../../../stores/fs";
import { Command, helpText } from "./constants";
import { parseFs } from "./modules/fs";
import { joinQuotedArgs } from "./utils";

export function Terminal(props: { initialPath?: string }) {
  const currentCommandIndex = useRef(0);
  const prevCommands = useRef<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tree = useFileSystemStore((s) => s.tree);
  const move = useFileSystemStore((s) => s.move);
  const createFolder = useFileSystemStore((s) => s.createFolder);
  const path = useRef<string[]>(
    props.initialPath?.split("/").filter(Boolean) ?? ["Home"]
  );
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
    const [command, ...args_] = parts;
    const args = joinQuotedArgs(args_);
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
        createFolder(
          parseRelativePath(path.current.join("/"), name)
        );
        pushOutput(<Command command={`mkdir ${name}`} />);
        break;
      }
      case "mv": {
        let [from, to] = args;
        if (!from || !to) {
          return pushOutput(
            <Code size="1" variant="soft" color="crimson">
              mv needs two paths as arguments
            </Code>
          );
        }
        from = parseRelativePath(path.current.join("/"), from);
        to = parseRelativePath(path.current.join("/"), to);
        const fromNode = findNodeByPath(from, tree);
        const toNode = findNodeByPath(to, tree);
        if (!fromNode) {
          return dirNotFound(from);
        }
        if (!toNode) {
          return dirNotFound(to);
        }
        move(from, to);
        pushOutput(<Command command={`mv ${from} ${to}`} />);
        break;
      }
      case "fs": {
        return parseFs({
          pushOutput,
          args,
          currentPath: path.current.join("/"),
        });
      }
      case "cd": {
        const parsedNextPath = parseRelativePath(
          path.current.join("/"),
          args[0]
        );
        const newNode = findNodeByPath(parsedNextPath, tree);
        if (!newNode) {
          return dirNotFound(parsedNextPath);
        }
        if (!isFolder(newNode)) {
          return notAFolder();
        }
        path.current = parsedNextPath.split("/").filter(Boolean);
        pushOutput(<Command command={`cd ${args[0]}`} />);
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
