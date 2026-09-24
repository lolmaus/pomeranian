import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CounterFixture } from "./counter-fixture";
import "./styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("The counter fixture requires its root element.");

createRoot(container).render(
  <StrictMode>
    <CounterFixture />
  </StrictMode>,
);
