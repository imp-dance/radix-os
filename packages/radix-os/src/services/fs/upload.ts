import { FsFile } from "../../stores/fs";

export async function createFile(file: File): Promise<FsFile> {
  let data = "";
  let launcher = [];

  const typeIs = (type: string) => file.type.startsWith(type);

  switch (true) {
    case typeIs("image/"):
      launcher.push("image");
      if (file.name.endsWith("svg")) {
        data = await parseTextFile(file);
        if (data.trim().startsWith("<")) break;
      }
      data = await parseImageData(file);
      break;
    case typeIs("text/html"):
      launcher.push("web");
      data = await parseTextFile(file);
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

function parseImageData(file: File): Promise<string> {
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
