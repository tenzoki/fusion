Closing the plan and the verbosity record dangles seventeen marker-literal citations, and the gate goes red

---

**Severity:** Medium. Nothing is red today. It goes red the moment either marker moves, which is
the next act this Circle's closure needs, and the person who meets the failure will not be the
person who wrote the citations.
**Domain:** code
**Filed by:** reconciler, final pass on `circles/260821-1042-reply-bounded-whole-question-answered`
at HEAD `9a68760`
**Affects:** `circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_*_plan-reply-bounded-whole-question-answered.md`,
`shared/issues/260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`
**Cross-references:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1913_*_closing-the-plan-dangles-thirty-four-workbench-citations-that-spell-its-open-marker.md`
is the same class, filed against a different Circle's closure and never closed;
`rules/fusion-workbench-conventions.md` `## Marker globs` states the `_*_` citation form this
repairs to.

## What is wrong

Two markers are owed a move at this Circle's closure and neither can be taken alone.

**The plan.** All six steps carry `[DONE]` and all six executor logs carry `**Status:** Complete`,
so `rules/fusion-workbench-conventions.md` `## Inline State Tracking` owes it `_o_` to `_c_`.
Fifteen citations across twelve workbench files spell its `_o_` marker literally. Five of those
sit inside the corpus `hooks/lib/__tests__/workbench-citation-lint.test.ts` recomputes from the
tree on every run, so they are judged rather than merely wrong:

- `circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-2004_*_what-happens-to-the-directive-when-the-plan-a-circle-runs-on-deliberately-does-not-state-one.md`
- `circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2204_*_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md`
- `shared/issues/260821-2206_*_the-german-voice-profiles-name-en-dash-as-the-character-to-avoid-while-every-other-surface-counts-em-dash.md`
- `shared/issues/260821-2207_*_the-rules-inventory-of-the-chat-profile-names-eight-of-nine-blacklist-entries-and-four-of-six-whitelist-entries.md` (two tokens)
- `shared/issues/260810-1820_*_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md`

The remaining ten are in history files, analyses and the two review files, which the gate's
predicates do not cover. They dangle for a reader without reddening anything.

**The verbosity record.** `shared/issues/260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`
is the record this Circle was cut to close. Two citations spell its `_o_` marker literally, both in
`circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2249_*_spec-style-rules-arrive-and-get-measured.md`,
which carries `_o_` and is therefore an in-corpus spec even though its Circle is closed.

## How it was measured

Each marker was renamed in the working tree, `npx vitest run
lib/__tests__/workbench-citation-lint.test.ts` was run from `hooks/`, and the rename was reverted.
Both runs failed with `stale marker '_o_': the record now exists as …` and named exactly the files
listed above. The tree was left clean. This is not inference from the gate's documentation; it is
the gate's own output on the two moves in question.

## Why it is worth a record rather than a note in a log

`hooks/lib/__tests__/workbench-citation-lint.test.ts` carries no approvable baseline by decision, so
there is nothing an author meeting the red run can edit except the citations. Its own header states
the accepted cost: a newly filed record with a bad citation turns `npm test` red for somebody who
touched no citation. Here the trigger is not a bad citation but a correct marker move, and the
person who runs into it is whoever next tries to close the plan. Without this record they meet
seventeen failures with no statement of what caused them.

## What to do

Repair first, rename second, and the repair is mechanical: rewrite the marker position as `_*_` in
each citing line, per `rules/fusion-workbench-conventions.md` `## Marker globs`. The five in-corpus
citations of the plan and the two of the verbosity record are what the gate requires; the ten in
history files, analyses and reviews are worth taking in the same pass, because a history file is
frozen by convention and will still be read.

Do not repair by widening the gate's corpus or by excluding a store. The gate's own header says an
exclusion is not a way to make it green, and the asymmetry is intentional.

**One thing this record does not decide.** Whether the verbosity record may be called closed at all
is a separate question, argued in the reconciliation appended to it on 2026-08-21. This record is
about what the move costs mechanically, not about whether it is earned.
