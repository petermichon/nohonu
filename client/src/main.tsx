import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";

export function main() {
  const rootElement = document.getElementById("root")!;

  const root = createRoot(rootElement);

  const children: React.ReactNode = (
    <StrictMode>
      <App />
    </StrictMode>
  );

  root.render(children);
}
