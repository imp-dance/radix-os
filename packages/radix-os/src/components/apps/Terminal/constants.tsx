import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Code, Flex } from "@radix-ui/themes";

export function DirNotFound(props: { dir?: string }) {
  return (
    <Code size="1" variant="soft" color="crimson">
      {props.dir
        ? `Directory not found: "${props.dir}"`
        : "Directory not found"}
    </Code>
  );
}

export function Command(props: { command: string }) {
  return (
    <Code size="1" variant="ghost" color="grass">
      <Flex align="center" gap="2">
        <ArrowRightIcon
          style={{ width: "1em", height: "1em" }}
        />{" "}
        {props.command}
      </Flex>
    </Code>
  );
}

export const helpText = `---AVAILABLE COMMANDS:-------------------------------------------------
------------------Terminal:--------------------------------------------
  help                       - Show this help message
  echo [...text]             - Print text to the terminal
  clear                      - Clear the terminal
----------------File system:-------------------------------------------
  mkdir [name]               - Create a new directory
  ls                         - List files in current directory
  cd [path]                  - Change directory
  mv [path1] [path2]         - Move file/folder from [path1] to [path2]
  open [path]                - Open a file
  open --help                - Show help for opening files
  fs [path] -R [name]        - Rename a file or folder
  fs [path] -L [launcher]    - Set a file's default launcher
  fs [path] --ll             - List a file's available launchers
  fs [path] --ex [launcher]  - Make file executable in given launcher
-----------------------------------------------------------------------
Relative paths are supported. Use quotes for paths with spaces.`;

export const openHelpText = `Available flags for command "open":
--help                     - Show this help message
-l [launcher]             - Open file with specific launcher
-x [number]               - Horizontal position of window
-y [number]               - Vertical position of window
-w [number]               - Width of window
-h [number]               - Height of window
-r [true/false]           - Resizable
-s [true/false]           - Scrollable`;
