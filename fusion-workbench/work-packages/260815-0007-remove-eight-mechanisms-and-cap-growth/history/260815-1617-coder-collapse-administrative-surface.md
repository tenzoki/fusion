# Step 12 — Collapse the administrative surface to three names

**Agent:** coder
**Status:** Complete
**Plan:** `260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md`, step 12
**Started from:** HEAD `f45f76a`, suite green at 39 files / 741 tests

## What the step did

Eight user-visible administrative names became three. `/fusion:setup`, `/fusion:cleanup` and
`/fusion:cadence` stay. `archive`, `log-activity` and `curate` keep their directories and their
procedures but are documented as steps of the cleanup pipeline, reachable through a new step selector.
`unlock` and `revise-claude-md` were deleted outright: the first became Setup Step 0g, the second was
replaced by the curator's gated pass at cleanup Step 5.

## The two decisions this realises

**`260815-0007_*_does-fusion-cleanup-block-at-the-claude-md-gate-or-leave-the-ledger.md`, option 1.**
Cleanup Step 5 now reads `skills/curate/SKILL.md` and runs its procedure inline: survey dispatch, run
file, blast-radius confirmation, gate, apply dispatch, report. `Agent(fusion:curator)` was added to the
skill's `allowed-tools`; `AskUserQuestion` was already there. Under `--dry-run` the step dispatches the
survey and stops.

The `## Autonomy and safety` section's opening sentence defined autonomous as *no per-step confirmation
gates*, which the answer made false. It was replaced rather than softened. The new opening reads:

> **The pipeline runs unattended through every step except one.** Step 5 reconciles `CLAUDE.md` and it
> stops there for your approval: the curator surveys, this skill puts the change ledger to you, and
> nothing reaches `CLAUDE.md` until you answer. That is the only gate, and it is deliberate — no
> mechanism edits this project's binding instructions without a person seeing what changes. **A run that
> is typed and walked away from stops at Step 5 and does not finish.** Steps 6, 7 and 8 never happen, so
> the activity log is not regenerated and the housekeeping commits are not made. Either sit with the run,
> or reach for `--skip claude-md`, which runs the rest end to end and leaves `CLAUDE.md` for a later pass.

**`260815-0029_*_what-permission-grant-does-setup-seed-when-unlock-becomes-a-setup-step.md`, part (a)
option 2 and part (b) option 1.** Setup Step 0g asks once, defaulting to yes, naming
`.claude/settings.local.json` and what `bypassPermissions` does in plain words. It carries the deleted
`unlock` body's merge and gitignore steps verbatim — one implementation, relocated, not a second one —
writes bare tool names only, and reports either outcome in the Done report, including that the effect
begins with the next session. The plugin-root `settings.json` was deleted with its `install.sh` copy
entry.

## The step selector

`/fusion:cleanup` gained `--only <steps>` and `--skip <steps>` over a seven-name vocabulary: `issues`,
`commit`, `reconcile`, `archive`, `claude-md`, `log-activity`, `commit-housekeeping`. The three that
replace former commands are `--only archive`, `--only claude-md`, `--only log-activity`. Step 8, the
report, always runs. The two flags are mutually exclusive and neither turns the gate off.

## What "collapse" does and does not mean — stated, because a reader will assume the stronger claim

A skill directory carrying a `SKILL.md` is registered as `/fusion:<name>` by Claude Code. `archive`,
`log-activity` and `curate` keep their directories, so all three remain typeable. The collapse is
therefore what fusion **presents and documents**, not a mechanism that unregisters anything. Keeping the
directories is not an oversight: `derivable-enumerations-lint` asserts a two-way match between `skills/*/`
and `CLAUDE.md`'s listing, and copying the three procedures into `cleanup` would have produced the second
copy `260810-1918` measured the cost of. Only `unlock` and `revise-claude-md` genuinely stopped existing,
because their procedures moved.

`CLAUDE.md`'s skill line and the `skills/<name>/SKILL.md` Layout row both say this in as many words, so a
later reader does not have to rediscover it.

## The permission defect's acceptance, checked rather than assumed

