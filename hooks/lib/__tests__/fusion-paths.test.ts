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
const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const fusionPaths = join(pluginRoot, "bin", "fusion-paths");

const AGENTS = [
  "orchestrator", "coder", "ontocoder", "bugfixer", "coderev",
  "ontorev", "conceptrev", "planner", "shaper", "taskplanner",
  "reconciler", "analyst", "investigator", "consultant", "playmaker",
  "editor",
];

const SKILLS = [
  "archive", "circle-pop", "circle-stash", "cleanup", "commit",
  "direct", "help", "log-activity", "memo", "migrate", "next",
  "revise-claude-md", "setup", "unlock",
];

/** The prompt file a name resolves to — the same rule the script applies. */
function promptPath(name: string): string {
  const agent = join(pluginRoot, "agents", `${name}.md`);
  return AGENTS.includes(name) ? agent : join(pluginRoot, "skills", name, "SKILL.md");
}

/**
 * The keys a prompt names. This is the contract's own definition of a key set
 * — "the prompt defines which keys a consumer gets" — restated independently
 * of the script, so the tests below assert agreement rather than assuming it.
 * WORKBENCH and CIRCLE are excluded: both are emitted unconditionally and
 * belong to no set.
 */
function keysNamedIn(name: string): string[] {
  const body = readFileSync(promptPath(name), "utf-8");
  const found = body.match(/\$(?:(?:OUT|SCAN)_[A-Z][A-Z_]*|PORTFOLIO|TASKLIST)/g) ?? [];
  return [...new Set(found.map((m) => m.slice(1)))].sort();
}

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
      // shaper, because its prompt names all four Circle-bound OUT_* keys.
      // The agent is a vehicle for the OUT_BASE rule; the set is derived from
      // the prompt, so the vehicle has to be a prompt that names them.
      const r = run(project, "shaper");
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
      // memo, not orchestrator: the memo skill is the only consumer that names
      // OUT_MEMO, now that each asks under its own name.
      expect(parse(run(project, "memo").stdout).OUT_MEMO).toBe("shared/memos");
    });

    it("tolerates a pointer written without a trailing newline", () => {
      writeFileSync(join(workbench, ".active-circle"), CIRCLE_NAME);
      const p = parse(run(project, "planner").stdout);
      expect(p.CIRCLE).toBe(`circles/${CIRCLE_NAME}`);
    });
  });

  describe("no Circle", () => {
    it("points every OUT_* into shared/ and emits no CIRCLE", () => {
      const r = run(project, "shaper");
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

  describe("target Circle argument", () => {
    // `fusion-paths <name> [<circle-dir>]`. The second argument makes a Circle
    // the Circle IN SCOPE without making it active — which is the whole point:
    // the caller is a shaper or planner working an ANTICIPATED Circle, and
    // anticipated is not active. .active-circle is neither read for the
    // substitution nor written.
    const OTHER = "260812-1720-circle-first-placement";

    beforeEach(() => {
      mkdirSync(join(workbench, "circles", OTHER), { recursive: true });
    });

    it("points every OUT_* into the target when no Circle is active", () => {
      const r = run(project, "shaper", OTHER);
      expect(r.status).toBe(0);
      const p = parse(r.stdout);
      expect(p.OUT_PLAN).toBe(`circles/${OTHER}/planning`);
      expect(p.OUT_HISTORY).toBe(`circles/${OTHER}/history`);
      expect(p.OUT_ISSUE).toBe(`circles/${OTHER}/issues`);
      expect(p.OUT_DECISION).toBe(`circles/${OTHER}/decisions`);
    });

    it("emits no CIRCLE for a target, because the target is not active", () => {
      // CIRCLE answers "which Circle is active", and a target does not make
      // one active. A caller that needs the target already holds it.
      const p = parse(run(project, "shaper", OTHER).stdout);
      expect(p.CIRCLE).toBeUndefined();
    });

    it("displaces a DIFFERENT active Circle from OUT_* and from SCAN_*", () => {
      activate();
      const r = run(project, "reconciler", OTHER);
      expect(r.status).toBe(0);
      const p = parse(r.stdout);

      // CIRCLE still reports the active one — the pointer was not consulted
      // for the substitution and was certainly not rewritten.
      expect(p.CIRCLE).toBe(`circles/${CIRCLE_NAME}`);
      expect(readFileSync(join(workbench, ".active-circle"), "utf-8").trim()).toBe(CIRCLE_NAME);

      for (const key of [
        "SCAN_PLANS",
        "SCAN_ISSUES",
        "SCAN_DECISIONS",
        "SCAN_HISTORY",
        "SCAN_REVIEWS",
        "SCAN_ANALYSES",
      ]) {
        const parts = p[key].split(" ");
        // Invariant 2 still holds and still means two stores: the Circle in
        // scope and the shared one. The active Circle is not a third.
        expect(parts, `${key} must carry exactly two stores`).toHaveLength(2);
        expect(parts[0]).toBe(`circles/${OTHER}/${parts[1].slice("shared/".length)}`);
        expect(parts[1]).toMatch(/^shared\//);
        expect(p[key], `${key} must not name the active Circle`).not.toContain(CIRCLE_NAME);
      }
    });

    it("keeps the unconditionally-shared kinds shared", () => {
      expect(parse(run(project, "investigator", OTHER).stdout).OUT_INVESTIGATION).toBe(
        "shared/investigations",
      );
      expect(parse(run(project, "consultant", OTHER).stdout).OUT_CONSULT).toBe("shared/consult");
      expect(parse(run(project, "memo", OTHER).stdout).OUT_MEMO).toBe("shared/memos");
    });

    it("exits 1 when the target names no such Circle directory", () => {
      // 1, not 3 and not 4. Exit 3 would send the user to fix an .active-circle
      // that is intact; exit 4 would claim a fusion bug when the caller may be
      // a person mistyping `/fusion:direct`. The argument came from the caller.
      const r = run(project, "shaper", "260101-0000-no-such-circle");
      expect(r.status).toBe(1);
      expect(r.stderr).toContain("260101-0000-no-such-circle");
      expect(r.stdout).toBe("");
    });

    it("exits 1 on a target that could escape circles/", () => {
      // The target is interpolated into a path, so this is a safety property.
      for (const bad of ["..", `../circles/${OTHER}`, `circles/${OTHER}`]) {
        const r = run(project, "shaper", bad);
        expect(r.status, `target '${bad}' must not resolve`).toBe(1);
        expect(r.stdout).toBe("");
      }
    });

    it("still exits 3 for an orphaned pointer, target or no target", () => {
      // The pointer is not consulted for the substitution, but it is still
      // read and still validated: a workbench in an inconsistent state stops
      // the run whichever Circle the caller asked to write into.
      activate("260101-0000-does-not-exist");
      const r = run(project, "shaper", OTHER);
      expect(r.status).toBe(3);
      expect(r.stdout).toBe("");
    });

    it("is a no-op when the target IS the active Circle", () => {
      // The strongest available form of "the argument is additive": with the
      // substitution resolving to what was already in scope, the output must be
      // byte-identical. The no-target path itself is regression-covered by
      // every other test in this file, which passes no second argument.
      activate();
      for (const name of ["shaper", "reconciler", "planner", "orchestrator"]) {
        expect(run(project, name, CIRCLE_NAME).stdout, name).toBe(run(project, name).stdout);
      }
    });

    it("exits 1 on a third argument", () => {
      const r = run(project, "shaper", OTHER, "extra");
      expect(r.status).toBe(1);
      expect(r.stderr).toContain("at most two arguments");
    });
  });

  describe("the backlog keys", () => {
    // OUT_BACKLOG and SCAN_BACKLOG are the fourth unconditionally-shared kind,
    // beside investigations, consultations and memos. A backlog entry PRECEDES
    // every Directive by construction, so there is no Circle it could belong
    // to — which is why the target argument does not move it either. That last
    // case is new: it is the first key set to meet a <circle-dir> target, and
    // "unconditionally shared" now has two conditions to survive rather than
    // one.
    //
    // No shipped prompt names OUT_BACKLOG — no agent files an entry — so the
    // consumer for the write key is a fixture prompt driven through a staged
    // copy of the script. That is the real derivation path, not a simulation
    // of it.
    const OTHER = "260812-1720-circle-first-placement";

    beforeEach(() => {
      mkdirSync(join(workbench, "circles", OTHER), { recursive: true });
      stageWithAgent("fixture", "File the idea to $OUT_BACKLOG, and skim $SCAN_BACKLOG.\n");
    });

    it("emits both keys for a prompt that names them", () => {
      const r = runStaged("fixture");
      expect(r.status).toBe(0);
      const p = parse(r.stdout);
      expect(p.OUT_BACKLOG).toBe("shared/backlog");
      expect(p.SCAN_BACKLOG).toBe("shared/backlog");
    });

    it("keeps both shared with a Circle active", () => {
      activate();
      const p = parse(runStaged("fixture").stdout);
      expect(p.OUT_BACKLOG).toBe("shared/backlog");
      expect(p.SCAN_BACKLOG).toBe("shared/backlog");
      // Invariant 2 collapses for SCAN_BACKLOG exactly as it does for
      // SCAN_CONSULT and SCAN_INVESTIGATIONS: one store, because the kind has
      // no Circle counterpart to carry.
      expect(p.SCAN_BACKLOG.split(" ")).toHaveLength(1);
    });

    it("keeps both shared when a target Circle is passed", () => {
      // The case no key has had to face before. The target replaces the OUT_*
      // base for every Circle-bound kind; these two are not Circle-bound, and
      // must not move.
      for (const active of [false, true]) {
        if (active) activate();
        const p = parse(runStaged("fixture", OTHER).stdout);
        expect(p.OUT_BACKLOG, `active=${active}`).toBe("shared/backlog");
        expect(p.SCAN_BACKLOG, `active=${active}`).toBe("shared/backlog");
        expect(p.SCAN_BACKLOG).not.toContain(OTHER);
      }
    });

    it("keeps the target from reaching them even when the target IS active", () => {
      activate();
      const p = parse(runStaged("fixture", CIRCLE_NAME).stdout);
      expect(p.OUT_BACKLOG).toBe("shared/backlog");
      expect(p.SCAN_BACKLOG).toBe("shared/backlog");
    });

    it("emits neither to a shipped prompt that names neither", () => {
      // Emission stays per-consumer: adding a key to the resolver gives it to
      // nobody until a prompt asks for it.
      for (const name of ["coder", "orchestrator", "planner", "memo"]) {
        const p = parse(run(project, name).stdout);
        expect(p.OUT_BACKLOG, name).toBeUndefined();
        expect(p.SCAN_BACKLOG, name).toBeUndefined();
      }
    });

    it("gives playmaker the read key and withholds the write key", () => {
      // The first shipped consumer of the store, and the asymmetry is the
      // point: playmaker consolidates the backlog and files no entry, so it
      // names `$SCAN_BACKLOG` and not `$OUT_BACKLOG`. Key derivation reads that
      // off the prompt, which makes the write prohibition in `## Scope`
      // mechanical rather than merely stated — a run that tried to write an
      // entry would have no resolved path to write it to.
      const p = parse(run(project, "playmaker").stdout);
      expect(p.SCAN_BACKLOG).toBe("shared/backlog");
      expect(p.OUT_BACKLOG).toBeUndefined();
    });

    it("gives shaper the read key and withholds the write key", () => {
      // The second shipped consumer, and the same asymmetry for a different
      // reason: the shaper READS an entry handed to it as a draft and CLOSES
      // it when the Circle takes it whole. Neither act needs a write target
      // under the store, so a run that tried to file an entry has no resolved
      // path to file it to.
      const p = parse(run(project, "shaper").stdout);
      expect(p.SCAN_BACKLOG).toBe("shared/backlog");
      expect(p.OUT_BACKLOG).toBeUndefined();
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

  describe("unknown name", () => {
    it("exits 2, matching bin/fusion-rules", () => {
      const r = run(project, "nosuchagent");
      expect(r.status).toBe(2);
      expect(r.stderr).toContain("unknown name");
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
      for (const agent of AGENTS) {
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

  // The key set is derived from the prompt, so these assert agreement between
  // the emitted set and the prompt's text — the contract's own rule ("the
  // prompt defines which keys a consumer gets"), checked rather than assumed.
  // They replace a hand-audited expectation table that was a second copy of
  // the same claim: it went 14/15 (see the reconciler pin below).
  describe("the emitted key set is exactly the set the prompt names", () => {
    for (const name of [...AGENTS, ...SKILLS]) {
      it(`${name}: emits every key it names and no other`, () => {
        const r = run(project, name);
        expect(r.status, `${name}: ${r.stderr}`).toBe(0);

        const emitted = Object.keys(parse(r.stdout))
          .filter((k) => k !== "WORKBENCH" && k !== "CIRCLE")
          .sort();

        // Both directions at once. Under-emission (a key the prompt names and
        // the resolver withholds) was the live defect: $OUT_DECISION expanded
        // empty and the reconciler's decision records landed at the workbench
        // root. Over-emission is now structurally impossible, and this is
        // where that is pinned.
        expect(emitted).toEqual(keysNamedIn(name));
      });
    }

    it("gives log-activity WORKBENCH alone — it names no key", () => {
      // The skill that broke the agent-only namespace: it reads consultations
      // and investigations, SCAN_CONSULT is named only by playmaker and
      // SCAN_INVESTIGATIONS only by conceptrev, and no agent names both, so no
      // agent argument resolved it. It scans the tree from WORKBENCH instead —
      // and asking under its own name is what makes that legible rather than a
      // borrowed argument that "selects nothing".
      const p = parse(run(project, "log-activity").stdout);
      expect(Object.keys(p)).toEqual(["WORKBENCH"]);
    });

    it("gives memo OUT_MEMO under its own name — no agent prompt writes memos", () => {
      // OUT_MEMO used to hang off the orchestrator, whose prompt never writes
      // a memo. The key now sits with its only writer.
      expect(parse(run(project, "memo").stdout).OUT_MEMO).toBe("shared/memos");
      expect(parse(run(project, "orchestrator").stdout).OUT_MEMO).toBeUndefined();
    });

    it("keeps OUT_MEMO shared even with a Circle active, whoever asks", () => {
      activate();
      expect(parse(run(project, "memo").stdout).OUT_MEMO).toBe("shared/memos");
    });

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

  // The guards below are driven through a staged copy of the real script, with
  // fixture prompts as the input. Nothing is stubbed: the script derives its
  // key set from `<its own dir>/../agents/` and `../skills/`, so staging it in
  // a scratch bin/ makes the scratch project its plugin root and the fixtures
  // its prompts. This is the derivation path itself, not a simulation of it.
  //
  // The previous versions of these tests patched a `KEYS="…"` literal in the
  // script's source. That anchor is gone with the declared sets — and a
  // fixture prompt is the better lever anyway: it injects the fault where a
  // real fault would now originate, in a prompt.
  function stage(): string {
    const bin = join(project, "bin");
    mkdirSync(bin, { recursive: true });
    for (const helper of ["fusion-paths", "fusion-workbench-root", "fusion-plugin-cwd"]) {
      const dst = join(bin, helper);
      writeFileSync(dst, readFileSync(join(pluginRoot, "bin", helper), "utf-8"));
      chmodSync(dst, 0o755);
    }
    return bin;
  }

  /** Stage the script and give the scratch plugin root one agent prompt. */
  function stageWithAgent(name: string, body: string): void {
    stage();
    mkdirSync(join(project, "agents"), { recursive: true });
    writeFileSync(join(project, "agents", `${name}.md`), body);
  }

  function runStaged(name: string, ...args: string[]): RunResult {
    try {
      const stdout = execFileSync(join(project, "bin", "fusion-paths"), [name, ...args], {
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

  describe("internal error is exit 4, not exit 3 (issue 260716-2001)", () => {
    // The `emits no key it cannot resolve` case above asserts the branch is
    // never taken. This asserts what happens when it is — otherwise a later
    // renumbering of the code passes silently.
    it("exits 4 with a bug-not-your-fault message when a key has no value", () => {
      // A key that IS in ORDER but has no value_for branch. Derivation alone
      // cannot produce this — an unknown key is caught by the ORDER check
      // first — so ORDER is patched to admit it, and a fixture prompt names
      // it. This drives the actual value_for fallthrough.
      const bin = stage();
      const source = readFileSync(fusionPaths, "utf-8");
      const patched = source.replace(
        /^       PORTFOLIO TASKLIST"$/m,
        '       PORTFOLIO TASKLIST OUT_NOVALUE"',
      );
      expect(patched, "ORDER injection did not apply — update the anchor").not.toBe(source);
      writeFileSync(join(bin, "fusion-paths"), patched);
      chmodSync(join(bin, "fusion-paths"), 0o755);
      mkdirSync(join(project, "agents"), { recursive: true });
      // The injected key must be shaped like a real one ($OUT_*) or the
      // derivation correctly ignores it and never reaches value_for at all.
      writeFileSync(join(project, "agents", "fixture.md"), "Write to $OUT_NOVALUE.\n");

      const r = runStaged("fixture");

      // 4, never 3: a caller keying on 3 would tell the user to fix a pointer
      // that is perfectly fine.
      expect(r.status).toBe(4);
      expect(r.stderr).toContain("no value defined");
      expect(r.stderr).toContain("OUT_NOVALUE");
      expect(r.stderr).toContain("not a fault in your workbench");
      // A caller reading stdout without checking the exit code must not get
      // half a contract.
      expect(r.stdout).toBe("");
    });

    it("still exits 3 for an orphaned pointer, keeping the two faults distinct", () => {
      activate("260101-0000-does-not-exist");
      expect(run(project, "planner").status).toBe(3);
    });
  });

  describe("a key named in a prompt but unknown to the resolver cannot ship silently", () => {
    // Emission is driven by ORDER. A derived key absent from ORDER is never
    // looked up, so it never reaches value_for: it would simply vanish — exit
    // 0, key absent, the prompt's $SCAN_FOO empty, the write landing at the
    // workbench root. Silent, and the same failure the value_for guard exists
    // to prevent, one step earlier.
    //
    // Derivation changes what this catches, not whether it is needed: the key
    // can no longer be mistyped in the resolver, so what it catches now is a
    // key mistyped in a prompt, or a genuinely new key introduced before the
    // resolver learned to value it.
    it("exits 4 naming the prompt, the key and the fix", () => {
      stageWithAgent("fixture", "Skim $SCAN_ISUES for open defects.\n");
      const r = runStaged("fixture");
      expect(r.status).toBe(4);
      expect(r.stderr).toContain("SCAN_ISUES");
      expect(r.stderr).toContain("does not know");
      expect(r.stderr).toContain("agents/fixture.md");
      expect(r.stdout).toBe("");
    });

    it("does not mistake the prompts' own `$OUT_*` boilerplate for a key", () => {
      // Every converted prompt contains the sentence "use them wherever a
      // later step names a `$OUT_*` or `$SCAN_*` value". If the derivation
      // matched those, every agent would exit 4 on every run.
      stageWithAgent(
        "fixture",
        "Use them wherever a later step names a `$OUT_*` or `$SCAN_*` value. File to $OUT_ISSUE.\n",
      );
      const r = runStaged("fixture");
      expect(r.status).toBe(0);
      expect(Object.keys(parse(r.stdout)).sort()).toEqual(["OUT_ISSUE", "WORKBENCH"]);
    });

    it("every emitted key set is complete and self-consistent for all 16 agents", () => {
      // The positive counterpart: with the guards in place, a clean run proves
      // every key every prompt names is both ordered and valued.
      for (const agent of AGENTS) {
        const r = run(project, agent);
        expect(r.status, `${agent}: ${r.stderr}`).toBe(0);
        expect(r.stderr).toBe("");
      }
    });

    it("resolves every skill too, with no stderr", () => {
      for (const skill of SKILLS) {
        const r = run(project, skill);
        expect(r.status, `${skill}: ${r.stderr}`).toBe(0);
        expect(r.stderr).toBe("");
      }
    });
  });

  describe("the name namespace is flat: agents and skills together", () => {
    it("has no name that is both an agent and a skill", () => {
      // The one real cost of the flat namespace. No collision exists today;
      // this is what tells us the day one is introduced, at the point where a
      // name is added rather than at the point where a consumer gets the wrong
      // paths.
      const collisions = AGENTS.filter((a) => SKILLS.includes(a));
      expect(collisions).toEqual([]);
    });

    it("exits 4 on a collision rather than silently preferring one prompt", () => {
      stageWithAgent("fixture", "File to $OUT_ISSUE.\n");
      mkdirSync(join(project, "skills", "fixture"), { recursive: true });
      writeFileSync(join(project, "skills", "fixture", "SKILL.md"), "Write to $OUT_MEMO.\n");

      const r = runStaged("fixture");
      // Not exit 2: the name is known, twice over. Not a silent pick: either
      // choice hands a consumer another consumer's paths.
      expect(r.status).toBe(4);
      expect(r.stderr).toContain("both an agent");
      expect(r.stderr).toContain("Rename");
      expect(r.stdout).toBe("");
    });

    it("rejects a name that could escape agents/ or skills/", () => {
      // The name is interpolated into a path, so this guard is a safety
      // property rather than a style rule.
      for (const bad of ["../etc/passwd", "..", "coder/../coder", "Coder"]) {
        const r = run(project, bad);
        expect(r.status, `${bad} must not resolve`).toBe(2);
        expect(r.stdout).toBe("");
      }
    });
  });

  describe("plugin-repo preference (decision 260806-0015, option c)", () => {
    // Inside the fusion plugin's own source repo (bin/fusion-plugin-cwd: a
    // .claude-plugin/plugin.json at cwd naming "fusion"), prompts resolve
    // from the WORK TREE, not from the script's install location — the
    // installed copy's prompts can be sessions stale against the ones being
    // edited. The prompt files are the only plugin-root-relative resources
    // this script reads, so the preference is one assignment; these tests pin
    // both its presence and its bound.

    function makePluginRepo(pluginName: string, manifestJson?: string): void {
      mkdirSync(join(project, ".claude-plugin"), { recursive: true });
      writeFileSync(
        join(project, ".claude-plugin", "plugin.json"),
        manifestJson ?? `{ "name": "${pluginName}" }\n`,
      );
      mkdirSync(join(project, "agents"), { recursive: true });
      // A prompt that exists ONLY in this fake repo. The real script (its
      // install location is THIS repository's bin/) can resolve it only by
      // reading the work tree — which is the assertion.
      writeFileSync(join(project, "agents", "fakeagent.md"), "File to $OUT_ISSUE.\n");
    }

    it("derives the key set from the work tree's prompt when cwd is the plugin repo", () => {
      makePluginRepo("fusion");
      const r = run(project, "fakeagent");
      expect(
        r.status,
        "fakeagent.md exists only in the fake repo's work tree; exit 2 means the " +
          "script resolved prompts from its install location instead",
      ).toBe(0);
      expect(parse(r.stdout).OUT_ISSUE).toBe("shared/issues");
    });

    it("does not prefer the work tree when the manifest names another plugin", () => {
      makePluginRepo("not-fusion");
      const r = run(project, "fakeagent");
      // The criterion is the plugin NAME, not the manifest's existence —
      // matching hooks/lib/self-detect.ts. Another plugin's repo is an
      // ordinary consuming project.
      expect(r.status).toBe(2);
      expect(r.stderr).toContain("unknown name");
    });

    it("does not prefer the work tree when only a NESTED object names fusion", () => {
      // The criterion is the TOP-LEVEL "name" — matching self-detect.ts's
      // `pkg.name === "fusion"` after JSON.parse. A `"name": "fusion"` pair
      // buried in a sub-object (author, dependency entry) must not flip the
      // bash half while the TS half says no (issue 260806-0854).
      makePluginRepo(
        "irrelevant",
        `{ "author": { "name": "fusion" }, "name": "other" }\n`,
      );
      const r = run(project, "fakeagent");
      expect(
        r.status,
        "exit 0 means bin/fusion-plugin-cwd matched the nested name and the " +
          "script resolved prompts from the work tree",
      ).toBe(2);
      expect(r.stderr).toContain("unknown name");
    });
  });
});
