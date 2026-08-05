import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, relative } from "node:path";

// ---------------------------------------------------------------------------
// The emission golden — how many bytes of plugin rule text every agent loads
// on every single dispatch.
//
// WHY THIS FILE EXISTS. `bin/fusion-rules` is the only thing that decides what
// an agent reads at Setup, and its always-on list (`emit_if_exists`, one call
// per line) is unconditional: every byte in those files is paid by every agent,
// every dispatch, forever. That cost had never been measured by anything
// executable, and it grew from 87 387 bytes (2026-07-31) to 145 144 bytes
// (2026-08-04) inside the very Circle whose goal was to reduce it —
// `rules/protected-path-discipline.md` alone went 11 032 -> 50 559 in four days.
// A number nothing asserts is a number nobody notices moving.
//
// This file is step 1 of
// `circles/260801-1244-guard-rules-write/planning/260804-2356_o_plan-ausstieg-kontextsteuer-und-auslieferung.md`.
// It cuts nothing. It builds the instrument the five following steps are
// measured against, so that "we reduced the context tax" is a diff and not a
// claim.
//
// WHAT IT MEASURES. For each of the 16 agents: the paths `bin/fusion-rules`
// emits that live under `<plugin>/rules`, in emission order, each with its byte
// size, plus the total. Project-side rules (`./rules`, `.claude/rules`) and the
// stilwerk voice profiles are deliberately out of scope — both vary per
// consuming project, so neither is a property of the plugin. They are excluded
// by CONSTRUCTION, not by a filter: the script runs with an empty temp
// directory as its working directory, so there is nothing project-side for it
// to find. `assertOnlyPluginRules` then proves the exclusion held rather than
// assuming it, because a filter that silently drops an unexpected line is how a
// measurement quietly stops measuring.
//
// WHY IT DRIVES THE REAL SCRIPT. `bin/fusion-rules` is bash; there is no
// importable module. `fusion-paths.test.ts` and `monitor-warnings-panel.test.ts`
// set the precedent of driving a real `bin/` script through child_process, and
// this file follows it. The seam is the script's stdout, which is exactly what
// an agent's Setup reads.
//
// ENVIRONMENT INDEPENDENCE. `FUSION_PLUGIN_ROOT` is forced to THIS repository
// for every call. A developer almost always has it pointing at their installed
// copy (`~/.fusion`), which carries a different — usually older — rule set; a
// test that inherited it would measure the install, not the source tree, and
// would report whatever the developer last installed.
//
// THE THREE ASSERTIONS, AND WHY EACH IS NEEDED.
//
//   1. The GOLDEN (`fixtures/rules-emission.golden`) pins path set, per-file
//      size and per-agent total. It fails on any change in either direction —
//      including a cut that removes more than intended. It is meant to be
//      regenerated when a cut is deliberate; see `## Updating the golden`.
//
//   2. The ROLE CAPS are literals in THIS file and are the safety net against
//      growth. They exist precisely because the golden is regenerable: an added
//      always-on rule file appears in no golden line, and a regenerated golden
//      would absorb it without complaint. A cap does not absorb it — it has to
//      be edited by hand, in the test source, in the same commit, which is the
//      moment the question "am I raising the tax, and for whom?" gets asked out
//      loud.
//
//      One cap per role rather than one number for all sixteen agents, because
//      after the cut the agents no longer carry the same load: they range from
//      89 913 to 111 810 bytes. A single ceiling has to sit at the maximum, so
//      it would have granted the five leanest agents 21 897 bytes of silent
//      head-room and called that compliance.
//
//   3. The RELEASE CAP is not a ratchet but a promise to consuming projects —
//      an update may not hand them more rule text than `origin/main` already
//      does — and it gates the version bump. Every role cap that stands above
//      it must carry, in this source, the file that causes the overage and the
//      reason that role applies it. A cap without that is a number the next
//      growth quietly raises, which is the whole thing the ratchet is for.
//
// HOW A ROLE IS DERIVED, AND WHY IT IS NOT A LIST OF NAMES. The universal core
// is computed as the INTERSECTION of all sixteen emissions. An agent's role is
// what is left over: the sorted set of rule files it loads that not every agent
// loads. `ROLE_CAPS` is keyed by that set. Nothing here names an agent, so the
// day `bin/fusion-rules` moves an agent between audiences, the agent changes
// role by itself; and a role with no entry fails loudly instead of being
// measured against some other role's number. A hand-written name list would
// have drifted at the first audience change, which is the failure mode this
// Circle demonstrated repeatedly.
//
// ## Updating the golden
//
// Deliberate, one command, and it can never be left switched on:
//
//     cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts
//
// That run rewrites the fixture from live measurement and then FAILS on
// purpose. The failure is the point: it forces a second run without the flag,
// and it means no CI or habitual `vitest run` can ever be green while the flag
// is set. Review the fixture diff, then bring the affected role's cap in
// `ROLE_CAPS` to its new high-water mark — `pins every role cap to that role's
// high-water mark` below fails until you do.
//
// Use `npx vitest run`, not `npm test`: the latter is `tsc && vitest run` and
// rebuilds `hooks/dist`, which is owned by step 5 of the plan.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(here, "../../..");
const fusionRules = join(pluginRoot, "bin", "fusion-rules");
const rulesDir = join(pluginRoot, "rules");
const goldenPath = join(here, "fixtures", "rules-emission.golden");

