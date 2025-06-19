import { FsFile } from "../../stores/fs";
import { encodeBase64WithMimeType } from "../base64/base64";

export async function createFile(
  file: File,
  handler?: (file: File) => Promise<FsFile | null>
): Promise<FsFile> {
  let data = "";
  let launcher = [];

  if (handler) {
    const result = await handler(file);
    if (result !== null) {
      return result;
    }
  }

  const typeIs = (type: string) => file.type.startsWith(type);

  switch (true) {
    case typeIs("image/"):
      launcher.push("image");
      if (file.name.endsWith("svg")) {
        data = await parseTextFile(file);
        if (data.trim().startsWith("<")) break;
      }
      data = await parseImageFile(file);
      break;
    case typeIs("application/pdf"):
      launcher.push("pdf");
      data = await parsePdfFile(file);
      break;
    case typeIs("text/html"):
      launcher.push("web");
      data = await parseTextFile(file);
      break;
    case typeIs("audio/"):
      data = await parseAudioFile(file);
      launcher.push("audio");
      break;
    case typeIs("video/"):
      data = await parseVideoFile(file);
      launcher.push("video");
      break;
    default:
      data = await parseTextFile(file);
      break;
  }

  if (!launcher.includes("code")) launcher.push("code");

  return {
    name: file.name,
    launcher,
    data,
  };
}

function parseImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const onload = (e: ProgressEvent<FileReader>) => {
      if (!e.target || !e.target.result) return reject();
      resolve(e.target.result.toString());
    };
    reader.onload = onload;
    reader.onerror = () => reject();
    reader.onabort = () => reject();
    reader.readAsDataURL(file);
  });
}

function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const onload = (e: ProgressEvent<FileReader>) => {
      if (!e.target || !e.target.result) return reject();
      resolve(e.target.result.toString());
    };
    reader.onload = onload;
    reader.onerror = () => reject();
    reader.onabort = () => reject();
    reader.readAsText(file);
  });
}

function parseAudioFile(file: File) {
  return encodeBase64WithMimeType(file);
}

function parseVideoFile(file: File) {
  return encodeBase64WithMimeType(file);
}

function parsePdfFile(file: File) {
  return encodeBase64WithMimeType(file);
}
