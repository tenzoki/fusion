import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, chmodSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// bin/fusion-paths is a bash script, so the tests drive the real one through
// child_process against a throwaway workbench, as an agent's Setup step does.
const fusionPaths = join(pluginRoot, "bin", "fusion-paths");

const AGENTS = [
  "orchestrator", "coder", "ontocoder", "reviewer",
  "planner", "shaper", "reconciler", "analyst",
  "consultant", "editor", "curator",
];

// Read off the tree, not hand-written: a hand-written roster omitted two skills
// and nothing said so (issue 260814-1001; `skillDirs()` in the enumeration lint).
const SKILLS = readdirSync(join(pluginRoot, "skills"), { withFileTypes: true })
  .filter((d) => d.isDirectory()).map((d) => d.name).sort();

/** The prompt file a name resolves to — the same rule the script applies. */
function promptPath(name: string): string {
  const agent = join(pluginRoot, "agents", `${name}.md`);
  return AGENTS.includes(name) ? agent : join(pluginRoot, "skills", name, "SKILL.md");
}

/**
 * The keys a prompt names. This is the contract's own definition of a key set
 * — "the prompt defines which keys a consumer gets" — restated independently
 * of the script, so the tests below assert agreement rather than assuming it.
 * WORKBENCH is excluded: it is emitted unconditionally and belongs to no set.
 */
