import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig(({ mode }) => {
  const env = {
    ...loadEnv(mode, fileURLToPath(new URL(".", import.meta.url)), "VITE_"),
    ...process.env,
  };
  return {
    define: {
      "import.meta.env.VITE_NOINDEX": JSON.stringify(
        env.VERCEL_ENV && env.VERCEL_ENV !== "production"
          ? "true"
          : env.VITE_NOINDEX || "false",
      ),
    },
    plugins: [react(), tailwindcss()],
    server: { host: "0.0.0.0", proxy: { "/api": "http://localhost:5000" } },
    build: { outDir: "../dist", emptyOutDir: true },
  };
});
