import { Flex } from "@radix-ui/themes";
import { RadixOsAppComponent } from "../../../stores/window";

export const ImageViewer: RadixOsAppComponent = (props) => {
  const trimmedData = props.file?.file.data.trim() ?? "";
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
          src={trimmedData}
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
          className="rxos-svgContainer"
          dangerouslySetInnerHTML={{ __html: trimmedData }}
        />
      )}
    </Flex>
  );
};
