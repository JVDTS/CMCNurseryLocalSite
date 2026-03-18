import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
  ],
  // Ensure Vite loads env variables from the project root (where .env lives)
  // so that values like VITE_RECAPTCHA_SITE_KEY are available in the client
  envDir: __dirname,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
  "@shared": path.resolve(__dirname, "shared"),
  // shim date-fns-tz in case some files import utcToZonedTime/format
  // older/newer package builds sometimes expose different named exports
  "date-fns-tz": path.resolve(__dirname, "client", "src", "shims", "date-fns-tz.js"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
