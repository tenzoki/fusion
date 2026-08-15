import { describe, it, expect, beforeAll } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, relative } from "node:path";
import { fmt, Growth, growth, grownLines, Sized } from "./helpers/growth-bound.js";

// ---------------------------------------------------------------------------
// The surface growth bounds — what the shipped prompt, skill and test text is
// allowed to GROW BY before the suite fails.
//
// WHY THIS FILE EXISTS. On 2026-08-05 this project converted its one growth
// ratchet from a blocking gate into a non-failing report, for a reason that was
// good where it applied: a ratchet made the first finding-driven addition
// unlandable unless somebody else's reasoned prose was cut by the same number of
// bytes (decision 260805-1559). What happened next was measured rather than
// feared. The largest deletion in this project's history was back above its
// pre-deletion peak in four and a half days
// (`shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`),
// and over the ten days from 2026-08-05 to the start of the Circle that armed
// this file (`9a7da8e`, 2026-08-15), with the report in force and read by nobody,
// `agents/*.md` rose 289 958 -> 460 292 bytes (+59 %) and the hook test suite
// 19 838 -> 25 897 lines (+31 %), while `rules/` — the ONE surface the old cap
// still covered — FELL, 170 835 -> 154 092 (-10 %). Those four figures are
// re-measured from `git` at the arming rather than quoted; the Circle record's
// own headline figures for the same period (agents +38 %, hook tests +47 %) were
// taken against a different anchor and are not restated here as measurements.
// A failing cap is the only instrument this project has ever had that bounded the
// rate, and the surfaces it did not cover are the surfaces that grew. This file
// puts it where the growth was.
//
// WHY A SECOND FILE RATHER THAN AN EXTENSION OF THE FIRST.
// `rules-emission-golden.test.ts` measures what `bin/fusion-rules` EMITS — a
// property of a script, measured by running it. `agents/`, `skills/` and the
// hook tests are emitted by nothing; they are read off the tree. Overloading one
// file with two subjects is the defect that file's own header warns about, so
// the two share the INSTRUMENT (`helpers/growth-bound.ts`) and nothing else.
//
// FOUR SURFACES, FOUR INDEPENDENT BUDGETS, ONE INSTRUMENT. Each surface carries
// its own baseline map, its own floor summed over the files present, and its own
// head-room derived from its own history. Nothing is pooled: growth in `agents/`
// can NOT be paid for by shrinkage in `skills/`, each bound asserts on its own
// result, and a single surface crossing its own bound fails the suite alone.
// `growth()` takes the baseline and the head-room as ARGUMENTS precisely so that
// no surface can see, or spend, another's numbers.
//
// TWO UNITS, AND WHY. `agents/*.md` and `skills/*/SKILL.md` are measured in
// BYTES, because their cost is context loaded into a dispatch — an agent prompt
// is read in full, every time that agent runs. The hook tests are measured in
// LINES, because their cost is maintenance and suite wall-clock rather than
// context: nothing loads them into a model.
//
// WHAT A FILE WITH NO BASELINE ENTRY COSTS. Its whole current size, counted as
// growth — a new agent prompt, a new skill body or a new test file spends the
// surface's head-room in full. That is the same rule `RULE_BASELINE` already
// applies and it is deliberate: nobody granted the new file a budget. In this
// project's measured history the biggest single additions to all three surfaces
// were exactly that (`feat(playmaker): introduce Circle portfolio agent`,
// +18 170 bytes; `feat(skills): add /fusion:circle-stash and /fusion:circle-pop
// bodies`, +38 025), so a new file tripping the bound and forcing a deliberate
// re-baseline is the instrument working, not a false alarm.
//
// ## Where each head-room comes from
//
// Derived, not chosen, and derived per surface — the 12 000 bytes
// `rules-emission-golden.test.ts` uses was measured against the growth rate of
// `rules/` and licenses nothing about a surface whose rate is different.
// `git log` was replayed commit by commit over the SAME WINDOW that figure came
// from, 2026-05-05 (the repository's first commit) to 2026-08-05, re-measuring
// each surface at each of the 337 commits in it. Each replayed commit's growth
// was split into growth in files that already existed and files that arrived, so
// the "honest single commit" figures below describe prose growth rather than
// a new file's arrival.
//
// The same three properties that produced 12 000 for `rules/` produced each
// figure below: it sits INSIDE the surface's worst measured single day, so a run
// like that day trips the bound on the day it begins; it is two to three weeks
// of the surface's own sustained rate, so a cleanup comes due on that cadence;
// and it stands well above the 95th-percentile honest single-commit addition, so
// ordinary work never trips it.
//
//   surface           worst day   sustained rate   p90 / p95 commit   head-room
//   agents/ bytes       +50 725      851 /day        +7 216 / +12 082    18 000
//   skills/ bytes       +38 025    1 427 /day        +6 976 / +10 456    20 000
//   hook test lines      +5 247      129 /day          +532 /    +793     2 500
//
//   agents/ 18 000 bytes — 35 % of the worst measured day (2026-05-16, +50 725);
//     21 days at the calm-stretch rate of 851 bytes a day (2026-06-02 to
//     2026-07-31); 1.5x the p95 single-commit addition to an existing prompt.
//   skills/ 20 000 bytes — 53 % of the worst measured day (2026-05-19, +38 025);
//     14 days at the calm-stretch rate of 1 427 bytes a day; 1.9x p95.
//   hook tests 2 500 lines — 48 % of the worst measured day (2026-08-04, +5 247),
//     and under the +4 026 of 2026-08-01, the FIRST day of the four-day run that
//     built most of this suite, so that run trips on day one; 19 days at 129
//     lines a day, which is this surface's existing-file growth over the whole
//     window rather than a calm-stretch rate, because it HAS no honest calm
//     stretch — it was three files until August and the 2026-06/07 figure of 51
//     lines a day describes a suite that did not yet exist; 3.2x p95.
//
// Corroboration from outside the window, deliberately not used to set the
// figures: over 2026-08-05 to 2026-08-15 `agents/` gained 10 989 bytes a day with
// a peak day of +66 803 and `skills/` 1 029 a day with a peak of +28 367. Every
// head-room above is well inside those peaks too, so none of them is slack.
//
// ## The arming, 2026-08-15
//
// This is event 2 of `## Re-baselining` in `helpers/growth-bound.ts` — a
// measurement that reported starts blocking — and it follows the form the
// 2026-08-14 arming set, whose governing record is
// `circles/260801-1244-curator/decisions/260814-0738_*_how-is-the-always-on-growth-bound-armed-when-the-corpus-is-already-over-budget.md`.
//
// NO BYTES AND NO LINES WERE REMOVED BY THE ARMING ITSELF, and one surface grew
// BECAUSE of it: this file and `helpers/growth-bound.ts` are 699 lines inside the
// hook-test surface they bound, and the baseline below carries them. A bound that
// exempted its own instrument would be granting itself the one exemption it
// exists to refuse, so the 699 lines are baselined like any others and the next
// 2 500 are what this surface has left. It is the last step of
// Circle `circles/260815-0007-remove-eight-mechanisms-and-cap-growth`, and it is
// deliberately last: arming before the removals would have baselined these three
// surfaces at their pre-removal size and handed this Circle its own savings back
// as head-room, which is the one outcome the Circle record forbids. What the
// removals did, measured at the Circle's start (`9a7da8e`) and at this arming:
//
//   agents/*.md         460 292 -> 399 843 bytes   (-60 449; conceptrev and
//                                                   investigator prompts deleted)
//   skills/*/SKILL.md   294 134 -> 220 439 bytes   (-73 695; five skill bodies)
//   hook test lines      25 897 ->  18 799 lines   (-7 098; fusion-plane.test.ts
//                                                   and the churn/state-drift suites)
//
// WHAT THIS ARMING ABSOLVES, written as text so it survives the numbers moving.
// These surfaces had never been bounded by anything, so the baselines below
// absolve every byte and every line they accumulated before today — including
// the growth this Circle did not remove. Two parts of it are worth naming
// because a later reader will otherwise try to reconcile them against the
// removals alone:
//
//   - The 356 test lines the Circle's own inserted step 3b added are INSIDE the
//     hook-test baseline: `fusion-commit-lock.test.ts` +236 and
//     `monitor-warnings-panel.test.ts` +120, both landed to make the suite safe
//     to run concurrently. They were a prerequisite of the removals, not a
//     product of them, and the baseline carries them.
//   - `agents/orchestrator.md` stands at 139 859 bytes, 35 % of the whole
//     `agents/` surface on its own. It grew through this Circle rather than
//     shrinking, and the baseline takes it as it is. Nothing here asks for that
//     to be cut; the bound asks only that it stop growing at the measured rate.
//
// ## What no bound covers, stated rather than left to be discovered
//
// The hook-test surface counts `.ts` under `hooks/lib/__tests__/`. The three
// `.mjs` files the Circle's step 3b added — `hooks/scripts/build.mjs` (205
// lines), `hooks/scripts/run-tests.mjs` (48) and `hooks/vitest.config.mjs` (67),
// 320 lines together — are hook SCRIPTS, not tests, and fall outside it. They
// are also invisible to the Circle's own before/after measurement, whose command
// reads `hooks/*.ts hooks/lib/*.ts` (issue
// `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1251_o_the-after-measurement-command-cannot-see-the-320-lines-the-build-change-added.md`).
// After this step they are bounded by NO surface, and this step claims no
// coverage of them. Extending a surface to reach them is a decision nobody has
// made; inventing one here would be arming a bound on a corpus nobody measured.
//
// RELEASE_CAP AND DRIFT_CEILING ARE NOT TOUCHED, NOT COPIED AND NOT IMITATED.
// They are historical facts about what `origin/main` once shipped in RULE TEXT.
// They say nothing about prompts, skill bodies or tests, and an analogue invented
// for these surfaces would be a fabricated history rather than a measurement.
//
// ## Updating the golden
//
// Deliberate, one command, and it can never be left switched on:
//
//     cd hooks && UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts
//
// That run rewrites the fixture from live measurement and then FAILS on purpose,
// which forces a second run without the flag. Regenerating the golden does NOT
// move a baseline and therefore never clears a bound: the golden records what the
// files measure, the baseline records what they are allowed to measure FROM. The
// baselines move at the two events in `## Re-baselining: the two events at which
// a baseline moves` in `helpers/growth-bound.ts`, and at no other moment.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(here, "../../..");
const goldenPath = join(here, "fixtures", "surface-growth.golden");

