import React from "react";
import { createRoot } from "react-dom/client";
import ChatWidget from "./ChatWidget";
import "./theme.css";

// polyfill process for some dependencies
var process = { env: {} };

// dynamic color via ?color=
const url = new URL(window.location.href);
const dyn = url.searchParams.get("color");
if(dyn){
  document.documentElement.style.setProperty("--ci-primary", dyn);
}

const root = createRoot(document.getElementById("chatinn-root"));
root.render(<ChatWidget />);
