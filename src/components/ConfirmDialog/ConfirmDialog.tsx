import { Button, Dialog, Flex } from "@radix-ui/themes";

type Color = Parameters<typeof Button>[0]["color"];

export function ConfirmDialog(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText: string;
  confirmColor?: Color;
}) {
  return (
    <Dialog.Root open={props.open} onOpenChange={props.setOpen}>
      <Dialog.Content>
        <Dialog.Title>{props.title}</Dialog.Title>
        <Dialog.Description>
          {props.description}
        </Dialog.Description>
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              variant="solid"
              color={props.confirmColor ?? "indigo"}
              onClick={props.onConfirm}
            >
              {props.confirmText}
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
