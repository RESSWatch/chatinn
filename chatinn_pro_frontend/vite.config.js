import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    lib: {
      entry: "index.jsx",
      name: "ChatInnWidget",
      fileName: () => "widget.js",
      formats: ["iife"],
    },
    minify: "esbuild",
  },
  plugins: [react()],
});
