# Coder: the plan closes and three records with it

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-22
**Dispatched by:** orchestrator
**Task:** three records — repair the plan's marker-literal citations and close the plan; reconcile
two figures for one quantity in a step log; dispose of a commit-message defect that cannot be fixed
**Sources:**
`circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2349_*_closing-the-plan-and-the-verbosity-record-dangles-seventeen-marker-literal-citations.md`,
`circles/260821-1042-reply-bounded-whole-question-answered/issues/260822-0116_*_the-head-room-correction-left-two-figures-for-one-quantity-in-adjacent-clauses.md`,
`circles/260821-1042-reply-bounded-whole-question-answered/issues/260822-0116_*_commit-e202016s-message-attributes-to-a-log-a-figure-the-log-never-carried.md`

---

## Job 1: repair, then rename

**The set was measured, not taken from the record.** `grep -rn '260821-1805_o_'` over the whole
workbench returned nineteen occurrences: sixteen in markdown and three in machine-written state.
The record filed at 260821-2349 had counted fifteen across twelve files; the difference is one
markdown occurrence added after it was filed, in
`circles/260821-1042-reply-bounded-whole-question-answered/history/260822-0019-orchestrator-session.md:20`.

**Fourteen pointers were starred.** Marker position only, per
`rules/fusion-workbench-conventions.md` `## Marker globs`; stamp, slug and extension untouched. One
live decision, one open Circle issue, two shared open issues (three tokens), six history logs, one
analysis (two tokens), one review (two tokens). Applied with line-addressed `sed`, never a
tree-wide substitution, so that no statement line could be caught by accident.

**Two are statements and were not starred.** Both are the same coderev self-report, whose subject is
which literal substitution a `sed -i ''` run could have made in files another executor held. Starring
either would have made the sentence read as a substitution of a token for itself, which is the
"a star costs a statement its content" case the rule names.

They could not be treated the same way, because the citation gate's corpus reaches one and not the
other:

- `circles/260821-1042-reply-bounded-whole-question-answered/reviews/260821-2215-coderev-the-bounded-reply-circle.md:96`
  is a review. `inCorpus()` in `hooks/lib/__tests__/workbench-citation-lint.test.ts` admits Circle
  records, open issues, live decisions, live plans and `portfolio.md` — not reviews. It stands
  verbatim.
- `shared/issues/260810-1820_*_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md:81`
  is an open shared issue and therefore judged. An inline code span buys no exemption — the scanner
  exempts a fenced block and a blockquote and nothing else at that level — so a verbatim `_o_` there
  would have gone red at the rename. It was rewritten in prose: the clause now names the marker
  position and the two markers without spelling an address, which is the first of the two remedies
  the gate's own failure message prescribes and the one it calls the default.

**Then the rename**, `git mv` on the plan, `_o_` → `_c_`. Its body already read `**Status:**
Complete` with all six steps `[DONE]`, so nothing else in it was owed. The Reconciliation Log gained
one dated closure entry, because the reconciler's entry above it records the marker as deliberately
held at `_o_` and a reader opening a `_c_` plan would otherwise meet that as a contradiction. The
reconciler's own entry was not edited.

**The gate after the rename:** `cd hooks && npx vitest run
lib/__tests__/workbench-citation-lint.test.ts` — exit 0, 10 tests.

**Three machine-written files still spell `_o_` and were left alone.** `agentstate.yaml:65`
(`plan_file:`), `orchestrator-events.jsonl:1861`, and five rows in `.guard-state/events.jsonl`.
The two logs are append-only records of what was true when each line was written. `agentstate.yaml`
is the orchestrator's live state, and its `plan_file` now names a path that does not exist; that is
the orchestrator's to correct and is named in the record's `Resolved:` note so it is not lost.

**The verbosity record's half was withheld, as dispatched.**
`shared/issues/260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`
keeps `_o_` and its two citations in the closed style Circle's spec were not touched, because they
dangle only if that marker moves. The reason is stated in the `Resolved:` note: the rule-text half is
closed and verified, nobody has observed whether a reply actually changed, and the after-measurement
that would answer it is defined and not run.

## Job 2: one clause, no new numbers

`circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2145-coder-the-cut-that-pays-for-steps-2-and-3.md:108`
now reads "so none of the hook test suite's 11 lines of head-room, the figure that stood when this
step ran, was spent." Both figures stand; the surrounding paragraph was rewrapped and nothing else
moved.

The reviewer's argument was accepted: before `e202016` the two clauses named two different file sets,
so no arithmetic between them was implied; after it, both name the bound, one saying 11 and the other
implying 15. Marking the 11 as belonging to the moment the step ran removes the implication that the
two describe one instant.

**The repair is the weaker of the two the record offered, and that was directed.** The record's
proposed clause also supplied the surface the 11 was computed against; the dispatch asked for one
clause and no new numbers. So the reader is told the figures speak about different moments but
cannot re-derive the 11. The reconciling surface still lives only in
`circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2214_*_a-step-log-defends-a-bounded-surface-with-a-count-taken-over-a-different-file-set-than-the-bound.md`,
which the `Resolved:` note names so the trail exists in a record.

## Job 3: the disposition is the fix

Confirmed against the artifact with `git show e202016`: the message says the log defended the bound
with 18 310 lines, and the same commit's diff removes a line reading 18 314. This project does not
amend a pushed commit, so nothing is rewritable. The `Resolved:` note states that the message is
wrong, that it cannot be corrected, that the two figures are four apart and neither changes any
conclusion — both are counts over the wrong file set for the bound either way — and that the record
is the correction. Closed on that basis rather than left open, because leaving it open would imply
an act remains available and none does.

## Verification

- `cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts` — exit 0, after the
  rename.
- `cd hooks && npm test` — exit 0, 40 files, 718 tests.
- Nothing outside `fusion-workbench/` was touched, so no growth bound was approached.
- Nothing was staged deliberately; the four `git mv` calls stage their renames by construction and
  the dispatch named `git mv` as the rename mechanism. No `git add` and no commit was run.
