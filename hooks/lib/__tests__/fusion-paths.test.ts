import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

// bin/fusion-paths is a bash script. There is no unit-testable module to
// import, so the tests drive the real script through child_process against a
// throwaway workbench fixture — the same thing an agent's Setup step does.
// This test is at hooks/lib/__tests__/; the script is at bin/.
const fusionPaths = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../bin/fusion-paths",
);

interface RunResult {
  status: number;
  stdout: string;
  stderr: string;
}

/** Run fusion-paths with `cwd` as the working directory. Never throws. */
function run(cwd: string, ...args: string[]): RunResult {
  try {
    const stdout = execFileSync(fusionPaths, args, {
      cwd,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, stdout, stderr: "" };
  } catch (err: any) {
    return {
      status: err.status ?? -1,
      stdout: err.stdout?.toString() ?? "",
      stderr: err.stderr?.toString() ?? "",
    };
  }
}

/** Parse `KEY=value` lines into a map. */
function parse(stdout: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of stdout.split("\n")) {
    if (!line.trim()) continue;
    const eq = line.indexOf("=");
    expect(eq, `line is not KEY=value: ${line}`).toBeGreaterThan(0);
    out[line.slice(0, eq)] = line.slice(eq + 1);
  }
  return out;
}

const CIRCLE_NAME = "260716-1847-workbench-umbau";

