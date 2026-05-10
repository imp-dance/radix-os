import { useEffect, useRef, useState } from "react";
import {
  base64Worker,
  decodeRb64,
} from "../services/base64/base64";

export function useDecodeB64MT(input: string) {
  const [output, setOutput] = useState<Blob | null>(null);
  const startedRef = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!input) return;
    if (!startedRef.current) {
      startedRef.current = true;
      const file = decodeRb64(input);
      base64Worker.decodeFile(file).then((blob) => {
        startedRef.current = false;
        setOutput(blob);
      });
    }
  }, [input]);

  return output;
}
