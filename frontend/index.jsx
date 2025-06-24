import React from "react";
import { createRoot } from "react-dom/client";
import ChatWidget from "./ChatWidget";
import "./theme.css";
if(typeof window!=='undefined'&&!window.process){window.process={env:{}};}
createRoot(document.getElementById("chatinn-root")).render(<ChatWidget />);