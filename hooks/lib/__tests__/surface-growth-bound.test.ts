import { describe, it, expect, beforeAll } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, relative } from "node:path";
import { fmt, Growth, growth, grownLines, Sized } from "./helpers/growth-bound.js";

// ---------------------------------------------------------------------------
// The surface growth bounds — what the shipped prompt, skill and test text is
// allowed to GROW BY before the suite fails.
//
// WHY THIS FILE EXISTS. On 2026-08-05 the one growth ratchet became a
// non-failing report (decision 260805-1559). Read by nobody, it bounded nothing:
// from `66e4a698` to `9a7da8e` `agents/*.md` rose +59 % and the hook tests +31 %
// while `rules/`, the one surface the old cap covered, fell -7.5 %
// (`shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`).
// A failing cap is the only instrument that ever bounded the rate; this file
// puts it where the growth was.
//
// WHY A SECOND FILE RATHER THAN AN EXTENSION OF THE FIRST.
// `rules-emission-golden.test.ts` measures what `bin/fusion-rules` EMITS — a
// property of a script, measured by running it. `agents/`, `skills/` and the
// hook tests are emitted by nothing; they are read off the tree. Overloading one
// file with two subjects is the defect that file's own header warns about, so
// the two share the INSTRUMENT (`helpers/growth-bound.ts`) and nothing else.
//
// FOUR SURFACES, FOUR INDEPENDENT BUDGETS, ONE INSTRUMENT — authored in this
// file's instrument (`helpers/growth-bound.ts`) and in `README-hooks.md`.
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
// applies and it is deliberate: nobody granted the new file a budget, so a new
// file tripping the bound is the instrument working, not a false alarm.
//
// ## Where each head-room comes from
//
// ONE PROPERTY, BECAUSE IT IS THE ONE THAT REPRODUCES FROM `git`: each head-room
// sits INSIDE its own surface's worst measured single day, so a run like that day
// trips the bound on the day it begins. It is derived per surface and pooled with
// nothing — the 12 000 bytes `rules-emission-golden.test.ts` uses was measured
// against `rules/` alone and licenses nothing here.
//
// The method, so the next re-baseliner recomputes rather than re-derives: size
// each surface at the last commit of every day from `b05b423` (2026-05-04, the
// repository's first commit) to `66e4a698` (2026-08-05) — 340 commits over 40
// commit-days, no merges, so diffing consecutive commit-days is valid — and take
// the largest of those rises. Sizes come off the tree, not off diffs: for
// `agents/`, `git ls-tree -r -l <commit> agents/` summed over the `.md` entries.
//
//   surface           worst measured day     head-room   share of that day
//   agents/ bytes     +50 725 (2026-05-16)     18 000          35 %
//   skills/ bytes     +38 025 (2026-05-19)     20 000          53 %
//   hook test lines    +5 247 (2026-08-04)      2 500          48 %
//
// 2 500 also sits under the +4 026 of 2026-08-01, the FIRST day of the four-day
// run that built most of this suite, so a run like that one trips on day one.
//
// THE ARMING'S TWO DISCARDED PROPERTIES AND ITS CORROBORATION RATE are in `260922-0939-rules-emission-golden-cut-log-and-retired-core-bound-argument-2026-08-05-to-2026-09-11.md`.
//
// ## The arming and the two re-baselines, 2026-08-15 to 2026-09-05 — rolled out
//
// The dated log of those three events (events 2, 1 and 3 of `## Re-baselining`
// in `helpers/growth-bound.ts`) is rolled verbatim into this workbench's
// `260921-1855-surface-growth-bound-arming-and-re-baseline-log-2026-08-15-to-2026-09-05.md`.
// None of the three moved a head-room; this file keeps only each head-room's derivation and the rules.
//
// ## The head-room raises, 2026-09-11 and 2026-09-16 — logged in `README-hooks.md`
//
// NOT A RE-BASELINING EVENT: each raise moved head-room and no baseline. The
// ruling, the figures and the reduction are authored once, under `README-hooks.md`
// `### Growth bounds on the shipped text`.
//
// ## What no bound covers
//
// Authored under that heading in `README-hooks.md`, and claimed by no step here.
//
// RELEASE_CAP AND DRIFT_CEILING ARE NOT TOUCHED, NOT COPIED AND NOT IMITATED.
// They are historical facts about what `origin/main` once shipped in RULE TEXT.
// They say nothing about prompts, skill bodies or tests, and an analogue invented
// for these surfaces would be a fabricated history rather than a measurement.
//
// ## Updating the golden
//
// `GOLDEN_HEADER` below carries the one command verbatim; `README-hooks.md` says
// why regenerating never clears a bound and where a baseline may move instead.
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
 * Hand-edited only at one of the three re-baselining events. The figures are the
 * post-removal sizes as Circle 260815-0007 leaves the tree; nothing was cut to
 * produce them. It does not move at the 2026-09-05 merge: this surface was
 * inside its bound on the merged tree, and event 3 reaches only what a merge put
 * over.
 *
 * SIX ENTRIES WERE DROPPED at the v11 roster cut on 2026-09-10, five here and
 * one from the skills map below: `bugfixer.md`, `coderev.md`, `ontorev.md`,
 * `playmaker.md`, `taskplanner.md` and `next/SKILL.md`, whose files were
 * deleted. **That is not a re-baselining event and no surviving figure moved.**
 * An entry for a file that is gone inflates the floor and grants head-room
 * nobody decided to grant, which is what the case below measures; dropping it
 * is the removal's own bookkeeping. `reviewer.md` arrived in the same commit
 * and deliberately gets NO entry: a file with no baseline contributes 0 to the
 * floor, so its whole size counts as growth against this surface, which is the
 * correct charge for a new file.
 */
