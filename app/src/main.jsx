import React from "react";
import ReactDOM from "react-dom/client";
import "../data/demo-state.js";
import "../data/run-library.js";
import "../data/run-payloads.js";
import "../styles.css";
import { ShipSentinelApp } from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ShipSentinelApp />
  </React.StrictMode>
);
