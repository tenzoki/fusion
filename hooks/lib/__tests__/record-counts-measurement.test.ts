import { describe, it, expect, beforeAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, renameSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { extractBashBlock } from "./helpers/prompt-blocks.js";

// ---------------------------------------------------------------------------
// The four record counts in the session budget table are MEASURED off the
// stores, and this gate runs the measurement rather than reading it
// (`agents/orchestrator.md` `### The record counts are computed, not tallied`).
//
// The block replaced a hand-kept tally that had drifted by two in both
// directions (`shared/issues/260810-1205_*`). It then shipped with four faults
// of its own, all four found by extracting it and running it, none of them
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
//   4. Both of its `unmeasured` branches threw away the `filed` counts along
//      with the `now_` ones. `filed` compares a filename stamp against
//      `session.started` and touches no git, so it stayed measurable in exactly
//      the cases the block declared unmeasurable — every project that does not
//      track its workbench (`shared/issues/260811-1610_*`). The prose taxonomy of
//      the two causes had drifted from the branches too: "a project outside git"
//      was listed under the branch that cannot reach it
//      (`shared/issues/260811-1616_*`).
//   5. The fix for 4 was applied in one direction only. A missing
//      `session.started` still took BOTH halves down, anchor and all, and the
//      case below asserting that was the untouched leg of the old combined gate
//      rather than a considered decision (`shared/issues/260811-2149_*`). Each
//      half is now gated on its own input, which is four cases, not two.
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

const orchestrator = () => readFileSync(join(pluginRoot, "agents", "orchestrator.md"), "utf-8");

const HEADING = "### The record counts are computed, not tallied";
/** The commit that introduced the block, with the first three faults in it. */
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
  /** no `.git` anywhere — Setup Step 5 records a HEAD only in a git repository */
  outsideGit?: boolean;
  /** override what `git_head_at_start` records: a string is written verbatim, `null` omits the field */
  anchor?: string | null;
  /** override what `started` records: a string is written verbatim, `null` omits the field */
  start?: string | null;
}

/**
 * A throwaway project whose workbench holds a known set of records, half of them
 * committed at the session anchor and half moved or filed after it. Returns the
 * project root. The expected counts for every shape are in EXPECTED below; they
 * are stated once and asserted against whatever the block prints.
 */
