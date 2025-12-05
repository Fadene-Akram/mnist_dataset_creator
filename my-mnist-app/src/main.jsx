import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import MNISTDigitDrawer from "./MNISTDigitDrawer.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MNISTDigitDrawer />
  </StrictMode>
);
