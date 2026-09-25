# B2 — the sentinel becomes the session identifier

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Circle:** 260909-1700-cut-fusion-to-working-minimum
**Plan step:** B2 of `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md`, session 2 (additive)

## What changed

The gate deciding whether a machine-written event row is written moved from
`orchestratorSessionInFlight(root)` — one `existsSync` on
`fusion-workbench/agentstate.yaml` — to `eventRowsAdmitted(root, sessionId)`, which is
that same call **disjoined** with a session identifier read off the hook payload. The old
term is one arm and was not touched, so every call the gate admitted before it is still
admitted; the mutation runs below prove both arms independently.

An absent identifier is no longer a bare `return`. With a workbench root found and no
identifier on the payload, one `guard_advisory` naming the condition goes to
`.guard-state/events.jsonl`, and the row then follows the disjunction: written with
`session_id` absent when `agentstate.yaml` still admits it, not written at all when
nothing does. The advisory says which of the two happened.

Three placement decisions inside the module, each stated at its site:

- `recordDispatchLaunch` takes the widened gate and raises **no** advisory. It parks a
  mapping entry rather than writing a row, so there is no row for an absent identifier to
  be missing from; `emitSubagentStop` advises when that launch's row comes due.
- In `emitSubagentStop` the gate sits **after** the mapping lookup. A sync dispatch's
  SubagentStop reaches that function with no parked entry and is owed no row at all, so
  gating first would emit one spurious advisory per sync dispatch.
- `heartbeatSessionMarker` keeps `orchestratorSessionInFlight` unwidened. Its subject is
  whether an *orchestrator* is running against the project, and a plain session refreshing
  the marker would make `/fusion:setup` Step 0c's `running` verdict a statement about the
  wrong thing.

`bin/fusion-commit-lock`'s `emit_commit_event` takes the same disjunction in shell
(`[ -f fusion-workbench/agentstate.yaml ] || [ -n "${FUSION_SESSION_ID:-}" ]`) and writes
no advisory: it is not a hook and has no `.guard-state/` writer.

The module header was rewritten, which is what the plan asked for beyond the code. It now
carries what the gate means (project-scoped, not orchestrator-scoped), why it widened (the
state file is the Turn loop's bookkeeping and the Turn loop is going, so a gate keyed on it
would soon admit nothing), the consequence stated as the point rather than a residual (a
plain session's dispatches land in the log, and scoping is the reader's job — which is how
`bin/fusion-events` already reads it), and the absent-identifier rule. B1's fourth row kind
`session_start` is kept in the list, with the added note that it is the one machine row
that does **not** pass this gate: at SessionStart `agentstate.yaml` does not exist yet and
the identifier is that row's dedup key rather than a descriptive field.

## Files changed

- `hooks/lib/orchestrator-events.ts` — header rewrite; `payloadSessionId`,
  `eventRowsAdmitted`, `ABSENT_SESSION_ID_ADVISORY`, `adviseAbsentSessionId` added;
  three call sites re-gated. `orchestratorSessionInFlight` kept and exported.
- `hooks/guard.ts` — product 3 of the header, and the dispatch-branch comment: both
  claimed a dispatch writes no guard state, which is now true except for the one advisory.
- `hooks/tracker.ts` — the dispatch-branch comment's "while an orchestrator session is in
  flight".
- `bin/fusion-commit-lock` — the `emit_commit_event` header and its one condition line.
- `hooks/lib/__tests__/helpers/guard-harness.ts` — `runDispatch`, `DispatchPayload`,
  `openOrchestratorSession`, `readOrchestratorEvents`; the spawn factored out of `runGuard`
  into `spawnGuard` rather than copied, because `runGuard` hard-codes the one payload field
  the gate turns on.
- `hooks/lib/__tests__/guard-state-shape.test.ts` — four cases and a header section saying
  why they live in this file.
- `hooks/lib/__tests__/fusion-commit-lock.test.ts` — the one case that asserted the old
  single-term gate, split into the session-identifier arm and a neither-arm case.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` — baseline re-approved.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` — regenerated.
- `hooks/dist/` — `npm run build`.

## What was measured, not assumed

**Both arms are independently pinned.** Two mutation runs against the new cases:
replacing the disjunction with `orchestratorSessionInFlight(root)` alone (the HEAD gate)
fails the no-`agentstate.yaml` case and nothing else; replacing it with
`sessionId !== undefined` alone fails the state-file-only case and nothing else. So the
suite catches a narrowing in either direction, which a single case could not.

**The reference-resolution baseline moved by exactly one, and the share was measured by
single-file revert**, per that gate's own convention: with `bin/fusion-commit-lock` alone
at HEAD the gate resolves 1728/253/14 and every case passes, so the whole +1 is that
file's new `hooks/lib/orchestrator-events.ts` citation. The three edited `hooks/*.ts` files
are scanned `recordsOnly` and the three edited test files sit under a directory the gate's
`surface()` never descends into, so neither could reach the pin.

**The hook-tests growth golden moved 22 992 -> 23 257 lines** and no baseline moved with
it; the surface's own head-room bound never went red at any point.

**One `run` in `fusion-commit-lock.test.ts` merges `process.env`**, and this session's own
`FUSION_SESSION_ID` is exported by the SessionStart hook — so the new neither-arm case
overrides it to the empty string. Without that the case would have passed on a bare shell
and asserted nothing on the machine most likely to run it, which is the failure
`STRIPPED_ENV_VARS` in the harness exists to prevent.

## Known effects, recorded rather than fixed

`dispatches` in `hooks/lib/events-query.ts` counts raw `session_start` rows and sees two per
session since B1. Untouched here; it belongs to B4 or C0. `presence` and `turns` are
unaffected.

Two shipped documentation surfaces now describe the old single-term gate — `README-hooks.md`
in two places and `rules/commit-lock.md` in one. Both are outside this step's permitted file
set, so the drift was created knowingly and filed as
`260909-2356_*_two-shipped-docs-still-describe-the-dispatch-gate-as-the-state-file-alone.md`.

## Verification

`cd hooks && npm test` — exit 0, 969 of 969 passing across 56 files.