const AGENT_BASELINE: Record<string, number> = {
  "analyst.md": 21317,
  "coder.md": 9688,
  "consultant.md": 14825,
  "curator.md": 33541,
  "editor.md": 14272,
  "ontocoder.md": 13305,
  "orchestrator.md": 139859,
  "planner.md": 18434,
  "reconciler.md": 20006,
  "shaper.md": 25320,
};

/**
 * The skill bodies, in bytes. 240 614 at the 2026-09-05 merge re-baseline, up
 * from 220 439 at the 2026-08-15 arming: the merged tree's own figure, taken
 * per file. See `## The merge re-baseline, 2026-09-05` above for the two parent
 * figures, the check that neither was over, and what the move absolves.
 */
const SKILL_BASELINE: Record<string, number> = {
  "archive/SKILL.md": 26364,
  "cadence/SKILL.md": 16923,
  "cleanup/SKILL.md": 23674,
  "commit/SKILL.md": 6298,
  "curate/SKILL.md": 12398,
  // `direct/SKILL.md` (10 613) stood here until 2026-09-10 and went with the
  // per-unit-of-work record its whole body dispatched the shaper to create.
  // The entry is DROPPED rather than zeroed: a baseline entry for a file the
  // tree no longer holds inflates the surface's floor by its whole size and
  // grants that much head-room nobody decided to grant.
  "help/SKILL.md": 16919,
  // `log-activity/SKILL.md` (13 629) stood here until 2026-09-16 and went with
  // the body, whose two procedures merged into `/fusion:cadence`. DROPPED
  // rather than zeroed, for the reason five lines above: an entry nothing is
  // measured against inflates the floor by its whole size.
  "memo/SKILL.md": 12336,
  "migrate/SKILL.md": 26620,
  "setup/SKILL.md": 47236,
};

/**
 * The hook tests and their helpers, in lines. 20 766 at the 2026-09-05 merge
 * re-baseline, up from 17 875 at the 2026-08-17 cleanup re-baseline and 19 453
 * at the 2026-08-15 arming: the merged tree's own figure, taken per file. See
 * `## The merge re-baseline, 2026-09-05` above for the two parent figures, the
 * check that neither was over, and what the move absolves — and
 * `## The cleanup re-baseline, 2026-08-17` for the previous move. The
 * instrument still counts itself, and so does this file: a bound that did not
 * would be granting itself the one exemption it exists to refuse.
 */
