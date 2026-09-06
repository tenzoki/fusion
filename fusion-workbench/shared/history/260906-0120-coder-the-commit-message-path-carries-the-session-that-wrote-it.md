# The commit-message path carries the session that wrote it

**Status:** Complete
**Agent:** coder
**Task:** repair `260905-2213_*_two-concurrent-sessions-share-one-tmp-commit-message-path-so-one-can-commit-the-others-message.md`

## What changed

`agents/orchestrator.md` Step 3b step 3 and step 5 now prescribe
`/tmp/fusion-commit-msg-<session-id>-<task-id>.txt`, where `<session-id>` is the value
SessionStart put in front of the model as `fusion: session_id=<id>`. `PRESCRIBED_MESSAGE_PATH`
in `hooks/lib/staging-drift.ts` was moved to the same spelling, because the sentence the
staging check hands back quotes that constant and would otherwise name a path nothing
prescribes.

## Why the session identifier and not the other two

The record named three sufficient discriminators and chose none. All three close the
collision; they differ in what the orchestrator can resolve at the moment it writes.

**The session id** is the only one already in the orchestrator's context **as a literal**
when it calls `Write`. That matters because `Write` expands no variable: a discriminator held
only in the environment or only in a helper's stdout has to make a round trip through Bash
first, and step 3 is precisely the step where improvisation is the recorded failure mode
(`260811-0114_*_the-queue-rebuild-and-its-history-file-never-entered-a-commit-and-survive-only-in-the-working-tree.md`).
It is also per **session**, which is the scope the acceptance asks for.

**The checkout id** is per checkout, so two sessions against one project still share a path —
the configuration `/fusion:setup` Step 0c warns about and permits. It is kept as the fallback
for the one degraded case, a payload with no `session_id`, where the stronger discriminator is
absent; the prompt says the fallback is weaker rather than presenting it as equivalent.

**A `mkdtemp` directory** needs no identifier but does need a Bash call whose output the
orchestrator must carry, unwritten, for the rest of the session, and a fusion resume is a new
process that would not have it. That is more session-local state at the step that already
loses it.

Both properties the record required are kept: the message still never touches a shell command
line (`Write` plus `git commit -F`), and the path is still under `/tmp` and never inside the
workbench.

## What the test now pins

`hooks/lib/__tests__/commit-message-path.test.ts` pinned one property of the path and now
pins two. `SESSION_DISCRIMINATOR` and `carriesSessionDiscriminator` are new; every `/tmp`
commit-message path the orchestrator names must carry the discriminator, the `git commit -F`
regex requires it, `PRESCRIBED_MESSAGE_PATH` must carry it, and a separate assertion requires
the prompt to state *why* the path is per-session, the same shape the existing `/tmp`
justification assertion has. A negative control feeds the exact pre-fix string
`/tmp/fusion-commit-msg-<task-id>.txt` to the same predicate and requires it to fail, so an
edit that keeps the `/tmp` prefix and drops the discriminator reddens the suite.

The property "unique per session" is not decidable from a path template — `<task-id>` and
`<session-id>` are both placeholders and nothing in the string says which varies per session.
So the pin is the exact spelling, and changing the discriminator is an edit somebody makes on
purpose, which is how `NAMEABLE_LEFTOVER` in the same file already works.

## Two other files, each a required consequence

`hooks/lib/__tests__/staging-drift.test.ts:224` transcribed the old literal and now
transcribes the new one. `reference-resolution-lint.test.ts`'s `BASELINE` moves `paths`
1624 -> 1625 and is re-approved in place, as that gate's own message directs; the whole
movement is the one `bin/fusion-identity` citation the fallback sentence adds, measured by
single-file revert (replacing that token with prose returns the gate to 1624 green) rather
than attributed by reading the diff.

## What is left red, deliberately

`surface-growth-bound.test.ts` fails on the golden fixture: `agents/` moved 151 148 ->
152 491 bytes for `orchestrator.md`. All three head-room assertions pass — 1 343 bytes against
18 000 — so no bound was spent and no baseline was touched. The fixture is left alone per the
dispatch. The hook-test surface also grew and its golden entry will move with the same
regeneration; the golden assertion fails on the first mismatching surface, so only `agents`
was reported.

One flake, unrelated: `staging-drift.test.ts` "does not call a staged record a fault" read
`unchecked` instead of `clean` under full-suite load in the first run and passes in isolation
and on every later run. It is a git-detection timeout under load, not a consequence of this
change.
