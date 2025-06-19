import {
  Button,
  Code,
  Flex,
  Select,
  Slider,
  Spinner,
  Text,
} from "@radix-ui/themes";
import { useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useDebounceValue } from "../../../hooks/useDebounceValue";
import { useDecodeB64MT } from "../../../hooks/useDecodeBase64";
import { useResizeObserver } from "../../../hooks/useResizeObserver";
import { MIME_BASE64_SEPARATOR } from "../../../services/base64/base64";
import { useSettingsStore } from "../../../stores/settings";
import { RadixOsAppComponent } from "../../../stores/window";
import { OpenFileDialog } from "../../OpenFileDialog/OpenFileDialog";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PDFViewer: RadixOsAppComponent = (props) => {
  const [numPages, setNumPages] = useState<number>();
  const [scale, setScale] = useState<number>(0.9);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const settings = useSettingsStore();
  const [openedFile, setOpenedFile] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const trimmedData =
    (openedFile || props.file?.file.data.trim()) ?? "";
  const blob = useDecodeB64MT(trimmedData);
  const ref = useRef<HTMLDivElement>(null);
  const { width = 100 } = useResizeObserver({
    ref,
    box: "border-box",
  });
  const [debouncedWidth] = useDebounceValue(width, 100);

  const pdfUrl = useMemo(() => {
    if (!blob) {
      return "";
    }
    return typeof window !== "undefined"
      ? window.URL.createObjectURL(blob)
      : "";
  }, [blob, trimmedData.length]);

  return (
    <Flex
      style={{
        height: "100%",
        background: "var(--gray-2)",
      }}
      direction="column"
      align="center"
      justify="start"
      ref={ref}
    >
      {fileDialogOpen && (
        <OpenFileDialog
          open={fileDialogOpen}
          setOpen={setFileDialogOpen}
          onFileOpened={(file) => setOpenedFile(file.data)}
          fileDisabled={(file) => !file.launcher.includes("pdf")}
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
          {err && !loading ? (
            <Flex
              mx="auto"
              mt="auto"
              direction="column"
              style={{ position: "absolute", inset: "0" }}
              p="5"
            >
              <Text weight="bold" size="1">
                Failed to load file.
              </Text>
              <div>
                <Code size="1" color="gray">
                  {props.file?.file?.name}
                </Code>
              </div>
              <div>
                <Code size="1" color="red">
                  {trimmedData.split(MIME_BASE64_SEPARATOR)[0]}
                </Code>
              </div>
            </Flex>
          ) : null}
          {pdfUrl === null ? (
            <Flex mx="auto" my="auto" gap="2">
              <Spinner />
              <Text color="gray">Loading pdf...</Text>
            </Flex>
          ) : (
            <>
              {numPages ? (
                <Flex
                  p="2"
                  justify="start"
                  align="center"
                  gap="2"
                  pb="3"
                  mb="5"
                  style={{
                    width: "calc(100% - 4px)",
                    position: "sticky",
                    top: 0,
                    right: 1,
                    left: 1,
                    zIndex: 2,
                    background:
                      settings.theme === "dark"
                        ? "var(--gray-3)"
                        : "var(--gray-3)",
                  }}
                >
                  <Button
                    onClick={() => setFileDialogOpen(true)}
                    variant="outline"
                    color="gray"
                  >
                    Open file
                  </Button>
                  <Select.Root
                    size="2"
                    value={pageNumber.toString()}
                    onValueChange={(value) =>
                      setPageNumber(Number(value))
                    }
                  >
                    <Select.Trigger variant="ghost" ml="2">
                      Page {pageNumber} of {numPages ?? "?"}
                    </Select.Trigger>
                    <Select.Content>
                      {Array.from(
                        { length: numPages },
                        (_, i) => (
                          <Select.Item
                            key={i + 1}
                            value={`${i + 1}`}
                          >
                            Page {i + 1}
                          </Select.Item>
                        )
                      )}
                    </Select.Content>
                  </Select.Root>
                  <Flex
                    direction="row"
                    align="center"
                    gap="2"
                    style={{ marginLeft: "auto" }}
                  >
                    <Text
                      size="1"
                      color="gray"
                      style={{
                        width: "max-content",
                        textWrap: "nowrap",
                      }}
                    >
                      {Math.round(scale * 100)}%
                    </Text>
                    <Slider
                      style={{
                        width: "100%",
                        flexShrink: 0,
                        maxWidth: 150,
                        minWidth: 150,
                      }}
                      value={[scale]}
                      onValueChange={([v]) => setScale(v)}
                      min={0.1}
                      size="3"
                      step={0.05}
                      max={2}
                    />
                  </Flex>
                </Flex>
              ) : null}
              <div
                style={{
                  minHeight: 300,
                  maxWidth: width - 30,
                  overflowX: "auto",
                  color: "#000",
                  position: "relative",
                  zIndex: 1,
                  marginBottom: "var(--space-5)",
                }}
              >
                <Document
                  file={pdfUrl}
                  onLoadStart={() => {
                    setLoading(true);
                  }}
                  onLoadSuccess={(e) => {
                    setLoading(false);
                    setNumPages(e.numPages);
                  }}
                  onLoadError={() => {
                    setErr(true);
                    setLoading(false);
                  }}
                >
                  <Page
                    width={debouncedWidth}
                    pageNumber={pageNumber}
                    scale={scale}
                  />
                </Document>
              </div>
            </>
          )}
        </>
      )}
    </Flex>
  );
};
