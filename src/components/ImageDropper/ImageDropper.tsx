import { Text } from "@radix-ui/themes";
import { useState } from "react";

export function ImageDropper(props: {
  onChange: (base64img: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  function getDataUrl(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  return (
    <label
      style={{
        display: "block",
        padding: "var(--space-3)",
        border: isDragging
          ? "2px dotted var(--indigo-5)"
          : "2px dotted var(--gray-5)",
        background: isDragging ? "var(--gray-1)" : "transparent",
        textAlign: "center",
      }}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (!file) return;
        getDataUrl(file).then((base64img) => {
          props.onChange(base64img);
        });
      }}
      onChange={(e) => {
        e.preventDefault();
        if (!(e.target instanceof HTMLInputElement)) return;
        if (!e.target.files) return;
        const file = e.target.files[0];
        if (!file) return;
        getDataUrl(file).then((base64img) => {
          props.onChange(base64img);
        });
      }}
    >
      <Text size="1" color="indigo" weight="medium">
        Drop image here
      </Text>
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
      />
    </label>
  );
}
