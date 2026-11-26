import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"] },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // `server-only` throws outside the Next server bundler; stub it for unit tests.
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
});