/**
 * The release cap from the plan's Erfolgsmaß: the rule-text total that
 * `origin/main` already ships, and therefore the most a consuming project may
 * be asked to load by an update. A release that raises the tax of a project
 * that installs it is a regression however much else it fixes.
 *
 * NEVER RAISE THIS. It is the target every role cap ratchets down to, and the
 * threshold above which a role cap has to justify itself in this source.
 */
const RELEASE_CAP = 105_354;

/**
 * How the whole-fleet number moved, cut by cut. Kept because each line names
 * which cut produced which figure; the fleet-wide ceiling it used to annotate
 * became six role caps below on 2026-08-05, once the agents stopped carrying
 * the same load and a single number stopped being an honest measure of any of
 * them.
 *
 *   150 817 — 2026-08-05, at plan step 1. Introduced. The six design-diagram
 *             agents (analyst, conceptrev, investigator, planner, shaper,
 *             taskplanner) carry `design-diagrams.md` (5 673) on top of the
 *             145 144 always-on set the other ten load.
 *   131 685 — 2026-08-05, at plan step 2. `protected-path-discipline.md` was cut
 *             into three layers by ADDRESSEE (decision 260805-0709): the core
 *             rule (16 346, all sixteen agents), the classifier reference
 *             `protected-path-internals.md` (20 754, `coder`/`coderev`/
 *             `bugfixer` only), and the measured forensics, which left `rules/`
 *             for the Circle's analysis store and is loaded by nothing.
 *             The high-water mark is now the three guard-internals agents, which
 *             carry both rule layers; the seven plain agents stand at 110 931 and
 *             the six diagram agents at 116 604.
 *
 *             NOTE, and it is the finding of the step rather than an aside: NO
 *             agent is under RELEASE_CAP after this cut, and the plan's own
 *             projection (104 600) never covered the six diagram agents either —
 *             at the plan's projected core size they would have stood at 110 273,
 *             over the cap before a single byte of this step was written. Step 4
 *             removes a further 8 484 from every agent, which clears the cap for
 *             the seven plain agents alone. The other nine need a fourth cut that
 *             does not exist in the plan.
 *   128 555 — 2026-08-05, at plan step 4. `## Stashes` and `## Commit lock` left
 *             `fusion-workbench-conventions.md` (59 303 -> 51 416) for
 *             `workbench-stash-and-lock.md`, emitted to `orchestrator` alone
 *             because a mechanism bounds that audience: skills are never served
 *             by `bin/fusion-rules`, and the lock is the orchestrator's to take.
 *             Every agent drops 7 887 — the 8 484 the sections weighed, less the
 *             597-byte pointer block the plan requires at both sites. The
 *             orchestrator alone RISES, 114 545 -> 115 908: it pays the 9 250 of
 *             the new file (the sections plus a 766-byte provenance header) to
 *             save 7 887. The high-water mark stays the three guard-internals
 *             agents at 128 555; the six plain agents stand at 106 658 and the
 *             six diagram agents at 112 331.
 *
 *             STILL OVER THE CAP, and the shortfall is now the whole story: the
 *             best-off agent is 1 304 bytes above RELEASE_CAP and the worst is
 *             23 201 above. The plan's step-4 target (96 500) was unreachable
 *             from the step-3 position before this step began. What is left is
 *             the cut the plan explicitly excludes — partitioning the remaining
 *             51 416 bytes of `fusion-workbench-conventions.md` (C9 step 3).
 *   111 810 — 2026-08-05, at the pulled-forward C9 step 3: the conventions file
 *             itself was partitioned by ADDRESSEE, 51 416 -> 34 671. Three shards
 *             left it. `workbench-path-resolution.md` (8 962: the `<name>`
 *             namespace, the key table, the key-set derivation) and
 *             `rule-file-provenance.md` (5 745) are emitted to NO agent — their
 *             addressee is whoever authors a prompt, the resolver, or a rule
 *             file, which is nobody's routine dispatch work. `circle-records.md`
 *             (9 302: the Circle state vocabulary, its transitions, the record
 *             and portfolio templates) goes to `orchestrator`, `playmaker` and
 *             `shaper` — a DERIVED audience, being exactly the agents whose
 *             prompts name a Circle-scoped `fusion-paths` key and therefore the
 *             only ones that can transition a Circle. The marker-glob discipline
 *             stayed behind in the core under `## Marker globs`: it was filed
 *             inside the circles section for historical reasons, but it governs
 *             every marker in every vocabulary, and eight of the ten citations
 *             that pointed at the circles section were reaching for it.
 *
 *             THIRTEEN of sixteen agents are now under RELEASE_CAP, and the
 *             three that are not are the finding rather than a shortfall to be
 *             closed by cutting further. `coder`/`coderev`/`bugfixer` stand at
 *             111 810, 6 456 over: they alone carry `protected-path-internals.md`
 *             (21 897), so their overage is step 2's split, not this one's. The
 *             `orchestrator` stands at 108 465, 3 111 over, carrying both
 *             `workbench-stash-and-lock.md` (9 250) and `circle-records.md` —
 *             18 552 bytes of agent-specific text, because it is the agent with
 *             the most distinct jobs. Every remaining byte in the core is text
 *             all sixteen agents apply; getting these three under the cap means
 *             revisiting a file this step did not own, not shaving this one.
 */
