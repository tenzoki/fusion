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
// THE TWO ASSERTIONS, AND WHY BOTH ARE NEEDED.
//
//   1. The GOLDEN (`fixtures/rules-emission.golden`) pins path set, per-file
//      size and per-agent total. It fails on any change in either direction —
//      including a cut that removes more than intended. It is meant to be
//      regenerated when a cut is deliberate; see `## Updating the golden`.
//
//   2. The CEILING is a literal in THIS file and is the safety net against
//      growth. It exists precisely because the golden is regenerable: an added
//      always-on rule file appears in no golden line, and a regenerated golden
//      would absorb it without complaint. The ceiling does not absorb it — it
//      has to be edited by hand, in the test source, in the same commit, which
//      is the moment the question "am I raising the tax for all 16 agents?"
//      gets asked out loud.
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
// is set. Review the fixture diff, and if the high-water mark moved, lower
// CEILING to match — `the ceiling tracks the golden's high-water mark` below
// fails until you do.
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
 * NEVER RAISE THIS. It is the target CEILING ratchets down to.
 */
const RELEASE_CAP = 105_354;

/**
 * The current high-water mark across all 16 agents — a ratchet.
 *
 * It may only ever be LOWERED, and it must reach RELEASE_CAP before step 6 of
 * the plan (bump the version, push, tag) may run. It is deliberately a literal
 * here and NOT derived from the golden: deriving it would let a regenerated
 * golden raise the ceiling silently, which is the one thing the ceiling exists
 * to prevent.
 *
 * History (lower it, never raise it):
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
 */
const CEILING = 128_555;

/**
 * The plugin version at which the release cap is not yet due. The plan bumps
 * 5.8.0 -> 5.9.0 in step 6, and step 6 is gated on the cap. Encoding that here
 * makes the cap a live assertion rather than a comment: today it is satisfied
 * trivially, and the moment someone bumps the version without having done the
 * cut, `the release cap gates the version bump` turns red and names the agents
 * that are over.
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
  "# never be left on in a green run. Review the diff, then lower the CEILING",
  "# constant in rules-emission-golden.test.ts if the high-water mark moved.",
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

  beforeAll(() => {
    agents = agentNames();
    measured = new Map(agents.map((a) => [a, measure(a)]));

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
        `one your cut intended, (2) lower CEILING in this file if the high-water mark ` +
        `moved, (3) re-run without UPDATE_RULES_GOLDEN.`,
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

  it("keeps every agent under the ceiling", () => {
    const over = agents
      .filter((a) => measured.get(a)!.total > CEILING)
      .map((a) => `${a}=${measured.get(a)!.total}`);
    expect(
      over,
      `Rule text grew past the ceiling of ${CEILING} bytes. This is the net that ` +
        `catches an always-on rule file appearing in no golden line at all. ` +
        `Regenerating the golden will NOT clear it: raising CEILING is a hand edit ` +
        `in hooks/lib/__tests__/rules-emission-golden.test.ts, and the plan's answer ` +
        `is that it may only ever be lowered.`,
    ).toEqual([]);
  });

  it("keeps the ceiling pinned to the golden's high-water mark", () => {
    const highWater = Math.max(...agents.map((a) => measured.get(a)!.total));
    expect(
      CEILING,
      `CEILING (${CEILING}) no longer equals the highest per-agent total ` +
        `(${highWater}). This is the hand edit the ratchet is designed to force: a ` +
        `regenerated golden cannot move the ceiling on its own. Set CEILING to ` +
        `${highWater} and add a line to its history comment saying which cut did it.`,
    ).toBe(highWater);
  });

  it("gates the version bump on the release cap", () => {
    const manifest = JSON.parse(
      readFileSync(join(pluginRoot, ".claude-plugin", "plugin.json"), "utf-8"),
    ) as { version: string };

    if (!isAfter(manifest.version, PRE_CUT_VERSION)) {
      // Pre-cut. The cap is not yet due; the ceiling above is what holds the
      // line. Record the distance still to cover so it stays visible.
      expect(CEILING).toBeGreaterThan(0);
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
