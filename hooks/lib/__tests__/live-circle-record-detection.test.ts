import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { extractBashBlock } from "./helpers/prompt-blocks.js";

// The v11 conversion's blind spot (issue 260911-1126, fixed at `c08230fa`
// without this test, which its closing note records as owed). A workbench
// mid-work at the upgrade holds a container whose record still carries a LIVE
// marker, `_a_`/`_t_`. Neither surface saw that shape, so Setup reported the
// workbench current and the migration never ran — and `bin/fusion-claimed-item`
// resolves an item only through a container's same-named record, so such a
// container matches nothing, every `OUT_*` lands in `shared/`, and the item's
// artifacts stay unreachable for the life of the project — silently, because
// both surfaces keep saying "current". The negative half is what makes the
// probe safe to ship: a TERMINAL record (`_c_`, `_b_`, `_s_`, `_d_`) is history
// no migration pass opens, and this repository's own 24 legacy containers are
// all terminal — a probe that fired on them would refuse Setup here forever.
// Both surfaces are fenced bash inside shipped markdown, lifted whole at run
// time and executed as found: a pasted copy would only ever prove the copy.

const tmpRoots: string[] = [];
afterAll(() => { for (const d of tmpRoots) rmSync(d, { recursive: true, force: true }); });

/** The markdown a skill body ships, read once. `extractBashBlock` throws with the
 *  anchor named when the heading moves or the fence goes, so an anchor that has
 *  drifted fails the test instead of running an empty script. */
const md = (skill: string) => readFileSync(join(pluginRoot, "skills", skill, "SKILL.md"), "utf-8");

/** A throwaway workbench holding one container, whose record is `record`. Never
 *  this repository's own: both blocks are anchored at `./fusion-workbench` and
 *  would otherwise probe the live tree. */
function tree(record: string): string {
  const dir = mkdtempSync(join(tmpdir(), "live-circle-record-"));
  tmpRoots.push(dir);
  const c = join(dir, "fusion-workbench", "circles", "sample-item");
  mkdirSync(c, { recursive: true });
  writeFileSync(join(c, record), "# Sample\n");
  return dir;
}

/** Process substitution and the `*[[]*[]]*` globs both need a real bash. */
function run(src: string, cwd: string): string {
  const r = spawnSync("bash", ["-c", src], { cwd, encoding: "utf-8" });
  expect(r.status, `the extracted block exited non-zero: ${r.stderr}`).toBe(0);
  return r.stdout ?? "";
}

const setupProbe = extractBashBlock(md("setup"), "### Superseded-format check");
const migrateMd = md("migrate");
const migrateSurvey = extractBashBlock(migrateMd, "### The containers, and what happens to the record");

describe("a container whose record still carries a live marker", () => {
  it("is a superseded format to /fusion:setup, which routes to the migration", () => {
    expect(run(setupProbe, tree("_t_circle.md"))).toMatch(/^OLD=1$/m);
  });
  it("is one convertible record to /fusion:migrate", () => {
    expect(run(migrateSurvey, tree("_t_circle.md"))).toMatch(/^LIVE=1$/m);
  });
  it("reaches /fusion:migrate's stop only below the block that counts it", () => {
    const end = migrateMd.indexOf(migrateSurvey) + migrateSurvey.length;
    expect(migrateMd.indexOf("**If the total is 0: stop here.**"), "skills/migrate/SKILL.md Step 2: '**If the total is 0: stop here.**' is missing, or sits above the second survey block (which ends at the index expected below) — that block is the only one finding a live record, so a stop between the two fires on a count that has not reached it").toBeGreaterThan(end);
  });
});

describe("a container whose record is terminal", () => {
  it("leaves /fusion:setup's verdict at current", () => {
    expect(run(setupProbe, tree("_c_circle.md"))).toMatch(/^OLD=0$/m);
  });
  it("is counted by /fusion:migrate and never converted", () => {
    const out = run(migrateSurvey, tree("_c_circle.md"));
    expect(out).toMatch(/^LIVE=0$/m);
    expect(out).toMatch(/^TERMINAL=1$/m);
  });
});

// Issue 260924-1732, run the same way: the periodic-check stamps travelled in the tracked marker, so a
// checkout that pulled another's skipped checks it never ran. They live in the class L `.check-stamps`.
describe("a pulled marker stamping every periodic check", () => {
  it("makes no selector count as done, loses the stamps, and a stamp taken here is read", () => {
    process.env.FUSION_PLUGIN_ROOT = pluginRoot;
    const setup = extractBashBlock(md("setup"), "Write the setup marker"), dir = tree("x.md"), m = join(dir, "fusion-workbench", ".fusion-setup");
    const SEL: string[] = JSON.parse(setup.match(/const SEL = (\[.*\]);/)![1]), at = new Date().toISOString().slice(0, 10);
    const v = JSON.parse(readFileSync(join(pluginRoot, ".claude-plugin", "plugin.json"), "utf-8")).version;
    writeFileSync(m, JSON.stringify({ setup_at: "2026-09-01T00:00:00", plugin_version: v, checks: Object.fromEntries(SEL.map((s) => [s, { at, version: v }])) }));
    expect(run(setup, dir)).toBe(`marker=written\nchecks_due=${SEL.join(",")}\n`);
    run(extractBashBlock(md("check"), "## Stamp what you ran").replace("<sel...>", SEL.join(" ")), dir);
    expect([readFileSync(m, "utf-8"), run(setup, dir)]).toEqual([expect.not.stringContaining("checks"), "marker=unchanged\nchecks_due=none\n"]);
  });
});
