# coder — /fusion:direct gains a shaper question relay

**Date:** 2026-08-15
**Agent:** coder
**Status:** Complete
**Source record:** `260813-1334_*_fusion-direct-documents-a-shaper-clarification-flow-that-a-dispatched-sub-agent-cannot-run.md`

## What was wrong

`skills/direct/SKILL.md` dispatched the shaper as a sub-agent and then described an interactive
clarification dialogue the shaper cannot hold: a dispatched shaper receives no `AskUserQuestion`,
and `agents/shaper.md` says so plainly. Three passages in the skill promised the dialogue anyway —
the header sentence, the Step 4 bullet list, and the line closing Step 4. The second half of the gap
sat in the shaper's own prompt, whose enumeration of dispatchers that relay named only the
orchestrator's three paths, so a shaper dispatched by this skill had no stated return address.

## What was changed

`skills/direct/SKILL.md`

- `allowed-tools` gained `AskUserQuestion`. Without it the skill body cannot ask, and the relay is
  the skill body asking on the dispatched agent's behalf.
- New **Step 4b — Relay shaper's questions to the user**, between the dispatch and the confirmation.
  It is the shape `skills/next/SKILL.md` Step 5b already uses for the playmaker, not a second shape
  for the same problem: state why the grant does not travel to a sub-agent, name the no-op case
  (a first report that already carries the Circle), put the round to the user as the agent wrote it,
  re-dispatch, repeat.
- Two details the relay carries because sub-agents share no memory. Every re-dispatch repeats the
  **whole Step 4 parameter block verbatim** — mode, draft, domain — since a parameter dropped from a
  cold-start re-dispatch is dropped for good. And the answers travel **in the user's own words**
  rather than paraphrased into the skill's framing, because that wording is the input shaper's next
  round reads.
- The three passages that promised an interactive shaper now name the relay.
- `## Boundaries` records that Step 4b adds no write of its own.

`agents/shaper.md`

- The dispatcher enumeration at `:121` now includes `/fusion:direct`'s anticipated-circle dispatch
  and cites the relay step by name.
- The return address in that bullet, and the same phrase at `:162`, changed from *the orchestrator*
  to *whoever dispatched you* / *your dispatcher*. Two dispatchers now relay, and naming one of them
  in the contract is how the skill came to be missing from it in the first place.

## What was not done

The record's behavioural claim — that two shaper dispatches in an earlier session returned questions
as report text — was reported by an orchestrator and is on no disk artifact. It was not reproduced.
The record itself says the documentation contradiction alone is sufficient, since the fix is the
same either way, and that is the basis this fix stands on. The contradiction was verified by reading
both passages.

## Verification

`cd hooks && npm test` in a detached worktree carrying only this patch: 40 test files, 751 tests,
one failure. The failure is `surface-growth-bound.test.ts > matches the checked-in golden, surface
by surface`, which compares a per-file byte inventory that goes stale on any edit to a bounded
surface. It was **not** regenerated: several tasks in this Turn edit bounded surfaces, and the
orchestrator regenerates the golden once at the end.

Both growth bounds pass on their own assertions: *holds agents inside its own head-room of 18000
bytes* and *holds skills inside its own head-room of 20000 bytes*, each green.

Byte deltas: `agents/shaper.md` 25320 → 25421 (+101), `skills/direct/SKILL.md` 9232 → 10799
(+1567). The skill ran about 850 bytes over the dispatch's rough estimate. The overrun is the
relay's fenced parameter block plus the two no-memory sentences; nothing in the step restates a fact
`/fusion:next` Step 5b already carries.
