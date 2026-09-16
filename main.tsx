import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SortGridApp from "./components/SortGridApp";
import "./app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SortGridApp />
  </StrictMode>,
);
