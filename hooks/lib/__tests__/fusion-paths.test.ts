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

  describe("no item in scope: one store, the shared one", () => {
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

    it("collapses every SCAN_* to the shared store alone", () => {
      // Invariant 2's second half: a SCAN_* names both stores for its kind and
      // collapses to the shared one when no item is in scope. This is the
      // collapsed reading; the two-store reading is under `an item in scope`.
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

    it("resolves the same values whatever the retired pointer holds", () => {
      // The one piece of workbench state the resolver reads is the item claim,
      // and `.active-circle` is not it. A leftover pointer from a workbench
      // that has not been migrated is the case this pins: a file the resolver
      // does not open, not a state it tolerates. A container with no record
      // inside it is claimed by nobody, so it moves no value either.
      const before = run(project, "reconciler").stdout;
      mkdirSync(join(workbench, "circles", "260716-1847-workbench-umbau"), { recursive: true });
      writeFileSync(join(workbench, ".active-circle"), "260716-1847-workbench-umbau\n");
      const after = run(project, "reconciler");
      expect(after.status).toBe(0);
      expect(after.stderr).toBe("");
      expect(after.stdout).toBe(before);
    });

    it("emits no CIRCLE key, and no key naming the retired container", () => {
      // CIRCLE named which Circle was active; OUT_CIRCLE, SCAN_CIRCLES and
      // PORTFOLIO named the container and the ranking file. All four went with
      // the layer and NONE came back with the container — OUT_BACKLOG names
      // the container store, so no consumer had to learn a new key name.
      for (const name of [...AGENTS, ...SKILLS]) {
        const p = parse(run(project, name).stdout);
        for (const key of ["CIRCLE", "OUT_CIRCLE", "SCAN_CIRCLES", "PORTFOLIO"]) {
          expect(p[key], `${name} must get no ${key}`).toBeUndefined();
        }
      }
    });

    it("is not an error state to hold no item — that answer is exit 0 and silent", () => {
      // And silent on stderr too: `bin/fusion-claimed-item` says "not a git
      // work tree" on a clean answer, and that reason is kept back rather than
      // printed at every agent's Setup in a project that has no git.
      expect(run(project, "coder").status).toBe(0);
      expect(run(project, "orchestrator").stderr).toBe("");
    });
  });

  // The scope branch. A scratch project under the OS temp directory is not a
  // git work tree, so every case above resolves to shared/ through the one path
  // that is a TRUE answer rather than a degraded one — which is why they need no
  // setup. The cases here build the git identity the claim is compared against.
  describe("an item in scope", () => {
    /** A git work tree with an identity, returning this checkout's own hex. */
    function withIdentity(): string {
      const git = (...a: string[]) => execFileSync("git", a, { cwd: project, stdio: "ignore" });
      git("init", "-q");
      git("config", "user.email", "s@example.com");
      git("config", "user.name", "Scratch Person");
      const out = execFileSync(join(pluginRoot, "bin", "fusion-identity"), [], {
        cwd: project, encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
      return /^CHECKOUT=(.*)$/m.exec(out)![1];
    }

    /** One work item: the container, and the record named after it. */
    function item(slug: string, status: string, claim?: string): void {
      mkdirSync(join(workbench, "circles", slug), { recursive: true });
      writeFileSync(join(workbench, "circles", slug, `${slug}.md`), [
        `# ${slug}`, "", "---", "**Domain:** code", `**Status:** ${status}`,
        ...(claim === undefined ? [] : [`**Claim:** ${claim}`]),
        "**Filed by:** user, Scratch Person", "", "---", "",
      ].join("\n"));
    }

    /** The claimed item, plus one open item nobody holds. */
    function claimAlpha(): void {
      item("260910-1000-alpha", "claimed", `${withIdentity()} — Scratch Person, 260910-1000`);
      item("260910-1100-beta", "open");
    }

    it("puts every OUT_* in the claimed item's container and every SCAN_* in both", () => {
      claimAlpha();
      const r = run(project, "reconciler");
      expect(r.status, r.stderr).toBe(0);
      const p = parse(r.stdout);
      expect(p.OUT_ISSUE).toBe("circles/260910-1000-alpha/issues");
      expect(p.OUT_DECISION).toBe("circles/260910-1000-alpha/decisions");
      // Container first, then the shared store. The order is contract: a
      // consumer that shows the first hit shows the item's own.
      expect(p.SCAN_ISSUES).toBe("circles/260910-1000-alpha/issues shared/issues");
      expect(p.SCAN_PLANS.split(" ")).toHaveLength(2);
      // The container store itself is not per-item, and stays whole.
      expect(parse(run(project, "orchestrator").stdout).SCAN_BACKLOG).toBe("circles");
    });

    it("takes the second argument over the claim", () => {
      // How a dispatcher sends an agent into an item this checkout does not
      // hold. The claimed item exists and is deliberately not the answer.
      claimAlpha();
      const p = parse(run(project, "planner", "260910-1100-beta").stdout);
      expect(p.OUT_PLAN).toBe("circles/260910-1100-beta/planning");
    });

    it.each([
      ["names no directory under circles/", ["260910-9999-absent"]],
      ["is a path rather than a directory name", ["circles/260910-1100-beta"]],
      ["could escape the container store", ["../../etc"]],
      ["is empty", [""]],
      ["is joined by a third argument", ["260910-1100-beta", "extra"]],
    ])("exits 1 — the caller's mistake, not the workbench's — when it %s", (_, args) => {
      // Never 3: the scope is perfectly determinable here and the caller simply
      // named an item that is not there. Sending the user off to repair their
      // workbench would send them after somebody else's bug.
      const r = run(project, "planner", ...args);
      expect(r.status).toBe(1);
      expect(r.stdout).toBe("");
    });

    it("refuses two claimed items with exit 3 and no output", () => {
      // The case a first-match implementation passes silently and wrongly. The
      // criterion is `bin/fusion-claimed-item`'s and its own test drives it;
      // under test here is that the 3 arrives whole — no output, and no fall
      // back to shared/, which would file this item's work into that item's
      // container.
      const mine = withIdentity();
      item("260910-1000-alpha", "claimed", `${mine} — Scratch Person, 260910-1000`);
      item("260910-1100-beta", "claimed", `${mine} — Scratch Person, 260910-1100`);
      const r = run(project, "planner");
      expect(r.status).toBe(3);
      expect(r.stdout).toBe("");
      expect(r.stderr, "the helper's reason reaches the user").toContain("260910-1100-beta");
    });

    it("exits 3 when this checkout's identifier cannot be read inside a work tree", () => {
      // The other half of the pair the whole table turns on. Unreadable inside a
      // work tree is a question with an answer this run failed to obtain; not a
      // work tree at all is the shared store being TRUE, and that is the case
      // every other test in this file runs under.
      withIdentity();
      writeFileSync(join(workbench, ".checkout-id"), "not-hex\n");
      const r = run(project, "planner");
      expect(r.status).toBe(3);
      expect(r.stdout).toBe("");
    });
  });

  describe("the backlog keys", () => {
    // OUT_BACKLOG and SCAN_BACKLOG name the container store whole — a work item
    // IS a directory there, and its record is the file inside it. The
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
      expect(p.OUT_BACKLOG).toBe("circles");
      expect(p.SCAN_BACKLOG).toBe("circles");
      expect(p.SCAN_BACKLOG.split(" ")).toHaveLength(1);
    });

    it("emits neither to a shipped prompt that names neither", () => {
      // Emission stays per-consumer: adding a key to the resolver gives it to
      // nobody until a prompt asks for it.
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
      expect(p.OUT_BACKLOG).toBe("circles");
      expect(p.SCAN_BACKLOG).toBe("circles");
    });

    it("gives shaper the read key and withholds the write key", () => {
      // The asymmetry is the shaper's whole access to the store: an item may
      // be its input and no byte of one is ever its output. A run that tried
      // to file or claim one has no resolved path to write to.
      const p = parse(run(project, "shaper").stdout);
      expect(p.SCAN_BACKLOG).toBe("circles");
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
      expect(p.OUT_BACKLOG).toBe("circles");
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
      expect(parse(run(project, "orchestrator").stdout).OUT_BACKLOG).toBe("circles");
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
      // restates nothing. `shared/consult/` still exists and `OUT_CONSULT`
      // still resolves for the consultant that writes there — the store's
      // survival was never the argument for the key's. A prompt that names it
      // again exits 4 against the ORDER check, loudly and reversibly.
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
    // The claim helper and the identity helper it calls travel with the script:
    // a scratch bin/ without them is an incomplete install, which is exit 3.
    for (const helper of ["fusion-paths", "fusion-workbench-root", "fusion-plugin-cwd",
                          "fusion-claimed-item", "fusion-identity"]) {
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

      // 4, never 3: a caller keying on 3 sends the user to their own claimed
      // items, and there is nothing wrong with those.
      expect(r.status).toBe(4);
      expect(r.stderr).toContain("no value defined");
      expect(r.stderr).toContain("OUT_NOVALUE");
      expect(r.stderr).toContain("not a fault in your workbench");
      // A caller reading stdout without checking the exit code must not get
      // half a contract.
      expect(r.stdout).toBe("");
    });

    it("is fusion's, where exit 3 is the workbench's and 1 and 2 are the caller's", () => {
      // The two codes are not interchangeable and the messages say whose fault
      // each is. 3 sends the user to their own claimed items; 4 tells them the
      // fault is not theirs to fix. Reading one as the other sends somebody
      // hunting a defect in the wrong tree.
      const r = run(project, "planner");
      expect(r.status).toBe(0);
      expect(r.stderr).toBe("");
    });
  });

  describe("a key named in a prompt but unknown to the resolver cannot ship silently", () => {
    // Why the guard is needed and what derivation changed about what it catches:
    // the ORDER-check comment in `bin/fusion-paths`, which this restated.
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
