import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.dirname(fileURLToPath(import.meta.url));
const websiteRoot = path.join(workspaceRoot, "website");

export default defineConfig({
  root: websiteRoot,
  build: {
    outDir: path.join(workspaceRoot, "dist", "client"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
  },
  plugins: [react()],
});
