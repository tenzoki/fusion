# coder — separate the two jobs in `/fusion:next` Step 6.5

**Status:** Complete
**Circle:** 260823-0023-settle-what-travels-between-checkouts
**Dispatched by:** orchestrator
**Addresses:** `shared/issues/260823-0510_*_the-activation-chain-hands-off-to-a-parent-thread-that-is-the-same-thread.md`
**Files changed:** `skills/next/SKILL.md`, `hooks/lib/__tests__/fixtures/surface-growth.golden`

## What changed

Step 6.5 made one string do two jobs: user-facing output, and an instruction to the
agent emitting it. The printed message is unchanged. Two edits sit around it.

Removed, the framing clause that assumed two parties:

> The skill's final output must phrase itself as an implicit directive that the
> orchestrator (the parent session reading this output) will pick up.

Removed, the closing claim that printing sufficed:

> That message is itself the directive. The orchestrator's own prompt instructs it to
> run Setup at the start of work, so emitting this text is sufficient to trigger Setup
> on the parent thread.

Added, in the imperative and outside the printed block:

> **Then act on it in the same turn, and who you are decides how.** If you are the
> orchestrator, this activation is one of the self-initiated runs your own MANDATORY
> section anticipates: run your Setup now, then continue into Phase 0. Its steps are
> not restated here and must not be. If you are any other agent, stop here. The printed
> message stands as the user's next step, and this skill starts no session on its own.

The instruction points at Setup and copies no step of it, and it degrades correctly for
a reader that is not the orchestrator. `agents/orchestrator.md` is untouched.

## What it cost

`skills/next/SKILL.md` 25 404 -> 25 485 bytes, +81. The `skills/*/SKILL.md` head-room
went 4 661 -> 4 580 bytes against `SKILL_BASELINE` and its 20 000-byte budget. No
baseline map moved; the golden was regenerated for the one changed file.

One wording was tried and dropped. It cited
`$FUSION_SRC/agents/orchestrator.md` `## MANDATORY — Read This First` in the class-(a)
form, which moved the reference-resolution pin (paths 1269 -> 1270) and would have
needed a re-approval block in `reference-resolution-lint.test.ts`, a third file and
three lines against a hook-test surface with 296 lines of head-room left. The
orchestrator reading this instruction has that prompt loaded already, so the prose
pointer carries the same weight at no cost outside the dispatch's blast radius.

## Verification

`cd hooks && npm test` — exit 0, 41 files, 724 tests passed.
