import { Button, Flex } from "@radix-ui/themes";
import { useState } from "react";
import { RadixOsAppComponent } from "../../../stores/window";
import { OpenFileDialog } from "../../OpenFileDialog/OpenFileDialog";

export const ImageViewer: RadixOsAppComponent = (props) => {
  const [openedFile, setOpenedFile] = useState("");
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const trimmedData =
    props.file?.file.data.trim() ?? openedFile ?? "";
  const isImageUrl =
    trimmedData.startsWith("http") ||
    trimmedData.startsWith("data:image");
  const isSvgData =
    trimmedData.startsWith("<?xml") ||
    trimmedData.startsWith("<svg") ||
    trimmedData.startsWith("<!DOCTYPE svg");
  return (
    <Flex style={{ height: "100%" }} direction="column">
      {fileDialogOpen && (
        <OpenFileDialog
          open={fileDialogOpen}
          setOpen={setFileDialogOpen}
          onFileOpened={(file, path) => setOpenedFile(file.data)}
          fileDisabled={(file) =>
            !file.launcher.includes("image")
          }
        />
      )}
      {trimmedData === "" && (
        <div style={{ margin: "auto" }}>
          <Button onClick={() => setFileDialogOpen(true)}>
            Open file
          </Button>
        </div>
      )}
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
