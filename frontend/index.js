
import React from "react";
import { createRoot } from "react-dom/client";
import ChatWidget from "./ChatWidget";

const root = createRoot(document.getElementById("chatinn-root"));
root.render(<ChatWidget />);
