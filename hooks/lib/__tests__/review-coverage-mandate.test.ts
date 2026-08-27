/**
 * The review file's header must be readable, and the orchestrator must read it
 * (shared/issues/260810-1205_o_seven-of-sixteen-commits-in-the-session-range-
 * never-reached-a-review-pass-and-nothing-measures-the-gap.md).
 *
 * ## The defect
 *
 * Sixteen commits landed in `18b6094..ed87d87`. Two `coderev` passes ran, their
 * ranges did not tile the session's range, and seven code-bearing commits
 * reached HEAD and a pushed release tag with no reviewer having opened them.
 * The session reported ONE, because it measured the gap against the last Turn.
 *
 * The data to tile it was already on disk and unreadable. Ten `coderev` files in
 * one store stated their scope in four spellings — `**Range:**`, `**Scope:**`,
 * `**Scope reviewed:**`, `**Scope as dispatched:**` — several stated none, and
 * of the filenames that carried a range, two ended in `-to-head`, which names a
 * different commit every day it is read. There is no cleverer parse: the
 * producer either records the range in one form or the information is not
 * recoverable (`rules/critical-stance.md` §4). Hence a mandate, and hence this
 * gate on the mandate — the same shape the work queue's `**Active Circle:**`
 * head line was gated in until that queue left the plugin on 2026-08-15, and
 * for the same reason.
 *
 * ## What this gate does, and it is three things
 *
 *   1. It asserts the MANDATE is in `rules/review-contract.md` — the field names
 *      spelled as `lib/review-coverage.ts` reads them, the resolved-hash
 *      requirement, the refusal of `HEAD`, and the `none` spelling stated for
 *      the pass that opened everything. Until 2026-08-22 the mandate stood in
 *      both reviewer prompts and this gate held the two copies equal; the
 *      contract now has one authoring home, so what it checks instead is that
 *      each prompt still cites it and that `bin/fusion-rules` still emits it to
 *      exactly those two agents.
 *   2. It RUNS the real parser over the header lines taken OUT OF that contract,
 *      never transcribed. A spelling the contract shows that
 *      `lib/review-coverage.ts` cannot read fails here, at `npm test`, rather
 *      than at a session whose coverage silently computes to nothing.
 *   3. It asserts the CONSUMER still consumes it — `agents/orchestrator.md`
 *      Step 3c widening the dispatch scope by the carried list, Phase 4 naming
 *      the gap commit by commit, and both call points naming the helper.
 *
 * ## What it is not (`rules/critical-stance.md` §3)
 *
 * Proof that a reviewer run wrote the fields. Nothing here executes at session
 * time. A pass that skips them produces a review the helper reports `UNUSABLE`
 * by name with the reason, and whose commits stay in the uncovered list — loud
 * instead of quiet, which is the improvement rather than a guarantee. The
 * measurement itself is under test in `review-coverage.test.ts`, against real
 * repositories; this file reads text and can only check the contract.
 *
 * The negative controls call the SAME assertion helpers as the cases above
 * them, with a fixture in place of the real file — never a re-implementation of
 * what they claim to test.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import {
  NOT_OPENED_FIELD,
  RANGE_FIELD,
  REVIEW_SENDERS,
  parseNotOpened,
  parseRange,
} from "../review-coverage.js";

const read = (...p: string[]) => readFileSync(join(pluginRoot, ...p), "utf-8");

/** The two prompts that write review files, and therefore reach the mandate. */
const REVIEWER_PROMPTS = ["coderev.md", "ontorev.md"] as const;

/**
 * The mandate's single authoring home since 2026-08-22. It stood in both
 * prompts, byte for byte, with no pointer between the copies; `bin/fusion-rules`
 * now emits this file to those two agents and to nobody else, so what the two
 * reviewers read at Setup is one text rather than two that have to be kept
 * equal. Everything `mandateGaps` and the parser cases below assert is asserted
 * here — the prompts are checked only for the pointer that reaches it.
 */
const CONTRACT = "rules/review-contract.md";
const contract = () => read("rules", "review-contract.md");

