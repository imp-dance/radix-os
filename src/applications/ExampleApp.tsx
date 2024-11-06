import { Button, Flex, Heading } from "@radix-ui/themes";
import { createApp } from "radix-os";
import { useAppLauncher } from "../main";

export const ExampleApp = createApp((_props) => {
  const { launch } = useAppLauncher();
  return (
    <Flex
      direction="column"
      gap="3"
      p="3"
      style={{ textAlign: "center", userSelect: "none" }}
    >
      <Heading size="4">You can create custom apps</Heading>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          launch("terminal");
        }}
        variant="ghost"
      >
        And utilize system hooks
      </Button>
    </Flex>
  );
});
