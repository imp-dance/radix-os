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

export const helpText = `help                       - Show this help message
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
fs [path] --ex [launcher]  - Make file executable in given launcher`;