interface RoleCap {
  /**
   * The role's high-water mark, in bytes — a ratchet. It may only ever be
   * LOWERED, and every cap must reach RELEASE_CAP before step 6 of the plan
   * (bump the version, push, tag) may run.
   *
   * Deliberately a literal here and NOT derived from the golden: deriving it
   * would let a regenerated golden raise a cap silently, which is the one thing
   * the caps exist to prevent.
   */
  cap: number;
  /**
   * Why this role stands above RELEASE_CAP: which file causes the overage, and
   * why this role applies that file. REQUIRED for every cap above the release
   * cap, and asserted to name each of the role's extra files by filename, so a
   * later cut cannot leave the reason pointing at a file the role no longer
   * loads. Omitted below the release cap, where a cap costs a consuming project
   * nothing and has nothing to justify.
   */
  overRelease?: string;
}

/**
 * One cap per ROLE, where a role is the sorted set of rule files an agent loads
 * that not all sixteen agents load — see `HOW A ROLE IS DERIVED` in the header.
 * The key is that set, rendered by `roleKey()`. No agent is named as a key, and
 * membership is never written down: it is measured, and the failure messages
 * print it.
 *
 * Six roles as of 2026-08-05, the first four of them below RELEASE_CAP:
 *
 *   89 913  core only                                      5 agents
 *   95 586  design-diagrams.md                             5 agents
 *   99 215  circle-records.md                              1 agent
 *  104 888  circle-records.md + design-diagrams.md         1 agent
 *  108 465  circle-records.md + workbench-stash-and-lock   1 agent
 *  111 810  protected-path-internals.md                    3 agents
 */
