import { Flex, TextField } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import { RadixOsAppComponent } from "../../../stores/window";

export const WebBrowser: RadixOsAppComponent = (props) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const isLinked =
    props.file !== undefined &&
    props.file.file.data.startsWith("http");
  const [redirect, setRedirect] = useState("");
  const [url, setUrl] = useState(
    isLinked
      ? props.file?.file.data!
      : "https://radix-os.netlify.app/"
  );

  useEffect(() => {
    const iframe = frameRef.current;
    if (!iframe) return;
    if (!props.file) return;
    if (!iframe.contentWindow) return;
    if (isLinked) return;
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(props.file.file.data);
    iframe.contentWindow.document.close();
  }, [props.file, isLinked]);
  return (
    <Flex direction="column" gap="0" style={{ height: "100%" }}>
      <Flex align="center" gap="2">
        <TextField.Root
          disabled={props.file !== undefined && !isLinked}
          value={
            isLinked ? props.file?.file.data : props.file?.path
          }
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: "100%", borderRadius: "0" }}
          variant="classic"
          color="indigo"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setRedirect(url!);
            }
          }}
          size="1"
        />
      </Flex>
      <iframe
        ref={frameRef}
        key={redirect ?? props.file?.path}
        src={
          isLinked
            ? props.file?.file.data!
            : redirect ||
              (props.file
                ? "#"
                : "https://radix-os.netlify.app/")
        }
        style={{
          flex: 1,
          border: "none",
          padding: 0,
          margin: 0,
          borderRadius: "var(--radius-2)",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      />
    </Flex>
  );
};
