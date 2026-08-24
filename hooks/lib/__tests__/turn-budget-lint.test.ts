import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// ---------------------------------------------------------------------------
// Turn-budget lint (issue 260811-1712).
//
// The defect: the orchestrator's Phase-2 Turn budget was PROSE. `5` was written
// into `agents/orchestrator.md` in seven places and four spellings — "Maximum 5
// Turns (numbered 1 through 5)", "`**Turn:** <N>/5`", "the existing 5-Turn
// circuit breaker", "`max_turns` (default 5)", "already reached (5/5)",
// "max_turns: 5" in the state schema, "`**Turn:** --/5` … `**Turn:** 1/5`" —
// plus the Threshold cell of the Max-Turns circuit-breaker row. No project
// could change any of them, and one already called the number a "default",
// which implies a source that can override it. None existed, so the word was
// false.
//
// The fix makes the budget a configured value: `orchestrator.maxTurns`, merged
// per leaf by `hooks/lib/config.ts` from the project's `fusion.json` and the
// built-in `DEFAULTS`; read once per
// session by `bin/fusion-turn-budget` at Setup, on a resume exactly as on a
// fresh session, and held for that session only. It was also persisted, as
// `progress.max_turns` in `agentstate.yaml`, until 2026-08-15 — that copy went
// with the six other hand-maintained counters in the same block, on the ground
// that a configured ceiling is not session state and a second source is the
// very defect this gate exists over.
//
// What this gate pins is the part that would otherwise be undone: that no bare
// Turn-budget literal comes BACK into the prompt. Seven copies of one fact did
// not arrive all at once — each was written by someone who needed a number in
// the sentence they were writing, and the eighth would arrive the same way.
//
// What it is, honestly (rules/critical-stance.md §2, §4): a text check over two
// prompt files and two configuration sources. It cannot check that a dispatched
// orchestrator actually READ the budget — nothing here runs at dispatch time,
// and a prompt instruction is overridable under task pressure. What it buys is
// that the number cannot quietly return to the prose, that the read stays
// named in the prompt, and that the default keeps living in exactly one place.
//
// A guard, not a fixer: it reads and asserts, it never rewrites a prompt.
// ---------------------------------------------------------------------------

const read = (rel: string) => readFileSync(join(pluginRoot, rel), "utf-8");

const ORCHESTRATOR = "agents/orchestrator.md";
const SETUP_SKILL = "skills/setup/SKILL.md";
const CONFIG_TS = "hooks/lib/config.ts";
/**
 * The two plugin-layer files, DELETED on 2026-08-16 and named here so their
 * absence can be asserted rather than assumed. `hooks/config.json` was the
 * middle merge layer and `hooks/config.example.json` a filled-in illustration of
 * it; both existed to give the guard settings a plugin-level default a project
 * could narrow, and the guard stopped deciding anything in that release.
 */
const DELETED_PLUGIN_CONFIGS = ["hooks/config.json", "hooks/config.example.json"];

/** The two files that carry the key's documentation: what Setup seeds, and this repository's own copy. */
const DOCUMENTED_IN = ["templates/fusion.json", "fusion.json"];
const HELPER = "bin/fusion-turn-budget";

/**
 * What to do about a legitimate change, said once and appended to every
 * failure here.
 *
 * A gate that only says "this failed" gets satisfied by deleting the assertion.
 * The budget genuinely does change — a project raises it, and fusion may one
 * day ship a different default — so the message has to name the route that
 * keeps working, or the next person to want a different number will take the
 * route this gate exists to close.
 */
const REMEDY =
  "\n\nIf the budget genuinely needs to change: for ONE PROJECT, declare " +
  '{"orchestrator": {"maxTurns": <n>}} in that project\'s fusion.json — nothing in ' +
  "this repository changes. For FUSION'S OWN DEFAULT, edit DEFAULTS.orchestrator.maxTurns in " +
  "hooks/lib/config.ts, which is the one place it is written. In neither case does a number " +
  "belong in an agent prompt: the prompt reads the resolved value through bin/fusion-turn-budget " +
  "at Setup and names it as <max-turns>. Issue 260811-1712.";

