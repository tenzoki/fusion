# The history filename is minute-resolution and is now the session identity the drift anchor matches on

---

**Severity:** Low — a naming scheme that was cosmetic became a correctness assumption, unnoticed
**Domain:** code
**Filed by:** coderev (review of `e3da397..a6b4928`, Turn 5)
**Affects:** `hooks/lib/state-drift.ts:324` (`sessionAnchor` case 1), `rules/fusion-workbench-conventions.md:258` (the session-history filename pattern)

---

## What is wrong

`e61e24a` makes the session history file the session's identity. `hooks/lib/state-drift.ts` says so in the docstring it added:

> `session_start` now carries `history_file`, and **a session keeps one history file for its whole life**: a resume inherits it, a Restart creates a new one.

The first half of that is true and is the property the fix rests on. The second half — that a history file belongs to exactly one session — is not guaranteed by anything. The filename pattern is `YYMMDD-HHMM-<topic>.md` (`rules/fusion-workbench-conventions.md:258`) with the stamp from `date +%y%m%d-%H%M`, so it is unique only to the minute, and the `<topic>` segment is the fixed string `orchestrator-session` for every orchestrator session in the same store.

Two sessions beginning in the same minute in the same store therefore produce the same path. `sessionAnchor`'s case 1 takes the **first** `session_start` naming it:

```ts
const named = starts.find((i) => lines[i].includes(historyRel));
if (named !== undefined) return { from: named, why: "" };
```

so the second session's Turn count would run from the first session's start and fold the first session's Turns in — which is precisely the Restart-after-crash failure the record for `260811-2143` rejected the positional rule for.

## How reachable this is

Narrow, and stated as an inference rather than a measurement: it needs a Restart (or a fresh session) inside the same clock minute as the previous one, in the same store, with the previous session's `session_start` still in the read tail. A crash-and-immediate-restart is the realistic route, and `/fusion:setup` writes no collision check — step 6 creates the file at the computed path with no test for an existing one. I have not reproduced it; the mechanism is read from the source.

The related and slightly wider case: step 6 would also **overwrite** the earlier session's history file, which is a data loss independent of the drift row.

## Fix direction

Two candidates, and they answer different amounts of the question:

1. **Make the creation collision-aware** — step 6 (and `skills/setup/SKILL.md` Step 4) refuse to overwrite an existing history file and suffix the path. Closes the overwrite and the anchor case together, and needs no schema change.
2. **Carry a real session id** in `session_start` and `agentstate.yaml` instead of leaning on a path. Exact, and larger than this record justifies on its own — but it is the same "obtain the input rather than approximate it" move `e61e24a` already made once, so if a second identity consumer appears it is the direction to take.

Direction 1 is the proportionate one now. Whether the naming scheme should carry identity at all is worth one line in the module docstring either way, because the docstring currently asserts the property rather than establishing it.

## Acceptance criteria

- Setup cannot silently overwrite an existing session history file.
- The `sessionAnchor` docstring states what makes a history path unique to one session, or names the residual.
