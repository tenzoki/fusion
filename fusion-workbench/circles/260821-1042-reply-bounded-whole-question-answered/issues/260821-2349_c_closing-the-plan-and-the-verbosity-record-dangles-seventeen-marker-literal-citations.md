Closing the plan and the verbosity record dangles seventeen marker-literal citations, and the gate goes red

---

**Severity:** Medium. Nothing is red today. It goes red the moment either marker moves, which is
the next act this Circle's closure needs, and the person who meets the failure will not be the
person who wrote the citations.
**Domain:** code
**Filed by:** reconciler, final pass on `260821-1042-reply-bounded-whole-question-answered`
at HEAD `9a68760`
**Affects:** `260821-1805_*_plan-reply-bounded-whole-question-answered.md`,
`260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`
**Cross-references:** `260815-1913_*_closing-the-plan-dangles-thirty-four-workbench-citations-that-spell-its-open-marker.md`
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

- `260821-2004_*_what-happens-to-the-directive-when-the-plan-a-circle-runs-on-deliberately-does-not-state-one.md`
- `260821-2204_*_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md`
- `260821-2206_*_the-german-voice-profiles-name-en-dash-as-the-character-to-avoid-while-every-other-surface-counts-em-dash.md`
- `260821-2207_*_the-rules-inventory-of-the-chat-profile-names-eight-of-nine-blacklist-entries-and-four-of-six-whitelist-entries.md` (two tokens)
- `260810-1820_*_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md`

The remaining ten are in history files, analyses and the two review files, which the gate's
predicates do not cover. They dangle for a reader without reddening anything.

**The verbosity record.** `260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`
is the record this Circle was cut to close. Two citations spell its `_o_` marker literally, both in
`260820-2249_*_spec-style-rules-arrive-and-get-measured.md`,
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

---
Resolved: coder, 2026-08-22. The plan's half only. Measured fresh rather than worked from the list
above, which had gone stale in both directions: sixteen occurrences of the plan's `_o_` marker stood
across sixteen markdown files, one of them added after this record was filed.

**Fourteen were pointers and were rewritten to `_*_`** per `rules/fusion-workbench-conventions.md`
`## Marker globs`, marker position only — one live decision, one open issue, two shared open issues
(three tokens), six history logs, one analysis (two tokens) and one review (two tokens). Example:
the `**Task:** Step 4 of …` line at `.../260821-2132-ontocoder-two-register-habits-in-four-profile-files.md:6`.

**Two were statements and keep their content.** Both are the coderev self-report about a `sed -i ''`
run whose whole subject is which literal substitution the command could have made, so a star would
have made the sentence read as a substitution of a token for itself. They were treated differently
because the corpus predicate reaches one and not the other. The review copy
(`.../260821-2215-coderev-the-bounded-reply-circle.md:96`) is out of the gate's corpus and
stands verbatim. The copy at `260810-1820_*_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md:81`
is an open shared issue and therefore judged, so it was rewritten in prose — it now names the marker
position and the two markers without spelling an address, which is the first of the two remedies the
gate's own failure message prescribes.

**Then the rename**, `git mv` `_o_` → `_c_` on the plan, and
`cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts` exits 0 after it.
`cd hooks && npm test` exits 0 as well.

**Three machine-written state files were left alone** and still spell `_o_`:
`agentstate.yaml:65` (`plan_file:`), `orchestrator-events.jsonl:1861` and `.guard-state/events.jsonl`
(five rows). The two logs are append-only records of what was true when the line was written and
must not be rewritten; `agentstate.yaml` is the orchestrator's own live state and its `plan_file`
now points at a path that no longer exists, which is the orchestrator's to correct and is named here
so it is not lost.

**The verbosity record's half was deliberately withheld.**
`260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`
keeps `_o_`, and its two citations in
`260820-2249_*_spec-style-rules-arrive-and-get-measured.md`
were not touched, because they dangle only if that marker moves and it did not. The reason is not
mechanical: the record's rule-text half is closed and verified, but nobody has observed whether a
reply actually changed, and the after-measurement that would answer it is defined and deliberately
not run. Closing it would assert something no one has checked. So this record is discharged for the
plan and open in substance for the verbosity record — do not read the closed marker as covering both.
