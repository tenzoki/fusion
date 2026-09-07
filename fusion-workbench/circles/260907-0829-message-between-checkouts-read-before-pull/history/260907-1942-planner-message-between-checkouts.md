# Planning session: the implementation plan for the cross-checkout message

**Status:** Complete
**Filed by:** planner, Kai Stalmann <ks@qantr.com>

## What was asked

The orchestrator dispatched planning for the active Circle
`260907-0829-message-between-checkouts-read-before-pull`, with `**Executors:** coder, ontocoder,
analyst`. The dispatch named the Circle record as the primary input, listed the pre-activation
review, the two shaping histories and three decision records to read, and directed that the three
rulings be planned against as settled, since the relay to `_a_` is the orchestrator's act. It also
named what the plan owes: the git time budget, the behaviour with no remote and no upstream, which
ref is shown when a branch tracks several, and how the repository-root-relative path is derived. It
asked whether this work is bound by the open git-budget record, told me to check the Directive's
edit-site list against the tree and say where it is wrong, to plan the proof run against the
two-session constraint, and to report the head-room I measure. The naming residual between `news`
and `shared/forum/` was ruled at activation and was not to be reopened.

## What was read

The Circle record whole; `260907-0840-spec-review-message-between-checkouts.md`; both shaper
histories; the three cited decision records plus the adjacent open git-budget record. Then, against
the tree at HEAD `abcaa823`: `bin/fusion-paths` in full, `bin/fusion-cadence-anchor` in full,
`skills/cleanup/SKILL.md` in full, `skills/archive/SKILL.md` in full, `skills/curate/SKILL.md` at its
gate, `skills/setup/SKILL.md` at Step 0k and its scaffold line, `rules/workbench-path-resolution.md`
in full, `rules/workbench-tracking.md` in full, `rules/user-facing-output.md` at the three sections
that bind a gate, and the six test files that fire on this work.

## What was measured rather than recalled

Six things, each run:

- **The four bounded surfaces.** Skills 13 131 bytes of head-room, always-on rule core 9 737,
  hook-test lines 1 518, agents 4 618, each computed with that surface's own collector and baseline
  map. The skills figure matches the Circle record's at `3639813c` because no skill body moved
  since. The other three are new information the record does not carry, and the always-on one
  matters most, because `rules/fusion-workbench-conventions.md` sits inside a bound that fails
  rather than reports.
- **No portable timeout.** Neither `timeout` nor `gtimeout` is on `PATH` on the reference machine.
  That kills a time budget expressed as a timeout, and it is why the plan bounds the fetch by
  forbidding it to wait for a human instead.
- **The git path derivation.** `git rev-parse --show-toplevel` plus a prefix strip yields
  `fusion-workbench`, and `git show "origin/main:<that>/shared/decisions/<file>"` returns the blob.
  Verified by running both.
- **A branch has at most one upstream**, read out of `branch.main.remote` and `branch.main.merge`,
  which is why "which ref when a branch tracks several" has no fork in it.
- **`bin/fusion-cadence-anchor` `get` and `set` take an arbitrary key** and preserve unknown ones,
  so the mark needs no new file.
- **The gate enumerations.** `derivable-enumerations-lint.test.ts` asserts both directions between
  `bin/` and `CLAUDE.md`'s Layout table, and between `skills/*/` and both `CLAUDE.md` and
  `README-agents.md`. `fusion-paths.test.ts` patches the `ORDER` string by an anchor on its last
  line, so new keys go before `PORTFOLIO` and that line must not move.

## What was written

`260907-1942_*_message-between-checkouts-read-before-pull.md`, thirteen steps, every one assigned to
`coder`. The plan's organising decision is that the git mechanism lives in a new `bin/fusion-forum`
rather than in the skill body, which follows the rule `bin/fusion-cadence-anchor`'s own header
states for exactly this case, buys the bounded skill surface back, makes the mechanism testable, and
costs no extra proof delay because the skill was already unprovable in this session. The helper
takes the store path as an argument, so `bin/fusion-paths` stays the single resolution point and no
fifth store-definition site is created.

## Where the Directive's cost list was wrong

Three sites missing, one correctly dropped, one deliberately not edited. Missing: `.gitignore` needs
`!bin/fusion-forum` or the helper is silently absent from every install; `CLAUDE.md`'s Layout table
needs a row for it, and that is gate-enforced; `bin/fusion-cadence-anchor`'s header needs the new
key's row. Correctly dropped already by the shaper: `rules/workbench-tracking.md`, whose R1 row
covers every store inside `shared/`. Deliberately not edited: `skills/setup/SKILL.md`'s scaffold
line, following the `shared/checkouts/` precedent that a store is created by its own writer.

## The git-budget question

This work is **not** bound by `260906-0035_*_what-should-the-git-helpers-budget-be-and-is-a-timeout-retried.md`
and does not answer it. That record governs a node `execFileSync` timeout inside a PostToolUse hook
that runs on every guarded tool call and must stay fail-open. This is a foreground command the user
typed, in bash, with no timeout facility available to it. The plan says so in its `## Approach` and
in an Open Questions bullet, so nobody later reads this as having settled that record.

## Also filed

`260907-1942_*_does-the-pipelines-one-stop-permit-a-second-question-in-the-same-askuserquestion-call.md`,
in this Circle's decision store. The user's ruling folds the message approval into the pipeline's one
stop and its chosen option says "no second `AskUserQuestion`"; the eight-line gate cap and the
twenty-line draft cap together make that unbuildable as one call carrying one question, which is a
collision neither the review nor the record had in front of it. Three options, recommendation stated,
and the plan names the single sentence of step 10 that changes under each answer.

`260907-1942_*_the-cleanup-pipelines-step-numbering-has-drifted-in-its-own-body-and-in-readme-agents.md`,
in the **shared** issue store, because it was found beside this Directive rather than caused by it:
`skills/cleanup/SKILL.md` carries Step 6 above Step 5 and names the wrong step three times, and
`README-agents.md` labels two rows with the same cleanup step number. Checked first against every
open defect in this Circle's store and the shared one; no duplicate.

The stray tool markup at the end of the review analysis was already filed by the shaper as
`260907-1234_*_the-spec-review-analysis-ends-with-two-lines-of-tool-markup.md`, so nothing was filed
against it here.

## Verification

`bin/fusion-prose-metric` over all three new files: `ok` on each. `bin/fusion-citation-check` over
the project after writing them: `verdict=clean`, `edited-violations=0`. The three lint gates that
read a plan could not be run here, because this checkout has no `hooks/node_modules`; step 12 of the
plan is where the suite is run, and this session installed nothing to find out.