/** `wc -l` semantics: the number of newline characters in the file. */
function lineCount(path: string): number {
  const buf = readFileSync(path);
  let n = 0;
  for (let i = 0; i < buf.length; i++) if (buf[i] === 0x0a) n++;
  return n;
}

/**
 * A bounded surface. `files()` reads it off the tree — never a written-down list,
 * so a prompt, a skill body or a test file that arrives is measured on the day it
 * arrives rather than on the day somebody remembers to add it here.
 */
interface Surface {
  /** Block name in the golden, and the name the failure text uses. */
  key: string;
  /** What the failure text calls this surface in prose. */
  label: string;
  unit: "bytes" | "lines";
  /** The files, keyed by the same relative path the baseline map uses. */
  files(): Sized[];
  baseline: Record<string, number>;
  headRoom: number;
  /** One line naming what this surface costs, printed in the failure text. */
  cost: string;
}

/**
 * The agent prompts, in bytes. 399 843 at the 2026-08-15 arming.
 *
 * Hand-edited only at one of the two re-baselining events. The figures are the
 * post-removal sizes as Circle 260815-0007 leaves the tree; nothing was cut to
 * produce them.
 */
const AGENT_BASELINE: Record<string, number> = {
  "analyst.md": 21317,
  "bugfixer.md": 11808,
  "coder.md": 9688,
  "coderev.md": 13257,
  "consultant.md": 14825,
  "curator.md": 33541,
  "editor.md": 14272,
  "ontocoder.md": 13305,
  "ontorev.md": 11234,
  "orchestrator.md": 139859,
  "planner.md": 18434,
  "playmaker.md": 38602,
  "reconciler.md": 20006,
  "shaper.md": 25320,
  "taskplanner.md": 14375,
};

