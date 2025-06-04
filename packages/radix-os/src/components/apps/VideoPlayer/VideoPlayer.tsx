import { Button, Flex, Spinner, Text } from "@radix-ui/themes";
import { useMemo, useState } from "react";
import { useDecodeB64MT } from "../../../hooks/useDecodeBase64";
import { RadixOsAppComponent } from "../../../stores/window";
import { OpenFileDialog } from "../../OpenFileDialog/OpenFileDialog";

export const VideoPlayer: RadixOsAppComponent = (props) => {
  const [openedFile, setOpenedFile] = useState("");
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const trimmedData =
    props.file?.file.data.trim() ?? openedFile ?? "";
  const blob = useDecodeB64MT(trimmedData);

  const videoUrl = useMemo(() => {
    if (blob) return window.URL.createObjectURL(blob);
    return null;
  }, [blob]);

  return (
    <Flex
      style={{ height: "100%", background: "var(--gray-3)" }}
      direction="column"
      p="3"
      align="stretch"
      justify="center"
    >
      {fileDialogOpen && (
        <OpenFileDialog
          open={fileDialogOpen}
          setOpen={setFileDialogOpen}
          onFileOpened={(file) => setOpenedFile(file.data)}
          fileDisabled={(file) =>
            !file.launcher.includes("video")
          }
        />
      )}
      {trimmedData === "" ? (
        <div style={{ margin: "auto" }}>
          <Button onClick={() => setFileDialogOpen(true)}>
            Open file
          </Button>
        </div>
      ) : (
        <>
          {!videoUrl ? (
            <Flex mx="auto" my="auto" align="center" gap="2">
              <Spinner />
              <Text mx="auto" my="auto" color="gray">
                Loading video...
              </Text>
            </Flex>
          ) : (
            <video
              src={videoUrl}
              style={{ maxWidth: "100%" }}
              controls
            />
          )}
        </>
      )}
    </Flex>
  );
};
