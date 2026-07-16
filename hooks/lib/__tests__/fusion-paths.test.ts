import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, chmodSync, rmSync } from "node:fs";
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

  // Regression coverage for the coderev findings of 2026-07-16. Each case
  // names the issue it pins.
  describe("read keys cover the reads the prompts perform (issue 260716-1957)", () => {
    // Derived by auditing all 15 prompts line by line. Each entry is a read the
    // prompt demonstrably performs, cited in bin/fusion-paths' key-set comments.
    // Hand-maintained on both sides today; P-8's lint gate is what makes the
    // agreement mechanical, once the converted prompts carry $SCAN_*/$OUT_*
    // references to grep. Until then this is the pin.
    const requiredScans: Record<string, string[]> = {
      coder: ["SCAN_HISTORY"],
      ontocoder: ["SCAN_HISTORY"],
      coderev: ["SCAN_HISTORY"],
      ontorev: ["SCAN_HISTORY"],
      conceptrev: ["SCAN_REVIEWS", "SCAN_INVESTIGATIONS"],
      shaper: ["SCAN_ISSUES"],
      taskplanner: ["SCAN_HISTORY"],
      analyst: ["SCAN_HISTORY"],
      investigator: ["SCAN_HISTORY", "SCAN_DECISIONS"],
      consultant: ["SCAN_HISTORY", "SCAN_ISSUES"],
      playmaker: ["SCAN_ISSUES", "SCAN_CONSULT"],
    };

    for (const [agent, keys] of Object.entries(requiredScans)) {
      it(`gives ${agent} ${keys.join(" + ")}`, () => {
        const p = parse(run(project, agent).stdout);
        for (const key of keys) {
          expect(p[key], `${agent} reads this kind but got no ${key}`).toBeDefined();
        }
      });
    }

    // The mirror of requiredScans: kinds a prompt demonstrably *writes*. The
    // 2026-07-16 audit checked reads far harder than writes and missed
    // reconciler's OUT_DECISION as a result — a write key is what the read
    // table above has no slot for.
    const requiredWrites: Record<string, string[]> = {
      // reconciler.md:65 — "file an issue in $OUT_ISSUE (or a decision record
      // in $OUT_DECISION)"; :159 names it as the relocation destination for a
      // misfiled defect.
      reconciler: ["OUT_ISSUE", "OUT_DECISION"],
      planner: ["OUT_PLAN", "OUT_HISTORY"],
      analyst: ["OUT_ANALYSIS", "OUT_HISTORY"],
      coderev: ["OUT_REVIEW", "OUT_ISSUE"],
      ontorev: ["OUT_REVIEW", "OUT_ISSUE"],
      conceptrev: ["OUT_REVIEW"],
      shaper: ["OUT_PLAN", "OUT_CIRCLE"],
      investigator: ["OUT_INVESTIGATION"],
      consultant: ["OUT_CONSULT"],
      playmaker: ["OUT_CIRCLE", "PORTFOLIO"],
      coder: ["OUT_HISTORY", "OUT_ISSUE"],
      ontocoder: ["OUT_HISTORY", "OUT_ISSUE"],
      bugfixer: ["OUT_HISTORY", "OUT_ISSUE"],
      taskplanner: ["OUT_HISTORY", "TASKLIST"],
      orchestrator: ["OUT_HISTORY", "OUT_ISSUE", "OUT_DECISION", "OUT_MEMO"],
    };

    for (const [agent, keys] of Object.entries(requiredWrites)) {
      it(`gives ${agent} ${keys.join(" + ")}`, () => {
        const p = parse(run(project, agent).stdout);
        for (const key of keys) {
          expect(p[key], `${agent} writes this kind but got no ${key}`).toBeDefined();
        }
      });
    }

    it("gives reconciler OUT_DECISION — it files decision records (reconciler.md:65)", () => {
      // The specific regression. Absent the key, $OUT_DECISION expanded to the
      // empty string and every decision record the reconciler filed landed at
      // the workbench root instead of the decision store. Silent: the write
      // succeeded, just in the wrong place.
      expect(parse(run(project, "reconciler").stdout).OUT_DECISION).toBe("shared/decisions");
      activate();
      expect(parse(run(project, "reconciler").stdout).OUT_DECISION).toBe(
        `circles/${CIRCLE_NAME}/decisions`,
      );
    });

    it("gives conceptrev no OUT_INVESTIGATION — it reads investigations, never writes one", () => {
      // A write key for a read-only agent inverts the contract's own semantics:
      // the prompt would read "write to $OUT_INVESTIGATION" and either violate
      // read-only or ignore the key.
      const p = parse(run(project, "conceptrev").stdout);
      expect(p.OUT_INVESTIGATION).toBeUndefined();
      expect(p.SCAN_INVESTIGATIONS).toBe("shared/investigations");
    });

    it("gives investigator no SCAN_INVESTIGATIONS — it writes them and never reads them", () => {
      // The mirror of the case above: a key for a read the prompt does not
      // perform would be speculation, not coverage.
      const p = parse(run(project, "investigator").stdout);
      expect(p.OUT_INVESTIGATION).toBe("shared/investigations");
      expect(p.SCAN_INVESTIGATIONS).toBeUndefined();
    });

    it("keeps SCAN_INVESTIGATIONS / SCAN_CONSULT shared-only, Circle active or not", () => {
      // Invariant 2 collapses for these two: their kinds exist only in shared/,
      // so "both stores" has nothing to range over.
      for (const withCircle of [false, true]) {
        if (withCircle) activate();
        expect(parse(run(project, "conceptrev").stdout).SCAN_INVESTIGATIONS).toBe(
          "shared/investigations",
        );
        expect(parse(run(project, "playmaker").stdout).SCAN_CONSULT).toBe("shared/consult");
      }
    });

    it("emits no SCAN_MEMOS to anyone — nothing reads memos", () => {
      for (const agent of ["orchestrator", "playmaker", "consultant", "analyst"]) {
        expect(parse(run(project, agent).stdout).SCAN_MEMOS).toBeUndefined();
      }
    });
  });

  describe("internal error is exit 4, not exit 3 (issue 260716-2001)", () => {
    // The `emits no key it cannot resolve` case above asserts the branch is
    // never taken. This asserts what happens when it is — otherwise a later
    // renumbering of the code passes silently.
    it("exits 4 with a bug-not-your-fault message when a key has no value", () => {
      // Inject an unresolvable key into a real KEYS set, in a copy of the real
      // script. Nothing is stubbed: this drives the actual value_for branch.
      // The copy must sit beside a fusion-workbench-root, which it resolves
      // relative to its own directory — so stage both in a scratch bin/.
      const bin = join(project, "bin");
      mkdirSync(bin, { recursive: true });
      const broken = join(bin, "fusion-paths");
      const source = readFileSync(fusionPaths, "utf-8");
      const patched = source.replace(
        'KEYS="OUT_HISTORY OUT_ISSUE SCAN_ISSUES SCAN_PLANS"',
        'KEYS="OUT_HISTORY OUT_ISSUE SCAN_ISSUES SCAN_PLANS NO_SUCH_KEY"',
      );
      // If the bugfixer key set is ever reworded, the injection silently
      // becomes a no-op and the test would pass against an unpatched script.
      expect(patched, "KEYS injection did not apply — update the anchor").not.toBe(source);
      writeFileSync(broken, patched);
      chmodSync(broken, 0o755);
      writeFileSync(
        join(bin, "fusion-workbench-root"),
        readFileSync(resolve(dirname(fusionPaths), "fusion-workbench-root"), "utf-8"),
      );
      chmodSync(join(bin, "fusion-workbench-root"), 0o755);

      let status = 0;
      let stderr = "";
      try {
        execFileSync(broken, ["bugfixer"], {
          cwd: project,
          encoding: "utf-8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (err: any) {
        status = err.status;
        stderr = err.stderr?.toString() ?? "";
      }

      // 4, never 3: a caller keying on 3 would tell the user to fix a pointer
      // that is perfectly fine.
      expect(status).toBe(4);
      expect(stderr).toContain("internal error");
      expect(stderr).toContain("NO_SUCH_KEY");
      expect(stderr).toContain("not a fault in your workbench");
    });

    it("still exits 3 for an orphaned pointer, keeping the two faults distinct", () => {
      activate("260101-0000-does-not-exist");
      expect(run(project, "planner").status).toBe(3);
    });
  });

  describe("a key in a KEYS set but missing from ORDER cannot ship silently", () => {
    // Emission is driven by ORDER. Before this guard, a key added to a KEYS set
    // and forgotten in ORDER was dropped without a word: exit 0, key simply
    // absent, the agent's $SCAN_FOO empty, the write landing at the workbench
    // root. Adding keys to KEYS sets is the routine change (P-4..P-7 are made
    // of it), which is what makes this the routine mistake worth guarding.
    function runPatched(patch: (s: string) => string, agent: string): RunResult {
      const bin = join(project, "bin");
      mkdirSync(bin, { recursive: true });
      const script = join(bin, "fusion-paths");
      const source = readFileSync(fusionPaths, "utf-8");
      const patched = patch(source);
      expect(patched, "patch did not apply — update the anchor").not.toBe(source);
      writeFileSync(script, patched);
      chmodSync(script, 0o755);
      writeFileSync(
        join(bin, "fusion-workbench-root"),
        readFileSync(resolve(dirname(fusionPaths), "fusion-workbench-root"), "utf-8"),
      );
      chmodSync(join(bin, "fusion-workbench-root"), 0o755);
      try {
        const stdout = execFileSync(script, [agent], {
          cwd: project,
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

    it("exits 4 naming the key and the fix", () => {
      const r = runPatched(
        (s) =>
          s.replace(
            'KEYS="OUT_HISTORY OUT_ISSUE SCAN_ISSUES SCAN_PLANS"',
            'KEYS="OUT_HISTORY OUT_ISSUE SCAN_ISSUES SCAN_PLANS ORPHAN_KEY"',
          ),
        "bugfixer",
      );
      expect(r.status).toBe(4);
      expect(r.stderr).toContain("ORPHAN_KEY");
      expect(r.stderr).toContain("missing from ORDER");
      expect(r.stdout).toBe("");
    });

    it("emits nothing at all when it fails — no partial key set", () => {
      // A caller reading stdout without checking the exit code must not get
      // half a contract.
      const r = runPatched(
        (s) =>
          s
            .replace(/^       PORTFOLIO TASKLIST"$/m, '       PORTFOLIO TASKLIST NO_VALUE_KEY"')
            .replace(
              'KEYS="OUT_HISTORY OUT_ISSUE SCAN_ISSUES SCAN_PLANS"',
              'KEYS="OUT_HISTORY OUT_ISSUE SCAN_ISSUES SCAN_PLANS NO_VALUE_KEY"',
            ),
        "bugfixer",
      );
      expect(r.status).toBe(4);
      expect(r.stderr).toContain("no value defined");
      expect(r.stdout).toBe("");
    });

    it("every emitted key set is complete and self-consistent for all 15 agents", () => {
      // The positive counterpart: with the guard in place, a clean run proves
      // every key in every KEYS set is both ordered and valued.
      for (const agent of [
        "orchestrator", "coder", "ontocoder", "bugfixer", "coderev",
        "ontorev", "conceptrev", "planner", "shaper", "taskplanner",
        "reconciler", "analyst", "investigator", "consultant", "playmaker",
      ]) {
        const r = run(project, agent);
        expect(r.status, `${agent}: ${r.stderr}`).toBe(0);
        expect(r.stderr).toBe("");
      }
    });
  });
});