const orchestrator = () => read("agents", "orchestrator.md");

/* ------------------------------------------------------------------ *
 * The assertions, each taking its input, so a control can drive them
 * ------------------------------------------------------------------ */

/** Every line of a prompt that is a `**Field:** …` header line for `field`. */
function fieldLines(text: string, field: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith(field))
    .map((l) => l.slice(field.length).trim());
}

/**
 * The mandate's own text obligations, as a list of what is missing.
 *
 * Returned rather than asserted so a negative control can drive it with a
 * fixture and see the same list come back non-empty.
 */
function mandateGaps(text: string): string[] {
  const gaps: string[] = [];
  if (!text.includes(RANGE_FIELD)) gaps.push(`no ${RANGE_FIELD} field`);
  if (!text.includes(NOT_OPENED_FIELD)) gaps.push(`no ${NOT_OPENED_FIELD} field`);
  if (!/resolved short hashes/i.test(text)) gaps.push("the resolved-hash requirement is not stated");
  if (!/never `HEAD`/i.test(text)) gaps.push("`HEAD` is not refused");
  // Issue 260811-1147: the placement used to read "beside `**Sender:**`", a
  // field no prompt defines, so a reviewer had to invent either the field or the
  // position. The rule has to resolve against something the file itself shows,
  // and it has to be the one `headerField` implements.
  if (!/first `##` heading/.test(text)) gaps.push("the header block's end is not stated");
  if (/beside `\*\*Sender:\*\*`/.test(text)) {
    gaps.push("the placement anchors on `**Sender:**`, which no prompt defines");
  }
  if (!fieldLines(text, NOT_OPENED_FIELD).some((v) => /^none\b/i.test(v))) {
    gaps.push("the `none` spelling is not shown");
  }
  if (!/bin\/fusion-review-coverage/.test(text)) {
    gaps.push("the helper that reads the fields is not named");
  }
  return gaps;
}

