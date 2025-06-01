import {
  Button,
  Code,
  Flex,
  Spinner,
  Text,
} from "@radix-ui/themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { RadixOsAppComponent } from "../../../stores/window";
import { OpenFileDialog } from "../../OpenFileDialog/OpenFileDialog";
import { MIME_BASE64_SEPARATOR } from "../../../services/base64/base64";
import WaveSurfer from "wavesurfer.js";
import styles from "./AudioPlayer.module.css";
import { useSettingsStore } from "../../../stores/settings";
import { useDecodeB64MT } from "../../../hooks/useDecodeBase64";

export const AudioPlayer: RadixOsAppComponent = (props) => {
  const settings = useSettingsStore();

  const startedRef = useRef(false);
  const darkMode = settings.theme === "dark";
  const vizRef = useRef<HTMLDivElement>(null);
  const errorTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >();
  const [openedFile, setOpenedFile] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const trimmedData =
    props.file?.file.data.trim() ?? openedFile ?? "";
  const blob = useDecodeB64MT(trimmedData);

  const audioUrl = useMemo(() => {
    if (!blob) {
      return "";
    }
    return typeof window !== "undefined"
      ? window.URL.createObjectURL(blob)
      : "";
  }, [blob]);

  useEffect(() => {
    if (!audioUrl) return;
    if (!vizRef.current) return;
    if (typeof document === "undefined") return;
    const ctx = document
      .createElement("canvas")
      .getContext("2d");
    if (!ctx) return;
    const bg = darkMode ? `255, 255, 255` : `0, 0, 0`;
    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0, `rgba(${bg}, 1)`);
    gradient.addColorStop(0.8, `rgba(${bg}, 0.4)`);
    gradient.addColorStop(1, `rgba(${bg}, 0.5)`);
    const instance = WaveSurfer.create({
      container: vizRef.current,
      mediaControls: true,
      url: undefined,
      progressColor: `rgba(${bg},0.3)`,
      waveColor: gradient,
      cursorColor: `rgba(${bg},0.4)`,
      barWidth: 2,
      fillParent: true,
      normalize: false,
    });
    setLoading(true);
    instance
      .load(audioUrl)
      .then(() => {
        setErr(false);
        clearTimeout(errorTimeoutRef.current);
        instance.play();
      })
      .catch((err) => {
        errorTimeoutRef.current = setTimeout(() => {
          setErr(true);
        }, 1000);
      })
      .finally(() => setLoading(false));
    return () => {
      instance.destroy();
      setLoading(true);
      clearTimeout(errorTimeoutRef.current);
      setErr(false);
    };
  }, [audioUrl, darkMode]);

  return (
    <Flex
      style={{ height: "100%", background: "var(--gray-3)" }}
      direction="column"
      p="3"
      align="end"
      justify="center"
    >
      {fileDialogOpen && (
        <OpenFileDialog
          open={fileDialogOpen}
          setOpen={setFileDialogOpen}
          onFileOpened={(file) => setOpenedFile(file.data)}
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
      {audioUrl === null ? (
        <Flex mx="auto" my="auto" gap="2">
          <Spinner />
          <Text color="gray">Loading audio...</Text>
        </Flex>
      ) : null}
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div ref={vizRef} />
      </div>
      {/* <audio
        controls
        src={audioUrl}

        autoPlay
      /> */}
    </Flex>
  );
};
