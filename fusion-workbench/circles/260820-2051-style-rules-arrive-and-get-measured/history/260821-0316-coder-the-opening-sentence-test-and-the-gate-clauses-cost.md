# The opening-sentence test lands, and the gate clauses state their cost

**Agent:** coder
**Date:** 2026-08-21 03:16
**Circle:** `circles/260820-2051-style-rules-arrive-and-get-measured`
**Plan:** `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2324_*_plan-style-rules-arrive-and-get-measured.md`, steps 13 and 14
**Status:** Complete

## What was done

Four hunks in one file, `rules/user-facing-output.md`, kept separable so the two steps commit apart. Two hunks belong to step 13 and two to step 14. No heading was renamed, no existing cap was relaxed, and no gate or check was built.

### Step 13, two hunks

**Hunk A, `## Self-review before sending: the readability gate`, point 1.** The fact-first requirement gains its failure condition in one sentence: an opening sentence fails when the fact it stands in for was available to the writer and the sentence names the significance of that fact instead of the fact. Two sentences follow it. One says the writer holds what decides the case and nothing outside the writer can check it, which is the decidability position `## Constraints` of the spec requires and is also why no check is proposed. The other says the factual form is usually no longer than the form it replaces, so the clause is not licence against `## Length`. The demonstration is one `Not X → Y` sub-bullet in the form the neighbouring clauses in `## Vocabulary` and `## Questions and gates` already use.

**Hunk B, `## Style anti-patterns apply to everything`, after "Answer, don't validate".** The correctio test from recommendation 3 of `shared/analyses/260816-0740-rhetorical-register-of-agent-output.md`, in one sentence: naming the rejected term earns its place when the reader would otherwise have assumed it. Two sub-bullets demonstrate it, the failing case from the analysis's own reduction and the one instance of five that earned its place. The marker pair in the second is glossed inline, because `## Vocabulary` forbids unexplained marker syntax in body prose.

**One sample of the two was used, and the reason is that the other has no recoverable fact.** The Circle record quotes two: "Schritt 8 hat etwas gefunden, das mehr wert ist als seine eigene Arbeit", whose factual form the record supplies, and "Zwei Türen, die niemand bewacht hätte", whose factual form appears nowhere in the tree. Writing an "after" for the second would have meant inventing the number it stands in for and putting the invention into a normative file as a worked example. The first sample carries the demonstration alone.

### Step 14, two hunks

**Hunk C, `## Questions and gates`.** The existing foreclosure bullet said to carry the foreclosure "on the option's own line when the gate is plain chat text", which is reading (a) of `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_*_does-a-foreclosure-clause-cost-its-own-line-and-what-caps-the-description-field.md`, the reading that record rejects. It now says "on a line of its own beneath the option". Two bullets follow: the foreclosure takes its own line and is never folded back onto the option's line to buy a line against a cap, and a plain-text gate carries at most three options. The second carries the arithmetic written out, one line of question stem plus three option lines plus three foreclosure lines, seven against the cap of eight in `## Length`, with the fourth-option escape the record names.

**Hunk D, `## Length`.** A new bullet caps the `AskUserQuestion` option `description` field at 2 lines. It is an addition to the section, not a relaxation of anything in it: every existing number stands unchanged.

## Measurements

`bin/fusion-prose-metric` is the authority for the prose figures, the regenerated golden fixture for the bytes.

| | Before | After |
|---|---|---|
| `rules/user-facing-output.md`, em-dash | 1 mark in 2 248 words, permit 2 | 1 mark in 2 577 words, permit 2 |
| `rules/user-facing-output.md`, bytes | 18 205 | 20 144 |
| always-on core emitted | 93 068 | 95 007 |
| always-on head-room | 5 505 | 3 566 |

The one mark is unchanged and unchanged in place: it sits inside the canonical anti-example, which is an exhibit rather than prose. None of the four hunks carries an em-dash. Verified by `grep -n "—" rules/user-facing-output.md`, which returns five lines and none of them is a line this pass wrote.

**The 1 939 bytes split 1 091 to step 13 and 848 to step 14.** The core baseline is 86 573 with a 12 000-byte budget, so the bound stands at 98 573 and the pass leaves 3 566 of it. `RULE_BASELINE` was not touched. `hooks/lib/__tests__/fixtures/rules-emission.golden` was regenerated with `UPDATE_RULES_GOLDEN=1` and the diff moves one filename on every agent's block, `user-facing-output.md` and each block's total, which is what a single-file edit should move and nothing else.

## Verification

`cd hooks && npm test`, exit 0, 40 files and 718 tests passed. `npx vitest run lib/__tests__/rules-emission-golden.test.ts` green on its own beforehand.

## What was not done

No check, no lint, no test asserts either clause. The answered decision `shared/decisions/260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md` makes the measurement a precondition for the gate question, and this Circle registers the measurement without having run it. Both clauses are writer-applied tests.

Nothing was committed. The two steps are separable by hunk, and the commit split is the orchestrator's.
