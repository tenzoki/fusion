import { describe, it, expect, beforeAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, renameSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { extractBashBlock } from "./helpers/prompt-blocks.js";

// ---------------------------------------------------------------------------
// The four record counts in the session budget table are MEASURED off the
// stores, and this gate runs the measurement rather than reading it
// (`agents/orchestrator.md` `### The record counts are computed, not tallied`).
//
// The block replaced a hand-kept tally that had drifted by two in both
// directions (`shared/issues/260810-1205_*`). It then shipped with three faults
// of its own, all three found by extracting it and running it, none of them
// visible to a reader:
//
//   1. Its untracked-workbench probe asked git for `${SCAN_ISSUES%% *}` — the
//      FIRST store, which `bin/fusion-paths` makes the active Circle's. Git
//      tracks no empty directory, so every Circle that had filed no committed
//      record by the session anchor read as an untracked workbench and the whole
//      measurement reported `unmeasured`, in a workbench that was fully tracked
//      and perfectly measurable (`shared/issues/260811-1406_*`).
//   2. It read `$WORKBENCH`, `$SCAN_ISSUES` and `$SCAN_DECISIONS` as live shell
//      variables. The Bash tool gives every call its own shell, so a verbatim run
//      aborted on its own assertion and blamed fusion (`shared/issues/260811-1407_*`).
//   3. It justified its store-list handling with "the Bash tool runs zsh", which
//      is a property of the author's machine, not of the tool
//      (`shared/issues/260811-1412_*`, `rules/critical-stance.md` §3).
//
// So this gate does three things, in the order the faults came:
//
//   - It RUNS the block, in both shells, over throwaway workbenches whose record
//     stores it built — so a count that drifts from the disk fails here.
//   - It runs it in a shell that was given NOTHING, which is the shell an agent
//     actually gets.
//   - It reads the section's prose for the one claim that is about a machine
//     rather than about the code.
//
// The controls run the block AS IT SHIPPED, read out of git rather than
// transcribed, and show it failing both ways over the same fixtures. A gate
// whose negative control is invented text proves nothing about what shipped.
//
// What this is not (`rules/critical-stance.md` §3): proof that a session runs
// the block. Nothing here executes at session time. It proves the block, run as
// written, counts what is on the disk.
// ---------------------------------------------------------------------------

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const orchestrator = () => readFileSync(join(pluginRoot, "agents", "orchestrator.md"), "utf-8");

const HEADING = "### The record counts are computed, not tallied";
/** The commit that introduced the block, with all three faults in it. */
const PRE_FIX_COMMIT = "7749845";

/** Both shells, because Claude Code starts the user's login shell, not bash. */
const SHELLS = { bash: "/bin/bash", zsh: "/bin/zsh" } as const;
type Shell = keyof typeof SHELLS;
const shells = (Object.keys(SHELLS) as Shell[]).filter((s) => existsSync(SHELLS[s]));

const CIRCLE = "260810-0900-demo";

interface Shape {
  /** the workbench is committed at the anchor (false = the project ignores it) */
  tracked?: boolean;
  /** the active Circle's issue store already holds a committed record at the anchor */
  circleAtAnchor?: boolean;
  /** `.active-circle` present, so each `SCAN_*` names two stores */
  activeCircle?: boolean;
  /** `agentstate.yaml` written, so the block has an anchor and a start stamp */
  state?: boolean;
}

/**
 * A throwaway project whose workbench holds a known set of records, half of them
 * committed at the session anchor and half moved or filed after it. Returns the
 * project root. The expected counts for every shape are in EXPECTED below; they
 * are stated once and asserted against whatever the block prints.
 */
function makeProject(shape: Shape = {}): string {
  const { tracked = true, circleAtAnchor = false, activeCircle = true, state = true } = shape;
  const root = mkdtempSync(join(tmpdir(), "fusion-record-counts-"));
  const wb = join(root, "fusion-workbench");
  const circleIssues = join(wb, "circles", CIRCLE, "issues");
  for (const d of [
    join(wb, "shared", "issues"),
    join(wb, "shared", "decisions"),
    circleIssues,
    join(wb, "circles", CIRCLE, "decisions"),
  ]) {
    mkdirSync(d, { recursive: true });
  }
  const put = (p: string, body = "x\n") => writeFileSync(join(wb, p), body, "utf-8");

  put(".fusion-setup", '{"version":"test"}\n');
  put(`circles/${CIRCLE}/_t_circle.md`, "# demo Circle\n");
  if (activeCircle) put(".active-circle", `${CIRCLE}\n`);

  // present, and committed, at the anchor
  put("shared/issues/260801-0900_o_still-open.md");
  put("shared/issues/260801-0901_o_closed-after-the-anchor.md");
  put("shared/decisions/260801-0902_o_answered-after-the-anchor.md");
  if (circleAtAnchor) put(`circles/${CIRCLE}/issues/260805-0900_o_circle-record-at-the-anchor.md`);
  if (!tracked) writeFileSync(join(root, ".gitignore"), "fusion-workbench/\n", "utf-8");
  writeFileSync(join(root, "README.md"), "# scratch\n", "utf-8");

  const git = (...args: string[]) => {
    const r = spawnSync("git", args, {
      cwd: root,
      stdio: "ignore",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "harness",
        GIT_AUTHOR_EMAIL: "harness@example.invalid",
        GIT_COMMITTER_NAME: "harness",
        GIT_COMMITTER_EMAIL: "harness@example.invalid",
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_CONFIG_SYSTEM: "/dev/null",
      },
    });
    if (r.status !== 0) throw new Error(`harness git ${args.join(" ")} failed`);
  };
  git("init", "-q", ".");
  git("add", "-A");
  git("commit", "-qm", "anchor");
  const anchor = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf-8" }).stdout.trim();

  if (state) {
    put("agentstate.yaml", `session:\n  started: "260811-1000"\n  git_head_at_start: "${anchor}"\n`);
  }

  // after the anchor: one issue closed, one decision answered, one issue filed
  // in each store the resolver will name
  renameSync(
    join(wb, "shared/issues/260801-0901_o_closed-after-the-anchor.md"),
    join(wb, "shared/issues/260801-0901_c_closed-after-the-anchor.md"),
  );
  renameSync(
    join(wb, "shared/decisions/260801-0902_o_answered-after-the-anchor.md"),
    join(wb, "shared/decisions/260801-0902_a_answered-after-the-anchor.md"),
  );
  put("shared/issues/260811-1400_o_filed-into-shared.md");
  if (activeCircle) put(`circles/${CIRCLE}/issues/260811-1401_o_filed-into-the-circle.md`);
  return root;
}