/** What the consumer must still do with the fields, as a list of what is missing. */
function consumerGaps(text: string): string[] {
  const gaps: string[] = [];
  if (!/bin\/fusion-review-coverage/.test(text)) gaps.push("the helper is never run");
  if (!/carried=/.test(text)) gaps.push("the carried out-of-scope list is never read");
  if (!/## Review coverage/.test(text)) gaps.push("the session summary has no review-coverage section");
  if (!/commit by commit/i.test(text)) gaps.push("the gap is not required to be named commit by commit");
  if (!/uncovered <hash>|uncovered `<hash>`/.test(text)) {
    gaps.push("the per-commit output line is not quoted, so nothing binds the section to the helper");
  }
  return gaps;
}

/* ------------------------------------------------------------------ *
 * 1. The mandate is in both reviewer prompts
 * ------------------------------------------------------------------ */

describe("review-coverage mandate: the producers", () => {
  it(`${CONTRACT} mandates both fields, in the spellings the parser reads`, () => {
    expect(
      mandateGaps(contract()),
      `${CONTRACT} stopped mandating part of the review header. Issue 260810-1205: ` +
        "without these fields nothing can tile the reviewed ranges against the range, and " +
        "seven commits reached a pushed tag unread while the session reported one.",
    ).toEqual([]);
  });

  it("both prompts reach the mandate, and bin/fusion-rules delivers it to both", () => {
    // One authoring home replaces the drift check two copies needed. What has
    // to hold instead is that each reviewer still gets there: the prompt names
    // the file, and the emission arm names the agent.
    for (const prompt of REVIEWER_PROMPTS) {
      expect(
        read("agents", prompt),
        `agents/${prompt} no longer cites ${CONTRACT}, so the reviewer is told nothing ` +
          "about the header its coverage is tiled from.",
      ).toContain(CONTRACT);
    }
    const helper = read("bin", "fusion-rules");
    expect(helper).toContain('emit_if_exists "$PLUGIN_RULES_DIR/review-contract.md"');
    expect(
      /coderev\|ontorev\)\s*IS_REVIEWER_AGENT=1/.test(helper),
      "bin/fusion-rules stopped emitting review-contract.md to exactly coderev and " +
        "ontorev. An agent that writes review files without the contract writes a " +
        "header the coverage check reports UNUSABLE.",
    ).toBe(true);
  });

  // Issue 260811-1145: `REVIEWER_PROMPTS` above already fixed the mandate at two
  // prompts and nothing carried that fact into the scan or the trigger. One
  // constant both consumers reach makes a fourth sender somebody's decision.
  it("the recognised sender set is those same two prompts, and both sides read it", () => {
    expect([...REVIEW_SENDERS].sort()).toEqual(
      REVIEWER_PROMPTS.map((p) => p.replace(/\.md$/, "")).sort(),
    );

    const tracker = read("hooks", "tracker.ts");
    expect(
      tracker,
      "hooks/tracker.ts stopped reading the shared population test, so its " +
        "trigger can drift wider than the scan it fires.",
    ).toContain("isMeasuredReview");
    expect(
      /["']coderev["']|["']ontorev["']/.test(tracker),
      "hooks/tracker.ts names a sender literally. Two literals is the silent " +
        "widening this constant exists to prevent.",
    ).toBe(false);
  });

  it("catches a contract that dropped the mandate — the control for the two cases above", () => {
    const gutted = contract().split(RANGE_FIELD).join("**Range:**");
    expect(
      mandateGaps(gutted),
      "renaming the mandated field to the old `**Range:**` spelling passed the gate. " +
        "That is the exact spelling four of the ten unreadable files used.",
    ).not.toEqual([]);
  });
});

/* ------------------------------------------------------------------ *
 * 2. The parser reads what the prompts show — the two sides, bound
 * ------------------------------------------------------------------ */

describe("review-coverage mandate: the contract's own lines, through the real parser", () => {
  it(`every filled **Reviewed-range:** line in ${CONTRACT} parses`, () => {
    const lines = fieldLines(contract(), RANGE_FIELD)
      // The template line carries placeholders rather than hashes; the worked
      // examples beside it are what a reviewer copies, and those must parse.
      .filter((v) => !v.includes("<"));

    expect(
      lines.length,
      `${CONTRACT} shows no worked **Reviewed-range:** example. The template ` +
        "line alone leaves the hash form to be inferred, which is how four spellings " +
        "arose the first time.",
    ).toBeGreaterThan(0);

    for (const value of lines) {
      const parsed = parseRange(value);
      expect(
        parsed.why,
        `${CONTRACT} shows \`${RANGE_FIELD} ${value}\`, which lib/review-coverage.ts ` +
          `refuses: ${parsed.why}. A reviewer copying the contract would produce a file ` +
          "the coverage check reports UNUSABLE.",
      ).toBe("");
    }
  });

  it(`every **Not-opened:** line in ${CONTRACT} parses to what it says`, () => {
    const lines = fieldLines(contract(), NOT_OPENED_FIELD);
    expect(lines.length).toBeGreaterThan(0);

    for (const value of lines) {
      const parsed = parseNotOpened(value);
      expect(
        parsed.recorded,
        `${CONTRACT} shows \`${NOT_OPENED_FIELD} ${value}\` and the parser read it ` +
          "as no record at all. A declared exclusion that reads as an absent field is " +
          "the defect: the reviewer stated it and nothing downstream carried it.",
      ).toBe(true);

      if (/^none\b/i.test(value)) {
        expect(parsed.files).toEqual([]);
      } else {
        expect(parsed.files.length).toBeGreaterThan(0);
      }
    }
  });

  it("refuses the two forms the real review files actually carried", () => {
    // `-to-head`: two of the ten filenames. `HEAD` is whatever it means today.
    expect(parseRange("`8960e1a..HEAD`").why).not.toBe("");
    // A branch or tag has the same defect for the same reason.
    expect(parseRange("`v5.9.1..main`").why).not.toBe("");
    // And a file with no field at all is a reason, never a silent skip.
    expect(parseRange(null).why).toContain(RANGE_FIELD);
  });

  it("keeps a recorded `none` apart from an absent line", () => {
    expect(parseNotOpened("none")).toEqual({ files: [], recorded: true, raw: "" });
    expect(parseNotOpened(null)).toEqual({ files: [], recorded: false, raw: "" });
  });

  // Issue 260811-1148, in opposite directions: an exclusion opening with the
  // word `none` read as the absence of one, and a sentence the parser could not
  // read was comma-split into filenames nobody had written.
  it("does not read a declared exclusion as a declared `none`", () => {
    const parsed = parseNotOpened("none of the prompt files");
    expect(parsed.files).toEqual([]);
    expect(
      parsed.raw,
      "`none of the prompt files` states an exclusion and was recorded as there " +
        "being none — the quiet half of the defect.",
    ).toBe("none of the prompt files");
  });

  it("still accepts `none` with a gloss behind it", () => {
    expect(parseNotOpened("none — everything in the range was opened").raw).toBe("");
    expect(parseNotOpened("None.").raw).toBe("");
  });

  it("invents no filename out of a value it cannot read", () => {
    const parsed = parseNotOpened("nothing left unopened");
    expect(
      parsed.files,
      "the sentence became a file list, which is a scope, which is acted on.",
    ).toEqual([]);
    expect(parsed.raw).toBe("nothing left unopened");
    expect(parsed.recorded).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * 3. The consumer still consumes it
 * ------------------------------------------------------------------ */

describe("review-coverage mandate: the consumer", () => {
  it("agents/orchestrator.md runs the helper and acts on both of its answers", () => {
    expect(
      consumerGaps(orchestrator()),
      "the orchestrator stopped consuming the review-coverage measurement. The fields " +
        "being mandated buys nothing on its own: issue 260810-1205's second acceptance " +
        "criterion is that a reviewer's declared out-of-scope list reaches the NEXT " +
        "dispatch's scope, and its first is that the summary names the gap commit by commit.",
    ).toEqual([]);
  });

  it("the Circle review widens the dispatch scope rather than merely reporting the gap", () => {
    const step = orchestrator().split("### Step 3c: Review Coverage Read")[1]?.split("### Step 3c-bis")[0] ?? "";
    expect(step, "the Step 3c section is gone or was renamed").not.toBe("");
    expect(step).toContain("bin/fusion-review-coverage");
    expect(
      /2a\. \*\*Circle review[\s\S]*?plus the carried[\s\S]*?2b\. \*\*Read the plan/.test(orchestrator()),
      "the one dispatch left (Phase 4 step 2a, decision 260827-1120) never adds the carried out-of-scope list to its scope.",
    ).toBe(true);
  });

  it("the summary section exists and the state-file schema gained no field for it", () => {
    const text = orchestrator();
    expect(text).toContain("## Review coverage");

    // The `### Format` block is `agentstate.yaml`'s schema. Issue 260810-1205
    // names the state file as carrying no review-coverage field, and it stays
    // that way on purpose: a reviewed-through marker there would be a fifth
    // surface a session can pass a boundary without writing — the class issue
    // 260801-2038 measured freezing in six sessions out of six — answering a
    // question the review files already answer unfreezably, because writing the
    // review file IS the review.
    const schema = text.split("### Format")[1]?.split("### Write Points")[0] ?? "";
    expect(schema, "the state file's `### Format` block is gone or was renamed").not.toBe("");
    expect(
      /reviewed[_-]through|review_coverage|reviewed_range/.test(schema),
      "a review-coverage field appeared in the agentstate.yaml schema. The measurement " +
        "is derived from the review files precisely so that it cannot freeze the way the " +
        "four surfaces in issue 260801-2038 did.",
    ).toBe(false);

    // …and the choice is stated rather than left to be rediscovered.
    expect(text).toMatch(/No field for this goes into `agentstate\.yaml`/);
  });

  it("catches an orchestrator that reports the gap without acting on it — the control", () => {
    const weakened = orchestrator().split("carried=").join("(removed)");
    expect(consumerGaps(weakened)).not.toEqual([]);
  });
});
