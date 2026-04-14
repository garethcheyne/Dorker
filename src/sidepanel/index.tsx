import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@/index.css";

// Connect to background so it can track panel open/close
chrome.runtime.connect({ name: "dorker-sidepanel" });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
