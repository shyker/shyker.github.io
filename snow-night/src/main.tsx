import React from "react";
import { createRoot } from "react-dom/client";
import { SnowNightShowcase } from "./SnowNightShowcase";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SnowNightShowcase />
  </React.StrictMode>,
);
