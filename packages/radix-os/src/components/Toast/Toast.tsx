import {
  Root,
  Provider,
  Viewport,
  Title,
  Description,
  Close,
  Action,
} from "@radix-ui/react-toast";
import ReactDOM from "react-dom";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Box, Button, Card, Flex, Text } from "@radix-ui/themes";

type Toast = {
  title: ReactNode;
  type?: "foreground" | "background";
  description?: ReactNode;
  dismissText?: ReactNode;
  action?: {
    onClick: () => void;
    altText?: string;
    label: ReactNode;
  };
};

type ToastContext = {
  toasts: Toast[];
  toast: (toast: Toast) => void;
};

const toastContext = createContext<ToastContext>({
  toasts: [],
  toast: (toast) => {},
});

const ContextProvider = toastContext.Provider;

export const useToast = () => useContext(toastContext);

export function ToastProvider(props: { children: ReactNode }) {
  const scrollRef = useRef<HTMLOListElement>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (toast: Toast) => setToasts((p) => [...p, toast]),
    [],
  );

  const desktopElement =
    typeof document !== "undefined"
      ? document.getElementById("rxosdesktop")
      : null;

  useLayoutEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [toasts.length]);

  return (
    <Provider>
      <ContextProvider
        value={{
          toast: toast,
          toasts,
        }}
      >
        {props.children}
        {toasts.map((toast, i) => (
          <Root asChild type={toast.type} key={i}>
            <Card size="2" style={{ minWidth: 250 }} mt="3">
              <Flex direction="column" gap="1">
                <Title>
                  <Text weight="bold" size="2">
                    {toast.title}
                  </Text>
                </Title>
                {toast.description ? (
                  <Description>
                    <Text size="2">{toast.description}</Text>
                  </Description>
                ) : null}
                <Flex direction="row" gap="3" mt="2">
                  {toast.action ? (
                    <Action
                      altText={
                        toast.action.altText ??
                        toast.action.label?.toString() ??
                        ""
                      }
                      asChild
                    >
                      <Button
                        style={{
                          flex: 1,
                          width: "100%",
                          minWidth: "max-content",
                        }}
                        onClick={toast.action.onClick}
                      >
                        {toast.action.label}
                      </Button>
                    </Action>
                  ) : null}
                  <Close asChild>
                    <Button
                      style={{
                        flex: 1,
                        width: "100%",
                        minWidth: "max-content",
                      }}
                      variant="soft"
                    >
                      <Text size="2">
                        {toast.dismissText ?? "Dismiss"}
                      </Text>
                    </Button>
                  </Close>
                </Flex>
              </Flex>
            </Card>
          </Root>
        ))}
        {desktopElement
          ? ReactDOM.createPortal(
              <Viewport
                ref={scrollRef}
                style={{
                  position: "fixed",
                  bottom: 24,
                  right: 8,
                  maxHeight: "calc(100vh - 40px)",
                  overflowX: "auto",
                  zIndex: 99,
                }}
              />,
              desktopElement,
            )
          : null}
      </ContextProvider>
    </Provider>
  );
}
