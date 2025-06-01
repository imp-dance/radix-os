export const decoderWorker = `const buffers = {};

self.onmessage = function (e) {
  const { type, data, id } = e.data;
  if (type === "mimeType") {
    buffers[id] = {
      base64Buffer: "",
      mimeTypeBuffer: data,
    };
  }
  if (type === "chunk") {
    if (!buffers[id]) return;
    buffers[id].base64Buffer += data;
  } else if (type === "end") {
    if (!buffers[id]) return;
    try {
      const binaryString = atob(buffers[id].base64Buffer);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes.buffer], {
        type: buffers[id].mimeTypeBuffer,
      });
      self.postMessage({ type: "result", blob, id });
    } catch (err) {
      if (err instanceof Error) {
        self.postMessage({
          type: "error",
          error: err.message,
          id,
        });
      } else {
        self.postMessage({
          type: "error",
          error: "error",
          id,
        });
      }
    }

    buffers[id] = null;
  }
};`;
