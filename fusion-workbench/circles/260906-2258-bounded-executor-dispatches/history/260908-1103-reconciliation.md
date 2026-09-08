# Reconciliation of the bounded-dispatch Circle after the v10.24.1 release stretch

**Status:** Complete
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>

**Domain:** code. **Verified against:** the working tree at `43fe1bc1` on `main`, plus the
release branch `release/v10.24.1` and the tag on it.

**No anchor bounded this pass.** `bin/fusion-cadence-anchor changed-since last_reconcile_commit`
returns `changed=yes` and its `changed-files` list is the whole workbench, so nothing proved a
skip. The inventory therefore opened every live-marker record in both stores of
`$SCAN_PLANS`, `$SCAN_ISSUES` and `$SCAN_DECISIONS`, plus this Circle's history and analyses.

## What was reviewed

- Plans: 4 live (`_o_`/`_p_`), 2 in this Circle and 2 shared. 1 updated.
- Defect records: 15 live, 3 in this Circle and 12 shared. 4 updated, of which 1 closed.
- Decision records: 47 live (`_o_`/`_a_`), 4 in this Circle and 43 shared. 2 updated, of which
  1 transitioned.
- Review files: 0 in this Circle. No review pass ran in this session, so nothing was annotated.
- Circle record: head fields checked, not edited. A reconciler writes no Circle record.

## Key findings

**Marked done and verified done.** Plan steps 2 and 3 carried `[DONE]` and both hold on disk.
`hooks/lib/config.ts` carries all four prescribed edits of step 2 (lines 187, 251, 429, 629),
committed as `e1e625ae`; `hooks/turn-budget.ts:121` and `bin/fusion-turn-budget` line 15 carry
step 3's second output line with the rebuilt `hooks/dist/turn-budget.js:109` beside them,
committed as `7e7708cf`.

**Unmarked and verified unstarted.** Steps 4 to 16 were each checked by the file the step names,
not by the absence of a mark: no `_dispatchBound` key in either `fusion.json`, no
`rules/bounded-dispatch.md`, no `IS_BOUND_AGENT` in `bin/fusion-rules`, both commit-lock
narratives still in `agents/orchestrator.md`, no `### Bounded dispatches` block, no
`dispatches` subcommand and no dispatch-bound test file.

**Marked open, done on disk.** Three records understated what the tree holds, and this pass
corrected all three:

1. The plan header read `**Status:** Draft` and its filename read `_o_` while two steps were
   finished. Now `In Progress` and `_p_`.
2. `260907-1450_*_which-program-hands-the-orchestrator-the-dispatch-bound-at-setup.md` stood at
   `_a_` while both halves of option B were on disk and committed. Now `_i_`, citing `e1e625ae`
   and `7e7708cf`.
3. `260907-1939_*_the-planability-analysis-spells-a-backlog-entrys-marker-and-the-citation-sweep-gate-is-red-on-it.md`
   stood at `_o_` while the repair had landed. `bin/fusion-citation-sweep --dry-run` now prints
   `files=0 rewrites=0 bare-record=0` where the record was filed against `files=1 rewrites=2
   bare-record=2`. Now `_c_`.

**Answered elsewhere — needs the user's ruling.**
`260907-0820_*_is-a-token-side-measurement-of-the-splits-net-cost-worth-building.md` stands at
`_o_` and its answer is on disk:
`260907-2012-break-even-arithmetic-for-the-dispatch-split.md` carried out option 3 and closed the
net sign positive at $12 to $90 over the log's 10.99 days, with the break-even run length at 20.2
to 27.5 minutes. The record gained an `Answer located:` line and no rename. The `_o_` → `_a_`
transition is the orchestrator's alone, and only to relay a ruling the user gave, so the question
belongs on the next session's list.

**Open and confirmed open, with fresh evidence.** Three records were re-verified rather than
assumed:

- `260908-0020_*_the-specs-open-for-planner-states-nine-c5-criteria-where-c5-carries-ten.md`: the
  spec's sentence is unchanged and `grep -c '^- \[ \]'` over C5 still returns 10.
- `260908-0030_*_every-agents-history-file-can-redden-the-citation-gate-and-two-have-in-one-turn.md`:
  both named instances are repaired, but the acceptance test asks for a run of further plan steps
  producing zero rejections and no further steps ran, so the class is untested.
- `260906-2014_*_the-help-topic-on-updates-has-missed-two-releases-and-names-none-of-the-last-three.md`:
  one release staler after `v10.24.1`, so the topic now misses three.

**Not answered, and nothing on disk claims otherwise.**
`260907-2330_*_does-the-shapers-portfolio-activation-mode-write-a-new-spec-or-revise-in-place.md`
stays `_o_`: `rules/orchestrator-rebalance.md` line 103 still carries the "a new spec, the field
set to it" wording the record was filed against.
`260908-0025_*_the-agents-budget-is-281-bytes-short-after-another-sessions-growth-so-what-gives.md`
stays `_a_`: its answer is realised by plan Step 8, which is unstarted, so nothing on disk yet
reflects the decision.

## The Circle record's head fields

All three resolve, and none was edited.

- `**Active spec/plan:**` cites `260907-0820_*_spec-bounded-executor-dispatches.md` and
  `260907-1450_*_plan-bounded-executor-dispatches.md`; a workbench-wide lookup on each basename
  finds exactly one file, and the plan's rename to `_p_` by this pass leaves the citation valid
  because the marker is wildcarded.
- `**Active session history:**` cites `260907-0657-orchestrator-session.md`, which exists in this
  Circle's history store and is the file the session appended to at resume.
- `**Claim:**` reads `Claimed 260907-0657: Kai Stalmann <ks@qantr.com>, checkout 5e8248d7.` It
  matches the second literal opening of `rules/circle-records.md` `### The claim field` exactly,
  and both halves match `bin/fusion-identity` on this checkout (`PERSON=Kai Stalmann
  <ks@qantr.com>`, `CHECKOUT=5e8248d7`).

**One gap, and it is not a head field.** The record's `## Turn log` is empty while one Turn ran:
`bin/fusion-events turns` prints `turns=1 scope=checkout` against this session's history file, and
`260907-0657-orchestrator-session.md` `## Turn log` carries that Turn's entry (commits
`7ed43852`..`8197f789`). The Circle record is not a file this role writes, so the gap is reported
and not repaired.

## Nothing new was filed

Every discrepancy this pass found was a marker or a header understating disk, which is what a
reconciliation corrects rather than files. The two conditions worth a record already have one: the
suite's nondeterminism as `260908-0032_*_two-hook-tests-are-load-sensitive-and-fail-only-in-the-parallel-full-run.md`,
and the history-file citation class as `260908-0030_*_every-agents-history-file-can-redden-the-citation-gate-and-two-have-in-one-turn.md`.

## Coherence

The three-edge verdict for this Circle is written where it belongs, in
`260907-0657-orchestrator-session.md` `## Coherence`. It reads `review-needed`, with the
recommendation `revise Grounding`.
