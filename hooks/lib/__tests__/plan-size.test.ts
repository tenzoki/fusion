// ---------------------------------------------------------------------------
// The plan-size helper — its own unit test, and the only test that reads it.
//
// WHAT THIS PINS, and the one thing it must never become. `bin/fusion-plan-size`
// REPORTS. The ceiling is carried in no exit code and no gate runs the program,
// which was ruled by the user at
// `260909-1700_*_does-the-plan-size-ceiling-fail-hard-or-only-report.md`
// (option 1). So the load-bearing assertion below is the inverse of the usual
// one: a corpus with a plan far over the ceiling must still exit **0**, with the
// finding in `verdict=` where a reader can see which row produced it. A future
// edit that makes this file assert a non-zero exit over an oversized plan has
// reversed a user decision, not tightened a test.
//
// It also does not measure fusion's own workbench. Every case below builds a
// throwaway workbench, so the file asserts what the mechanism DOES rather than
// what this repository's plans happen to weigh today — the same separation
// `plan-stopping-section-lint.test.ts` makes for its own mechanism.
// ---------------------------------------------------------------------------

import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { CASE_TIMEOUT, REPO_ROOT } from "./helpers/guard-harness.js";
import { place, withJsonProject, type JsonProject } from "./helpers/json-workbench.js";
import { measurePlanSizes, isSpec, markerOf, DEFAULT_CEILING } from "../plan-size.js";

const script = join(pluginRoot, "bin", "fusion-plan-size");

const tmpRoots: string[] = [];
afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

/** A project root with a set-up workbench and nothing else in it. */
function scratchRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "fusion-plan-size-"));
  tmpRoots.push(root);
  mkdirSync(join(root, "fusion-workbench"), { recursive: true });
  writeFileSync(join(root, "fusion-workbench", ".fusion-setup"), "{}\n");
  return root;
}

/** Write one planning file of `bytes` bytes into `store` (workbench-relative). */
function plan(root: string, store: string, base: string, bytes: number, head = "# Implementation Plan: x"): void {
  const dir = join(root, "fusion-workbench", store);
  mkdirSync(dir, { recursive: true });
  const filler = "x".repeat(Math.max(0, bytes - head.length - 1));
  writeFileSync(join(dir, base), `${head}\n${filler}`);
}

interface Run {
  status: number;
  stdout: string;
  stderr: string;
}