function keysNamedIn(name: string): string[] {
  const body = readFileSync(promptPath(name), "utf-8");
  const found = body.match(/\$(?:OUT|SCAN)_[A-Z][A-Z_]*/g) ?? [];
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

describe("bin/fusion-paths", () => {
  let project: string;
  let workbench: string;
  let outside: string;

  beforeEach(() => {
    project = mkdtempSync(join(tmpdir(), "fusion-paths-"));
    workbench = join(project, "fusion-workbench");
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

  describe("one kind, one store", () => {
    it("points every OUT_* into shared/", () => {
      // shaper, because its prompt names three of the artifact-kind OUT_* keys.
      const r = run(project, "shaper");
      expect(r.status).toBe(0);
      const p = parse(r.stdout);

      expect(p.OUT_PLAN).toBe("shared/planning");
      expect(p.OUT_ISSUE).toBe("shared/issues");
      expect(p.OUT_DECISION).toBe("shared/decisions");
    });

    it("emits WORKBENCH as the only absolute path", () => {
      const p = parse(run(project, "planner").stdout);
      expect(p.WORKBENCH).toMatch(/\/fusion-workbench$/);
      for (const [key, value] of Object.entries(p)) {
        if (key === "WORKBENCH") continue;
        expect(value.startsWith("/"), `${key} must be workbench-relative`).toBe(false);
      }
    });

    it("gives every SCAN_* one directory, the one its OUT_* names", () => {
      // Invariant 2 as it now reads: a SCAN_* value is a single store, the
      // same one the write key points at. It used to carry two — the active
      // Circle's and the shared one — and a consumer that read only the first
      // silently under-reported. There is no first and second any more.
      const p = parse(run(project, "reconciler").stdout);
      for (const key of ["SCAN_PLANS", "SCAN_ISSUES", "SCAN_DECISIONS", "SCAN_REVIEWS"]) {
        expect(p[key].split(" "), `${key} must name exactly one store`).toHaveLength(1);
        expect(p[key]).toMatch(/^shared\//);
      }
      // The pairing itself, on a consumer that names both halves of a kind:
      // the read key and the write key are the same string.
      const o = parse(run(project, "orchestrator").stdout);
      for (const [scan, out] of [
        ["SCAN_ISSUES", "OUT_ISSUE"],
        ["SCAN_DECISIONS", "OUT_DECISION"],
        ["SCAN_BACKLOG", "OUT_BACKLOG"],
      ] as [string, string][]) {
        expect(o[scan], `${scan} must name what ${out} names`).toBe(o[out]);
      }
    });

    it("resolves the same values whatever the workbench holds", () => {
      // The resolver reads no workbench state at all, so nothing anyone leaves
      // in the tree can move a value. A leftover `.active-circle` from a
      // workbench that has not been migrated is the case this pins: it is a
      // file the resolver does not open, not a state it tolerates.
      const before = run(project, "reconciler").stdout;
      mkdirSync(join(workbench, "circles", "260716-1847-workbench-umbau"), { recursive: true });
      writeFileSync(join(workbench, ".active-circle"), "260716-1847-workbench-umbau\n");
      const after = run(project, "reconciler");
      expect(after.status).toBe(0);
      expect(after.stderr).toBe("");
      expect(after.stdout).toBe(before);
    });

    it("emits no CIRCLE key, and no key naming the retired container", () => {
      // CIRCLE was the one emitted key that named no store: it told a caller
      // which Circle was active, or was absent when none was. OUT_CIRCLE,
      // SCAN_CIRCLES and PORTFOLIO named the container and the ranking file.
      // All four went with the layer; asserted over every consumer so a prompt
      // that names one fails here rather than resolving to nothing.
      for (const name of [...AGENTS, ...SKILLS]) {
        const p = parse(run(project, name).stdout);
        for (const key of ["CIRCLE", "OUT_CIRCLE", "SCAN_CIRCLES", "PORTFOLIO"]) {
          expect(p[key], `${name} must get no ${key}`).toBeUndefined();
        }
      }
    });

    it("is not an error state to have no Circle, because there is no Circle", () => {
      expect(run(project, "coder").status).toBe(0);
      expect(run(project, "orchestrator").stderr).toBe("");
    });
  });

  describe("there is no second argument, and no exit 3", () => {
    // `fusion-paths <name>`. The optional `<circle-dir>` selected between two
    // candidate stores for one kind; with one store per kind there is nothing
    // to select and the argument names nothing.
    it("exits 1 on a second argument rather than ignoring it", () => {
      const r = run(project, "shaper", "260812-1720-anything");
      expect(r.status).toBe(1);
      expect(r.stderr).toContain("exactly one argument");
      expect(r.stdout).toBe("");
    });

    it("exits 1 on a third argument too", () => {
      const r = run(project, "shaper", "a", "b");
      expect(r.status).toBe(1);
      expect(r.stdout).toBe("");
    });

    it("never exits 3, whatever a leftover pointer says", () => {
      // Exit 3 meant `.active-circle` was orphaned or corrupt — a
      // workbench-state fault the user had to repair. Nothing reads that file,
      // so the fault class is gone rather than unreported, and every shape
      // that used to raise it now resolves normally.
      for (const bad of ["", "\n", "260101-0000-does-not-exist\n", "circles/x\n", "../escape\n"]) {
        writeFileSync(join(workbench, ".active-circle"), bad);
        const r = run(project, "planner");
        expect(r.status, `pointer ${JSON.stringify(bad)} must resolve`).toBe(0);
        expect(r.stderr).toBe("");
      }
    });

    it("leaves the pointer file untouched", () => {
      // It is not read, and it is certainly not written. Deleting it belongs
      // to `/fusion:migrate`, which is the one consumer that knows what the
      // file was for.
      writeFileSync(join(workbench, ".active-circle"), "260101-0000-whatever\n");
      run(project, "planner");
      expect(readFileSync(join(workbench, ".active-circle"), "utf-8")).toBe(
        "260101-0000-whatever\n",
      );
    });
  });

  describe("the backlog keys", () => {
    // OUT_BACKLOG and SCAN_BACKLOG name the work-item store — the kind that
    // holds the units of work themselves since the Circle container went. The
    // staged-fixture cases below exercise the derivation path itself (see the
    // block above `stage()`); the shipped-prompt cases at the end are where
    // each consumer's actual key set is pinned.
    beforeEach(() => {
      stageWithAgent("fixture", "File the idea to $OUT_BACKLOG, and skim $SCAN_BACKLOG.\n");
    });

    it("emits both keys for a prompt that names them", () => {
      const r = runStaged("fixture");
      expect(r.status).toBe(0);
      const p = parse(r.stdout);
      expect(p.OUT_BACKLOG).toBe("shared/backlog");
      expect(p.SCAN_BACKLOG).toBe("shared/backlog");
      expect(p.SCAN_BACKLOG.split(" ")).toHaveLength(1);
    });

    it("emits neither to a shipped prompt that names neither", () => {
      // Emission stays per-consumer: adding a key to the resolver gives it to
      // nobody until a prompt asks for it.
      //
      // `orchestrator` left this list on 2026-09-10. Its prompt now names both
      // tokens, because the confirm-gated item operations became edits the
      // orchestrator performs at the user's word with no dispatch, and an
      // agent that writes the store needs the store resolved — unnamed, both
      // keys expand to the empty string and the write lands at the workbench
      // root. It moved to the case below rather than being dropped. `direct`
      // left it by being deleted: it was a user surface onto the store that
      // held no key, and it went with the Circle it created.
      for (const name of ["coder", "planner", "reviewer"]) {
        const p = parse(run(project, name).stdout);
        expect(p.OUT_BACKLOG, name).toBeUndefined();
        expect(p.SCAN_BACKLOG, name).toBeUndefined();
      }
    });

    it("gives the orchestrator both keys — it maintains the store at the user's word", () => {
      // Its prompt names `$OUT_BACKLOG` and `$SCAN_BACKLOG`, so the resolver
      // emits them. Nothing in the resolver was changed to bring them across.
      //
      // A green result says "the key is granted" and says NOTHING about the
      // write being bounded. What bounds the writer is prose, in
      // `rules/fusion-workbench-conventions.md` `## Backlog entries — work
      // items` and `agents/orchestrator.md` `## Work items`; no assertion in
      // this file reaches it.
      const p = parse(run(project, "orchestrator").stdout);
      expect(p.OUT_BACKLOG).toBe("shared/backlog");
      expect(p.SCAN_BACKLOG).toBe("shared/backlog");
    });

    it("gives shaper the read key and withholds the write key", () => {
      // The asymmetry is the shaper's whole access to the store: an item may
      // be its input and no byte of one is ever its output. A run that tried
      // to file or claim one has no resolved path to write to.
      const p = parse(run(project, "shaper").stdout);
      expect(p.SCAN_BACKLOG).toBe("shared/backlog");
      expect(p.OUT_BACKLOG).toBeUndefined();
    });

    it("gives memo the write key and withholds the read key", () => {
      // The asymmetry runs the other way. `/fusion:memo` is the one surface
      // where the store is WRITTEN — by the user, which is what the "no agent
      // files an item" bound leaves open — and it files one item per
      // invocation without ever listing, re-reading or consolidating the
      // store. Consolidating is a maintenance operation the orchestrator
      // performs at the user's word, so a run here that set out to do it has
      // no resolved path to read from.
      const p = parse(run(project, "memo").stdout);
      expect(p.OUT_BACKLOG).toBe("shared/backlog");
      expect(p.SCAN_BACKLOG).toBeUndefined();
    });
  });

  describe("the forum keys", () => {
    // A message store like any other kind: one store, one pair of keys.
    // OUT_PLAN travels along as a control, so a green result cannot come from
    // every key having collapsed to the same string.
    beforeEach(() => {
      stageWithAgent("fixture", "Draft to $OUT_FORUM, read $SCAN_FORUM, plan to $OUT_PLAN.\n");
    });

    it("emits both, each naming one store", () => {
      const r = runStaged("fixture");
      expect(r.status).toBe(0);
      const p = parse(r.stdout);
      expect(p.OUT_FORUM).toBe("shared/forum");
      expect(p.SCAN_FORUM).toBe("shared/forum");
      expect(p.SCAN_FORUM.split(" ")).toHaveLength(1);
      expect(p.OUT_PLAN).toBe("shared/planning");
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

    // The negative example used to be `playmaker`, which read every store and
    // filed into none. That agent went at v11 and `editor` is the survivor with
    // the same shape from the other direction: it writes plenty, all of it
    // project-side, and holds no workbench key at all.
    it("gives an editor no OUT_ISSUE and no store key whatsoever", () => {
      const p = parse(run(project, "editor").stdout);
      expect(p.OUT_ISSUE).toBeUndefined();
      expect(Object.keys(p)).toEqual(["WORKBENCH"]);
    });

    it("gives every agent WORKBENCH, and every workbench writer at least one key", () => {
      // `editor` is the one agent that names no key, and that is its contract
      // rather than a gap: everything it produces is project-side, and its
      // last workbench write — a session log — went with the history store on
      // 2026-09-10. It is listed here rather than filtered silently, so an
      // agent that loses its last key by accident still fails.
      const NO_KEY = ["editor"];
      for (const agent of AGENTS) {
        const r = run(project, agent);
        expect(r.status, `${agent} must resolve`).toBe(0);
        const p = parse(r.stdout);
        expect(p.WORKBENCH, `${agent} must get WORKBENCH`).toBeDefined();
        if (NO_KEY.includes(agent)) {
          expect(Object.keys(p), `${agent} writes nothing in the workbench`).toEqual(["WORKBENCH"]);
        } else {
          expect(
            Object.keys(p).length,
            `${agent} must get more than WORKBENCH alone`,
          ).toBeGreaterThan(1);
        }
      }
    });

    it("routes writers to their own output kind", () => {
      expect(parse(run(project, "planner").stdout).OUT_PLAN).toBe("shared/planning");
      expect(parse(run(project, "analyst").stdout).OUT_ANALYSIS).toBe("shared/analyses");
      expect(parse(run(project, "reviewer").stdout).OUT_REVIEW).toBe("shared/reviews");
      expect(parse(run(project, "orchestrator").stdout).OUT_BACKLOG).toBe("shared/backlog");
    });

    it("emits no key it cannot resolve", () => {
      // Guards against a key landing in an agent's set without a value —
      // an empty right-hand side would send writes to the workbench root.
      for (const agent of ["orchestrator", "reconciler", "curator"]) {
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
          .filter((k) => k !== "WORKBENCH")
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
      // and investigations, and the investigation kind has no key at all since
      // the investigator fold, so no agent argument ever resolved it. It scans the
      // tree from WORKBENCH instead — and asking under its own name is what
      // makes that legible rather than a borrowed argument that "selects
      // nothing".
      const p = parse(run(project, "log-activity").stdout);
      expect(Object.keys(p)).toEqual(["WORKBENCH"]);
    });

    it("gives memo OUT_MEMO under its own name — no agent prompt writes memos", () => {
      // OUT_MEMO used to hang off the orchestrator, whose prompt never writes
      // a memo. The key now sits with its only writer.
      expect(parse(run(project, "memo").stdout).OUT_MEMO).toBe("shared/memos");
      expect(parse(run(project, "orchestrator").stdout).OUT_MEMO).toBeUndefined();
    });

    it("gives reconciler OUT_DECISION — it files decision records (reconciler.md:65)", () => {
      // The specific regression. Absent the key, $OUT_DECISION expanded to the
      // empty string and every decision record the reconciler filed landed at
      // the workbench root instead of the decision store. Silent: the write
      // succeeded, just in the wrong place.
      expect(parse(run(project, "reconciler").stdout).OUT_DECISION).toBe("shared/decisions");
    });

    it("emits no history key to any agent — the store is closed to writes", () => {
      // The history store closed on 2026-09-10: no agent prompt names
      // `$OUT_HISTORY` or `$SCAN_HISTORY`, so the resolver values neither for
      // an agent. The corpus itself is kept and stays readable; what ended is
      // the writing. `/fusion:cadence` still receives SCAN_HISTORY, because it
      // digests that frozen corpus and says so in its own output.
      // Asserted over every agent rather than one, so re-adding a history-log
      // step to a prompt fails here rather than quietly re-opening the store.
      for (const name of AGENTS) {
        const p = parse(run(project, name).stdout);
        expect(p.OUT_HISTORY, `${name} must get no OUT_HISTORY`).toBeUndefined();
        expect(p.SCAN_HISTORY, `${name} must get no SCAN_HISTORY`).toBeUndefined();
      }
      expect(parse(run(project, "cadence").stdout).SCAN_HISTORY).toBe("shared/history");
    });

    it("emits no investigation key to anyone — the kind lost both of them", () => {
      // OUT_INVESTIGATION and SCAN_INVESTIGATIONS were retired on 2026-08-15
      // with `agents/investigator.md` and `agents/conceptrev.md`, the last two
      // prompts naming either. `shared/investigations/` still exists and still
      // holds reports; the KEYS went because a key set restates the prompts
      // and these restated nothing. Asserted over every consumer rather than
      // one, so re-adding an arm without a prompt to name it fails here.
      for (const name of [...AGENTS, ...SKILLS]) {
        const p = parse(run(project, name).stdout);
        expect(p.OUT_INVESTIGATION, `${name} must get no OUT_INVESTIGATION`).toBeUndefined();
        expect(p.SCAN_INVESTIGATIONS, `${name} must get no SCAN_INVESTIGATIONS`).toBeUndefined();
      }
    });

    it("emits no SCAN_CONSULT to anyone — the kind lost its read key", () => {
      // The same retirement the investigation keys took, and by the same
      // criterion: a key set restates the prompts, so a key no prompt names
      // restates nothing. `playmaker` read every store and went at v11;
      // `/fusion:archive` then named the key in one sentence about deriving a
      // shared store from a two-valued SCAN_*, and that derivation went with
      // the second value on 2026-09-10. `shared/consult/` still exists, still
      // holds reports, and `OUT_CONSULT` still resolves for the consultant
      // that writes them — the store's survival was never the argument for the
      // key's. A prompt that names it again exits 4 against the ORDER check,
      // which is how the retirement stays reversible and loud.
      for (const name of [...AGENTS, ...SKILLS]) {
        expect(parse(run(project, name).stdout).SCAN_CONSULT, name).toBeUndefined();
      }
      expect(parse(run(project, "consultant").stdout).OUT_CONSULT).toBe("shared/consult");
    });

    it("emits no SCAN_MEMOS to anyone — nothing reads memos", () => {
      for (const agent of ["orchestrator", "curator", "consultant", "analyst"]) {
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
  // A fixture prompt is the right lever: it injects the fault where a real
  // fault would now originate, in a prompt.
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
        /^       SCAN_ANALYSES SCAN_BACKLOG SCAN_FORUM"$/m,
        '       SCAN_ANALYSES SCAN_BACKLOG SCAN_FORUM OUT_NOVALUE"',
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

    it("is the only non-usage failure the resolver has left", () => {
      // Exit 3 used to sit beside it, for a workbench-state fault the user
      // could repair. With the pointer gone there is no such fault: 1 and 2
      // are the caller's, 4 is fusion's, and nothing in between belongs to
      // the user's workbench.
      const r = run(project, "planner");
      expect(r.status).toBe(0);
      expect(r.stderr).toBe("");
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

    it("every emitted key set is complete and self-consistent for every agent", () => {
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
    // The work-tree preference, its criterion and its exact bound are stated in
    // `CLAUDE.md`'s `bin/fusion-plugin-cwd` Layout row and its Rules-loading
    // convention. The prompt files are the only plugin-root-relative resources
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
