import { Flex } from "@radix-ui/themes";

export function ImageViewer(props: { src: string }) {
  const trimmedData = props.src.trim();
  const isImageUrl =
    trimmedData.startsWith("http") ||
    trimmedData.startsWith("data:image");
  const isSvgData =
    trimmedData.startsWith("<?xml") ||
    trimmedData.startsWith("<svg") ||
    trimmedData.startsWith("<!DOCTYPE svg");
  return (
    <Flex style={{ height: "100%" }} direction="column">
      {isImageUrl && (
        <img
          src={props.src}
          style={{
            height: "100%",
            width: "100%",
            objectFit: "contain",
            padding: "var(--space-5)",
          }}
        />
      )}
      {isSvgData && (
        <div
          style={{
            height: "100%",
            width: "100%",
            objectFit: "contain",
            padding: "var(--space-5)",
          }}
          className="svg-container"
          dangerouslySetInnerHTML={{ __html: props.src }}
        />
      )}
    </Flex>
  );
}