function run(cwd: string, ...args: string[]): Run {
  const r = spawnSync(script, args, { cwd, encoding: "utf-8" });
  return { status: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

function value(stdout: string, key: string): string {
  const line = stdout.split("\n").find((l) => l.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1) : "";
}

describe("plan-size: the ceiling reports and never gates", () => {
  it("exits 0 over a plan above the ceiling, and prints the verdict", () => {
    const root = scratchRoot();
    plan(root, "work-packages/260909-1700-c/plans", "260909-1843_p_big.md", DEFAULT_CEILING * 3);

    const r = run(root);

    expect(r.status, `stderr: ${r.stderr}`).toBe(0);
    expect(value(r.stdout, "verdict")).toBe("over");
    expect(value(r.stdout, "over")).toBe("1");
    expect(r.stdout).toContain("260909-1843_p_big.md");
  });

  it("exits 0 with verdict=under when every plan fits", () => {
    const root = scratchRoot();
    plan(root, "shared/planning", "260909-1843_o_small.md", 500);

    const r = run(root);

    expect(r.status).toBe(0);
    expect(value(r.stdout, "verdict")).toBe("under");
    expect(value(r.stdout, "over")).toBe("0");
  });

  it("an empty corpus is a real answer, not a failure", () => {
    const root = scratchRoot();
    const r = run(root);

    expect(r.status).toBe(0);
    expect(r.stdout.split("\n")[0]).toBe("format=legacy");
    expect(value(r.stdout, "verdict")).toBe("empty");
    expect(value(r.stdout, "plans")).toBe("0");
    expect(value(r.stdout, "largest")).toBe("0");
  });

  it("--ceiling re-reads the same corpus at another number", () => {
    const root = scratchRoot();
    plan(root, "shared/planning", "260909-1843_o_mid.md", 5000);

    expect(value(run(root, "--ceiling", "4000").stdout, "verdict")).toBe("over");
    expect(value(run(root, "--ceiling", "6000").stdout, "verdict")).toBe("under");
    expect(value(run(root, "--ceiling", "6000").stdout, "ceiling")).toBe("6000");
  });

  it("no workbench above cwd is exit 2, and a bad argument is exit 1", () => {
    const nowhere = mkdtempSync(join(tmpdir(), "fusion-plan-size-bare-"));
    tmpRoots.push(nowhere);

    expect(run(nowhere).status).toBe(2);
    expect(run(scratchRoot(), "--ceiling", "nope").status).toBe(1);
    expect(run(scratchRoot(), "--wat").status).toBe(1);
  });
});

describe("plan-size: the corpus", () => {
  it("is live plans only — terminal markers and shaper specs are out", () => {
    const root = scratchRoot(); // a legacy-only v11 store, reported under its own name
    plan(root, "shared/planning", "260901-0900_o_open.md", 900);
    plan(root, "shared/planning", "260901-0901_p_recommended.md", 900);
    plan(root, "shared/planning", "260901-0902_c_closed.md", 90000);
    plan(root, "shared/planning", "260901-0903_d_deferred.md", 90000);
    plan(root, "shared/planning", "260901-0904_o_spec-by-topic.md", 90000);
    plan(root, "shared/planning", "260901-0905_o_by-h1.md", 90000, "# Spec: by h1");
    plan(root, "shared/planning", "not-a-record.md", 90000);

    const report = measurePlanSizes(root);

    expect(report.rows.map((r) => r.rel)).toEqual([
      "shared/planning/260901-0900_o_open.md",
      "shared/planning/260901-0901_p_recommended.md",
    ]);
    expect(report.skippedSpecs).toBe(2);
    expect(report.verdict).toBe("under");
  });

  it("spans every package's plans store and the shared one under both window names, largest first", () => {
    const root = scratchRoot();
    plan(root, "work-packages/260101-0000-a/plans", "260101-0000_o_a.md", 3000);
    plan(root, "circles/260102-0000-b/planning", "260102-0000_o_b.md", 5000);
    plan(root, "shared/plans", "260103-0000_o_c.md", 4000);
    plan(root, "shared/planning", "260104-0000_o_d.md", 2000);

    const report = measurePlanSizes(root, 4500);

    expect(report.rows.map((r) => r.rel.replace(/\/[^/]+$/, ""))).toEqual(
      ["circles/260102-0000-b/planning", "shared/plans", "work-packages/260101-0000-a/plans", "shared/planning"]);
    expect(report.rows.map((r) => r.over)).toEqual([true, false, false, false]);
    expect(report.verdict).toBe("over");
  });

  it("reads the marker and the spec signatures the way the filename states them", () => {
    expect(markerOf("260909-1843_p_x.md")).toBe("p");
    expect(markerOf("260909-1843-x.md")).toBeNull();
    expect(markerOf("plan.md")).toBeNull();
    expect(isSpec("260909-1843_o_spec-thing.md", "# Implementation Plan: x")).toBe(true);
    expect(isSpec("260909-1843_o_thing.md", "# Spec: thing")).toBe(true);
    expect(isSpec("260909-1843_o_thing.md", "# Implementation Plan: thing")).toBe(false);
  });
});

// --- a JSON-controlled workbench: a plan is live when its record says so ------

/** A plan pair from the codec's fixture at `rel`: `create` refuses a marker name, so the pair is placed. */
function placedPlan(p: JsonProject, rel: string, n: number, state: string): void {
  const fixture = JSON.parse(readFileSync(join(REPO_ROOT, "codec/fixtures/valid/record/plan-open-unadopted.json"), "utf-8"));
  const control = { ...fixture, id: fixture.id.slice(0, -1) + n, narrative: { path: rel }, control: { ...fixture.control, state } };
  place(p, rel.replace(/\.md$/, ".record.json"), JSON.stringify(control, null, 2) + "\n");
  place(p, rel, `# Implementation Plan: x\n${"x".repeat(900)}`);
}

describe("plan-size on a JSON-controlled workbench", () => {
  it("measures a live plan named _c_, not a closed one named _o_, and names a plan control that does not read", () => {
    withJsonProject((p) => {
      placedPlan(p, "shared/plans/260901-0900_c_live.md", 1, "open");
      placedPlan(p, "shared/plans/260901-0901_o_closed.md", 2, "closed");
      place(p, "shared/plans/260901-0902-broken.record.json", "{\n");
      const r = run(p.root);
      expect(r.status, r.stderr).toBe(0);
      const lines = r.stdout.trimEnd().split("\n");
      expect([lines[0], value(r.stdout, "plans"), value(r.stdout, "unreadable")]).toEqual(["format=json-control", "1", "1"]);
      expect(lines.filter((l) => l.startsWith("  "))).toEqual([
        expect.stringMatching(/^ {2}under +925 {2}shared\/plans\/260901-0900_c_live\.md$/),
        expect.stringMatching(/^ {2}unreadable {2}shared\/plans\/260901-0902-broken\.record\.json {2}\S+\/\S+$/),
      ]);
    });
  }, CASE_TIMEOUT);

  it("exits 4 with nothing on stdout when the workbench is unsupported, never verdict=empty", () => {
    withJsonProject((p) => {
      const manifest = JSON.parse(readFileSync(join(p.workbench, "workbench.json"), "utf-8")) as { required_features: string[] };
      place(p, "workbench.json", JSON.stringify({ ...manifest, required_features: [...manifest.required_features, "json-control-v9"] }));
      const r = run(p.root);
      expect([r.status, r.stdout]).toEqual([4, ""]);
      expect(r.stderr).toMatch(/unsupported .*unknown-feature.* Nothing was measured\.$/m);
    });
  }, CASE_TIMEOUT);
});
