# Reconciliation — the multi-user spec, and a pass over the rest of the workbench

**Status:** Complete
**Agent:** reconciler, domain `code`
**Range:** `a99e680..cfab17e` (one commit)
**Circle:** none active; every `SCAN_*` collapsed to `shared/`
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>

## What was reviewed and what moved

| Store | Reviewed | Updated |
|---|---|---|
| Plans | 6 in `shared/planning/`, 1 live plan inside a terminal Circle | 2 |
| Issues | 1 open in `shared/issues/`, 0 open in any Circle | 1 annotated, 3 filed |
| Decisions | 65 in `shared/decisions/`, 21 open inside terminal Circles | 2 transitioned |
| Reviews | 20 in `shared/reviews/`, plus the Circle stores | 0 |
| History | skimmed the last 30 entries | — |

`cd hooks && npm test` after every write above: 43 files, 760 tests, exit 0.

## The four leads, verified

**1. C3 is substantially delivered, and six criteria were ticked.** Each was opened at its own site
rather than read off a report. Criteria 1, 2, 4, 5, 6 and 7 are met; the evidence is written into the
spec's own `## Reconciliation Log` beside each. Criterion 7 was additionally verified against the
tree, not only against the rule that states it: 19 records carry a person half, every one stamped
260824 or later, and no record predating the Circle carries one.

**2. The third criterion is stale *and* unmet, which the lead treated as alternatives.** Its second
half prescribes `$USER`; `260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md`
replaced that on 260824 with the git identity read from `bin/fusion-identity`, so the criterion's text
no longer describes what the project decided and the record governs. That is the stale half. The
first half — *every agent that files a record writes the field* — is separately false on disk: of the
63 records filed since the obligation landed, 18 carry the person, 17 carry the stated absence the
rule's exit-127 branch prescribes, and 28 carry neither. Six agents are represented, so it is the
obligation's reach rather than one prompt. The box stays unticked and the gap is filed.

**3. The identity decision is not `_o_`, and the lead was wrong about which surface is stale.** The
record carries `_i_` on disk, with an `Answered:` line citing the user's answer of 260824 and an
`Implemented:` line naming six commits, each checked against its own diff. What was stale is the
spec's `## User decisions pending` checkbox, which still read `[ ]`. Ticked.

**4a. C0's fifth criterion is deliverable in substance and not in its stated home; ticked with the
deviation named.** `260822-1540-coder-c0-step-9-closure-measurement.md`
`## The four surfaces` carries exactly what the criterion asks — a section per surface with the cut
and the head-room before and after. The home cannot be built: C0 ran with no Circle and no closure
note, the spec records that at `:94`, and the defect that raised it closed on that statement rather
than on a Circle being created. Left unticked it would stand open for the life of the spec against
work nobody can do.

**4b. C1's seventh is a conditional whose antecedent is false, and this is the third pass to say so.**
It stays unticked, and the repetition is now its own record: the checkbox notation has two states and
this criterion needs a third, so every future reader counts C1 as 6 of 7.

**5. The `.gitignore` capability gap is real, and the spec's nearest constraint does not forbid it.**
C2's subject is fusion's own `.gitignore`; a consuming project's appears in no criterion of any
capability. The `## Constraints` sentence forecloses a **rule obliging a project to track**, and the
answered decision ships no such rule — `rules/workbench-tracking.md` still leaves that choice with the
project and Setup never repairs an R1 exclusion. So the constraint survives and the work is a genuine
gap. One correction to the record that raised it: its closing paragraph calls the second decision open
and blocking, and both decisions carry `_a_` at HEAD, so nothing blocks building the repair.

## The ordinary pass

**The three open decisions in `shared/decisions/` are all genuinely open at HEAD**, each checked
against the mechanism it asks about rather than against its own text. The re-baselining question:
`hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining` still names two moments and neither
is a cut-only Circle. The hook-test comment-prose question: unchanged, and the
`reference-resolution-lint.test.ts` baseline note written on a shared line "because the hook-test line
budget was at its bound" is evidence the counter still charges comment prose. The citation-corpus
question: `workbench-citation-lint.test.ts` carries `OPEN_ISSUE_RE`, `LIVE_DECISION_RE` and
`LIVE_PLAN_RE` and no `reviews/` pattern at all.

**The 21 open decisions inside terminal Circles split three ways, and the pattern is the finding.**

- **Nine are open by construction and must not be moved.** Eight `260820-2314_*` records and one
  `260821-0414_*_does-a-corpus-repair-circle-carry-a-budget-for-what-its-own-new-clauses-may-spend.md` each carry a closing paragraph stating in terms that the answer above it was written
  by an orchestrator during an unattended run, is not the user's, and that the record is filed `_o_`
  so the user meets it live. One of them records exactly this class being overturned by the user on
  2026-08-21. `260821-2004_*_what-happens-to-the-directive-when-the-plan-a-circle-runs-on-deliberately-does-not-state-one.md` in the reply-bounded Circle carries a prior reconciliation verdict
  reaching the same conclusion in its own words.
- **Two were stale and are transitioned.** Both `260820-2324_*` records had option 1 on disk with
  empty annotation stubs: `bin/fusion-source-root` in all three of Step 0e's bash blocks, and
  `fusion-workbench/.asset-provenance` with the layout-tree row and the R3 classification its own
  constraint demanded. Now `_i_`, citing `3464575` and `dc78da2`.
- **Ten are genuinely open Grounding**, filed by the analyst and the planner and never answered.

**What binds all 21, and is worse than any of them individually.** Their Circles are terminal, so
`bin/fusion-paths` emits no `SCAN_DECISIONS` that names their stores. No future reconciler,
taskplanner or playmaker opens them. The question of whether a terminal Circle's stores should enter
any scan set is itself one of the 21
(`260824-2013_*_do-archive-and-terminal-circles-stores-enter-any-scan-set-or-is-the-exclusion-written-down.md`),
which makes it unreachable by its own argument. This pass reached them only because the dispatch named
them.

**The one live plan inside a terminal Circle carried `Draft` against a delivered Circle.**
`circles/260820-2051-.../260820-2249_*_spec-style-rules-arrive-and-get-measured.md`: header
set to `Partially Complete` on its Circle's closure note, marker left `_o_`, and none of its 49
acceptance criteria ticked — verifying them is a pass of its own and ticking them from the closure note
rather than from the tree would be the substitution `rules/critical-stance.md` §3 forbids. Its Circle's
own reconciliation caught the identical fault in the plan beside it and never opened the spec, because
the Circle record's `**Active spec/plan:**` names the plan.

**Reviews: nothing to annotate.** Every finding in the 20 shared review files and in the Circle review
stores was filed as its own defect record, and every one of those records carries `_c_`. No review
file makes a claim the tree contradicts.

## Records written

Three defects, all in `shared/issues/`:

- `260825-1250_*_twenty-eight-records-filed-since-the-attribution-rule-landed-carry-no-person-half-and-no-stated-reason.md`
  — C3's one unmet criterion, with the 63-record measurement and the two candidate fix directions.
- `260825-1250_*_a-conditional-acceptance-criterion-has-no-notation-for-a-false-antecedent-so-three-passes-re-derived-the-same-explanation.md`
  — C1's seventh, and the cost three passes have paid for it.
- `260825-1250_*_a-bounded-circle-holds-a-draft-spec-with-49-unreconciled-criteria-that-no-scan-reaches.md`
  — the style spec, and why nothing will reach it again.

Nothing was misfiled: no issue reviewed in this pass turned out to be a decision, and no decision an
issue.