/**
 * The spellings a Turn budget takes in prose, each as it was actually written
 * before the fix.
 *
 * Deliberately narrow. A prompt this long carries plenty of legitimate digits
 * next to the word "Turn" — "Turn 1", "### Turn 2", a quoted measurement about
 * "Turn 5's own commit", "3+ agent errors in a single Turn". Those are counts
 * of a thing that happened, not statements of the bound, and a pattern wide
 * enough to catch them would be turned off within the month. Each entry below
 * matches a BOUND being stated.
 */
const BUDGET_LITERALS: { name: string; pattern: RegExp; why: string }[] = [
  {
    name: "a Turn counter over a numeric maximum",
    pattern: /\bTurn:\*{0,2}\s*(?:<[^>\n]*>|\d+|--)\s*\/\s*\d+/g,
    why: 'the dashboard\'s Turn field, as in "**Turn:** 1/5". The right-hand side is the resolved budget, written <max-turns>, or -- when it did not resolve',
  },
  {
    name: "a bare N/N Turn ratio",
    pattern: /\breached\s*\(\s*\d+\s*\/\s*\d+\s*\)/g,
    why: 'a Turn count stated against its bound, as in "already reached (5/5)"',
  },
  {
    name: "a maximum stated as a count of Turns",
    pattern: /\b(?:Maximum|maximum|Max|max|at most|up to)\s+\d+\s+Turns?\b/g,
    why: 'the loop\'s bound in words, as in "Maximum 5 Turns"',
  },
  {
    name: "a hyphenated N-Turn bound",
    pattern: /\b\d+-Turn\b/g,
    why: 'a bound folded into a compound, as in "the existing 5-Turn circuit breaker"',
  },
  {
    name: "the Max-Turns circuit-breaker row with a numeric threshold",
    pattern: /^\|[^|\n]*Max Turns[^|\n]*\|\s*`?\d+`?\s*\|/g,
    why: "the Threshold cell of the Step 3d table — the eighth site, and the one none of the prose patterns reaches, because a table cell is a bare number with no sentence around it",
  },
  {
    name: "max_turns or maxTurns assigned a number",
    pattern: /\b(?:max_turns|maxTurns)`?\s*[:=]\s*\d+/g,
    why: 'the key given a value, as in "max_turns: 5". The schema line takes a <placeholder>, not a figure',
  },
  {
    name: "max_turns or maxTurns given a parenthesised default",
    pattern: /\b(?:max_turns|maxTurns)`?[^.\n]{0,12}?\(default\s+\d+\)/g,
    why: 'the word "default" made concrete, as in "`max_turns` (default 5)" — the word was false while no source could override it, and a number beside it makes it false again',
  },
  {
    // The only forward-looking entry: unlike the seven above, this one never
    // matched the pre-fix prompt, because the surface it guards did not exist
    // yet. It guards the unresolved-budget check-in (issue 260811-2142), whose
    // interval is one Turn precisely so that no number has to be written. A
    // future author who wants the gate to nag less will reach for "ask again
    // every 3 Turns", which is a bound stated as a figure in the one branch
    // built to refuse one. Its detection is measured directly, below, since
    // the prompt scan cannot measure a pattern that finds nothing.
    name: "a check-in interval stated as a count of Turns",
    pattern:
      /\b(?:every|another|a further|a further set of)\s+\d+\s+Turns?\b|\b\d+\s+(?:more|further|additional)\s+Turns?\b/g,
    why: 'the unresolved-budget check-in given a hardcoded interval, as in "ask again every 3 Turns". The interval is one Turn and is widened by the USER at the gate, not by a figure here',
  },
];

