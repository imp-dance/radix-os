import {
  Box,
  Button,
  DropdownMenu,
  Flex,
} from "@radix-ui/themes";
import { useKeydowns } from "../../hooks/useKeyboard";

type ButtonColor = Parameters<typeof Button>[0]["color"];

type Option = {
  label: string;
  onClick: () => void;
  shortcut?: {
    key: string;
    modifiers: Array<"ctrl" | "shift" | "alt" | "meta">;
    label: string;
    dependency?: string;
  };
  disabled?: boolean;
  color?: ButtonColor;
};

type Menu = Array<{
  label: string;
  color?: ButtonColor;
  options: Array<Option | "separator">;
}>;

export function MenuBar(props: {
  menu: Menu;
  windowId?: symbol;
}) {
  const kd = props.menu.flatMap((menu) =>
    (
      menu.options
        .filter(
          (option) => option !== "separator" && option.shortcut
        )
        .filter(Boolean) as Option[]
    ).map((option) => ({
      key: option.shortcut!.key,
      ctrlKey: option.shortcut!.modifiers.includes("ctrl"),
      shiftKey: option.shortcut!.modifiers.includes("shift"),
      altKey: option.shortcut!.modifiers.includes("alt"),
      metaKey: option.shortcut!.modifiers.includes("meta"),
      windowId: props.windowId,
      callback: () => option.onClick(),
      disabled: option.disabled,
      dep: option.shortcut!.dependency,
    }))
  );
  useKeydowns(...kd);
  return (
    <Box style={{ background: "var(--gray-2)" }}>
      {props.menu.map((menuItem) => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button
              variant={"soft"}
              size={"1"}
              ml={"0"}
              color={menuItem.color}
              style={{ borderRadius: 0 }}
            >
              <Flex gap="2" align="center">
                {menuItem.label}
                <DropdownMenu.TriggerIcon
                  style={{ opacity: 0.5 }}
                />
              </Flex>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content size="1">
            {menuItem.options.map((option, i) =>
              option === "separator" ? (
                <DropdownMenu.Separator key={`${option}${i}`} />
              ) : (
                <DropdownMenu.Item
                  shortcut={option.shortcut?.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    option.onClick();
                  }}
                  key={option.label}
                  color={option.color}
                  disabled={option.disabled}
                >
                  {option.label}
                </DropdownMenu.Item>
              )
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ))}
    </Box>
  );
}
