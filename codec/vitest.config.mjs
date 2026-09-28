import { BaseSequencer } from "vitest/node";
import { defineConfig } from "vitest/config";

// Plain ESM rather than `.ts`, as `hooks/vitest.config.mjs` is: the package's
// `tsconfig.json` includes `src/**/*.ts` only, so a `.ts` config would sit
// outside the typecheck for no gain.
//
// The bundle gate (`committed-bundle.test.ts`) is scheduled last, as the FJ01
// plan asks: it is the one suite whose red says "commit the build", not "the
// code is wrong", and it is the slowest, so the readable output ends with it.
// Scheduled last is not finished last under parallel workers; what it buys is
// that every other file has started before the gate takes a worker.
class GateLast extends BaseSequencer {
  async sort(files) {
    const sorted = await super.sort(files);
    const isGate = (f) => (typeof f === "string" ? f : (f.moduleId ?? f[1] ?? "")).endsWith("committed-bundle.test.ts");
    return [...sorted.filter((f) => !isGate(f)), ...sorted.filter(isGate)];
  }
}

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    sequence: { sequencer: GateLast },
    // The CLI cases spawn `node` on the bundle and the gate runs esbuild over
    // a git archive extract; both are slower than the default 5 s on a loaded machine.
    testTimeout: 30_000,
  },
});