/** Every line of `text` that any budget-literal pattern matches. */
function budgetLiteralHits(text: string): string[] {
  const hits: string[] = [];
  text.split("\n").forEach((line, i) => {
    for (const { name, pattern, why } of BUDGET_LITERALS) {
      // Fresh lastIndex per line: the patterns are /g and are reused.
      pattern.lastIndex = 0;
      const found = line.match(pattern);
      if (found === null) continue;
      hits.push(`${i + 1}: ${name} — ${found.join(", ")}  (${why})\n    ${line.trim()}`);
    }
  });
  return hits;
}

describe("the Turn budget is not a number in a prompt", () => {
  it("states no Turn-budget literal in the orchestrator prompt", () => {
    const hits = budgetLiteralHits(read(ORCHESTRATOR));
    expect(
      hits,
      `${ORCHESTRATOR} states the Turn budget as a literal at:\n  ${hits.join("\n  ")}${REMEDY}`,
    ).toEqual([]);
  });

  it("states no Turn-budget literal in the setup skill", () => {
    // `/fusion:setup` inlines the orchestrator's Setup. It is the surface a
    // second copy of the number would land on, which is why it is checked with
    // the same patterns rather than trusted to stay clean.
    const hits = budgetLiteralHits(read(SETUP_SKILL));
    expect(
      hits,
      `${SETUP_SKILL} states the Turn budget as a literal at:\n  ${hits.join("\n  ")}${REMEDY}`,
    ).toEqual([]);
  });

  it("keeps the placeholder the prompt names in place of the number", () => {
    // The anti-vacuity half of the two cases above: a prompt that simply
    // DELETED every mention of the bound would also pass them. The budget has
    // to still be spoken about, under the name Setup resolves it to.
    const text = read(ORCHESTRATOR);
    expect(
      text.includes("<max-turns>"),
      `${ORCHESTRATOR} no longer names <max-turns>. Removing the budget from the prose is not ` +
        `the same as reading it: the Turn loop, the dashboard and the Max-Turns circuit breaker ` +
        `each have to name the resolved value.${REMEDY}`,
    ).toBe(true);
  });
});

