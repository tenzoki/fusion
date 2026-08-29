# The `**Status:**` field leaves the decision-record template

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-19
**Store:** shared (no active Circle)

---

## Task

Task T2 — realise decision
`260818-2212_*_should-the-decision-records-status-field-exist-at-all-now-that-the-circle-records-has-been-removed.md`,
answered option 1 by the user on 2026-08-18: the `**Status:**` head field leaves the
decision-record template and the filename marker becomes the only source of a decision
record's state. The change surface the record names is two rule files, and the measurement
it was decided on is 39 of 94 records carrying a header naming a state their marker does
not.

## What was done

1. `rules/fusion-workbench-conventions.md` `## Decision Record Template` — the
   `**Status:** open | answered | implemented | deferred | superseded` line removed from
   the template body.
2. `rules/decision-record-examples.md` — the `**Status:** open` line removed from Example
   1's record head.
3. The full statement of *why* the field is gone was placed once, in the conventions file
   directly under the template, in the register of the Circle precedent's paragraph
   (`agents/orchestrator.md` `## Circle head fields`, the paragraph opening "There is no
   `Status:` head field"). It carries the three things the decision requires and nothing
   else: the marker is the state and the only source; the field was a hand-maintained
   second copy that drifted, with the 39-of-94 measurement and the six-day/three-correction
   ratio; and the position on existing records — a record written before the removal keeps
   the field, leave it exactly as it stands, because hand-correcting a record you are not
   transitioning destroys the evidence the removal was decided on. It closes with the
   binding-decision citation, the form this file uses for every other normative statement
   in it.
4. `rules/decision-record-examples.md` carries a one-sentence pointer at that statement
   rather than a second copy of it.

## What was deliberately not touched

- `## State Markers — decisions` and `### Decision files` (`## Inline State Tracking`) were
  read in full. Neither says anything about the head field — both are entirely about the
  marker vocabulary and the `Answered:` / `Implemented:` / `Deferred:` / `Superseded by:`
  footers — so the removal makes nothing in them false and neither was edited.
- The four other artifact kinds sharing the field name (session histories, plans, analyses,
  consultations) are untouched. Every edit was scoped by artifact kind, never by the string:
  the `**Status:** Complete` instruction for planning files two sections above the template
  stands unchanged, and this very history file carries a `**Status:**` head of its own.
- The template's footer placeholders still read `<set when status moves to _a_>`. Left as
  they stand: `_a_` is a marker value, not a value the removed field ever took, so the
  sentence names the marker and stays true.
- No workbench file was rewritten. The decision record keeps its `_a_` marker and its own
  `**Status:** open` line; the marker transition is the orchestrator's.

## One finding for the orchestrator, not acted on

`rules/fusion-workbench-conventions.md` `## Project language` carries a sentence about head
labels: "A label defined in a shipped template — the plan head's `**Decidability:**`, a
record's `**Status:**` and `**Domain:**` — is English in every project". After this removal
and the Circle one before it, no *record* kind has a `**Status:**` field any more, so that
example now names a pairing that no longer exists. The sentence is not strictly false — the
label is still defined in shipped templates for plans, histories, analyses and
consultations, and "record" can be read loosely as "artifact record" — which is why it was
left alone rather than edited under a task whose change surface the decision states
precisely. It is worth a one-line correction in some later pass.

## Verification

    cd hooks && npx vitest run   — exit 0 (36 files, 672 tests)

Two generated fixtures were regenerated, each by the documented flag run in its own test
file's header, and each diff was read:

- `hooks/lib/__tests__/fixtures/rules-emission.golden` — the always-on rule set moved
  95 458 -> 96 277 bytes per dispatch for the widest role. `fusion-workbench-conventions.md`
  54 688 -> 55 276 and `decision-record-examples.md` 4 291 -> 4 522. **This task added 819
  bytes rather than removing them**, against the expectation stated in the dispatch. The two
  are not reconcilable as the task is specified: the removal itself takes 81 bytes off, and
  the statement the decision requires — three facts, a measurement and a citation, in two
  files — cannot be written in 81. The addition is one paragraph plus one sentence, both
  already cut once for length after the first measurement. Well inside the 12 000-byte
  growth budget, so nothing is red.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` — hook-tests 18 428 -> 18 444 lines,
  entirely the 16-line re-approval note below. 569 lines of the 2 500-line head-room used.

`hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE` was re-approved,
`{ paths: 1152, anchors: 148, records: 101 }` -> `{ paths: 1152, anchors: 149, records: 102 }`,
with the note the file's own convention requires. The two contributions were measured per
file by reverting each changed rule file in turn and rerunning the gate: the anchor is the
examples file's `## Decision Record Template` citation, the record is the conventions file's
binding-decision citation, and they sum exactly with no interaction. The note also records
the two absences a later reader would misread as an error — the examples file contributes
zero records because it is a `RECORD_EXAMPLE_FILES` entry and exempt from class (c)
wholesale, and its bare-basename citation of the conventions file is no class-(a) token, so
paths did not move while a file was named.

## Files changed

- `rules/fusion-workbench-conventions.md`
- `rules/decision-record-examples.md`
- `hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `hooks/lib/__tests__/fixtures/rules-emission.golden` (generated)
- `hooks/lib/__tests__/fixtures/surface-growth.golden` (generated)
