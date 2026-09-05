# Coder — only the orchestrator performs `_o_` → `_a_`

**Status:** Complete

**Realises:** `260905-1042_*_may-a-dispatched-agent-perform-the-open-to-answered-transition-at-all-and-under-which-bound.md` (option 1)

---

## What changed

Two places, the scope the record measured.

**`agents/reconciler.md`, the `_o_` branch of the decision-marker pass (line 132).** The bullet instructed the agent to append the `Answered:` line and rename `_o_` → `_a_`. It now moves no marker and writes nothing into the record: it surfaces the finding in the reconciliation log under an "Answered elsewhere — needs the user's ruling" heading, naming the record, the answer's location and a one-line summary, for the orchestrator to put to the user. The bullet states that only the orchestrator performs the transition and only to relay a ruling the user gave, and it keeps the old bound as a reporting threshold rather than a licence to transition: report only an answer that already exists elsewhere, record where it is rather than choosing among the options. The report shape matches the neighbouring "Misfiled — should be a decision" bullet (line 129) rather than inventing a second form. Two clarifications the surrounding text made necessary: the bullet says explicitly that no `Answered:` footer is written, because the adjacent issue rule at line 139 does instruct an annotation on a record it leaves at `_o_`; and the unanswered bullet (line 136) lost its "still", which had implied a preceding branch could move the marker.

**`rules/decision-record-examples.md`, Example 1.** The pass that finds the answer is still the reconciler's, and it now reports rather than renames; a second beat, "Orchestrator, once the user has ruled at the gate", carries the append and the rename. The `Answered:` line's citation form is untouched — `path §5` — because R2 of `260905-0529-consumer-findings-citation-form-and-decision-authority.md` holds that question open.

## What was deliberately not done

- `agents/orchestrator.md` line 401 is the path this answer preserves; untouched.
- No mechanism: no user-reserved marker, no self-citation check, no authority field. The record's cons for option 2 and its separate filing of option 3 both say why.
- `_a_` → `_i_` is unchanged in every prompt.
- `rules/fusion-workbench-conventions.md` line 364 names the rename beside the `Answered:` template but names no actor; it is the marker vocabulary and stays.

## Byte cost

`agents/reconciler.md` +507 (21 131 → 21 638). `rules/decision-record-examples.md` +200 (4 510 → 4 710). No baseline moved.

## Verification

`cd hooks && npm test` — exit 1. 823 of 825 pass. Both failures are golden-fixture staleness from these two files' own byte movement, named in the report and left unregenerated per the dispatch:

- `surface-growth-bound.test.ts` "matches the checked-in golden" — `agents` block, `reconciler.md 21131 → 21638`, total `409327 → 409836`. The bound itself passes: net growth over baseline 9 993 of 18 000 head-room.
- `rules-emission-golden.test.ts` "matches the checked-in golden" — `decision-record-examples.md 4510 → 4710` in each of the five blocks that draw the conditional emission. `RELEASE_CAP` and `DRIFT_CEILING`, the two blocking numbers, both pass; `GROWTH_BUDGET` fails nothing by construction.

`bin/fusion-prose-metric agents/reconciler.md` reads 45 em-dashes over 2 828 prose words, `over`. It was `over` at HEAD too, at 44/2 737; the new text adds one, inside the quoted log heading, where the neighbouring heading uses the same form. Reports, never gates.
