# The fourth SessionStart command is asserted by nothing, and its own suite warns about exactly that

---
`hooks/session-id.ts` was measured working end to end. Nothing in `npm test` says it is wired,
and `hooks-wiring.test.ts` exists because a hook can be entirely correct and entirely
unreachable with a green suite either way.

---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

**Severity:** Medium

**Cross-references:**
`hooks/lib/__tests__/hooks-wiring.test.ts`, the describe block "the working-directory warning runs at SessionStart";
`hooks/session-id.ts`;
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/analyses/260825-2214-can-a-hook-obtain-the-session-identifier.md`,
finding (b).

## What is uncovered

Two things, and the second is the one that bites.

**The wiring.** No assertion says `hooks.json` invokes `dist/session-id.js` from a SessionStart
entry. The existing SessionStart cases in `hooks-wiring.test.ts` use `.some(...)`, so they stayed
green when the fourth command was added and would stay green if it were removed. That file's own
header states the failure class in as many words: the hook can be correct and unreachable, with
a green suite either way.

**The channel.** No assertion says the module writes its line on PLAIN stdout rather than inside
a `hookSpecificOutput` envelope. This is the sharper gap. `hookSpecificOutput.systemMessage`
reaches the user and never the model, measured; a well-meant edit that wrapped this hook's line
in an envelope "for consistency with `session-start.ts`" would emit valid JSON, exit 0, log as a
successful hook and put nothing in front of the model. Nothing anywhere would go red, and the
orchestrator's event lines would quietly lose the field with no reader able to tell that from a
session where the identifier legitimately did not resolve.

## What does stand in the meantime

The delivery was measured end to end on 2026-08-26, in `/tmp/fusion-sessionid-260826`, outside
every git tree, against Claude Code 2.1.245. The transcript's `hook_success` attachment for
`node .../hooks/dist/session-id.js` read
`"content": "fusion: session_id=102df4a8-09be-4019-8a6b-adaec6e95bc5"`, equal to that run's own
reported identifier. A measurement is not a gate: it says the code was right once.

## Why it was not covered in place

The step's dispatch enumerated the test files it may touch and `hooks-wiring.test.ts` is not
among them. Line budget was not the constraint: 36 of the 62 available hook-test lines were
still unspent.

## Fix direction

Two cases in `hooks-wiring.test.ts`. One asserting a SessionStart command invokes
`dist/session-id.js`, in the shape the two cases above it already use. One spawning the built
module with a payload carrying a `session_id` and asserting stdout is the bare line and parses
as JSON in NO reading — that is the assertion that pins the channel, and it costs one spawn.
A payload with no `session_id`, and one with an empty one, should both produce empty stdout:
absent, never empty.
