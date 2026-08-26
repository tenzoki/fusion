# P-11 — the session identifier, both branches taken

**Date:** 2026-08-26 08:46
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Status:** Complete
**Task:** P-11, Turn 2, step 11 of
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/planning/260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`

## What the step asked

Two independent conditionals, each on its own measured answer, from
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/analyses/260825-2214-can-a-hook-obtain-the-session-identifier.md`.
Both came back positive, so both branches were taken.

## Branch 2 — `session_id` on the guard log's rows

`hooks/lib/events.ts` gains an optional `session_id` on `GuardEvent` and a `setEventSession`
seam. `hooks/guard.ts` and `hooks/tracker.ts` each call it once, immediately after parsing their
input.

The seam is a module variable rather than a fifth parameter on `emitEvent`, for one reason that
decided it: both hooks emit a `guard_error` row from their top-level `main().catch()` handler,
which sits outside `main` and has no `input` in scope. A parameter would mean each hook hoisting
a module variable of its own — this variable, twice, with two chances to disagree about when it
is set.

Unresolved means the key is ABSENT from the row, never present and empty, which is the rule
`agents/orchestrator.md` `### 2. Structured Event Log` states for `person` and `checkout`. A run
that never reaches its parse never calls the seam, so its rows say so by omission.

### What `bin/monitor` does with the new field

Measured, not read off. A temporary workbench was served over `GET /api/dashboard` with three
seeded rows: a `guard_allow` carrying `session_id`, a `guard_advisory` carrying it, and a
`guard_advisory` without it.

- The `guard_allow` row never reaches the panel at all. `guard_allow` is not in
  `WARNING_EVENT_TYPES` (`bin/monitor:181`), so the write trace's copy of the field is invisible
  to the dashboard by construction.
- The two advisory rows both came back in the `warnings` array, byte-identical to what was
  seeded, `session_id` carried through on the one that had it. The field is passed to the client
  and rendered from by nothing: the row template reads `event`, `detail` and `ts`
  (`bin/monitor:666`).
- Dismissals are unaffected. `warningKey` is built from `event`, `file` and `detail`
  (`bin/monitor:586`), so a row a user dismissed before this change keeps its key and stays
  dismissed.

## Branch 1 — `session_id` on the orchestrator's own lines

New hook `hooks/session-id.ts`, wired as a fourth SessionStart command in `hooks/hooks.json`. It
reads the payload, and prints `fusion: session_id=<uuid>` on **plain stdout**.

**The channel was measured, and then measured again for this implementation.** Finding (b) of
the analysis established that plain stdout from a SessionStart hook is copied verbatim into the
model's context while `hookSpecificOutput.systemMessage` never reaches the model at all.
`hookSpecificOutput.additionalContext` is NOT measured on this event and is NOT used: it is the
obvious clean-looking implementation, and a delivery built on an unmeasured channel emits
correctly, exits 0, logs as a successful hook and puts nothing in front of the model.

This module's own delivery was then measured end to end on 2026-08-26 in
`/tmp/fusion-sessionid-260826`, a throwaway project outside every git tree, against Claude Code
2.1.245, the way the analysis did it. The transcript's `hook_success` attachment read:

```
"hookName": "SessionStart:startup",
"content": "fusion: session_id=102df4a8-09be-4019-8a6b-adaec6e95bc5",
"stdout": "fusion: session_id=102df4a8-09be-4019-8a6b-adaec6e95bc5\n",
"exitCode": 0,
"command": "node /Users/k1/Projects/productive/fusion/hooks/dist/session-id.js"
```

`content` non-empty is the harness's own record that the line became context, independent of the
model's testimony; the run's reported `session_id` and the transcript's filename carry the same
UUID. The model, asked separately, reproduced the line verbatim.

A fourth command rather than a line inside `session-start.ts`: one process writes one stdout,
and the two hooks need opposite channels. `session-start.ts` warns the USER about a working
directory below the project root and must keep `systemMessage`; this value is for the MODEL. A
recognised JSON object routes `systemMessage` away and leaves `content` empty, so whichever half
went into the envelope is the half that would disappear. `session-start.ts`'s `## Channel`
section was extended to name the sibling and its measurement; its own channel is unchanged.

`agents/orchestrator.md` gained three edits: a Setup step 2 bullet saying where the value is read
and how `<ID>` is extended, the field in the event schema block, and a sentence in
`### 2. Structured Event Log`.

### What the identifier buys, stated rather than judged

The plan's note reasoned that a resumed session keeps its history file while receiving a fresh
`session_id`, so the field might buy little. The correction is
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0805_*_the-resumption-measurement-answers-for-claude-codes-resume-and-the-plan-asked-about-fusions.md`,
and it runs the other way. A fusion resume is not `claude --resume`: it is a NEW Claude Code
session that finds `agentstate.yaml` and carries on with `session.history_file` held fixed. So
two processes share one `history_file` and carry two `session_id` values. The two fields do not
partition the log identically, and this one distinguishes something nothing in the log
distinguishes today.

## Verification

`cd hooks && npm test` — exit 0, 776 tests across 44 files.

Both bounded surfaces measured after the change, neither over:

| Surface | Measured | Budget |
|---|---|---|
| `agents/` bytes | 417 412 | 417 843 |
| hook-test lines | 20 349 | 20 375 |

No baseline map was touched. `git diff HEAD` is empty for
`hooks/lib/__tests__/surface-growth-bound.test.ts`,
`hooks/lib/__tests__/rules-emission-golden.test.ts` and
`hooks/lib/__tests__/reference-resolution-lint.test.ts`, so `TEST_LINE_BASELINE`,
`AGENT_BASELINE`, `SKILL_BASELINE` and `BASELINE` all stand where they stood. The golden was
regenerated last and the suite re-run without the flag.

## Defects filed

Three, all from the same cause: the step's file scope had no room for the surfaces its two
branches touched. Line and byte budget were not the constraint in any of the three — 36 hook-test
lines and 431 `agents/` bytes went unspent.

- `260826-0846_o_a-fourth-sessionstart-command-lands-and-four-prose-sites-still-say-there-are-three.md`
- `260826-0847_o_the-session-id-row-assertion-sits-in-the-state-load-suite-because-that-was-the-only-permitted-file.md`
- `260826-0848_o_the-fourth-sessionstart-command-is-asserted-by-nothing-and-its-own-suite-warns-about-exactly-that.md`

## Not done, deliberately

The plan file now has all eleven steps at `[DONE]`. Its `**Status:**` still reads `Draft` and its
marker is still `_o_`. The dispatch's permission on that file was "step 11 to `[DONE]`" and
nothing further, and closing a plan is bound up with the Circle's Phase-4 stop-conditions gate,
which is the orchestrator's.
