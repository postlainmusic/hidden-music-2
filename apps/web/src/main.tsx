import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initErrorWatchdog } from "./utils/telemetry";

// Initialize global bug & error telemetry watchdog
initErrorWatchdog();

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

