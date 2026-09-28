# Planner — plan revision at the approval gate

**Status:** Complete
**Agent:** planner
**Circle:** `260813-0858-playmaker-maintains-backlog-store`
**Artifact revised in place:** `260813-1306_*_the-playmaker-maintains-the-backlog-store.md`

## What this run was

The plan went to the approval gate with a `conceptrev` diagram verdict beside it. The user
approved it subject to revisions, settled the plan's one open question, and answered a second
question the plan had carried as its top risk. This run made those revisions in the existing plan
file. No second plan file was created, no step's substance was reopened, and nothing in the
Directive or the two answered decisions was touched.

## The three changes

**The confirm-gated operations are four, not three.** The user's answer: the decision record's
marker grant enumerates what the playmaker may write, and the Directive decides which of those
writes need a confirmation. Ranking renames are autonomous, dispositions are confirmed, so
splitting, merging, closing and deferring are all gated. The plan had stated that scope in three
different sizes, and the smallest of them sat in the head's `**Decidability:**` line where a later
reader looks it up. The count is now four in the head line, in both nodes of the first diagram, and
in the acceptance text of steps 1 and 2.

**The deferral half of the state machine is decided rather than absent.** `conceptrev` found the
deferred state had one entrance and one exit, which silently claimed that a recommended entry must
lose its recommendation before it can be pushed out and that a pushed-out entry can never be
closed. Two transitions were added, `Recommended → Deferred` and `Deferred → Closed`, both on the
confirmed gate. Two are absent on purpose and are now reasoned in prose: `Deferred → Recommended`,
because the autonomous rename is the playmaker restating its ranking of a live idea and a revival
reverses a user's disposition instead; and `Deferred → Closed` by the shaper, because the shaper's
promotion path renames `_o_` or `_p_` and nothing else (`agents/shaper.md:87`). Revival stays with
the user, by hand, through the edge the diagram already carried.

**A new step 4 builds the confirmation relay in `/fusion:next`.** The plan is nine steps now. The
playmaker returns its proposals as report text, the skill body puts them to the user with
`AskUserQuestion`, and the answer travels back on a second dispatch that performs the writes. The
step states what the second dispatch carries so the run acts without re-deriving the first run's
analysis: the confirmed operations in the first run's own words, and a pointer to the portfolio
section where that run wrote its reasoning down.

## Two findings the revision turned up

**The same grep is a trap for this step.** `bin/fusion-paths` derives a consumer's key set by one
grep over its prompt, and step 4 adds a fenced example dispatch prompt to `skills/next/SKILL.md`. A
single `$OUT_BACKLOG` or `$SCAN_BACKLOG` token in that example would hand the skill a key into the
store and break the resolver test that names `next` on purpose. The step states the trap where the
executor will be standing and makes the resolver's own answer its first acceptance criterion.

**Two history logs, one minute.** Both dispatches of a relay can land inside the same minute, and a
playmaker log filename is stamped to the minute. The second run therefore logs under the trigger
segment `user-fusion-next-confirmed`, or it overwrites the first run's log.

## What was deliberately not built

No lint pins step 4's dispatch-parameter contract, and the plan says why rather than leaving the
omission to inference. Every linted contract in this plugin guards a silent failure; a drifted
parameter name here is loud, because the second dispatch performs nothing and the user sees
unchanged entries. The closest analogue by shape, the parameter block between `/fusion:direct` and
the shaper, carries no lint and has not drifted. The suite prediction is therefore unchanged at
1019 tests across 49 files.

## One defect filed

`260813-1334_*_fusion-direct-documents-a-shaper-clarification-flow-that-a-dispatched-sub-agent-cannot-run.md`.
`skills/direct/SKILL.md:84` tells the reader the dispatched shaper runs its clarification flow with
the user interactively, while `agents/shaper.md:119` states that a dispatched shaper receives no
question channel and must return its questions instead. The record separates what was verified by
reading from what was reported by the dispatching orchestrator and appears in no history file.
Filed to the shared store rather than this Circle: a different skill and a different agent, found
nearby rather than caused by this Directive.
