import { useEffect, useRef, useState } from "react";
import { decodeBase64WithMimeType } from "../services/base64/base64";

export function useDecodeB64MT(input: string) {
  const [output, setOutput] = useState<Blob | null>(null);
  const startedRef = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!input) return;
    if (!startedRef.current) {
      startedRef.current = true;
      decodeBase64WithMimeType(input).then((blob) => {
        startedRef.current = false;
        setOutput(blob);
      });
    }
  }, [input]);

  return output;
}