/** What the disk says, for the shapes the assertions use. */
const EXPECTED = {
  twoStores: { "filed issue": 2, "now_c issue": 1, "now_o issue": 2, "now_a decision": 1 },
  sharedOnly: { "filed issue": 1, "now_c issue": 1, "now_o issue": 1, "now_a decision": 1 },
} as const;

interface Reading {
  raw: string;
  stderr: string;
  status: number | null;
  /** the `why=` field when the block reported `records=unmeasured`, else null */
  unmeasured: string | null;
  counts: Record<string, number>;
}

/**
 * Run `snippet` over `root` in `shell`, in a shell that holds none of the
 * resolver's values — which is the shell an agent's Bash call actually gets.
 */
function run(snippet: string, root: string, shell: Shell, opts: { cwd?: string; env?: Record<string, string> } = {}): Reading {
  const env: Record<string, string | undefined> = {
    ...process.env,
    FUSION_PLUGIN_ROOT: pluginRoot,
    ...(opts.env ?? {}),
  };
  for (const k of ["WORKBENCH", "SCAN_ISSUES", "SCAN_DECISIONS"]) {
    if (!(opts.env && k in opts.env)) delete env[k];
  }
  const r = spawnSync(SHELLS[shell], ["-c", snippet], {
    cwd: opts.cwd ?? root,
    encoding: "utf-8",
    env: env as NodeJS.ProcessEnv,
  });
  const raw = (r.stdout ?? "").trim();
  const counts: Record<string, number> = {};
  for (const line of raw.split("\n")) {
    const m = /^\s*(\d+)\s+(\S.*)$/.exec(line);
    if (m) counts[m[2].trim()] = Number(m[1]);
  }
  const why = /records=unmeasured(?:\s+why=(\S+))?/.exec(raw);
  return { raw, stderr: r.stderr ?? "", status: r.status, unmeasured: why ? (why[1] ?? "(no why= field)") : null, counts };
}

