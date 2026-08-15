import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

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
// per leaf by `hooks/lib/config.ts` from the project's `fusion-guard.json`, the
// plugin's `hooks/config.json` and the built-in `DEFAULTS`; read once per
// session by `bin/fusion-turn-budget` at Setup; carried in `agentstate.yaml`
// where `progress.max_turns` already had a home and where
// `/fusion:circle-stash` already read it as data.
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

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(join(pluginRoot, rel), "utf-8");

const ORCHESTRATOR = "agents/orchestrator.md";
const SETUP_SKILL = "skills/setup/SKILL.md";
const CONFIG_TS = "hooks/lib/config.ts";
const PLUGIN_CONFIG = "hooks/config.json";
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
  '{"orchestrator": {"maxTurns": <n>}} in that project\'s fusion-guard.json — nothing in ' +
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
        `project's fusion-guard.json over the plugin's configuration.${REMEDY}`,
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
      text.includes("Omit `progress.max_turns` from `agentstate.yaml` entirely"),
      `${ORCHESTRATOR} must say the key is OMITTED when the budget is unresolved. ` +
        `/fusion:circle-stash parses progress.max_turns with a [0-9]+ pattern ` +
        `(skills/circle-stash/SKILL.md), so a word written there is read as a garbled number, ` +
        `while an absent key is a case it already handles.`,
    ).toBe(true);
  });

  it("carries the budget in agentstate.yaml, where circle-stash already reads it", () => {
    const state = read(ORCHESTRATOR).split(/^### Format\s*$/m)[1] ?? "";
    expect(
      /^\s*max_turns:/m.test(state),
      `${ORCHESTRATOR} "### Format" must keep progress.max_turns. It is the handoff surface: ` +
        `skills/circle-stash/SKILL.md reads the budget from there rather than assuming one, ` +
        `and a resumed session reads it from there too.${REMEDY}`,
    ).toBe(true);
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

  it("is deliberately absent from the plugin's own config.json", () => {
    // Every OTHER leaf is spelled in both `hooks/config.json` and `DEFAULTS`,
    // and the loader's docstring says plainly that nothing keeps the two copies
    // agreeing. This leaf declines the second copy.
    const parsed = JSON.parse(read(PLUGIN_CONFIG)) as Record<string, unknown>;
    expect(
      parsed.orchestrator,
      `${PLUGIN_CONFIG} declares an "orchestrator" section. The Turn budget's default lives in ` +
        `${CONFIG_TS} DEFAULTS alone, so that there is exactly one number to change and no second ` +
        `one to fall out of step with it.${REMEDY}`,
    ).toBeUndefined();
  });

  it("is documented in the seeded template, which is how a project finds the key", () => {
    // A configurable value nobody can discover is configurable in theory. The
    // template is the file `/fusion:setup` puts in front of a project owner.
    for (const rel of ["templates/fusion-guard.json", "fusion-guard.json"]) {
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

  /** The claim, in the shape it took and the near ones it could return in. */
  const CLAIM = /\bloop is (?:still |nonetheless |nevertheless )?bounded\b/i;

  /** The name every site that points at the gate refers to it by. */
  const ANCHOR = "Unresolved-budget check-in";

  it("never states that the Phase-2 loop is bounded", () => {
    const offending = read(ORCHESTRATOR)
      .split("\n")
      .map((line, i) => `${i + 1}: ${line.trim()}`)
      .filter((line) => CLAIM.test(line));
    expect(
      offending,
      `${ORCHESTRATOR} states that the Phase-2 loop is bounded. Whether that holds depends on ` +
        `the Turn budget resolving: unresolved, the Max-Turns row is not evaluated, and it was ` +
        `the only row in the Step 3d table guaranteed to arrive from the passage of Turns. What ` +
        `bounds that branch is the ${ANCHOR} gate, not the remaining conditions — say that, or ` +
        `say the residual is accepted. Do not say bounded. Issue 260811-2142.`,
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
    expect(
      text.includes("AskUserQuestion"),
      `${ORCHESTRATOR} must put the question through AskUserQuestion, the way every other human ` +
        `gate in this prompt reaches the user. The count configuration could not supply is asked ` +
        `for, not invented.`,
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
});