function makeProject(shape: Shape = {}): string {
  const { tracked = true, circleAtAnchor = false, activeCircle = true, state = true, outsideGit = false } = shape;
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
  let anchor = "";
  if (!outsideGit) {
    git("init", "-q", ".");
    git("add", "-A");
    git("commit", "-qm", "anchor");
    anchor = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf-8" }).stdout.trim();
  }

  if (state) {
    // `undefined` means "whatever this fixture's git says", which outside git is
    // nothing at all — the shape Setup Step 5 actually leaves behind there.
    const recorded = shape.anchor === undefined ? anchor : shape.anchor;
    const anchorLine = recorded ? `  git_head_at_start: "${recorded}"\n` : "";
    // `start: null` omits `started` while keeping the anchor — the shape that
    // leaves the now_ half measurable and the filed half without a bound.
    const started = shape.start === undefined ? "260811-1000" : shape.start;
    const startLine = started ? `  started: "${started}"\n` : "";
    put("agentstate.yaml", `session:\n${startLine}${anchorLine}`);
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
  /** what stays measurable when the anchor is unusable: the filed half needs no git */
  filedOnly: { "filed issue": 2 },
  /** what stays measurable when `session.started` is absent: the now_ half needs no start stamp */
  nowOnly: { "now_c issue": 1, "now_o issue": 2, "now_a decision": 1 },
} as const;

interface Reading {
  raw: string;
  stderr: string;
  status: number | null;
  /** the `why=` field when the block reported `records=unmeasured`, else null */
  unmeasured: string | null;
  /** the `why=` field when the block reported `records=partial`, else null */
  partial: string | null;
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
  const why = /records=(unmeasured|partial)(?:\s+why=(\S+))?/.exec(raw);
  const cause = why ? (why[2] ?? "(no why= field)") : null;
  return {
    raw,
    stderr: r.stderr ?? "",
    status: r.status,
    unmeasured: why?.[1] === "unmeasured" ? cause : null,
    partial: why?.[1] === "partial" ? cause : null,
    counts,
  };
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

describe("each half is gated on what that half needs, and the cause is named", () => {
  const noNowCounts = (v: Reading) =>
    expect(
      Object.keys(v.counts).filter((k) => k.startsWith("now_")),
      "a `now_` count was printed without a usable anchor. Every record's path is absent " +
        "from the anchor there, so every record would read as having reached its marker " +
        "this session — a large wrong number in place of an honest gap.",
    ).toEqual([]);

  const noFiledCounts = (v: Reading) =>
    expect(
      Object.keys(v.counts).filter((k) => k.startsWith("filed")),
      "a `filed` count was printed with no `session.started` to compare against. Every " +
        "record's stamp would pass an empty bound, so every record would read as filed " +
        "this session — the same shape of wrong number, from the other input.",
    ).toEqual([]);

  for (const shell of shells) {
    it(`keeps the filed counts over an untracked workbench (${shell})`, () => {
      const v = run(snippet, makeProject({ tracked: false }), shell);
      expect(v.status).toBe(0);
      expect(v.partial, `an untracked workbench did not report itself as partial:\n${v.raw}`).toBe(
        "workbench-not-in-anchor-commit",
      );
      expect(v.unmeasured, "the whole read was declared unmeasurable while half of it was on the disk").toBeNull();
      // The assertion this replaces required `{}` here, and was right about the
      // block as it then stood: both branches printed the cause and nothing else.
      // The filed half needs no git, so an unusable anchor never touched it
      // (`shared/issues/260811-1610_*`).
      expect(v.counts, "the filed counts went down with the git-dependent ones").toEqual(EXPECTED.filedOnly);
      noNowCounts(v);
    });

    it(`reports both causes when neither input is present, and measures nothing (${shell})`, () => {
      // No `agentstate.yaml` at all, so neither half has its input: no bound for
      // the filed half and no anchor for the now_ half. This is the one shape
      // left where all four cells are unmeasurable.
      //
      // The assertion this replaces required `why=no-anchor-in-agentstate`
      // alone, and was right about the block as it then stood — a missing start
      // stamp took BOTH halves down, under the anchor's name, so the name was
      // the whole story of that branch. Each half is now gated on its own input
      // (`shared/issues/260811-2149_*`), which leaves this branch reachable only
      // when both inputs are missing, and then both causes are true. Naming one
      // would send a session diagnosing it to look at half the state file.
      const v = run(snippet, makeProject({ state: false }), shell);
      expect(v.unmeasured).toBe("no-anchor-in-agentstate,no-session-start");
      expect(v.raw).toMatch(/anchor=none/);
      expect(v.raw).toMatch(/start=none/);
      expect(v.counts, "counts were printed alongside `unmeasured`").toEqual({});
    });

    it(`keeps the now_ counts when only the start stamp is missing (${shell})`, () => {
      // The mirror of the case the untracked-workbench test covers, and the leg
      // of the old combined gate that was left standing when the other was fixed
      // (`shared/issues/260811-2149_*`). `session.started` is absent while the
      // anchor is present and its probe passes. The now_ half asks git whether a
      // name existed at the anchor — a question the start stamp plays no part in
      // — so it stays measurable and is taken.
      const v = run(snippet, makeProject({ start: null }), shell);
      expect(v.status).toBe(0);
      expect(v.partial, `a missing start stamp did not report itself as partial:\n${v.raw}`).toBe("no-session-start");
      expect(v.unmeasured, "the whole read was declared unmeasurable while the git half was measurable").toBeNull();
      expect(v.raw).toMatch(/start=none/);
      expect(v.counts, "the now_ counts went down with the start-stamp-dependent one").toEqual(EXPECTED.nowOnly);
      noFiledCounts(v);
    });

    it(`keeps the filed counts when only the anchor is missing (${shell})`, () => {
      // `[ -z "$A" ] || [ -z "$T" ]` fired here too, discarding a filed count
      // that a present `session.started` made fully computable.
      const v = run(snippet, makeProject({ anchor: null }), shell);
      expect(v.partial).toBe("no-anchor-in-agentstate");
      expect(v.counts).toEqual(EXPECTED.filedOnly);
      noNowCounts(v);
    });

    it(`puts a project outside git on the cause its own branch emits (${shell})`, () => {
      // Setup Step 5 records a HEAD only in a git repository, so outside git the
      // state file carries `started` and no `git_head_at_start` — the no-anchor
      // branch, not the probe (`shared/issues/260811-1616_*`).
      const recordedNothing = run(snippet, makeProject({ outsideGit: true }), shell);
      expect(recordedNothing.partial, `outside git, anchor never recorded:\n${recordedNothing.raw}`).toBe(
        "no-anchor-in-agentstate",
      );
      expect(recordedNothing.counts).toEqual(EXPECTED.filedOnly);
      noNowCounts(recordedNothing);

      // The other anchor state: a hash was recorded and the repository is gone.
      // That one the probe answers, and it is the only way branch 2 sees a
      // project outside git.
      const recordedAnchor = run(snippet, makeProject({ outsideGit: true, anchor: "0".repeat(40) }), shell);
      expect(recordedAnchor.partial, `outside git, anchor recorded:\n${recordedAnchor.raw}`).toBe(
        "workbench-not-in-anchor-commit",
      );
      expect(recordedAnchor.counts).toEqual(EXPECTED.filedOnly);
      noNowCounts(recordedAnchor);
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

describe("the cause list matches the branch that emits it", () => {
  it("lists a project outside git under the cause it actually gets", () => {
    // The prose is the one place the two `why=` values are explained, and a
    // session diagnosing `no-anchor-in-agentstate` outside git must find that
    // case listed under the value it got (`shared/issues/260811-1616_*`).
    const s = section(orchestrator());
    const noAnchor = s.lastIndexOf("`no-anchor-in-agentstate`");
    const notInCommit = s.lastIndexOf("`workbench-not-in-anchor-commit`");
    const outsideGit = s.lastIndexOf("outside git");
    expect(noAnchor, "the section explains neither cause").toBeGreaterThan(-1);
    expect(notInCommit, "the section explains `workbench-not-in-anchor-commit` before the other cause").toBeGreaterThan(
      noAnchor,
    );
    expect(outsideGit, "the section names no project outside git at all").toBeGreaterThan(-1);
    expect(
      outsideGit > noAnchor && outsideGit < notInCommit,
      "'a project outside git' is listed under `workbench-not-in-anchor-commit`, which cannot " +
        "reach it: Setup Step 5 records a HEAD only in a git repository, so `git_head_at_start` " +
        "is empty and the no-anchor branch is the one that fires.",
    ).toBe(true);
  });

  it("describes the no-anchor branch as reading the anchor field alone", () => {
    const s = section(orchestrator());
    // What this replaces asserted the branch was described as a DISJUNCTION —
    // "missing either `git_head_at_start` or `started`" — and that was an
    // accurate description of the combined gate, which fired on either field.
    // The gate is now per input (`shared/issues/260811-2149_*`): a missing
    // `started` has its own cause, so the old sentence would now describe a
    // branch the code cannot take, and the disjunction is replaced rather than
    // dropped.
    expect(
      s,
      "the no-anchor cause is still described as firing on a missing `started` too. " +
        "It does not: that field has its own cause now, and a session reading this " +
        "would look for an anchor that is present.",
    ).not.toMatch(/missing either `git_head_at_start` or `started`/);
    expect(s, "the section names no `no-session-start` cause, so one of the three `why=` values is undocumented").toMatch(
      /`no-session-start`/,
    );
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
