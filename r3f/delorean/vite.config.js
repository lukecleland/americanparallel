import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  esbuild: {
    pure: ["console.log"], // example: have esbuild remove any console.log
    minifyIdentifiers: false, // but keep variable names
  },
  build: {
    minify: "esbuild",
  },
});
