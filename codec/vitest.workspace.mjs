import { configDefaults, defineWorkspace } from "vitest/config";

// Two projects under the one entry point, `vitest run`: every file but one in
// the parallel pool, and `migration.test.ts` alone after the pool has drained.
//
// Why: that file holds each request over the largest measured store to the
// record client's 5 s post-wait allowance (`POST_WAIT_MARGIN_MS` in
// `hooks/lib/record-client.ts`), a wall-clock statement about one codec
// process working a store with nothing beside it. Its work is fsync-bound, so
// in the pool it was timed against the other files' disk traffic and went red
// on chunks that take under 2 s alone (issue 261112-0728). Run after the pool,
// the 5 s is measured against the code and not against the suite.
//
// How it holds: vitest 2.1's forks pool awaits every file of the projects
// without `singleFork` before it starts the files of a project with it
// (`createForksPool` in vitest's `resolveConfig` chunk; `package-lock.json`
// pins 2.1.9). This is the pool's behaviour, not a documented contract: a
// vitest upgrade re-reads that function, and vitest 3.2's
// `sequence.groupOrder` states the same order as configuration.
//
// The whole file moves, not its one describe: the large store is built by the
// file's own generator, and a second file would need that generator shared.
const ALONE = "src/__tests__/migration.test.ts";

export default defineWorkspace([
  {
    extends: "./vitest.config.mjs",
    test: { name: "pool", include: ["src/**/*.test.ts"], exclude: [...configDefaults.exclude, ALONE] },
  },
  {
    extends: "./vitest.config.mjs",
    test: { name: "alone", include: [ALONE], poolOptions: { forks: { singleFork: true } } },
  },
]);