const ROLE_CAPS: Record<string, RoleCap> = {
  /**
   * The plain agents: everything the framework asks of everyone, and nothing
   * else. This is the floor the other five roles are measured against, and the
   * only number that says what the always-on set actually costs.
   */
  "(core only)": { cap: 89_913 },

  /**
   * The design-diagram producers and the evaluator that judges their output.
   * They pay 5 673 for the shared Mermaid rubric so that producer and reviewer
   * hold one definition of "coherent".
   */
  "design-diagrams.md": { cap: 95_586 },

  /**
   * Ranks Circles without producing design diagrams. Pays 9 302 for the Circle
   * state vocabulary, which it needs because it transitions nothing but reads
   * and orders every Circle record there is.
   */
  "circle-records.md": { cap: 99_215 },

  /**
   * Turns a Directive into a Circle record and draws the design diagram that
   * goes in it, so it pays for both files. 466 bytes under the release cap:
   * this role has no head-room to spend and the next always-on byte pushes it
   * over.
   */
  "circle-records.md + design-diagrams.md": { cap: 104_888 },

  /**
   * OVER THE RELEASE CAP by 3 111 bytes.
   *
   * `circle-records.md` (9 302) is the Circle state vocabulary and the record
   * and portfolio templates. This role writes those transitions — it activates
   * a Circle on `_a_ -> _t_` and closes it on `_t_ -> _c_` — so the vocabulary
   * is the text it acts on, not background.
   *
   * `workbench-stash-and-lock.md` (9 250) is `## Stashes` and `## Commit lock`.
   * The commit lock is this role's to take: it is the agent that commits after
   * a task completes, and the lock is what serialises that against the other
   * agents' writes. Stashes are created and consumed by /fusion:circle-stash
   * and /fusion:circle-pop, which this role runs and which `bin/fusion-rules`
   * cannot serve directly (it exits 2 on any non-agent name), so the protocol
   * has to reach the agent to reach the skill.
   *
   * 18 552 bytes of role-specific text, the most of any role, because this is
   * the agent with the most distinct jobs. The overage is not shaveable from
   * the core, where every remaining byte is text all sixteen agents apply.
   */
  "circle-records.md + workbench-stash-and-lock.md": {
    cap: 108_465,
    overRelease:
      "circle-records.md (9 302) carries the Circle state vocabulary and the record " +
      "template, and this role is the one that writes the `_a_ -> _t_` and `_t_ -> _c_` " +
      "transitions. workbench-stash-and-lock.md (9 250) carries the commit lock this " +
      "role takes before every commit, plus the stash protocol its two skills need and " +
      "that bin/fusion-rules cannot deliver to a skill directly.",
  },

  /**
   * OVER THE RELEASE CAP by 6 456 bytes, and the fleet's high-water mark.
   *
   * `protected-path-internals.md` (21 897) is the reference half of the
   * protected-path rule: the verb tables, command-word resolution, the
   * clustered-flag grammar, git's own working directory, the directory-builtin
   * forms that are not modelled, and the fail-closed bound. It is how the
   * classifier READS a command, which is only actionable for an agent that
   * changes `hooks/lib/bash-mutation-guard.ts` or reviews a change to it. The
   * other thirteen agents read the core half and reach this one by its pointer
   * line.
   *
   * The overage belongs to the step-2 split, not to any later cut: bringing
   * this role under the cap means revisiting a file that split produced, not
   * shaving the core the other roles share.
   */
  "protected-path-internals.md": {
    cap: 111_810,
    overRelease:
      "protected-path-internals.md (21 897) is the classifier reference — verb tables, " +
      "command-word resolution, clustered short flags, git's own working directory, the " +
      "fail-closed bound. This role is the three agents that change or review " +
      "hooks/lib/bash-mutation-guard.ts, the only agents for which how the classifier " +
      "reads a command is actionable rather than background.",
  },
};

/**
 * An agent's role, derived from measurement: its emitted files minus the ones
 * every agent gets. Sorted, so the key does not depend on emission order.
 */
function roleKey(extras: string[]): string {
  return extras.length === 0 ? "(core only)" : [...extras].sort().join(" + ");
}

/** The files every one of the sixteen agents loads — the intersection. */
function universalCore(measured: Map<string, Emission>): Set<string> {
  const sets = [...measured.values()].map((e) => new Set(e.files.map((f) => f.rel)));
  const [first, ...rest] = sets;
  if (!first) return new Set();
  return new Set([...first].filter((rel) => rest.every((s) => s.has(rel))));
}

/**
 * The plugin version at which the release cap is not yet due. The plan bumps
 * 5.8.0 -> 5.9.0 in step 6, and step 6 is gated on the cap. Encoding that here
 * makes the cap a live assertion rather than a comment: today it is satisfied
 * trivially, and the moment someone bumps the version without having done the
 * cut, `gates the version bump on the release cap` turns red and names the
 * agents that are over. Until then the role caps above are what hold the line.
 */
