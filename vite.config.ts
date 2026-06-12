import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// Configuração direta e robusta para o ambiente de produção
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 8080,
    host: true,
  }
});
