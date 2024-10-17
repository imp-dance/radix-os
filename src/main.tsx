import "@radix-ui/themes/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Providers } from "./Providers.tsx";
import RadixOS from "./RadixOS.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <RadixOS />
    </Providers>
  </StrictMode>
);
