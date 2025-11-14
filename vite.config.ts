import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["@surrealdb/wasm"],
  },
  build: {
    target: "esnext",
  },
});
