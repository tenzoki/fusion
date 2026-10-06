// ---------------------------------------------------------------------------
// The plan-size helper — its own unit test.
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
// what this repository's plans happen to weigh today. The corpus function is
// also the one `plan-stopping-section-lint.test.ts` reads fusion's own plans
// through, so its JSON cases here are that lint's corpus cases too.
// ---------------------------------------------------------------------------

import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { CASE_TIMEOUT } from "./helpers/guard-harness.js";
import { indexOf, jsonWorkbenchAt, place, placeRecord, withJsonProject } from "./helpers/json-workbench.js";
import { measurePlanSizes, isSpec, DEFAULT_CEILING } from "../plan-size.js";

const script = join(pluginRoot, "bin", "fusion-plan-size");

const tmpRoots: string[] = [];
afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

/** A project root with a JSON-controlled workbench and nothing else in it. */
function scratchRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "fusion-plan-size-"));
  tmpRoots.push(root);
  jsonWorkbenchAt(root);
  return root;
}

/** One plan pair of `bytes` narrative bytes at `rel` (workbench-relative), its record at `state`. */
function plan(root: string, rel: string, bytes: number, head = "# Implementation Plan: x", state = "open"): void {
  const fixture = state === "in_progress" ? "plan-in-progress" : "plan-open-unadopted";
  placeRecord(join(root, "fusion-workbench"), fixture, rel, state, `${head}\n${"x".repeat(Math.max(0, bytes - head.length - 1))}`);
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
    plan(root, "work-packages/260909-1700-c/plans/260909-1843-big.md", DEFAULT_CEILING * 3);

    const r = run(root);

    expect(r.status, `stderr: ${r.stderr}`).toBe(0);
    expect(value(r.stdout, "verdict")).toBe("over");
    expect(value(r.stdout, "over")).toBe("1");
    expect(r.stdout).toContain("260909-1843-big.md");
  }, CASE_TIMEOUT);

  it("an empty corpus is a real answer, not a failure", () => {
    const r = run(scratchRoot());

    expect(r.status).toBe(0);
    expect(r.stdout.split("\n")[0]).toBe("format=json-control");
    expect([value(r.stdout, "verdict"), value(r.stdout, "plans"), value(r.stdout, "largest")]).toEqual(["empty", "0", "0"]);
  }, CASE_TIMEOUT);

  it("--ceiling re-reads the same corpus at another number", () => {
    const root = scratchRoot();
    plan(root, "shared/plans/260909-1843-mid.md", 5000);

    expect(value(run(root, "--ceiling", "4000").stdout, "verdict")).toBe("over");
    expect(value(run(root, "--ceiling", "6000").stdout, "verdict")).toBe("under");
    expect(value(run(root, "--ceiling", "6000").stdout, "ceiling")).toBe("6000");
  }, CASE_TIMEOUT);

  it("no workbench above cwd is exit 2, and a bad argument is exit 1", () => {
    const nowhere = mkdtempSync(join(tmpdir(), "fusion-plan-size-bare-"));
    tmpRoots.push(nowhere);

    expect(run(nowhere).status).toBe(2);
    expect(run(scratchRoot(), "--ceiling", "nope").status).toBe(1);
    expect(run(scratchRoot(), "--wat").status).toBe(1);
  });
});

describe("plan-size: the corpus", () => {
  it("is live plans only, across every plans store, largest first — terminal states, specs and files with no record out", () => {
    const root = scratchRoot();
    plan(root, "shared/plans/260901-0900-open.md", 900);
    plan(root, "work-packages/260101-0000-a/plans/260901-0901-under-way.md", 3000, undefined, "in_progress");
    plan(root, "shared/plans/260901-0902-closed.md", 90000, undefined, "closed");
    plan(root, "shared/plans/260901-0903-deferred.md", 90000, undefined, "deferred");
    plan(root, "shared/plans/260901-0904-spec-by-topic.md", 90000);
    plan(root, "shared/plans/260901-0905-by-h1.md", 90000, "# Spec: by h1");
    writeFileSync(join(root, "fusion-workbench/shared/plans/260901-0906-no-record.md"), "x".repeat(90000));

    const read = indexOf(join(root, "fusion-workbench"));
    if (read.format !== "json-control") throw new Error(JSON.stringify(read));
    const report = measurePlanSizes(root, read.index, 2000);

    expect(report.rows.map((r) => [r.rel, r.over])).toEqual([
      ["work-packages/260101-0000-a/plans/260901-0901-under-way.md", true],
      ["shared/plans/260901-0900-open.md", false],
    ]);
    expect([report.skippedSpecs, report.verdict, report.unreadable]).toEqual([2, "over", []]);
  }, CASE_TIMEOUT);

  it("reads the spec signatures the way the filename and the first line state them", () => {
    expect(isSpec("260909-1843_o_spec-thing.md", "# Implementation Plan: x")).toBe(true);
    expect(isSpec("260909-1843-spec-thing.md", "# Implementation Plan: x")).toBe(true);
    expect(isSpec("260909-1843-thing.md", "# Spec: thing")).toBe(true);
    expect(isSpec("260909-1843-thing.md", "# Implementation Plan: thing")).toBe(false);
  });
});

// --- a JSON-controlled workbench: a plan is live when its record says so ------

describe("plan-size on a JSON-controlled workbench", () => {
  it("measures a live plan named _c_, not a closed one named _o_, and names a plan control that does not read", () => {
    withJsonProject((p) => {
      plan(p.root, "shared/plans/260901-0900_c_live.md", 925);
      plan(p.root, "shared/plans/260901-0901_o_closed.md", 925, undefined, "closed");
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

  it("refuses a legacy workbench by name, exit 4, nothing on stdout, and points at /fusion:migrate", () => {
    withJsonProject((p) => {
      place(p, "shared/plans/260901-0900_o_open.md", "# Implementation Plan: x\n");
      const r = run(p.root);
      expect([r.status, r.stdout]).toEqual([4, ""]);
      expect(r.stderr).toMatch(/^fusion-plan-size: the workbench at .* is legacy \(no workbench\.json: .*run \/fusion:migrate\. Nothing was measured\.$/m);
    }, { legacy: true });
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
