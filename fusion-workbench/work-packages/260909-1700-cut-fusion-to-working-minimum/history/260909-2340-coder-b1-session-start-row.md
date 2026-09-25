# Step B1 — the SessionStart hook writes the `session_start` row

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Plan:** `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md`, session 2, step B1

## What landed

`hooks/session-start.ts` now appends one machine-written `session_start` row to
the workbench's event log, once per session, carrying `session_id` from the hook
payload, `person` and `checkout` by the module's existing env-first rule,
`git_head_at_start` from `lib/git.ts`, `domain` by the `lib/domain-cascade.ts`
resolution, and `writer` naming the hook.

The emission itself is in `lib/orchestrator-events.ts`, which owns the log's
schema, its stamp format and its identity rule. Four exported names were added
there and nothing existing was changed except the header's row-kind list, which
said "three row kinds and only three".

## The three decisions this step took

**The dedup reads the log back rather than keeping a mark of its own.**
SessionStart fires again on a resume and on a clear with the same identifier. A
second state file could disagree with the log; the log cannot disagree with
itself. The match requires event, `writer` and `session_id` together, so the
model's own row for the same session does not suppress the hook's.

**No identifier, no row.** The identifier is the dedup key, so without one a
second SessionStart could not be told from the first. Every other field follows
the ordinary absent-rather-than-empty rule.

**The head commit and the domain are resolved in the hook, behind a thunk.**
Each costs a subprocess and `lib/orchestrator-events.ts` is imported by three
hooks that run on a tool call's latency budget. The thunk is called only when
the row will actually be written, so a resumed session's second SessionStart
spawns nothing. A `bin/fusion-count-sources` that cannot be run leaves `domain`
absent; one that ran and declined to count prints `counted_by=none`, which is
the cascade's own top branch and a real verdict.

## Verification

`cd hooks && npm test` — exit 1. One case fails, in a file this step did not
touch: `citation-sweep.test.ts` over a workbench record committed before the
dispatch. Filed as
`260909-2339_*_the-citation-gate-is-red-on-a-store-prefixed-path-in-session-1s-reconciliation-record.md`,
with the evidence that step B1's own two files contribute zero rewrites. Every
other case passes, `committed-dist.test.ts` included.

The plan's own end-to-end check for this step needs `fusion --update` and a
session restart and falls to step C0 in session 3.

## For step B2

B2 also edits `lib/orchestrator-events.ts`. This step changed one existing thing
there — the header's row-kind list — and added one self-contained block at the
foot of the file. `orchestratorSessionInFlight()` is untouched and no new caller
of it was added, so B2's replacement of that predicate meets nothing this step
wrote.
