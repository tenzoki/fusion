import { it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { CONTAINER_STORE, RECORD_STORES, WINDOW_LEGACY_NAMES } from "../stores.js";

// `bin/fusion-stores` is the bash copy of the table in `hooks/lib/stores.ts`, legacy entries included.
it("bin/fusion-stores prints the names hooks/lib/stores.ts holds, the window's legacy names too", () => {
  const r = spawnSync(join(pluginRoot, "bin", "fusion-stores"), { encoding: "utf-8" });
  expect(r.status, r.stderr).toBe(0);
  const out = Object.fromEntries(r.stdout.trim().split("\n").map((l) => l.split("=")));
  const kinds: Record<string, string> = { CONTAINER: CONTAINER_STORE, PLAN: "plans", CONSULT: "consultations" };
  for (const [k, v] of Object.entries(kinds)) expect(out[`${k}_STORE`], k).toBe(v);
  expect(RECORD_STORES).toEqual(expect.arrayContaining([out.PLAN_STORE, out.CONSULT_STORE]));
  const legacy = Object.entries(kinds).filter(([k]) => out[`LEGACY_${k}_STORE`]).map(([k, v]) => [v, out[`LEGACY_${k}_STORE`]]);
  expect(Object.fromEntries(legacy)).toEqual({ ...WINDOW_LEGACY_NAMES });
});
