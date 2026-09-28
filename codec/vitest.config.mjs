import { defineConfig } from "vitest/config";

// Plain ESM rather than `.ts`, as `hooks/vitest.config.mjs` is: the package's
// `tsconfig.json` includes `src/**/*.ts` only, so a `.ts` config would sit
// outside the typecheck for no gain. Nothing here spawns processes, so the
// worker cap the hooks suite needs does not apply.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
