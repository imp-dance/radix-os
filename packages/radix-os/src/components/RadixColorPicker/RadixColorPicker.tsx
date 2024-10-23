import {
  Badge,
  Button,
  Flex,
  Popover,
  Tooltip,
} from "@radix-ui/themes";

type Color = NonNullable<Parameters<typeof Badge>[0]["color"]>;

export function RadixColorPicker(props: {
  onColorSelected: (color: Color) => void;
  selectedColor: Color;
  label?: string;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button variant="soft" color={props.selectedColor}>
          {props.label ?? "Pick color"}
        </Button>
      </Popover.Trigger>
      <Popover.Content style={{ maxWidth: 272 }}>
        <Flex gap="3" wrap="wrap">
          {(
            [
              "gray",
              "cyan",
              "blue",
              "indigo",
              "crimson",
              "pink",
              "plum",
              "violet",
              "teal",
              "jade",
              "green",
              "grass",
              "gold",
              "bronze",
              "yellow",
              "amber",
            ] as const
          ).map((color) => (
            <Badge color={color} key={color} asChild>
              <Tooltip content={color}>
                <Button
                  color={color}
                  variant={
                    color === props.selectedColor
                      ? "solid"
                      : "soft"
                  }
                  style={{
                    borderRadius: 0,
                    cursor: "pointer",
                    height: 16,
                    width: 16,
                  }}
                  onClick={() => props.onColorSelected(color)}
                ></Button>
              </Tooltip>
            </Badge>
          ))}
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}