/** The skill bodies, in bytes. 220 439 at the 2026-08-15 arming. */
const SKILL_BASELINE: Record<string, number> = {
  "archive/SKILL.md": 23705,
  "cadence/SKILL.md": 17506,
  "cleanup/SKILL.md": 23662,
  "commit/SKILL.md": 6233,
  "curate/SKILL.md": 12741,
  "direct/SKILL.md": 9232,
  "help/SKILL.md": 13351,
  "log-activity/SKILL.md": 13559,
  "memo/SKILL.md": 12560,
  "migrate/SKILL.md": 26256,
  "next/SKILL.md": 26249,
  "setup/SKILL.md": 35385,
};

/**
 * The hook tests and their helpers, in lines. 19 453 at the 2026-08-15 arming:
 * 18 799 as the removals left the suite, plus the 699 lines of this file and
 * `helpers/growth-bound.ts`, less the 45 the shared instrument took out of
 * `rules-emission-golden.test.ts` when it moved. The instrument counts itself —
 * a bound that did not would be granting itself the one exemption it exists to
 * refuse.
 */
const TEST_LINE_BASELINE: Record<string, number> = {
  "clear-halt-concurrent-halt.test.ts": 427,
  "commit-message-path.test.ts": 366,
  "config.test.ts": 1522,
  "context-manifest.test.ts": 476,
  "deliverable-language-lint.test.ts": 141,
  "derivable-enumerations-lint.test.ts": 462,
  "domain-cascade-order-lint.test.ts": 235,
  "domain-cascade.test.ts": 925,
  "escalation.test.ts": 253,
  "executor-verification-report-lint.test.ts": 218,
  "fusion-commit-lock.test.ts": 372,
  "fusion-count-sources.test.ts": 443,
  "fusion-paths.test.ts": 879,
  "glob-nomatch-lint.test.ts": 162,
  "guard-bash-integration.test.ts": 389,
  "guard-escalation-shape.test.ts": 278,
  "guard-halt-event.test.ts": 146,
  "guard-project-config-integration.test.ts": 530,
  "guard-state-shape.test.ts": 251,
  "helpers/citation-scan.ts": 574,
  "helpers/growth-bound.ts": 123,
  "helpers/guard-harness.ts": 1015,
  "helpers/prompt-blocks.ts": 28,
  "hook-fail-open.test.ts": 607,
  "hooks-wiring.test.ts": 92,
  "legacy-halt-clearing.test.ts": 262,
  "marker-format-lint.test.ts": 186,
  "monitor-warnings-panel.test.ts": 897,
  "path-literal-lint.test.ts": 342,
  "paths.test.ts": 132,
  "playmaker-backlog-mandate-lint.test.ts": 392,
  "portfolio-citation-form-lint.test.ts": 171,
  "project-relative.test.ts": 159,
  "provenance-header-lint.test.ts": 449,
  "record-counts-measurement.test.ts": 521,
  "reference-resolution-lint.test.ts": 814,
  "review-coverage-mandate.test.ts": 278,
  "review-coverage.test.ts": 677,
  "rules-emission-golden.test.ts": 1159,
  "rules-voice-profile.test.ts": 318,
  "session-start-subdirectory.test.ts": 159,
  "staging-drift.test.ts": 649,
  "surface-growth-bound.test.ts": 576,
  "turn-budget-lint.test.ts": 398,
};

