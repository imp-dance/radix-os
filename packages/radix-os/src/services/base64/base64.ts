import { decoderWorker } from "./decoder-worker";
export const MIME_BASE64_SEPARATOR = " B64 ";

/*
A string represented by two parts:
"{mimeType} B64 {base64}"
Ex: ""
*/
type RB64 = string & { __brand: "rb64" };
const brandRB64 = (input: string) => input as RB64;

export const encodeRb64 = (opts: {
  mimeType: string;
  base64: string;
}) => {
  const { mimeType, base64 } = opts;
  return brandRB64(
    `${mimeType}${MIME_BASE64_SEPARATOR}${base64}`,
  );
};
export const decodeRb64 = (input: RB64 | string) => {
  const [mimeType, base64] = input.split(MIME_BASE64_SEPARATOR);
  if (!base64) throw new Error("Invalid RB64 string");
  return {
    mimeType,
    base64,
  };
};

export class B64Worker {
  private id: number;
  private worker: Worker;
  private chunkSize: number;

  constructor(opts?: { chunkSize?: number }) {
    this.id = 0;
    this.worker = this.createWorker();
    this.chunkSize = opts?.chunkSize ?? 1_000_000;
  }

  private createWorker() {
    const decoderWorkerBlob = new Blob([decoderWorker], {
      type: "application/javascript",
    });
    const workerUrl =
      typeof window !== "undefined"
        ? window.URL.createObjectURL(decoderWorkerBlob)
        : "";
    return new Worker(workerUrl);
  }

  private generateId() {
    this.id++;
    return this.id.toString();
  }

  encodeFile(file: File) {
    return new Promise<{ base64: string; mimeType: string }>(
      (resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result !== "string") {
            const actualType =
              reader.result === null ? "null" : "ArrayBuffer";
            throw new Error(
              `Encountered unexpected "${actualType}" instead of "string" when reading file`,
            );
          }
          const [_dataUrl, base64] = reader.result.split(",");
          resolve({ base64, mimeType: file.type });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      },
    );
  }

  decodeFile(file: { base64: string; mimeType: string }) {
    const { mimeType, base64 } = file;

    const id = this.generateId();
    /*
      Sends file to worker in three parts:
      * mimeType
      * chunks (up to many iterations)
      * end
      
      The worker stores the data in a buffer indexed by the request id.
      After sending the end-signal (last chunk) - the base64 is decoded
      on the worker and sent back, then the chunks are cleared from memory.
    */
    return new Promise<Blob>((resolve, reject) => {
      this.worker.postMessage({
        type: "mimeType",
        data: mimeType,
        id,
      });
      this.sendChunks(base64, id);
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
          this.worker.removeEventListener("message", listener);
          return;
        }
        if (data.blob) {
          resolve(data.blob);
          this.worker.removeEventListener("message", listener);
        }
      };
      this.worker.addEventListener("message", listener);
    });
  }

  private sendChunks(base64: string, id: string) {
    let i = 0;
    const chunkSize = this.chunkSize;
    const total = base64.length;
    const worker = this.worker;
    function sendNext() {
      if (i < total) {
        const chunk = base64.slice(i, i + chunkSize);
        worker.postMessage({ type: "chunk", data: chunk, id });
        i += chunkSize;
        // We use setTimeout to yield back to the event loop inbetween iterations
        // this is to ensure a smooth ui while the file is being sent for decoding
        setTimeout(sendNext, 0);
      } else {
        worker.postMessage({ type: "end", id });
      }
    }

    sendNext();
  }
}

export const base64Worker = new B64Worker();