describe("the orchestrator obtains the budget instead of assuming it", () => {
  it("calls the helper at Setup, behind the [ -x ] guard", () => {
    const text = read(ORCHESTRATOR);
    expect(
      text.includes(`$FUSION_PLUGIN_ROOT/${HELPER}`),
      `${ORCHESTRATOR} must call ${HELPER} at Setup — it is the only thing that merges the ` +
        `project's fusion.json over fusion's built-in default.${REMEDY}`,
    ).toBe(true);
    expect(
      text.includes(`if [ -x "$FUSION_PLUGIN_ROOT/${HELPER}" ]`),
      `${ORCHESTRATOR} must guard the ${HELPER} call with [ -x ], as the source count does: ` +
        `$FUSION_PLUGIN_ROOT is the installed copy, pinned for the session, so a helper added ` +
        `between releases is absent there and a bare call is exit 127.`,
    ).toBe(true);
  });

  it("decides the unresolved case rather than leaving it open", () => {
    // The three ways the read can fail — helper absent, exit 2, exit 3 — take
    // one branch, and that branch must be a STATE and not a substituted
    // number. If this assertion goes, the next reader meets a gap exactly where
    // inventing a `5` looks reasonable.
    const text = read(ORCHESTRATOR);
    expect(
      /unresolved/i.test(text),
      `${ORCHESTRATOR} must name the unresolved Turn budget as its own case. A read that can ` +
        `fail three ways and says nothing about what then happens is where a literal comes back.${REMEDY}`,
    ).toBe(true);
    expect(
      text.includes("**Write no substitute anywhere.**"),
      `${ORCHESTRATOR} must say plainly that NOTHING is written in the budget's place when the ` +
        `read fails. Until 2026-08-15 the sentence it had to carry was narrower — omit the ` +
        `progress.max_turns key from agentstate.yaml — because the resolved budget was persisted ` +
        `there and a word written into a numeric field is read as a garbled number. The budget is ` +
        `no longer persisted at all, so there is no key to omit and the instruction widened to the ` +
        `one it always meant: do not invent a bound, in the state file, the dashboard, a gate ` +
        `prompt or your own reasoning.${REMEDY}`,
    ).toBe(true);
  });

  it("does NOT carry the budget in agentstate.yaml — a resumed session resolves it", () => {
    // This assertion was its own inverse until 2026-08-15, and the reversal is
    // the point rather than a relaxation.
    //
    // `progress.max_turns` was the handoff surface: a resumed session read the
    // budget out of the state file instead of assuming one, and the field was
    // required here. It went with the six other hand-maintained counters in that
    // block, and the argument that removed it is the one this whole gate is
    // built on. A budget is a CONFIGURED ceiling, not session state — it is
    // resolved from `fusion.json` through `bin/fusion-turn-budget` at
    // Setup Step 2, and Setup Step 2 runs on a resume exactly as it runs on a
    // fresh session. So the persisted copy handed a resume nothing it could not
    // resolve itself, while being one more number a session could write stale.
    //
    // Asserted as an ABSENCE, and asserted rather than dropped: re-adding the
    // field is the natural-looking fix for someone who meets a resume and wants
    // the budget nearby, and it would reintroduce a second source for a value
    // whose whole defect (issue 260811-1712) was having many.
    const state = read(ORCHESTRATOR).split(/^### Format\s*$/m)[1] ?? "";
    expect(
      /^\s*max_turns:/m.test(state),
      `${ORCHESTRATOR} "### Format" must NOT carry max_turns. The Turn budget is configuration, ` +
        `not session state: Setup Step 2 resolves it through ${HELPER} on a resume exactly as on ` +
        `a fresh session, so a persisted copy is a second source for a value whose defect was ` +
        `having several.${REMEDY}`,
    ).toBe(false);
  });

  it("has the setup skill cite that call rather than copy it", () => {
    // `/fusion:setup` inlines Setup, and this session closed four
    // surface-duplication records. The skill points at the orchestrator's block;
    // it does not carry a second one.
    const text = read(SETUP_SKILL);
    expect(
      text.includes(HELPER),
      `${SETUP_SKILL} must resolve the Turn budget too — it IS the orchestrator's Setup, and a ` +
        `session that ran the skill instead of the inline steps would otherwise start with no budget.`,
    ).toBe(true);
    expect(
      text.includes("agents/orchestrator.md` Setup Step 2"),
      `${SETUP_SKILL} must CITE ${ORCHESTRATOR} Setup Step 2 for the block rather than restating ` +
        `it. A second copy of the call is a second place the unresolved branch can go stale.`,
    ).toBe(true);
    expect(
      budgetLiteralHits(text),
      `${SETUP_SKILL} restated the budget as a number while citing the block.${REMEDY}`,
    ).toEqual([]);
  });
});

describe("the default is defined once, in the configuration layer", () => {
  it("is written in hooks/lib/config.ts DEFAULTS and nowhere else in the loader", () => {
    const text = read(CONFIG_TS);
    const assignments = text.match(/\bmaxTurns:\s*\d+/g) ?? [];
    expect(
      assignments,
      `${CONFIG_TS} must assign maxTurns a number exactly once — in DEFAULTS. Found ` +
        `${assignments.length}: ${assignments.join(", ")}. Two copies of a default are two ` +
        `values free to disagree, which is the standing complaint this module's docstring already ` +
        `makes about escalation.${REMEDY}`,
    ).toHaveLength(1);
  });

  it("has no shipped JSON layer left to restate it in", () => {
    // This case used to read `hooks/config.json` and assert it declared no
    // `orchestrator` section: every OTHER leaf was spelled in both that file and
    // `DEFAULTS`, with nothing keeping the two copies agreeing, and this leaf
    // declined the second copy. Both plugin-layer files were deleted on
    // 2026-08-16 with the guard settings that were the layer's only reason to
    // exist, so the property is now structural rather than declared — and it is
    // asserted as an absence, because reinstating either file is the obvious
    // way to give the default a "documented" home and would put the number in
    // two places again.
    for (const rel of DELETED_PLUGIN_CONFIGS) {
      expect(
        existsSync(join(pluginRoot, rel)),
        `${rel} is back. The Turn budget's default lives in ${CONFIG_TS} DEFAULTS alone, so ` +
          `that there is exactly one number to change and no second one to fall out of step ` +
          `with it — and a shipped JSON layer is where the second copy has always gone.${REMEDY}`,
      ).toBe(false);
    }
  });

  it("is documented in the seeded template, which is how a project finds the key", () => {
    // A configurable value nobody can discover is configurable in theory. The
    // template is the file `/fusion:setup` puts in front of a project owner.
    for (const rel of DOCUMENTED_IN) {
      const parsed = JSON.parse(read(rel)) as Record<string, unknown>;
      const note = String(parsed._turnBudget ?? "");
      expect(
        note,
        `${rel} must carry a _turnBudget note naming the key, or a project owner has no way to ` +
          `learn the budget is theirs to set.${REMEDY}`,
      ).toContain("maxTurns");
      expect(note).toContain(HELPER);
    }
  });
});

describe("the unresolved branch claims only the bound it actually has", () => {
  // Regression guard for issue 260811-2142, filed against 61bd21f — the commit
  // that made the budget configurable. That change correctly refused to
  // substitute a number when the read fails, and then wrote beside the refusal
  // that "the loop is still bounded — the other five conditions and the Step 3e
  // convergence check all still exit it". Read against the table it pointed at,
  // that was false. `Max Turns reached` was the only MONOTONE row: the other
  // five need `created > resolved`, both counts at zero, agent errors, a
  // blocking graph, or a guard halt, and Step 3e needs an empty queue. A
  // session resolving one task and filing one issue per Turn satisfies none of
  // them and never shortens the queue, so it runs forever. The prompt stated a
  // safety property the mechanism did not have, in the file the property lives
  // in — and the branch it stated it in is the one EVERY consumer meets until
  // it next runs `fusion --update`, since that is the population that cannot
  // yet have bin/fusion-turn-budget.
  //
  // Non-vacuity, measured rather than asserted: against agents/orchestrator.md
  // as 61bd21f left it, CLAIM matched two lines (the Setup unresolved bullet
  // and the Phase-2 head) and ANCHOR appeared nowhere, so both cases below fail
  // against the text they were written against.
  //
  // Only the orchestrator is scanned. skills/setup/SKILL.md would produce zero
  // hits before and after — it cites Setup Step 2 rather than restating it, and
  // a case above already pins that citation. A second file in the loop here
  // would measure nothing, which is the standing complaint about the
  // setup-skill literal case and not a shape to copy.

  /**
   * A bound being asserted, in every shape the prompt has actually stated one.
   *
   * The first alternative is the original (issue 260811-2142): the sentence
   * `61bd21f` wrote beside its own refusal to invent a number. The other three
   * are the Rebalance-bounding section's own words, which the first shape of
   * this pattern did not reach — and that gap is what let `500f51f` close one
   * false bound claim while leaving two more standing one paragraph away
   * (issue 260811-2305).
   */
  const CLAIM =
    /\bloop is (?:still |nonetheless |nevertheless )?bounded\b|\bbounded post-action mechanics\b|\bbounds the retries\b|\bno option is allowed to loop unboundedly\b/i;

  /**
   * The state that makes every CLAIM false, and therefore the qualification a
   * line asserting one has to carry.
   *
   * One rule, not two: a bound may be stated, and it must name the answer that
   * removes it, on the same line where the reader meets the assertion. The
   * pre-fix text failed exactly that — the check-in's own bullet stated the
   * residual plainly while the two sentences asserting the opposite, 260 lines
   * away, did not. Co-location is the whole property; a qualification the
   * reader has to go and find is the defect.
   */
  const OPT_OUT = "Continue without check-ins";

  /**
   * The gate put where not every route reaches it (issue 260811-2304).
   *
   * "Every Turn boundary runs the check-in" was false: Step 3c-bis exits a Turn
   * before Step 3d, and its *Revise Artifact* answer starts the next one, so
   * the one path that creates Turns without ending them the ordinary way never
   * met the gate. The check-in now runs at Turn START, which every route that
   * creates a Turn executes. This pattern catches the old placement coming
   * back in words.
   *
   * Honest bound: it fires only on a line that also says "check-in", so the
   * prompt's several legitimate mentions of a Turn boundary (the staging check,
   * the state-write cadence, the dashboard reset) are left alone. A sentence
   * that mis-places the gate WITHOUT naming it is not reached.
   */
  const BOUNDARY_CLAIM = /\b(?:every|each|the next) Turn boundary\b/i;

  /** The name every site that points at the gate refers to it by. */
  const ANCHOR = "Unresolved-budget check-in";

  /** Numbered lines of `text` matching `pattern`, minus those `exempt` clears. */
  const offenders = (text: string, pattern: RegExp, exempt: (line: string) => boolean) =>
    text
      .split("\n")
      .map((line, i) => `${i + 1}: ${line.trim()}`)
      .filter((line) => pattern.test(line) && !exempt(line));

  it("states no bound without the answer that removes it", () => {
    const offending = offenders(read(ORCHESTRATOR), CLAIM, (line) => line.includes(OPT_OUT));
    expect(
      offending,
      `${ORCHESTRATOR} asserts a bound on the Phase-2 loop without naming "${OPT_OUT}", the ` +
        `answer that removes it. Whether the loop is bounded at all depends on the Turn budget ` +
        `resolving: unresolved, the Max-Turns row is not evaluated, and it was the only row in ` +
        `the Step 3d table guaranteed to arrive from the passage of Turns. What bounds that ` +
        `branch is the ${ANCHOR}, and the user may switch it off for the rest of the session. ` +
        `State the bound with that exception named on the same line, or do not state it. ` +
        `Issues 260811-2142, 260811-2305.`,
    ).toEqual([]);
  });

  it("does not place the check-in at a Turn boundary, which not every route reaches", () => {
    const offending = offenders(
      read(ORCHESTRATOR),
      BOUNDARY_CLAIM,
      (line) => !/check-in/i.test(line),
    );
    expect(
      offending,
      `${ORCHESTRATOR} puts the ${ANCHOR} at a Turn boundary. Not every route to a Turn ` +
        `boundary runs it: Step 3c-bis exits the Turn before Step 3d, and its *Revise Artifact* ` +
        `answer re-enters Phase 2 with a new Turn — the very path the Rebalance section named ` +
        `the check-in as bounding. The gate runs at the START of a Turn (Phase 2 step 1), which ` +
        `every route that creates a Turn executes and no route that exits the loop reaches. ` +
        `Issue 260811-2304.`,
    ).toEqual([]);
  });

  it("gives the branch the check-in gate in place of the claim", () => {
    const text = read(ORCHESTRATOR);
    expect(
      text.includes(`#### ${ANCHOR}`),
      `${ORCHESTRATOR} must define the ${ANCHOR} gate under Step 3d. Deleting the false claim ` +
        `without putting a bound where it stood leaves the unresolved branch with no exit that ` +
        `is guaranteed to arrive — the defect, minus its description. Issue 260811-2142.`,
    ).toBe(true);
    const gate = text.split(`#### ${ANCHOR}`)[1]?.split(/^#{1,4} /m)[0] ?? "";
    expect(
      /ask in chat/.test(gate) && text.includes("## How you ask the user anything"),
      `${ORCHESTRATOR} must put the question to the user as plain chat text under the ${ANCHOR} ` +
        `gate, the shape \`## How you ask the user anything\` defines for every gate in this ` +
        `prompt (a dialog tool is banned there). The count configuration could not supply is ` +
        `asked for, not invented. Issue 260824-1538.`,
    ).toBe(true);
    expect(
      text.split(ANCHOR).length - 1,
      `${ORCHESTRATOR} names the ${ANCHOR} once. Setup Step 2 is where the unresolved state is ` +
        `decided and must point at the gate; Step 3d is where it is defined. One mention means ` +
        `one of those two is missing, and a session that learns of the gate only after it needed ` +
        `it is the same defect one step later.`,
    ).toBeGreaterThan(1);
  });

  it("detects a hardcoded check-in interval, the shape the number would return in", () => {
    // The prompt scan cannot measure the interval pattern — it correctly finds
    // nothing today, and a pattern whose only evidence is an empty result is
    // indistinguishable from a broken one. So measure the detector on the
    // sentences it exists to catch, and on the counts the prompt legitimately
    // states, which it must leave alone.
    expect(budgetLiteralHits("ask again every 3 Turns unless the user says otherwise")).not.toEqual(
      [],
    );
    expect(budgetLiteralHits("continue for 4 more Turns before asking again")).not.toEqual([]);
    expect(budgetLiteralHits("emit turn_start at Turn 1, then again at Turn 2")).toEqual([]);
    expect(budgetLiteralHits("| Error cascade | 3+ agent errors in a single Turn |")).toEqual([]);
  });

  it("reaches the sentences its first shape missed, measured on them verbatim", () => {
    // The two prompt scans above pass trivially against a prompt that states
    // nothing, so a widened pattern whose only evidence is an empty result is
    // indistinguishable from a broken one — the same argument the interval case
    // above makes. Measure the detectors on the text as it was actually
    // shipped.
    const asShipped = [
      // `61bd21f`, the sentence issue 260811-2142 was filed over. The first
      // shape of CLAIM reached this one, and only this one.
      "the loop is still bounded — the other five conditions and the Step 3e convergence check all still exit it",
      // `500f51f`, agents/orchestrator.md:972 and :974 — the two the first
      // shape missed, which is why issue 260811-2305 had to be filed by hand.
      "Each option has bounded post-action mechanics. No option is allowed to loop unboundedly.",
      "every Turn boundary in such a session runs the **Unresolved-budget check-in** (Step 3d) — that is what bounds the retries, and it is where the user ends them",
    ];
    for (const line of asShipped) {
      expect(CLAIM.test(line), `CLAIM does not reach: ${line}`).toBe(true);
    }

    // Naming the opt-out on the same line is what clears a stated bound, and
    // it is the only thing that does.
    const qualified = `Each option has bounded post-action mechanics, until the user answers ${OPT_OUT}.`;
    expect(CLAIM.test(qualified)).toBe(true);
    expect(offenders(qualified, CLAIM, (line) => line.includes(OPT_OUT))).toEqual([]);

    // Prose that points at the bound without asserting it is left alone, and so
    // is the Setup instruction that forbids the claim.
    expect(CLAIM.test("(Bounding: see Rebalance bounding below.)")).toBe(false);
    expect(CLAIM.test("Never describe the loop as bounded while the budget is unresolved.")).toBe(
      false,
    );

    // The placement claim (issue 260811-2304), and the boundary mentions that
    // are not it: the staging check, the state-write cadence, the Continue
    // bullet in its fixed wording.
    const misplaced = "every Turn boundary in such a session runs the Unresolved-budget check-in";
    expect(offenders(misplaced, BOUNDARY_CLAIM, (l) => !/check-in/i.test(l))).not.toEqual([]);
    for (const line of [
      "a plain Turn boundary is no longer a write point at all",
      "This is the Turn boundary the acceptance for issue 260811-0114 names",
      "run another Turn, and ask again at the start of the next Turn",
    ]) {
      expect(offenders(line, BOUNDARY_CLAIM, (l) => !/check-in/i.test(l)), line).toEqual([]);
    }
  });
});
