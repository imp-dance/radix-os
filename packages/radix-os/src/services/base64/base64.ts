import Worker from "web-worker";
import { decoderWorker } from "./decoder-worker";
export const MIME_BASE64_SEPARATOR = " B64 ";

const decoderWorkerBlob = new Blob([decoderWorker], {
  type: "application/javascript",
});

const workerUrl =
  typeof window !== "undefined"
    ? window.URL.createObjectURL(decoderWorkerBlob)
    : "";

export async function encodeBase64WithMimeType(
  file: File,
): Promise<string> {
  const encoded = await fileToBase64(file);
  return (
    encoded.mimeType + MIME_BASE64_SEPARATOR + encoded.base64
  );
}

export function decodeBase64WithMimeType(
  file: string,
): Promise<Blob> {
  const [mimeType, base64] = file.split(MIME_BASE64_SEPARATOR);
  return base64ToBlobAsync(base64, mimeType);
}

export function fileToBase64(
  file: File,
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1]; // Remove the data URL prefix
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file); // This gives a data URL with MIME type prefix
  });
}

const decodeWorker = new Worker(workerUrl);

export async function base64ToBlobAsync(
  base64: string,
  mimeType: string,
) {
  return sendToWorker(decodeWorker, base64, mimeType);
}

let i = 0;
const generateId = () => {
  i++;
  return i.toString();
};

export async function sendToWorker(
  worker: Worker,
  base64: string,
  mimeType: string,
): Promise<Blob> {
  const id = generateId();
  return new Promise((resolve, reject) => {
    worker.postMessage({
      type: "mimeType",
      data: mimeType,
      id,
    });
    sendChunks(worker, base64, id);
    const listener = (e: MessageEvent) => {
      const data = e.data as {
        type: string;
        blob?: Blob;
        error?: string;
        id: string;
      };
      if (data.id !== id) return;
      if (data.type === "error") {
        reject(data.error);
        worker.removeEventListener("message", listener);
        return;
      }
      if (data.blob) {
        resolve(data.blob);
        worker.removeEventListener("message", listener);
      }
    };
    worker.addEventListener("message", listener);
  });
}

export function base64ToBlob(
  base64: string,
  mimeType: string,
): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (
    let offset = 0;
    offset < byteCharacters.length;
    offset += 512
  ) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}

function sendChunks(
  worker: Worker,
  base64: string,
  id: string,
  chunkSize = 1_000_000,
) {
  let i = 0;
  const total = base64.length;

  function sendNext() {
    if (i < total) {
      const chunk = base64.slice(i, i + chunkSize);
      worker.postMessage({ type: "chunk", data: chunk, id });
      i += chunkSize;
      setTimeout(sendNext, 0);
    } else {
      worker.postMessage({ type: "end", id });
    }
  }

  sendNext();
}
