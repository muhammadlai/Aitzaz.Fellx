import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { OsProvider } from "./state/OsProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OsProvider>
      <App />
    </OsProvider>
  </StrictMode>,
);