`260810-0326` was closed to `_c_`, but only after its three acceptance criteria were read
against what the fold actually does. Two are met outright. The first — *a fresh project that has only run
`/fusion:setup` completes an orchestrator Turn without a per-tool approval dialog* — is met **from the
next session onward and not in the session that ran Setup**, because Claude Code reads permission settings
at startup only. No Setup-time seeding can close that half; the criterion as written is unreachable by any
mechanism that writes the file during the run. The `Resolved:` footer states that rather than eliding it,
and Step 0g's report says the same thing to the user instead of claiming the session is unlocked.

One residual was filed rather than buried in the closure:
`260815-1617_*_re-measure-whether-a-fresh-project-still-raises-approval-dialogs-before-setup-keeps-asking.md`.
The 260810 measurement found a `fusion:playmaker` dispatch **permitted** with no `.claude/` present, which
is the symptom the whole record was filed about, and could not separate "Claude Code changed" from
"interactive mode differs from print mode". If the dialogs are gone, Step 0g asks every user of every new
project a dead question, forever, for the price of one scratch project's measurement.

## Judgement calls, named

1. **`skills/setup/SKILL.md`'s "Steps 0b, 0d and 0e run one"** cited a Step 0e that step 2 deleted with the
   Plane mirror. No gate sees it — the token is a step number, not a path. Corrected to "Steps 0b and 0d"
   because the sentence sits three lines above where Step 0g was inserted.
2. **`agents/curator.md`'s preserve list** pointed at
   `skills/revise-claude-md/SKILL.md` `## Pass guard — what to PRESERVE`, which held the only copy of five
   load-bearing categories. Deleting the skill would have deleted a normative list the curator depends on,
   so the five categories were written into `agents/curator.md` itself. The citation was gate-forced; the
   relocation of the content was not, and is the judgement.
3. **The curator's `### Boundary against /fusion:revise-claude-md` section** was rewritten rather than
   deleted. A boundary against a mechanism that no longer exists is not a boundary, but the *reason* for it
   still binds: the curator is now the only path to `CLAUDE.md`, and that is a narrowing of who writes, not
   a widening of what it may write on. Exclusion 2 and the owner table row were rewritten to match, and
   both now say plainly that nobody owns the session-learnings pass.
4. **`skills/cadence/SKILL.md`, `README.md:150` and `docs/philosophy.md:15`** name `/fusion:log-activity`
   as a command to run. Left alone: the directory exists, so the statements are true, and none of the three
   files is in this step's scope. They read as slightly off against the three-name framing and belong to
   the curator's narrative pass at gate G1.
5. **`agents/orchestrator.md:1289`** calls `/fusion:curate` "the ordinary surface" for a curator dispatch.
   Also left alone, on the plan's explicit statement that step 12 edits `agents/curator.md` and not the
   orchestrator, and because the sentence is not false.

## Verification

`cd hooks && npm test` — exit 0, 39 test files, 739 tests. The suite was 741 before: `fusion-paths.test.ts`
parameterises two of its cases over the skill roster, and the roster lost two names. No test was deleted or
weakened.

Four gates were load-bearing here and all four were exercised rather than reasoned about:

- `derivable-enumerations-lint` — the two-way `CLAUDE.md`/`skills/*/` match, and `README-agents.md`'s
  one-row-per-directory table. It is why an early draft of the `CLAUDE.md` skill line failed: it named the
  two removed skills in `/fusion:` form while explaining that they were gone, which the lint reads as two
  phantom citations. They are now written as bare names, with a line in the file saying why.
- `reference-resolution-lint` — `settings.json` is in its own path grammar, so deleting the file dangled
  four bare tokens in `CLAUDE.md:106` and one in `install.sh:77`. The same class-(c) scan would have failed
  on `CLAUDE.md`'s exact-marker citation of `260810-0326_*_…` the moment the issue was renamed; that
  citation now carries the `_*_` wildcard.
- `path-literal-lint` and `fusion-paths.test.ts` — no store literal was introduced, and the resolver still
  answers for every surviving skill name.

## Not done here, by design

Gate G1 stands next. Every narrative row and Conventions bullet this step falsified without a gate seeing
it is the curator's, behind the user's approval. Step 13 waits on that gate.