const PRE_CUT_VERSION = "5.8.0";

interface Emission {
  /** Path relative to `<plugin>/rules`, in emission order. */
  files: { rel: string; bytes: number }[];
  total: number;
}

/** Every agent name, taken from the prompt directory rather than hard-coded. */
function agentNames(): string[] {
  return readdirSync(join(pluginRoot, "agents"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -3))
    .sort();
}

let neutralCwd: string;

beforeAll(() => {
  // An empty directory: no ./rules, no .claude/rules, no ./CLAUDE.md, no
  // ./fusion-workbench. Whatever the script emits from here is plugin-side by
  // construction.
  neutralCwd = mkdtempSync(join(tmpdir(), "fusion-rules-golden-"));
});

afterAll(() => {
  if (neutralCwd) rmSync(neutralCwd, { recursive: true, force: true });
});

/** Raw stdout lines of `bin/fusion-rules <agent>`, run in the neutral cwd. */
function runRules(agent: string): string[] {
  const stdout = execFileSync(fusionRules, [agent], {
    cwd: neutralCwd,
    encoding: "utf-8",
    env: { ...process.env, FUSION_PLUGIN_ROOT: pluginRoot },
    stdio: ["ignore", "pipe", "pipe"],
  });
  return stdout
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/**
 * Lines that are NOT plugin rule files. Expected empty from the neutral cwd;
 * asserted rather than filtered so that a project-side path, or a `skill:<name>`
 * manifest pointer, can never leak into the measurement unnoticed.
 */
function foreignLines(lines: string[]): string[] {
  return lines.filter((p) => !p.startsWith(rulesDir + "/"));
}

function measure(agent: string): Emission {
  const lines = runRules(agent);
  const files = lines
    .filter((p) => p.startsWith(rulesDir + "/"))
    .map((p) => ({ rel: relative(rulesDir, p), bytes: statSync(p).size }));
  return { files, total: files.reduce((n, f) => n + f.bytes, 0) };
}

/** One agent's block, in the exact shape the golden stores. */
function render(agent: string, e: Emission): string {
  const body = e.files.map((f) => `  ${f.rel} ${f.bytes}`).join("\n");
  return `[${agent}]\n${body}\n  total ${e.total}`;
}

const GOLDEN_HEADER = [
  "# rules-emission.golden — the per-dispatch rule-context tax, per agent.",
  "#",
  "# Generated. Do not hand-edit. To update after a deliberate cut:",
  "#",
  "#   cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts",
  "#",
  "# That run rewrites this file and then fails on purpose, so the flag can",
  "# never be left on in a green run. Review the diff, then bring the affected",
  "# role's cap in ROLE_CAPS (rules-emission-golden.test.ts) to its new figure.",
  "#",
  "# One block per agent: the files bin/fusion-rules emits under <plugin>/rules,",
  "# in emission order, each with its byte size, then the agent's total. Paths",
  "# are relative to <plugin>/rules. Project-side rules and stilwerk voice",
  "# profiles are out of scope — they vary per consuming project.",
].join("\n");

/** Parse the golden into blocks keyed by agent. */
function parseGolden(text: string): Map<string, string> {
  const blocks = new Map<string, string>();
  let current: string | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (current) blocks.set(current, buf.join("\n").replace(/\n+$/, ""));
  };
  for (const line of text.split("\n")) {
    if (line.startsWith("#")) continue;
    const head = /^\[([a-z-]+)\]$/.exec(line.trim());
    if (head) {
      flush();
      current = head[1];
      buf = [line.trim()];
      continue;
    }
    if (current && line.trim().length > 0) buf.push(line.replace(/\s+$/, ""));
  }
  flush();
  return blocks;
}

const UPDATING = process.env.UPDATE_RULES_GOLDEN === "1";

