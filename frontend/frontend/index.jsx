import React from "react";
import { createRoot } from "react-dom/client";
import ChatWidget from "./ChatWidget";
import "./theme.css";
var process={env:{}};
const url=new URL(window.location.href);
const dyn=url.searchParams.get("color");
if(dyn){document.documentElement.style.setProperty("--ci-primary",dyn);}
createRoot(document.getElementById("chatinn-root")).render(<ChatWidget/>);
