import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  // Keep the CRA output folder so the existing Vercel project keeps working.
  build: { outDir: "build", sourcemap: false, chunkSizeWarningLimit: 1200 },
  worker: { format: "es" },
  server: { port: 3000 },
  test: { environment: "node", include: ["src/**/*.test.js"] },
})
