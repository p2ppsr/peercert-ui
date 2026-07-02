import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "build",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Replace Vite's node:crypto warning-Proxy stub with an inert empty
      // module — @bsv/sdk probes node crypto on every hash, and the Proxy
      // stub makes that probe pathologically slow (main-thread freezes
      // during merkle-path verification).
      "node:crypto": path.resolve(__dirname, "./src/shims/empty-crypto.ts"),
      crypto: path.resolve(__dirname, "./src/shims/empty-crypto.ts"),
    },
  },
}));
