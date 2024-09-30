import { Flex, TextField } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";

export function WebBrowser(props: {
  launchConfig?: {
    data: string;
    title: string;
  };
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const isLinked =
    props.launchConfig !== undefined &&
    props.launchConfig.data.startsWith("http");
  const [redirect, setRedirect] = useState("");
  const [url, setUrl] = useState(
    isLinked
      ? props.launchConfig!.data
      : props.launchConfig?.title ?? "https://haakon.dev"
  );

  useEffect(() => {
    const iframe = frameRef.current;
    if (!iframe) return;
    if (!props.launchConfig) return;
    if (!iframe.contentWindow) return;
    if (isLinked) return;
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(props.launchConfig.data);
    iframe.contentWindow.document.close();
  }, [props.launchConfig]);
  return (
    <Flex direction="column" gap="0" style={{ height: "100%" }}>
      <Flex align="center">
        <TextField.Root
          disabled={
            props.launchConfig !== undefined && !isLinked
          }
          value={
            isLinked
              ? props.launchConfig?.data
              : props.launchConfig?.title ?? url
          }
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: "100%" }}
          variant="classic"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setRedirect(url);
            }
          }}
          size="1"
        />
      </Flex>
      <iframe
        ref={frameRef}
        key={redirect ?? props.launchConfig?.title}
        src={
          isLinked
            ? props.launchConfig!.data
            : redirect ||
              (props.launchConfig ? "#" : "https://haakon.dev")
        }
        style={{
          flex: 1,
          border: "none",
          padding: 0,
          margin: 0,
          borderRadius: "var(--radius-2)",
        }}
      />
    </Flex>
  );
}