describe("rules emission golden", () => {
  let measured: Map<string, Emission>;
  let agents: string[];
  /** The files all sixteen agents load. */
  let core: Set<string>;
  /** Role key -> the agents measured into it. Derived, never written down. */
  let roles: Map<string, string[]>;

  beforeAll(() => {
    agents = agentNames();
    measured = new Map(agents.map((a) => [a, measure(a)]));

    core = universalCore(measured);
    roles = new Map();
    for (const a of agents) {
      const extras = measured.get(a)!.files.map((f) => f.rel).filter((rel) => !core.has(rel));
      const key = roleKey(extras);
      roles.set(key, [...(roles.get(key) ?? []), a]);
    }

    if (UPDATING) {
      const body = agents.map((a) => render(a, measured.get(a)!)).join("\n\n");
      writeFileSync(goldenPath, `${GOLDEN_HEADER}\n\n${body}\n`, "utf-8");
    }
  });

  it("was not run with the update flag left switched on", () => {
    expect(
      UPDATING,
      `The golden at ${relative(pluginRoot, goldenPath)} has been REWRITTEN from live ` +
        `measurement. This failure is deliberate — it stops a regeneration run from ` +
        `ever being green. Now: (1) read the fixture diff and confirm every change is ` +
        `one your cut intended, (2) bring the affected role's cap in ROLE_CAPS to its ` +
        `new figure, (3) re-run without UPDATE_RULES_GOLDEN.`,
    ).toBe(false);
  });

  it("emits nothing but plugin rule files when no project rules are in reach", () => {
    const leaks: Record<string, string[]> = {};
    for (const a of agents) {
      const foreign = foreignLines(runRules(a));
      if (foreign.length > 0) leaks[a] = foreign;
    }
    expect(
      leaks,
      "bin/fusion-rules emitted a path outside <plugin>/rules from an empty working " +
        "directory. Either the script reaches somewhere it should not, or the temp " +
        "cwd is not as empty as this test assumes; in both cases the byte totals " +
        "below stopped measuring what they claim to measure.",
    ).toEqual({});
  });

  it("matches the checked-in golden, agent by agent", () => {
    expect(
      existsSync(goldenPath),
      `Missing ${relative(pluginRoot, goldenPath)}. Create it with: ` +
        `cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts`,
    ).toBe(true);

    const golden = parseGolden(readFileSync(goldenPath, "utf-8"));

    expect(
      [...golden.keys()].sort(),
      "The golden covers a different set of agents than agents/*.md. An agent was " +
        "added or removed; regenerate the golden.",
    ).toEqual(agents);

    for (const a of agents) {
      expect(
        render(a, measured.get(a)!),
        `Rule emission for '${a}' changed. If a cut caused this, regenerate the ` +
          `golden deliberately (see the header of this file). If it was not intended, ` +
          `the change to bin/fusion-rules or rules/ is the bug.`,
      ).toBe(golden.get(a));
    }
  });

  it("assigns every agent a role derived from what it actually loads", () => {
    expect(
      core.size,
      "No rule file is loaded by all sixteen agents, so there is no universal core " +
        "and every agent would be its own role. Either bin/fusion-rules stopped " +
        "emitting an always-on set, or a run failed and returned nothing.",
    ).toBeGreaterThan(0);

    const unknown = [...roles.keys()].filter((k) => !(k in ROLE_CAPS));
    expect(
      unknown.map((k) => `${k} <- ${roles.get(k)!.join(", ")}`),
      "A role appeared that ROLE_CAPS has no entry for. A role is the set of rule " +
        "files an agent loads that not all sixteen load, so this means an audience in " +
        "bin/fusion-rules changed. Add an entry keyed by that file set, with the cap " +
        "set to the role's measured total — and if that total is above " +
        `${RELEASE_CAP}, with the reason it is.`,
    ).toEqual([]);

    const stale = Object.keys(ROLE_CAPS).filter((k) => !roles.has(k));
    expect(
      stale,
      "ROLE_CAPS carries an entry no agent matches any more. The cut that removed the " +
        "role should have removed its cap in the same commit; a cap nothing is " +
        "measured against is a number that looks like a guarantee and is not one.",
    ).toEqual([]);
  });

  it("keeps every agent under its role's cap", () => {
    const over: string[] = [];
    for (const [key, members] of roles) {
      const entry = ROLE_CAPS[key];
      if (!entry) continue; // reported by the role-coverage test above
      for (const a of members) {
        const total = measured.get(a)!.total;
        if (total > entry.cap) over.push(`${a}=${total} (role '${key}', cap ${entry.cap})`);
      }
    }
    expect(
      over,
      "Rule text grew past a role's cap. This is the net that catches an always-on " +
        "rule file appearing in no golden line at all. Regenerating the golden will " +
        "NOT clear it: raising a cap is a hand edit in " +
        "hooks/lib/__tests__/rules-emission-golden.test.ts, and the plan's answer is " +
        "that a cap may only ever be lowered.",
    ).toEqual([]);
  });

  it("pins every role cap to that role's high-water mark", () => {
    const drifted: string[] = [];
    for (const [key, members] of roles) {
      const entry = ROLE_CAPS[key];
      if (!entry) continue;
      const highWater = Math.max(...members.map((a) => measured.get(a)!.total));
      if (entry.cap !== highWater) {
        drifted.push(`'${key}': cap ${entry.cap}, measured ${highWater} (${members.join(", ")})`);
      }
    }
    expect(
      drifted,
      "A role cap no longer equals that role's highest measured total. This is the " +
        "hand edit the ratchet is designed to force: a regenerated golden cannot move " +
        "a cap on its own. Set the cap to the measured figure and say in the comment " +
        "beside it which cut did it.",
    ).toEqual([]);
  });

  it("justifies in this source every role cap that stands above the release cap", () => {
    const unjustified: string[] = [];
    const unanchored: string[] = [];

    for (const [key, entry] of Object.entries(ROLE_CAPS)) {
      if (entry.cap <= RELEASE_CAP) continue;
      const reason = entry.overRelease?.trim() ?? "";
      if (reason.length === 0) {
        unjustified.push(`'${key}' (cap ${entry.cap}, ${entry.cap - RELEASE_CAP} over)`);
        continue;
      }
      // The reason has to name the files that cause the overage, or it is prose
      // that survives the cut that made it wrong.
      const missing = key.split(" + ").filter((f) => !reason.includes(f));
      if (missing.length > 0) unanchored.push(`'${key}' does not mention ${missing.join(", ")}`);
    }

    expect(
      unjustified,
      `A role cap stands above the release cap of ${RELEASE_CAP} bytes with no reason ` +
        "recorded next to it. Every consuming project pays that overage on every " +
        "dispatch. Give the entry an `overRelease` naming the file that causes it and " +
        "why that role applies it — a cap without a reason is a number the next growth " +
        "raises quietly, which is what the ratchet exists to stop.",
    ).toEqual([]);

    expect(
      unanchored,
      "A role's over-the-cap reason does not name the rule files the role loads. The " +
        "reason has to name them, so that a cut which moves a file leaves the reason " +
        "visibly wrong instead of quietly stale.",
    ).toEqual([]);
  });

  it("gates the version bump on the release cap", () => {
    const manifest = JSON.parse(
      readFileSync(join(pluginRoot, ".claude-plugin", "plugin.json"), "utf-8"),
    ) as { version: string };

    if (!isAfter(manifest.version, PRE_CUT_VERSION)) {
      // Pre-cut: standing above the cap is expected here and is not a failure —
      // the role caps hold the line until the version moves. What IS checked is
      // that every agent already over the cap sits in a role whose entry says
      // why, so the reason is on record before the release makes it binding.
      const undocumented: string[] = [];
      for (const [key, members] of roles) {
        if (ROLE_CAPS[key]?.overRelease) continue;
        for (const a of members) {
          const total = measured.get(a)!.total;
          if (total > RELEASE_CAP) undocumented.push(`${a}=${total} (role '${key}')`);
        }
      }
      expect(
        undocumented,
        `An agent already loads more than the ${RELEASE_CAP} bytes origin/main ships, ` +
          `and its role carries no reason for it. Record the reason now: at the version ` +
          `bump this stops being a note and starts blocking the release.`,
      ).toEqual([]);
      return;
    }

    const over = agents
      .filter((a) => measured.get(a)!.total > RELEASE_CAP)
      .map((a) => `${a}=${measured.get(a)!.total}`);
    expect(
      over,
      `Version ${manifest.version} is past ${PRE_CUT_VERSION}, so this is a release, ` +
        `and a release may not raise a consuming project's context tax above the ` +
        `${RELEASE_CAP} bytes origin/main already ships. The agents listed are over. ` +
        `Do the cut (plan steps 2 and 4) before bumping the version, or the update ` +
        `hands every consumer more rule text than it had.`,
    ).toEqual([]);
  });
});

/** True when semver `a` is strictly greater than `b`. Numeric parts only. */
function isAfter(a: string, b: string): boolean {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x !== y) return x > y;
  }
  return false;
}
