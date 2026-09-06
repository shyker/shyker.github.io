import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: __dirname,
  publicDir: "../public",
  plugins: [react()],
  server: {
    port: 5174,
  },
  preview: {
    port: 4174,
  },
  build: {
    outDir: "../dist/snow-night",
    emptyOutDir: true,
  },
});
