import { it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { CONTAINER_STORE, RECORD_STORES, WINDOW_LEGACY_NAMES } from "../stores.js";
import { EVIDENCE_SUFFIX, isControlFile, JSON_STATE_DIR, narrativeOf, PACKAGE_CONTROL, RECORD_CONTROL_SUFFIX, WORKBENCH_MANIFEST } from "../stores.js";

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

// A text read of the codec's source, not an import: the hook build does not resolve the codec's package.
it("holds the JSON surface names equal to the codec's, and pairs each control file with its narrative", () => {
  const codec = readFileSync(join(pluginRoot, "codec", "src", "store.ts"), "utf-8");
  const constant = (name: string) => new RegExp(`export const ${name} = "([^"]+)";`).exec(codec)?.[1];
  expect([constant("WORKBENCH_MANIFEST"), constant("STATE_DIR"), constant("EVIDENCE_SUFFIX")]).toEqual([WORKBENCH_MANIFEST, JSON_STATE_DIR, EVIDENCE_SUFFIX]);
  const predicate = /export const isControlFile = .*/.exec(codec)?.[0] ?? "";
  expect([...predicate.matchAll(/"([^"]+)"/g)].map((m) => m[1])).toEqual([PACKAGE_CONTROL, RECORD_CONTROL_SUFFIX]);
  expect(codec).toContain(`const EVIDENCE_NAME = ${readFileSync(join(pluginRoot, "hooks", "lib", "stores.ts"), "utf-8").match(/const EVIDENCE_NAME = (.*);/)?.[1]};`);
  expect(["work-packages/d/package.json", "shared/issues/a.record.json", "r/a.evidence.json", "r/a.2.evidence.json", "r/a.02.evidence.json", "package.json", "a.md"].map((p) => narrativeOf(p)))
    .toEqual(["work-packages/d/d.md", "shared/issues/a.md", "r/a.md", "r/a.md", "r/a.02.md", null, null]);
  expect(["package.json", "a.record.json", "a.evidence.json", "a.json", "a.md"].map(isControlFile)).toEqual([true, true, true, false, false]);
});
