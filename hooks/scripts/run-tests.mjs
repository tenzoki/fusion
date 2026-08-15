// ---------------------------------------------------------------------------
// `npm test` — compile, then run vitest against a build no other run can touch.
//
// The suite has to survive being run concurrently with itself in one checkout:
// `agents/orchestrator.md` Step 3a dispatches executors in parallel batches
// whose FILE SETS are disjoint, and each of them runs this command to decide
// whether its own change lands. Disjoint sources did not make the runs
// disjoint, because `hooks/dist/` was shared build output every run deleted.
// `scripts/build.mjs` explains what replaced the delete and why.
//
// What this script adds on top of the atomic sync: the staging build stays
// alive for the duration of the run and `FUSION_TEST_DIST` names it. The two
// cases that spawn or copy a compiled artifact resolve it from there
// (`lib/__tests__/helpers/guard-harness.ts`, `TEST_DIST`), so nothing in the
// suite reads the CONTENT of the shared `hooks/dist/` at all. What remains
// pointed at the shared tree is the citation lint's existence check, and an
// atomic rename never makes a live path momentarily absent.
//
// Arguments are forwarded to vitest, so `npm test -- lib/__tests__/x.test.ts`
// works as before.
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { HOOKS_DIR, buildToStaging, syncIntoDist } from "./build.mjs";

const staging = buildToStaging();
let status = 1;
try {
  syncIntoDist(staging);

  const vitest = join(HOOKS_DIR, "node_modules", ".bin", "vitest");
  if (!existsSync(vitest)) {
    throw new Error(`${vitest} not found — run \`npm install\` in hooks/.`);
  }
  const run = spawnSync(vitest, ["run", ...process.argv.slice(2)], {
    cwd: HOOKS_DIR,
    stdio: "inherit",
    env: { ...process.env, FUSION_TEST_DIST: staging },
  });
  // A signalled vitest has a null status; report it as a failure rather than
  // as the 0 a `?? 0` would produce.
  status = run.status ?? 1;
} finally {
  rmSync(staging, { recursive: true, force: true });
}
process.exit(status);
