# Coder — the cut in the rule file, sized to what steps 2 and 3 spent

**Date:** 2026-08-21
**Agent:** coder
**Circle:** circles/260821-1042-reply-bounded-whole-question-answered
**Plan step:** 5 of `circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_*_plan-reply-bounded-whole-question-answered.md`
**Status:** Complete

## What was asked

Cut duplicated worked material from `rules/user-facing-output.md` until the file's net
delta against HEAD `e764637` (20 144 bytes) is zero or less. Steps 2 and 3 had spent
+1 023, leaving the file at 21 167.

## Result

| Measurement | Command | Value |
|---|---|---|
| HEAD `e764637` | `git show e764637:rules/user-facing-output.md \| wc -c` | 20 144 |
| Before this step | `wc -c rules/user-facing-output.md` | 21 167 |
| After this step | `wc -c rules/user-facing-output.md` | 20 060 |

Net delta against HEAD: **−84 bytes**. Acceptance met (at most 20 144).

## What was cut, and why each was a duplicate rather than the thing itself

**1. The "recurring offender" block, lines 34–45 at HEAD, 948 bytes.** The plan's third
candidate, spent in full. Three independent copies of it survive the cut:

- The before/after pair itself is the chat profile's own foot `examples:` block. In
  `stilwerk/chat-voice-de.yaml:175-181` it is the **identical German text**, word for
  word; `stilwerk/chat-voice-en.yaml:173-180` carries the English translation of the
  same pair. Verified by reading both files.
- The *statement* of the pattern is duplicated **inside this same file**, thirty lines
  down, at `## Self-review before sending` point 2: "The telegraphic-with-parentheses
  pattern (clause, jargon aside, clause, compressed reason, all in one breath) is the
  single most common offender." That is the operative copy, because point 2 is a check
  the writer runs on a draft rather than a description.
- The failure mode is demonstrated a second and sharper time by
  `### Canonical anti-example (a real failure)`, which the step forbids cutting and which
  is kept.

The in-file duplication is what decided this candidate over the others. C06, as step 4
just extended it, now reads "one formulation per claim: saying a claim twice does not
make it truer." A rule file that states a claim twice while carrying that clause fails
its own new rule.

**One clause of the removed block was not a duplicate and was preserved rather than
dropped:** the surface where the pattern occurs. Line 34 said it "shows up most in gate
prompts and `AskUserQuestion` option text", and nothing else in the rule file said so
(AI02 in the profile does, but a profile can be absent from a workbench). It was appended
to `## Self-review before sending` point 2 at a cost of **+71 bytes**, which is counted
in the net figure above. This is preservation of a non-duplicated fact, not relocation to
satisfy a count.

**2. The `One name per thing` worked example under `## Vocabulary`, 584 bytes at HEAD,
trimmed rather than removed.** Its `uif-framework.yaml` illustration is duplicated
verbatim in C06 of both chat profiles, and step 4 additionally gave C06 its own
before/after `examples:` block, so the illustration now stands three times. The principle
is kept, together with a compressed form of the "state the synonyms once" concession —
dropping that concession entirely would have made the rule file **stricter** than C06,
which grants it, and a rule stricter than the profile it governs is a conflict rather
than a cut. Saving: **252 bytes**.

## The candidate that was NOT spent, and why

The plan's **first** candidate was the sketch worked example and its legend
(lines 52–62, 639 bytes), on the reasoning that chat entry C05 carries the same sketch.
That reasoning was written before step 4 ran, and step 4 changed it. C05 today reads:

    instruction: |
      For a structure, prefer a small ASCII sketch to prose. The rule is in
      rules/user-facing-output.md, "## Sketch structure instead of narrating it".

C05 no longer states the rule — it **points at this file's section for it**, and carries
only a four-line reduction of the sketch with half the legend. Step 4 therefore made
`## Sketch structure instead of narrating it` the sole authoring home of the sketch
statement. Cutting its worked example in the same Circle would leave a pointer aimed at
prose that demonstrates nothing, and the fuller demonstration would survive only in a
file that step 4's own reasoning says can be absent from a workbench. That is the
"removes the thing rather than the duplicate" case, so the candidate was left unspent.

Candidates 4 (`### Example 2: activation confirmation`, 760 bytes) and 5
(`### Example 1: session report`, 1 420 bytes) were not needed and are kept intact. Example 1
is the one place the file demonstrates the history-file link that steps 2 and 3 depend
on, and it survives unchanged.

## Constraints held

- **`### Canonical anti-example (a real failure)` is untouched.**
- **No heading was renamed, added or removed.** Verified:
  `diff <(git show e764637:rules/user-facing-output.md | grep '^#') <(grep '^#' rules/user-facing-output.md)`
  reports no difference.
- **The voice profiles were not touched.** Step 4's budget is separate and neither budget
  paid the other.
- **No whole-tree git command was run.** The only git commands were single-path
  `git show e764637:<path>` reads and `git diff <path>` / `git status --short`.

## The citation pin did not move

`hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE` stands unchanged at
`{ paths: 1258, anchors: 163, records: 116 }`, and its `toEqual` assertion passed on the
edited tree. Neither cut block contained a token of any of the three classes: no
`PLUGIN_PATH_BODY`-shaped path (`uif-framework.yaml` carries no plugin-directory prefix,
so the scanner never sees it), no adjacent `` `file.md` `## Section` `` anchor, and no
workbench record citation. The 71 preserved bytes added `` `AskUserQuestion` ``, which is
not path-shaped. **No attribution comment was owed and none was written**, so none of the
hook test suite's 11 lines of head-room was spent. That was the tight bound named in the
dispatch and it is untouched: the suite still measures 20 360 lines across
`hooks/lib/__tests__/**.ts`.

## Golden regenerated

One golden moved, `hooks/lib/__tests__/fixtures/rules-emission.golden`, regenerated the
way its own header prescribes:

    cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts

which rewrote the fixture and failed on purpose, followed by a run without the flag.
The diff was read before acceptance. It is one substitution repeated across all fifteen
agent blocks, `user-facing-output.md 20144` → `20060`, with each block's `total` down by
the same 84. No agent gained or lost a rule file and no other file's size moved.
`RULE_BASELINE` was **not** touched: this step shrinks the corpus, and a baseline never
moves for a shrink.

`hooks/lib/__tests__/fixtures/surface-growth.golden` was already modified in the working
tree by an earlier step and was not touched here — it records `agents/`, `skills/` and the
hook test suite, none of which this step edits.

The always-on total for an agent drawing no conditional rule now stands at **94 982
bytes** against the 86 573 floor and the 98 573 budget, which is 84 below where HEAD
`e764637` stood.

## Verification

    cd hooks && npm test    → exit 0
    Test Files  40 passed (40)
    Tests  718 passed (718)

`bin/fusion-prose-metric rules/user-facing-output.md` reports 1 em-dash over 2 634 prose
words, rate 0.4 against a permit of 2, verdict ok.

## What this step does not claim

The cut is a byte measurement and nothing more. Whether the clauses steps 2 and 3 landed
change a reply is not observed here, and this step took no reading of that.

## Files changed

- `/Users/k1/Projects/productive/fusion/rules/user-facing-output.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/rules-emission.golden`
