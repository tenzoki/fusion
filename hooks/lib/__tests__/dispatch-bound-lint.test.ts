import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// ---------------------------------------------------------------------------
// Dispatch-bound lint — the sibling of `turn-budget-lint.test.ts`, over the
// other value `bin/fusion-turn-budget` resolves.
//
// The specification of the bounded-dispatch mechanism does NOT require this
// gate. It exists because this project has already measured the exact failure it
// prevents, on the other value in the same block: the Phase-2 Turn budget was
// prose in seven places and four spellings. That defect is told once, in
// `turn-budget-lint.test.ts`'s header and in issue
// `260811-1712_*_max-turns-is-hardcoded-in-eight-places-and-cannot-be-set-per-project.md`.
// What matters here is its shape: none of the seven arrived at once — each was
// written by someone who wanted a number in the sentence they were writing, and
// the eighth would have arrived the same way.
//
// The dispatch bound has the identical shape: a wall-clock figure the prompt
// wants in a sentence ("stop after 20 minutes"), while the value is
// `orchestrator.dispatchMinutes`, merged per leaf by `hooks/lib/config.ts` from
// the project's `fusion.json` over the built-in `DEFAULTS`, read once per
// session at Setup and held as `<dispatch-minutes>`. Nothing before this gate
// would have caught `20 minutes` appearing in the orchestrator prompt.
//
// What it is, honestly (rules/critical-stance.md §2, §3): a text check over two
// prompt files. It checks that the number is NOT IN THE PROSE. It cannot check
// that a dispatched orchestrator actually read the configured value, that the
// value it read reached a dispatch prompt, or that a bound agent honoured the
// stopping time it was given — nothing here runs at dispatch time, and a prompt
// instruction is overridable under task pressure. What it buys is that the
// figure cannot quietly return to the prose and that the default keeps living in
// exactly one place. One further limit is measured rather than assumed, in the
// last case below: a minute figure counts as a bound only next to one of four
// named words, and the prompt's own heading for the value — "The dispatch
// bound." — is not one of them.
//
// A guard, not a fixer: it reads and asserts, it never rewrites a prompt.
//
// **THE READER IS GONE, AND ONE CASE WENT WITH IT (2026-09-10).** Both values
// came out of `bin/fusion-turn-budget`, which was deleted with the Turn budget
// it also resolved. `turn-budget-lint.test.ts` — the sibling that pinned the
// guarded call — went with its own subject in the same commit, and the case
// here that pinned the block's SECOND output line went with it in the next: a
// coupling assertion over a program that does not exist pins nothing, and
// keeping it would only have asserted that a prompt still names a deleted path.
//
// `orchestrator.dispatchMinutes` is still a live configuration leaf and now has
// no program that resolves it for a session. Whether it gets a reader again or
// is retired beside `maxTurns` is open, filed as issue
// `260910-1033_*_deleting-the-turn-budget-helper-leaves-the-dispatch-bound-with-no-reader.md`.
// Until that is answered the prompt states the bound as `<dispatch-minutes>`,
// says plainly that nothing resolves it, and passes no `**Stop by:**` line — so
// the three cases below are exactly the coverage that still means something:
// the figure may not return to the prose, and the bound must still be spoken
// about under the name a reader would resolve it to.
// ---------------------------------------------------------------------------

const read = (rel: string) => readFileSync(join(pluginRoot, rel), "utf-8");

const ORCHESTRATOR = "agents/orchestrator.md";
const SETUP_SKILL = "skills/setup/SKILL.md";

/** The name the prompt holds the resolved bound under, once Setup has read it. */
const PLACEHOLDER = "<dispatch-minutes>";

/** The configuration key, named in the failure text so a reader can find it. */
const OUTPUT_KEY = "dispatch_minutes";

/**
 * What to do about a legitimate change, said once and appended to every failure
 * here.
 *
 * A gate that only says "this failed" gets satisfied by deleting the assertion.
 * The bound genuinely does change — a project wants longer dispatches, and
 * fusion may one day ship a different default — so the message has to name the
 * routes that keep working, or the next person who wants a different number will
 * take the one route this gate exists to close.
 */
const REMEDY =
  "\n\nIf the dispatch bound genuinely needs to change: for ONE PROJECT, declare " +
  '{"orchestrator": {"dispatchMinutes": <n>}} in that project\'s fusion.json — nothing in ' +
  "this repository changes. For FUSION'S OWN DEFAULT, edit DEFAULTS.orchestrator.dispatchMinutes " +
  "in hooks/lib/config.ts, which is the one place it is written. In neither case does a number " +
  "belong in an agent prompt: the prompt names the bound as " +
  `${PLACEHOLDER}, whatever resolves it. Modelled on issue 260811-1712, which is the same defect on ` +
  "the Turn budget.";

/**
 * The words that make a line a statement ABOUT the bound rather than a sentence
 * that happens to contain a number and the word "minutes".
 *
 * Deliberately narrow, for the reason the sibling's comment gives about "Turn":
 * a prompt this long carries legitimate durations, and a pattern wide enough to
 * catch every one of them would be switched off within the month. A minute
 * literal only counts as a bound when it stands next to the bound's own
 * vocabulary.
 */
const BOUND_CONTEXT = /Stop by|stopping time|dispatch_minutes|dispatchMinutes/;