/** See `## Where each head-room comes from`. Derived per surface, never shared. */
const AGENT_HEAD_ROOM = 18_000;
const SKILL_HEAD_ROOM = 20_000;
const TEST_LINE_HEAD_ROOM = 2_500;

const SURFACES: Surface[] = [
  {
    key: "agents",
    label: "the agent prompts (agents/*.md)",
    unit: "bytes",
    baseline: AGENT_BASELINE,
    headRoom: AGENT_HEAD_ROOM,
    cost: "every byte is context an agent loads in full on every dispatch",
    files: () =>
      readdirSync(join(pluginRoot, "agents"))
        .filter((f) => f.endsWith(".md"))
        .sort()
        .map((f) => ({ rel: f, size: statSync(join(pluginRoot, "agents", f)).size })),
  },
  {
    key: "skills",
    label: "the skill bodies (skills/*/SKILL.md)",
    unit: "bytes",
    baseline: SKILL_BASELINE,
    headRoom: SKILL_HEAD_ROOM,
    cost: "a skill body becomes the user prompt, so every byte is context too",
    files: () =>
      readdirSync(join(pluginRoot, "skills"), { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => join(d.name, "SKILL.md"))
        .filter((rel) => existsSync(join(pluginRoot, "skills", rel)))
        .sort()
        .map((rel) => ({ rel, size: statSync(join(pluginRoot, "skills", rel)).size })),
  },
  {
    key: "hook-tests",
    label: "the hook test suite (hooks/lib/__tests__/**.ts)",
    unit: "lines",
    baseline: TEST_LINE_BASELINE,
    headRoom: TEST_LINE_HEAD_ROOM,
    cost: "every line is maintenance and suite wall-clock, paid on every run",
    // Recursive, because vitest's include is: a `.ts` file at ANY depth under
    // `__tests__/` runs, so reading two directories and naming `helpers` was the
    // written-down list this reader exists to refuse — a test file one level
    // deeper ran and was measured by nothing (issue 260815-1935).
    files: () =>
      readdirSync(here, { recursive: true })
        .filter((f) => f.endsWith(".ts"))
        .sort()
        .map((rel) => ({ rel, size: lineCount(join(here, rel)) })),
  },
];

/** The failure text. Factored out so the synthetic tests below can read it. */
function boundMessage(s: Surface, g: Growth): string {
  return [
    "",
    `${s.label} has grown ${fmt(g.delta)} ${s.unit} past its baseline, which is ` +
      `${fmt(g.total - g.budget)} beyond the ${fmt(s.headRoom)} of head-room this ` +
      `surface gets (${fmt(g.total)} ${s.unit} now, budget ${fmt(g.budget)} = floor ` +
      `${fmt(g.floor)} + ${fmt(s.headRoom)}).`,
    `This bound FAILS instead of reporting because ${s.cost}.`,
    "grown since the baseline was last set:",
    ...grownLines(g),
    "",
    "Cut where the growth is. Each surface has its OWN budget: shrinking another " +
      "surface does not pay for this one, by construction.",
    "",
    "Regenerating the golden does NOT clear this — the golden records what the " +
      `files measure, ${s.key}'s baseline map records what they are allowed to ` +
      "measure from. A baseline moves at exactly the two events in " +
      "`## Re-baselining: the two events at which a baseline moves` in " +
      "helpers/growth-bound.ts: after a cleanup, or at a one-time arming written " +
      "into this file's arming log. Editing it to make this assertion pass is " +
      "neither of them.",
    "",
  ].join("\n");
}

const GOLDEN_HEADER = [
  "# surface-growth.golden — what the bounded shipped surfaces measure, per file.",
  "#",
  "# Generated. Do not hand-edit. To update after a deliberate change:",
  "#",
  "#   cd hooks && UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts",
  "#",
  "# That run rewrites this file and then fails on purpose, so the flag can never",
  "# be left on in a green run. Reviewing the diff is the whole obligation.",
  "#",
  "# One block per surface: every file in it with its size, then the total.",
  "# agents and skills are bytes; hook-tests are lines. Regenerating this file",
  "# does not move any baseline and therefore never clears a bound.",
].join("\n");

function render(s: Surface, files: Sized[]): string {
  const body = files.map((f) => `  ${f.rel} ${f.size}`).join("\n");
  const total = files.reduce((n, f) => n + f.size, 0);
  return `[${s.key} ${s.unit}]\n${body}\n  total ${total}`;
}

function parseGolden(text: string): Map<string, string> {
  const blocks = new Map<string, string>();
  let current: string | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (current) blocks.set(current, buf.join("\n").replace(/\n+$/, ""));
  };
  for (const line of text.split("\n")) {
    if (line.startsWith("#")) continue;
    const head = /^\[([a-z-]+) (bytes|lines)\]$/.exec(line.trim());
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

const UPDATING = process.env.UPDATE_SURFACE_GOLDEN === "1";

describe("surface growth bounds", () => {
  let measured: Map<string, Sized[]>;

  beforeAll(() => {
    measured = new Map(SURFACES.map((s) => [s.key, s.files()]));
    if (UPDATING) {
      const body = SURFACES.map((s) => render(s, measured.get(s.key)!)).join("\n\n");
      writeFileSync(goldenPath, `${GOLDEN_HEADER}\n\n${body}\n`, "utf-8");
    }
  });

  it("was not run with the update flag left switched on", () => {
    expect(
      UPDATING,
      `The golden at ${relative(pluginRoot, goldenPath)} has been REWRITTEN from live ` +
        "measurement. This failure is deliberate — it stops a regeneration run from " +
        "ever being green. Now: (1) read the fixture diff and confirm every change is " +
        "one you intended, (2) re-run without UPDATE_SURFACE_GOLDEN. The baselines do " +
        "NOT move with the golden, so a regeneration records growth and never absolves it.",
    ).toBe(false);
  });

  it("measures a non-empty file set for every bounded surface", () => {
    const empty = SURFACES.filter((s) => measured.get(s.key)!.length === 0).map((s) => s.key);
    expect(
      empty,
      "A bounded surface measured no files at all, so its bound would pass on a " +
        "measurement of nothing. Either the directory moved or the reader is wrong.",
    ).toEqual([]);
  });

  it("carries no baseline entry for a file that is gone", () => {
    const stale: string[] = [];
    for (const s of SURFACES) {
      const present = new Set(measured.get(s.key)!.map((f) => f.rel));
      for (const rel of Object.keys(s.baseline)) {
        if (!present.has(rel)) stale.push(`${s.key}: ${rel}`);
      }
    }
    expect(
      stale,
      "A baseline map names a file that no longer exists. The removal that deleted it " +
        "should have dropped its entry in the same commit — an entry nothing is measured " +
        "against inflates the floor and grants head-room nobody decided to grant.",
    ).toEqual([]);
  });

  it("matches the checked-in golden, surface by surface", () => {
    expect(
      existsSync(goldenPath),
      `Missing ${relative(pluginRoot, goldenPath)}. Create it with: ` +
        "cd hooks && UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts",
    ).toBe(true);

    const golden = parseGolden(readFileSync(goldenPath, "utf-8"));
    expect(
      [...golden.keys()].sort(),
      "The golden covers a different set of surfaces than this file bounds.",
    ).toEqual(SURFACES.map((s) => s.key).sort());

    for (const s of SURFACES) {
      expect(
        render(s, measured.get(s.key)!),
        `The '${s.key}' surface changed. If the change is deliberate, regenerate the ` +
          "golden (see the header of this file) and read the diff. Regenerating does " +
          "not move the baseline, so the bound below still applies.",
      ).toBe(golden.get(s.key));
    }
  });

  // One `it` per surface, and deliberately not a loop: four independent budgets
  // means four independent failures, each naming its own surface in the report.
  for (const s of SURFACES) {
    it(`holds ${s.key} inside its own head-room of ${s.headRoom} ${s.unit}`, () => {
      const g = growth(measured.get(s.key)!, s.baseline, s.headRoom);
      expect(g.over, boundMessage(s, g)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// The bounds, proved on synthetic sizes.
//
// The behaviours each bound rests on, exercised on INVENTED sizes against the
// real baselines. Nothing here reads or edits a shipped file: proving that a
// bound fails would otherwise mean bloating an agent prompt to watch it fire.
// (It was also proved live, once, at the arming — see the report for that step.)
// ---------------------------------------------------------------------------
describe("the surface bounds, on synthetic sizes", () => {
  const at = (b: Record<string, number>): Sized[] =>
    Object.entries(b).map(([rel, size]) => ({ rel, size }));

  it("sits at zero growth when every file is at its baseline", () => {
    for (const s of SURFACES) {
      const g = growth(at(s.baseline), s.baseline, s.headRoom);
      expect(g.delta, s.key).toBe(0);
      expect(g.over, s.key).toBe(false);
    }
  });

  it("fails each surface once that surface has spent its own head-room", () => {
    for (const s of SURFACES) {
      const files = at(s.baseline);
      files[0].size += s.headRoom + 1;
      const g = growth(files, s.baseline, s.headRoom);
      expect(g.over, `${s.key} should be over`).toBe(true);
      expect(boundMessage(s, g)).toContain(files[0].rel);
      expect(boundMessage(s, g)).toContain("helpers/growth-bound.ts");
    }
  });

  it("counts a file with no baseline entry in full", () => {
    const s = SURFACES[0];
    const files = [...at(s.baseline), { rel: "a-new-agent.md", size: s.headRoom + 1 }];
    expect(growth(files, s.baseline, s.headRoom).over).toBe(true);
  });

  it("never goes over on a shrink, however large — this bounds the rate of addition", () => {
    for (const s of SURFACES) {
      const files = at(s.baseline);
      files[0].size = 0;
      const g = growth(files, s.baseline, s.headRoom);
      expect(g.delta, s.key).toBeLessThan(0);
      expect(g.over, s.key).toBe(false);
      expect(g.grown, s.key).toEqual([]);
    }
  });

  it("keeps the budgets independent — one surface's shrink cannot pay for another's growth", () => {
    // The property the plan's diagram was corrected to assert: there is one
    // instrument and NOT one pooled budget. `agents/` blown past its head-room
    // stays blown however far `skills/` shrinks, because the two measurements
    // never meet.
    const agents = SURFACES.find((s) => s.key === "agents")!;
    const skills = SURFACES.find((s) => s.key === "skills")!;

    const bloated = at(agents.baseline);
    bloated[0].size += agents.headRoom + 1;
    const emptied = at(skills.baseline).map((f) => ({ ...f, size: 0 }));

    expect(growth(bloated, agents.baseline, agents.headRoom).over).toBe(true);
    expect(growth(emptied, skills.baseline, skills.headRoom).over).toBe(false);
    // And the bloat is invisible to the other surface's baseline: an agent file
    // has no entry in the skills map, so it could only ever count as growth
    // there — never as credit.
    expect(skills.baseline[bloated[0].rel]).toBeUndefined();
  });
});