const TEST_LINE_BASELINE: Record<string, number> = {
  "archive-filter-key.test.ts": 40,
  "citation-grammar-boundaries.test.ts": 116,
  "citation-sweep.test.ts": 441,
  "commit-message-path.test.ts": 315,
  "committed-dist.test.ts": 332,
  "config.test.ts": 859,
  "context-manifest.test.ts": 472,
  "deliverable-language-lint.test.ts": 138,
  "derivable-enumerations-lint.test.ts": 453,
  "domain-cascade-order-lint.test.ts": 234,
  "domain-cascade.test.ts": 911,
  "executor-verification-report-lint.test.ts": 217,
  "fenced-code-exemption.test.ts": 224,
  "fusion-checkout-name.test.ts": 177,
  "fusion-citation-check.test.ts": 248,
  "fusion-commit-lock.test.ts": 424,
  "fusion-count-sources.test.ts": 442,
  "fusion-events.test.ts": 322,
  "fusion-identity.test.ts": 220,
  "fusion-paths.test.ts": 873,
  "fusion-prose-metric.test.ts": 174,
  "fusion-session-domain.test.ts": 80,
  "glob-nomatch-lint.test.ts": 148,
  "guard-bash-integration.test.ts": 338,
  "guard-project-config-integration.test.ts": 251,
  "guard-state-shape.test.ts": 215,
  "helpers/citation-scan.ts": 56,
  "helpers/growth-bound.ts": 123,
  "helpers/guard-harness.ts": 970,
  "helpers/prompt-blocks.ts": 28,
  "hook-fail-open.test.ts": 624,
  "hooks-wiring.test.ts": 187,
  "identity-mint-notice.test.ts": 118,
  "legacy-halt-clearing.test.ts": 213,
  "marker-format-lint.test.ts": 171,
  "monitor-warnings-panel.test.ts": 1153,
  "path-literal-lint.test.ts": 338,
  "paths.test.ts": 31,
  "plan-stopping-section-lint.test.ts": 266,
  "provenance-header-lint.test.ts": 448,
  "reference-resolution-lint.test.ts": 1004,
  "review-coverage-mandate.test.ts": 353,
  "review-coverage.test.ts": 818,
  "rules-emission-golden.test.ts": 1150,
  "rules-voice-profile.test.ts": 323,
  "sentence-identifier-containment.test.ts": 425,
  "session-start-subdirectory.test.ts": 159,
  "staging-drift.test.ts": 673,
  "surface-growth-bound.test.ts": 608,
  "workbench-citation-lint.test.ts": 325,
};

/** See `## Where each head-room comes from`. Derived per surface, never shared. */
const AGENT_HEAD_ROOM = 18_000;
/** 20 000 derived, plus the two 2026-09-11 raises and the two on 2026-09-16 and 2026-09-17, logged in `README-hooks.md`. */
const SKILL_HEAD_ROOM = 39_260;
/**
 * 2 500 derived, plus the 2026-09-11 raise and the three on 2026-09-16, logged
 * in `README-hooks.md` — and a ninth raise of +190 on 2026-09-18, justified
 * here rather than there because a raise nobody can trace is what this bound
 * exists to prevent.
 *
 * WHO, WHEN, FOR WHAT. Kai Stalmann authorised it on 2026-09-18, in the
 * dispatch that built `bin/fusion-edge-answers` under the ruling on
 * `260918-0712_*_how-does-the-curators-edge-survey-know-not-to-re-propose-an-edge-the-user-declined.md`,
 * and for that helper's test file alone: `edge-answers.test.ts` is 190 lines and
 * the raise is 190, so the ten lines this comment adds still come out of the 26
 * this surface had before. No cut was looked for, because the user named the
 * raise as the remedy and the authorisation reaches nothing else — the same
 * dispatch left `AGENT_HEAD_ROOM` and `SKILL_HEAD_ROOM` unraised and said so.
 */
const TEST_LINE_HEAD_ROOM = 3_030;

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
    // Recursive, and NOT filtered by what vitest runs: `vitest.config.mjs` sets no
    // `include`, so the default `**/*.{test,spec}.?(c|m)[jt]s?(x)` collects a TEST
    // file at any depth and no plain `.ts` at all — `helpers/*.ts` is run by
    // nothing and counted here anyway. The criterion is what the suite's tree
    // costs to MAINTAIN and to run, and it settles `fixtures/` deliberately: that
    // directory IS inside the walk, and its goldens fall out for being machine-
    // written records of other surfaces' size, not TypeScript anybody maintains.
    // Two named directories were the written-down list this reader exists to
    // refuse (issue 260815-1935).
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
      "measure from. A baseline moves at exactly the three events in " +
      "`## Re-baselining: the three events at which a baseline moves` in " +
      "helpers/growth-bound.ts: after a cleanup, at a one-time arming written " +
      "into this file's arming log, or at a merge of two lines that were each " +
      "inside this bound at their own head. Editing it to make this assertion " +
      "pass is none of them.",
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
