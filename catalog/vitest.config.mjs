import { defineConfig } from "vitest/config";

// Plain ESM rather than `.ts`, as `hooks/` and `codec/` do: `tsconfig.json`
// includes `src/**/*.ts` only, so a `.ts` config would sit outside the
// typecheck for no gain.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // The render cases read `git rev-parse HEAD` and write a temporary tree;
    // on a loaded machine that is slower than the 5 s default.
    testTimeout: 30_000,
  },
});
