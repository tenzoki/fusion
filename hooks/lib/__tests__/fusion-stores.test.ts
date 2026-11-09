import { it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { CAMPAIGN_RECORD, CAMPAIGN_STORE, CONTAINER_STORE, RECORD_STORES, WINDOW_LEGACY_NAMES } from "../stores.js";
import { EVIDENCE_SUFFIX, isControlFile, JSON_STATE_DIR, narrativeOf, PACKAGE_CONTROL, RECORD_CONTROL_SUFFIX, WORKBENCH_MANIFEST } from "../stores.js";

// `bin/fusion-stores` is the bash copy of the table in `hooks/lib/stores.ts`, legacy entries included.
it("bin/fusion-stores prints the names hooks/lib/stores.ts holds, the window's legacy names too", () => {
  const r = spawnSync(join(pluginRoot, "bin", "fusion-stores"), { encoding: "utf-8" });
  expect(r.status, r.stderr).toBe(0);
  const out = Object.fromEntries(r.stdout.trim().split("\n").map((l) => l.split("=")));
  const kinds: Record<string, string> = { CONTAINER: CONTAINER_STORE, PLAN: "plans", CONSULT: "consultations", CAMPAIGN: CAMPAIGN_STORE };
  for (const [k, v] of Object.entries(kinds)) expect(out[`${k}_STORE`], k).toBe(v);
  expect(Object.keys(out), "the four lines, in the header's order").toEqual(Object.keys(kinds).map((k) => `${k}_STORE`));
  expect(RECORD_STORES).toEqual(expect.arrayContaining([out.PLAN_STORE, out.CONSULT_STORE]));
  expect(RECORD_STORES, "the campaign store is a root entry, not a store under shared/").not.toContain(out.CAMPAIGN_STORE);
  const legacy = Object.entries(kinds).filter(([k]) => out[`LEGACY_${k}_STORE`]).map(([k, v]) => [v, out[`LEGACY_${k}_STORE`]]);
  expect(Object.fromEntries(legacy)).toEqual({ ...WINDOW_LEGACY_NAMES });
});

// A text read of the codec's source, not an import: the hook build does not resolve the codec's package.
it("holds the JSON surface names equal to the codec's, and pairs each control file with its narrative", () => {
  const codec = readFileSync(join(pluginRoot, "codec", "src", "store.ts"), "utf-8");
  const constant = (name: string) => new RegExp(`export const ${name} = "([^"]+)";`).exec(codec)?.[1];
  expect([constant("WORKBENCH_MANIFEST"), constant("STATE_DIR"), constant("EVIDENCE_SUFFIX")]).toEqual([WORKBENCH_MANIFEST, JSON_STATE_DIR, EVIDENCE_SUFFIX]);
  expect(codec).toContain(`const EVIDENCE_NAME = ${readFileSync(join(pluginRoot, "hooks", "lib", "stores.ts"), "utf-8").match(/const EVIDENCE_NAME = (.*);/)?.[1]};`);
  expect(["work-packages/d/package.json", "shared/issues/a.record.json", "r/a.evidence.json", "r/a.2.evidence.json", "r/a.02.evidence.json", "package.json", "a.md"].map((p) => narrativeOf(p)))
    .toEqual(["work-packages/d/d.md", "shared/issues/a.md", "r/a.md", "r/a.md", "r/a.02.md", null, null]);
  expect(["package.json", "a.record.json", "a.evidence.json", CAMPAIGN_RECORD, "a.json", "a.md"].map(isControlFile)).toEqual([true, true, true, false, false, false]);
  // The campaign path is the schema's own statement, read as text for the same reason.
  expect(readFileSync(join(pluginRoot, "codec", "schemas", "campaign.schema.json"), "utf-8")).toContain(`${CAMPAIGN_STORE}/<id>/${CAMPAIGN_RECORD}`);
});

/**
 * The names a one-line `isControlFile` admits, every term read: `=<name>` for
 * an equality, `*<suffix>` for an ending, a constant resolved to its string in
 * the same file. A term of another shape, or a constant that resolves to no
 * string, throws: a name the reading cannot see is the fault this replaces
 * (261109-0814-the-control-file-predicate-test-no-longer-sees-what-the-codec-admits.md).
 */
function admitted(source: string, line: RegExp): string[] {
  const body = line.exec(source)?.[1];
  if (body === undefined) throw new Error(`no predicate line matches ${line}`);
  return body.split("||").map((term) => {
    const m = /^\s*name(?: === (\S+)|\.endsWith\((\S+)\))\s*$/.exec(term);
    if (m === null) throw new Error(`a term of the predicate is neither an equality nor an ending: ${term.trim()}`);
    const operand = m[1] ?? m[2];
    const value = /^"[^"]+"$/.test(operand) ? operand.slice(1, -1) : new RegExp(`^(?:export )?const ${operand} = "([^"]+)";`, "m").exec(source)?.[1];
    if (value === undefined) throw new Error(`${operand} resolves to no string constant`);
    return `${m[1] === undefined ? "*" : "="}${value}`;
  }).sort();
}

const CODEC_PREDICATE = /^export const isControlFile = \(name: string\): boolean => (.*);$/m;
const HOOKS_PREDICATE = /^export function isControlFile\(name: string\): boolean \{\n {2}return (.*);\n\}$/m;

// The two predicates differ by one name and the difference is intended: the codec's names every file it reads, the
// hooks' the control half of a pair, and a campaign has no narrative (`hooks/lib/stores.ts` `isControlFile`).
it("holds the codec's control-file names equal to the hooks' plus the campaign record, constants resolved", () => {
  const codec = readFileSync(join(pluginRoot, "codec", "src", "store.ts"), "utf-8");
  const hooks = admitted(readFileSync(join(pluginRoot, "hooks", "lib", "stores.ts"), "utf-8"), HOOKS_PREDICATE);
  const expected = [...hooks, `=${CAMPAIGN_RECORD}`].sort();
  expect(hooks, "the hooks' line reads as the names the module exports").toEqual([`=${PACKAGE_CONTROL}`, `*${RECORD_CONTROL_SUFFIX}`, `*${EVIDENCE_SUFFIX}`].sort());
  expect(admitted(codec, CODEC_PREDICATE)).toEqual(expected);

  // Sensitivity: one further name on the codec's side, spelled as a literal or behind a constant, fails the comparison.
  const further = (term: string) => admitted(codec.replace(/^(export const isControlFile = .*);$/m, `$1 || ${term};`), CODEC_PREDICATE);
  for (const [term, name] of [['name === "lanes.json"', "=lanes.json"], ["name === STATE_DIR", `=${JSON_STATE_DIR}`], ["name.endsWith(ARCHIVE_DIR)", "*archive"]]) {
    expect(further(term), term).not.toEqual(expected);
    expect(further(term), term).toEqual([...expected, name].sort());
  }
  expect(() => further("name === NO_SUCH_CONSTANT")).toThrow(/resolves to no string constant/);
  expect(() => further("/x/.test(name)")).toThrow(/neither an equality nor an ending/);
});