describe("bin/fusion-paths", () => {
  let project: string;
  let workbench: string;
  let outside: string;

  beforeEach(() => {
    project = mkdtempSync(join(tmpdir(), "fusion-paths-"));
    workbench = join(project, "fusion-workbench");
    mkdirSync(join(workbench, "circles", CIRCLE_NAME), { recursive: true });
    mkdirSync(join(workbench, "shared"), { recursive: true });
    // The marker bin/fusion-workbench-root walks up looking for.
    writeFileSync(join(workbench, ".fusion-setup"), "{}\n");

    // A directory guaranteed to sit outside any workbench, for the no-workbench
    // case. mkdtemp under the OS temp dir has no .fusion-setup above it.
    outside = mkdtempSync(join(tmpdir(), "fusion-nowb-"));
  });

  afterEach(() => {
    rmSync(project, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  });

  function activate(name: string = CIRCLE_NAME): void {
    writeFileSync(join(workbench, ".active-circle"), `${name}\n`);
  }

  describe("active Circle", () => {
    it("points every OUT_* into the Circle", () => {
      activate();
      const r = run(project, "planner");
      expect(r.status).toBe(0);
      const p = parse(r.stdout);

      expect(p.CIRCLE).toBe(`circles/${CIRCLE_NAME}`);
      expect(p.OUT_PLAN).toBe(`circles/${CIRCLE_NAME}/planning`);
      expect(p.OUT_HISTORY).toBe(`circles/${CIRCLE_NAME}/history`);
      expect(p.OUT_ISSUE).toBe(`circles/${CIRCLE_NAME}/issues`);
      expect(p.OUT_DECISION).toBe(`circles/${CIRCLE_NAME}/decisions`);
    });

    it("emits WORKBENCH as the only absolute path", () => {
      activate();
      const p = parse(run(project, "planner").stdout);
      expect(p.WORKBENCH).toMatch(/\/fusion-workbench$/);
      for (const [key, value] of Object.entries(p)) {
        if (key === "WORKBENCH") continue;
        for (const part of value.split(" ")) {
          expect(part.startsWith("/"), `${key} must be workbench-relative`).toBe(false);
        }
      }
    });

    it("carries both stores in every SCAN_* (Circle first, then shared)", () => {
      activate();
      const p = parse(run(project, "reconciler").stdout);
      for (const key of [
        "SCAN_PLANS",
        "SCAN_ISSUES",
        "SCAN_DECISIONS",
        "SCAN_HISTORY",
        "SCAN_REVIEWS",
        "SCAN_ANALYSES",
      ]) {
        const parts = p[key].split(" ");
        expect(parts, `${key} must carry both stores`).toHaveLength(2);
        expect(parts[0]).toMatch(new RegExp(`^circles/${CIRCLE_NAME}/`));
        expect(parts[1]).toMatch(/^shared\//);
      }
    });

    it("keeps OUT_INVESTIGATION / OUT_CONSULT / OUT_MEMO shared even with a Circle active", () => {
      activate();
      expect(parse(run(project, "investigator").stdout).OUT_INVESTIGATION).toBe(
        "shared/investigations",
      );
      expect(parse(run(project, "consultant").stdout).OUT_CONSULT).toBe("shared/consult");
      expect(parse(run(project, "orchestrator").stdout).OUT_MEMO).toBe("shared/memos");
    });

    it("tolerates a pointer written without a trailing newline", () => {
      writeFileSync(join(workbench, ".active-circle"), CIRCLE_NAME);
      const p = parse(run(project, "planner").stdout);
      expect(p.CIRCLE).toBe(`circles/${CIRCLE_NAME}`);
    });
  });

  describe("no Circle", () => {
    it("points every OUT_* into shared/ and emits no CIRCLE", () => {
      const r = run(project, "planner");
      expect(r.status).toBe(0);
      const p = parse(r.stdout);

      expect(p.CIRCLE).toBeUndefined();
      expect(p.OUT_PLAN).toBe("shared/planning");
      expect(p.OUT_HISTORY).toBe("shared/history");
      expect(p.OUT_ISSUE).toBe("shared/issues");
      expect(p.OUT_DECISION).toBe("shared/decisions");
    });

    it("is not an error state", () => {
      // Work outside Circles is routine and has a defined home.
      expect(run(project, "coder").status).toBe(0);
      expect(run(project, "orchestrator").stderr).toBe("");
    });

    it("collapses every SCAN_* to the shared store alone", () => {
      const p = parse(run(project, "reconciler").stdout);
      expect(p.SCAN_PLANS).toBe("shared/planning");
      expect(p.SCAN_ISSUES).toBe("shared/issues");
      expect(p.SCAN_DECISIONS).toBe("shared/decisions");
      expect(p.SCAN_ANALYSES).toBe("shared/analyses");
    });
  });

  describe("orphaned pointer", () => {
    it("errors with a non-zero exit and never falls back to shared/", () => {
      activate("260101-0000-does-not-exist");
      const r = run(project, "planner");
      expect(r.status).not.toBe(0);
      expect(r.stderr).toContain("does not exist");
      expect(r.stdout).toBe("");
    });

    it("rejects an empty pointer file", () => {
      writeFileSync(join(workbench, ".active-circle"), "\n");
      const r = run(project, "planner");
      expect(r.status).not.toBe(0);
      expect(r.stdout).toBe("");
    });

    it("rejects a pointer carrying a path, a prefix, or a marker", () => {
      // The pointer holds a bare directory name — no circles/ prefix, no .md.
      for (const bad of [`circles/${CIRCLE_NAME}`, `${CIRCLE_NAME}/[t]-circle.md`]) {
        writeFileSync(join(workbench, ".active-circle"), `${bad}\n`);
        const r = run(project, "planner");
        expect(r.status, `pointer '${bad}' must be rejected`).not.toBe(0);
        expect(r.stdout).toBe("");
      }
      // A marker-carrying name is not a bare name of an existing directory,
      // so it fails the existence check rather than the shape check.
      writeFileSync(join(workbench, ".active-circle"), `260716-1847[t]-workbench-umbau\n`);
      expect(run(project, "planner").status).not.toBe(0);
    });
  });

  describe("unknown agent", () => {
    it("exits 2, matching bin/fusion-rules", () => {
      const r = run(project, "nosuchagent");
      expect(r.status).toBe(2);
      expect(r.stderr).toContain("unknown agent");
      expect(r.stdout).toBe("");
    });

    it("exits 1 on a missing argument", () => {
      const r = run(project);
      expect(r.status).toBe(1);
      expect(r.stderr).toContain("Usage");
    });

    it("exits 1 when no workbench is found above cwd", () => {
      const r = run(outside, "planner");
      expect(r.status).toBe(1);
      expect(r.stderr).toContain("/fusion:setup");
    });
  });

  describe("per-agent emission", () => {
    // The whole point of per-agent emission: an agent receives only the keys
    // it needs. These assertions are the conventions' own examples.
    it("gives a coder no OUT_PLAN", () => {
      const p = parse(run(project, "coder").stdout);
      expect(p.OUT_PLAN).toBeUndefined();
      expect(p.OUT_ISSUE).toBeDefined();
    });

    it("gives a playmaker no OUT_ISSUE", () => {
      const p = parse(run(project, "playmaker").stdout);
      expect(p.OUT_ISSUE).toBeUndefined();
      expect(p.PORTFOLIO).toBe("portfolio.md");
      expect(p.SCAN_CIRCLES).toBe("circles");
    });

    it("gives every agent WORKBENCH and at least one key", () => {
      const agents = [
        "orchestrator",
        "coder",
        "ontocoder",
        "bugfixer",
        "coderev",
        "ontorev",
        "conceptrev",
        "planner",
        "shaper",
        "taskplanner",
        "reconciler",
        "analyst",
        "investigator",
        "consultant",
        "playmaker",
      ];
      for (const agent of agents) {
        const r = run(project, agent);
        expect(r.status, `${agent} must resolve`).toBe(0);
        const p = parse(r.stdout);
        expect(p.WORKBENCH, `${agent} must get WORKBENCH`).toBeDefined();
        expect(
          Object.keys(p).length,
          `${agent} must get more than WORKBENCH alone`,
        ).toBeGreaterThan(1);
      }
    });

    it("routes writers to their own output kind", () => {
      expect(parse(run(project, "planner").stdout).OUT_PLAN).toBe("shared/planning");
      expect(parse(run(project, "analyst").stdout).OUT_ANALYSIS).toBe("shared/analyses");
      expect(parse(run(project, "coderev").stdout).OUT_REVIEW).toBe("shared/reviews");
      expect(parse(run(project, "ontorev").stdout).OUT_REVIEW).toBe("shared/reviews");
      expect(parse(run(project, "conceptrev").stdout).OUT_REVIEW).toBe("shared/reviews");
      expect(parse(run(project, "shaper").stdout).OUT_CIRCLE).toBe("circles");
    });

    it("emits no key it cannot resolve", () => {
      // Guards against a key landing in an agent's set without a value —
      // an empty right-hand side would send writes to the workbench root.
      for (const agent of ["orchestrator", "reconciler", "playmaker"]) {
        for (const [key, value] of Object.entries(parse(run(project, agent).stdout))) {
          expect(value.trim(), `${agent}: ${key} resolved empty`).not.toBe("");
        }
      }
    });
  });
});