const BOUND_LITERALS: {
  name: string;
  pattern: RegExp;
  /** True when a hit only counts with `BOUND_CONTEXT` on the same line. */
  needsContext: boolean;
  why: string;
}[] = [
  {
    name: "the bound stated as a literal count of minutes",
    pattern: /\b\d+\s*minutes?\b/g,
    needsContext: true,
    why:
      'a figure next to the bound\'s own vocabulary, as in "a stopping time of 20 minutes" or ' +
      `"**Stop by:** now + 20 minutes". The prompt states ${PLACEHOLDER}, which Setup resolves`,
  },
  {
    name: "dispatch_minutes or dispatchMinutes assigned a number",
    pattern: /\b(?:dispatch_minutes|dispatchMinutes)[`"]?\s*[:=]\s*\d+/g,
    needsContext: false,
    why:
      `the key given a value, as in "${OUTPUT_KEY}=20". The prompt shows the helper's output ` +
      "line with a <placeholder>, not a figure",
  },
];

/** Every line of `text` that states the dispatch bound as a literal. */
function boundLiteralHits(text: string): string[] {
  const hits: string[] = [];
  text.split("\n").forEach((line, i) => {
    for (const { name, pattern, needsContext, why } of BOUND_LITERALS) {
      // The minute pattern is only a bound when the bound's vocabulary is on the
      // same line; the assignment pattern names the key itself and needs no
      // further context.
      if (needsContext && !BOUND_CONTEXT.test(line)) continue;
      // Fresh lastIndex per line: the patterns are /g and are reused.
      pattern.lastIndex = 0;
      const found = line.match(pattern);
      if (found === null) continue;
      hits.push(`${i + 1}: ${name} — ${found.join(", ")}  (${why})\n    ${line.trim()}`);
    }
  });
  return hits;
}

describe("the dispatch bound is not a number in a prompt", () => {
  it("states no dispatch-bound literal in the orchestrator prompt", () => {
    const hits = boundLiteralHits(read(ORCHESTRATOR));
    expect(
      hits,
      `${ORCHESTRATOR} states the dispatch bound as a literal at:\n  ${hits.join("\n  ")}${REMEDY}`,
    ).toEqual([]);
  });

  it("states no dispatch-bound literal in the setup skill", () => {
    // `/fusion:setup` inlines the orchestrator's Setup and names the dispatch
    // bound in its own words, so it is the second surface a copy of the figure
    // would land on. Checked with the same patterns rather than trusted.
    const hits = boundLiteralHits(read(SETUP_SKILL));
    expect(
      hits,
      `${SETUP_SKILL} states the dispatch bound as a literal at:\n  ${hits.join("\n  ")}${REMEDY}`,
    ).toEqual([]);
  });

  it("keeps the placeholder the prompt names in place of the number", () => {
    // The anti-vacuity half of the two cases above: a prompt that simply DELETED
    // every mention of the bound would pass them both. The bound has to still be
    // spoken about, under the name Setup resolves it to — the stopping-time
    // computation is written against that name.
    const text = read(ORCHESTRATOR);
    expect(
      text.includes(PLACEHOLDER),
      `${ORCHESTRATOR} no longer names ${PLACEHOLDER}. Removing the bound from the prose is not ` +
        `the same as reading it: the stopping time passed on every bounded dispatch is computed ` +
        `from the resolved value, so the prompt has to name it.${REMEDY}`,
    ).toBe(true);
  });

});

describe("the detector is measured on the sentences it exists to catch", () => {
  // The two prompt scans above pass trivially against a prompt that states
  // nothing, so a pattern whose only evidence is an empty result is
  // indistinguishable from a broken one. This is the sibling's own doctrine,
  // applied to a detector that has never yet fired on a shipped file.

  it("fires on a bound stated as a figure", () => {
    for (const line of [
      "Compute a stopping time of 20 minutes from now and pass it on the dispatch.",
      "**Stop by:** now + 20 minutes",
      "dispatch_minutes=20",
      '"dispatchMinutes": 20',
    ]) {
      expect(boundLiteralHits(line), `not detected: ${line}`).not.toEqual([]);
    }
  });

  it("leaves alone the lines the prompt legitimately carries", () => {
    for (const line of [
      // agents/orchestrator.md, the stopping-time block: names "Stop by" and the
      // word "minutes" in one sentence, and states no figure.
      'Node, not `date`: adding minutes is unportable (`-d "+N minutes"` GNU, `-v+NM` BSD).',
      // The helper's output shown with placeholders, which is the correct shape.
      "It prints two lines, `max_turns=<n>` and `dispatch_minutes=<n>`.",
      "node -e 'console.log(new Date(Date.now()+<dispatch-minutes>*60000).toISOString())'",
      // A duration with no bound vocabulary on the line: a measurement, not a
      // statement of the bound. Catching this is what would get the gate
      // switched off.
      "The reconciler pass took 20 minutes on the last run.",
    ]) {
      expect(boundLiteralHits(line), `false positive: ${line}`).toEqual([]);
    }
  });

  it("does NOT reach a figure stated beside the phrase 'dispatch bound'", () => {
    // A residual, asserted rather than left to be discovered (critical-stance
    // §3). `BOUND_CONTEXT` is the four names the step specified — `Stop by`,
    // `stopping time`, `dispatch_minutes`, `dispatchMinutes` — and the prompt's
    // own prose heading for the value, "The dispatch bound.", is not among them.
    // A figure written on such a line passes this gate.
    //
    // It is pinned as an ABSENCE so that widening `BOUND_CONTEXT` is a
    // deliberate act with a failing test in front of it, rather than a silent
    // one; and so that nobody reads the four names as coverage they are not.
    expect(
      boundLiteralHits("The dispatch bound is 35 minutes unless the project says otherwise."),
      "BOUND_CONTEXT was widened. That is very likely an improvement — the phrase 'dispatch " +
        "bound' is the prompt's own heading for the value, so it is where a figure would most " +
        "plausibly land. Delete this case and say so in the commit message.",
    ).toEqual([]);
  });
});
