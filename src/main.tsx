import "@radix-ui/themes/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import RadixOS from "./RadixOS.tsx";
import { fsZustandIntegration } from "./stores/fs.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RadixOS fs={fsZustandIntegration} />
  </StrictMode>
);