function git(...args: string[]) {
  const r = spawnSync("git", args, { cwd: pluginRoot, encoding: "utf-8" });
  return { status: r.status, stdout: r.stdout ?? "" };
}

/** The section's prose — heading to the next `###`, the block included. */
function section(text: string): string {
  const lines = text.split("\n");
  const at = lines.findIndex((l) => l.startsWith(HEADING));
  if (at < 0) throw new Error(`section not found: ${HEADING}`);
  const end = lines.findIndex((l, i) => i > at && /^### /.test(l));
  return lines.slice(at, end < 0 ? undefined : end).join("\n");
}

let snippet = "";
let shipped: string | null = null;

beforeAll(() => {
  snippet = extractBashBlock(orchestrator(), HEADING);
  // The block as it shipped, out of git — never transcribed. An install copy or
  // a shallow clone has no such commit; those controls skip.
  if (git("rev-parse", "--verify", "--quiet", `${PRE_FIX_COMMIT}^{commit}`).status === 0) {
    const historical = git("show", `${PRE_FIX_COMMIT}:agents/orchestrator.md`);
    if (historical.status === 0) shipped = extractBashBlock(historical.stdout, HEADING);
  }
});

describe("the record counts are measured off the stores", () => {
  it("has both shells to measure in", () => {
    expect(shells, "neither /bin/bash nor /bin/zsh is present; nothing below measured anything").not.toHaveLength(0);
  });

  for (const shell of shells) {
    it(`counts what the disk holds, across both stores (${shell})`, () => {
      const v = run(snippet, makeProject(), shell);
      expect(v.status, `the block exited ${v.status}: ${v.stderr}`).toBe(0);
      expect(v.unmeasured, `reported unmeasured over a tracked workbench:\n${v.raw}`).toBeNull();
      expect(v.counts).toMatchObject(EXPECTED.twoStores);
    });

    it(`measures a Circle whose issue store was empty at the anchor (${shell})`, () => {
      // The defect this gate exists for. Git tracks no empty directory, so the
      // Circle store is absent from the anchor commit — which says nothing about
      // whether the counts can be taken, and they can: they are on the disk.
      const empty = run(snippet, makeProject({ circleAtAnchor: false }), shell);
      const filled = run(snippet, makeProject({ circleAtAnchor: true }), shell);
      expect(empty.unmeasured, `an empty Circle store at the anchor read as unmeasurable:\n${empty.raw}`).toBeNull();
      expect(empty.counts).toEqual(filled.counts);
      expect(empty.counts).toMatchObject(EXPECTED.twoStores);
    });

    it(`needs nothing from the shell it is run in (${shell})`, () => {
      // `run` deletes the three keys from the environment. The block resolves
      // them itself, because the Bash tool gives every call its own shell.
      const v = run(snippet, makeProject(), shell);
      expect(v.status).toBe(0);
      expect(v.stderr, "the block reported a fusion bug over a healthy workbench").not.toMatch(/fusion bug/);
    });

    it(`counts a workbench with no active Circle (${shell})`, () => {
      const v = run(snippet, makeProject({ activeCircle: false }), shell);
      expect(v.unmeasured).toBeNull();
      expect(v.counts).toMatchObject(EXPECTED.sharedOnly);
    });

    it(`resolves the workbench from a subdirectory (${shell})`, () => {
      const root = makeProject();
      const sub = join(root, "fusion-workbench", "shared");
      const v = run(snippet, root, shell, { cwd: sub });
      expect(v.unmeasured, `could not measure from ${sub}:\n${v.raw}`).toBeNull();
      expect(v.counts).toMatchObject(EXPECTED.twoStores);
    });
  }
});

describe("unmeasured stays reachable, and names the cause it found", () => {
  for (const shell of shells) {
    it(`reports an untracked workbench, and says which cause (${shell})`, () => {
      const v = run(snippet, makeProject({ tracked: false }), shell);
      expect(v.status).toBe(0);
      expect(
        v.unmeasured,
        "an untracked workbench measured as if it were tracked. Every record's path is " +
          "absent from the anchor there, so every record would read as having reached its " +
          "marker this session — a large wrong number in place of an honest gap.",
      ).toBe("workbench-not-in-anchor-commit");
      expect(v.counts, "counts were printed alongside `unmeasured`").toEqual({});
    });

    it(`reports a missing anchor as its own cause (${shell})`, () => {
      const v = run(snippet, makeProject({ state: false }), shell);
      expect(v.unmeasured).toBe("no-anchor-in-agentstate");
      expect(v.raw).toMatch(/anchor=none/);
    });

    it(`names the resolver's exit code when a key comes back empty (${shell})`, () => {
      // The one thing the assertion in front of the read can still be reporting,
      // now that the block resolves the keys itself.
      const v = run(snippet, makeProject(), shell, { env: { FUSION_PLUGIN_ROOT: "/nonexistent-plugin-root" } });
      expect(v.status).toBe(1);
      expect(v.stderr).toMatch(/record counts not taken/);
      expect(
        v.stderr,
        "the failure text still calls an unresolvable key a fusion bug. It is one only " +
          "when the resolver exits 4; exit 3 is the user's own `.active-circle`, and the " +
          "remedies are opposite.",
      ).not.toMatch(/fusion bug/);
    });
  }
});

describe("the justification is about the code, not about a machine", () => {
  it("claims no shell for the Bash tool", () => {
    expect(
      section(orchestrator()),
      "the section states which shell the Bash tool runs. It runs the USER's shell — zsh " +
        "on the author's machine, bash on many consuming ones — and an agent that reads " +
        "the claim as a property of fusion will carry it into the next block it writes, " +
        "where `setopt`, glob qualifiers and unmatched-glob handling do differ " +
        "(`rules/critical-stance.md` §3).",
    ).not.toMatch(/Bash tool runs\s+(?:zsh|bash|sh)\b/);
  });

  it("states the splitting property for both shells instead", () => {
    const s = section(orchestrator());
    expect(s).toMatch(/under bash/);
    expect(s).toMatch(/under zsh/);
  });
});

describe("the gate catches the faults it exists for", () => {
  it("shows the shipped block reporting a tracked workbench as unmeasurable", (ctx) => {
    if (!shipped) return ctx.skip();
    // Run as a session that DID substitute the values would have run it, so the
    // only fault left in play is the probe on the first store.
    const root = makeProject({ circleAtAnchor: false });
    const v = run(shipped, root, shells[0], {
      env: {
        WORKBENCH: join(root, "fusion-workbench"),
        SCAN_ISSUES: `circles/${CIRCLE}/issues shared/issues`,
        SCAN_DECISIONS: `circles/${CIRCLE}/decisions shared/decisions`,
      },
    });
    expect(v.unmeasured, "the shipped block already measured this case; the control is stale").not.toBeNull();
    expect(run(snippet, root, shells[0]).unmeasured, "the fix does not measure it either").toBeNull();
  });

  it("shows the shipped block aborting in a shell that was given nothing", (ctx) => {
    if (!shipped) return ctx.skip();
    const root = makeProject();
    const v = run(shipped, root, shells[0]);
    expect(v.status, "the shipped block ran without the values; the control is stale").toBe(1);
    expect(v.stderr).toMatch(/fusion bug/);
    expect(run(snippet, root, shells[0]).status, "the fix aborts the same way").toBe(0);
  });

  it("shows the claim it removed", (ctx) => {
    if (git("rev-parse", "--verify", "--quiet", `${PRE_FIX_COMMIT}^{commit}`).status !== 0) return ctx.skip();
    const historical = git("show", `${PRE_FIX_COMMIT}:agents/orchestrator.md`);
    if (historical.status !== 0) return ctx.skip();
    expect(section(historical.stdout), "the control is stale — that commit carries no such claim").toMatch(
      /Bash tool runs\s+zsh/,
    );
  });
});
