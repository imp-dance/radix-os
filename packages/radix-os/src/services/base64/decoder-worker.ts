export const decoderWorker = /*js*/ `const buffers = {};

self.onmessage = function (e) {
  const { type, data, id } = e.data;
  if (type === "mimeType") {
    buffers[id] = {
      base64Buffer: "",
      mimeTypeBuffer: data,
    };
    return;
  }
  if (type === "chunk") {
    if (!buffers[id]) return;
    buffers[id].base64Buffer += data;
    return;
  }
  if (type === "end") {
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
      self.postMessage({
        type: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }

    delete buffers[id];
  }
};`;
