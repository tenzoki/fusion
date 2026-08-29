# Turn 3, task T3-4 — the guard's own state file could switch it off, and the halt it wrote said nothing

**Status:** Complete
**Agent:** coder
**Circle:** `260801-1244-guard-rules-write`
**Closes:**
`260802-2334_*_a-shape-valid-escalation-json-makes-the-whole-guard-fail-open-on-both-surfaces.md` (Medium),
`260802-2336_*_the-bash-guard-halt-event-records-neither-the-command-nor-the-segment-it-blocked.md` (Low)
**Scope touched:** `hooks/lib/escalation.ts`, `hooks/guard.ts`,
`hooks/lib/__tests__/guard-escalation-shape.test.ts` (new),
`hooks/lib/__tests__/guard-halt-event.test.ts` (new),
`hooks/lib/__tests__/guard-bash-wiring.test.ts`
**Tests:** 1076 passed, 22 files (baseline 1047 / 20 files, +29 tests, +2 files)
**Not touched, by instruction:** `bin/monitor` (T3-6), `README-hooks.md` and
`rules/protected-path-discipline.md` (T3-7), `hooks/lib/rules-write-exemption.ts` and the
exemption logic (settled by T3-1 and T3-2 earlier this Turn).
**`hooks/dist/`:** tracked files restored to HEAD with `git checkout HEAD -- hooks/dist`
after the final run. The four UNTRACKED `dist/lib/{fs-locator,rules-write-exemption}.{js,d.ts}`
were already present and untracked on arrival; Plan Step 10 owns them and they were left
alone. No version bump.
**Not committed.** The orchestrator commits after validation.

## Why the two are one task, and how they were kept separable

Both sit in `hooks/`, both are small, and both are about what the guard RECORDS rather than
what it decides. They share no file: finding 1 is entirely `lib/escalation.ts`, finding 2 is
entirely `guard.ts` plus one existing wiring test. Each has its own new test file. Reverting
either is a clean `git checkout` of a disjoint set, and neither test file references the
other's change.

## Finding 1 — a shape-valid `escalation.json` switched the whole guard off

### What the defect was

`loadEscalation` read the file and cast: `JSON.parse(content) as EscalationState`. The
`try/catch` around it handles a MISSING file and UNPARSEABLE text. It does not handle text
that parses to a perfectly valid JSON value of the wrong SHAPE, and the `as` told the type
checker not to care. Every later access then threw — `state.recentEvents.push(…)` on
`undefined`, `state.haltActive` on `null` — and `main().catch` in `guard.ts` fails OPEN: one
stderr line, then `{}` on stdout, which Claude Code reads as ALLOW.

### Measured, before and after

Real guard subprocess, throwaway project per row, no flag set, attacking `agents/coder.md`,
which is plainly protected. Measured with a standalone script rather than through the test
harness, because the harness deliberately throws on a `[guard] Error:` stderr line and would
have hidden the production verdict behind a harness failure.

```
  escalation.json content         Edit agents/coder.md          Bash rm -f agents/coder.md
  ------------------------------  ---------------------------   ---------------------------
  {}                              ALLOW (fail-open) → deny      ALLOW (fail-open) → deny
  {…} without recentEvents        ALLOW (fail-open) → deny      ALLOW (fail-open) → deny
  {"recentEvents":{}}             ALLOW (fail-open) → deny      ALLOW (fail-open) → deny
  null                            ALLOW (fail-open) → deny      ALLOW (fail-open) → deny
  truncated JSON                  deny → deny                   deny → deny
  empty file                      deny → deny                   deny → deny
```

The four rows that failed open are exactly the four that are well-formed JSON. The two that
behaved are the two the `catch` was written for. After the fix, all twelve deny and stderr is
empty on every row.

The stderr lines that were the whole of the diagnostic before:

```
[guard] Error: TypeError: Cannot read properties of undefined (reading 'push')
[guard] Error: TypeError: state.recentEvents.push is not a function
[guard] Error: TypeError: Cannot read properties of null (reading 'haltActive')
```

### What was done

Direction 1 from the issue, as instructed, and nothing beyond it. `coerceState` in
`lib/escalation.ts` requires an object (rejecting `null` and arrays), defaults every field,
and forces `recentEvents` to an array. A well-formed file round-trips unchanged.

Two coercions lean restrictive rather than literal, and the reason is written into the
docstring because a later editor would otherwise "fix" them:

- `haltActive` uses `Boolean(raw.haltActive)`, not `=== true`. A halt is the RESTRICTIVE
  state and a user can always clear it with `clear-halt.js`. Reading a hand-edited
  `"haltActive": "true"` as un-halted is the worse of the two errors.
- `consecutiveBlocks` is clamped to a non-negative integer. A negative or fractional count
  read verbatim would push the halt threshold further away.

Elements of `recentEvents` are NOT validated, and that is a decision rather than an
oversight. Measured: they are only appended to, trimmed and re-serialised; the sole reader of
their fields is `clear-halt.ts:20-22`, where a garbage element prints `undefined` inside a
template string rather than throwing. Validating them would buy nothing this function exists
to buy.

### What was deliberately NOT done

The fail-open policy in `guard.ts` (`main().catch` → `allow()`) is untouched. Directions 2
and 3 in the issue change that policy, and the issue says explicitly it belongs in a decision
record and not in this Circle. No decision record was filed either: the current choice is
already named in the issue's own "Candidate directions" section, which survives at `_c_`, and
filing a second record saying the same thing would be duplication rather than a decision.

### Tests

`hooks/lib/__tests__/guard-escalation-shape.test.ts`, 19 cases, all against the shipped
guard as a subprocess:

- the six rows × two surfaces (12), asserting `decision === "block"` — the PRODUCTION
  verdict, not merely that the harness refused the result;
- two anti-vacuity controls: a well-formed HALTED file seeded through the same route,
  asserting the reason contains `[HALTED]`. Without these, a malformed row that denied only
  because the seeded file was never read at all would pass and prove nothing;
- three "no behaviour change" cases: `consecutiveBlocks` carried forward so the halt
  threshold is unmoved, `recentEvents` on disk kept rather than dropped, and an unprotected
  write still allowed;
- two cases locking in the restrictive coercions.

The rows are seeded through `withProject`'s `files` option, which writes content VERBATIM.
The harness's `escalation` option cannot express them: it merges a partial over a well-formed
snapshot and stringifies the result, so by construction it only produces valid shapes. No
harness change was needed.

### Anti-vacuity, measured

Reverting `loadEscalation` to the `as` cast and re-running: **10 of the 19 fail.** The 9 that
still pass are the four rows the original `catch` already handled (truncated JSON and empty
file, both surfaces), the two halted controls, the two well-formed-file cases, and the
truthy-`haltActive` case — which passes because the old code returned the raw value and `"true"`
is truthy in JS. That one is a lock-in test, not a regression detector, and is recorded as
such.

## Finding 2 — the halt event named neither the command nor the surface

### What the defect was

`STEP 2a` passed `mutation.targetPath` and a constant detail. `targetPath` is populated on a
DENYING verdict only, while the halt fires on `mutation.mutates` — the common case being a
command that mutates something UNPROTECTED (`rm notes.txt`, `echo hi > out.txt`). For all of
those the file field was `undefined` and the detail was a constant, so a halted session left
a run of identical rows saying "something mutating was blocked, ten times".

### What the event now carries

`Halt active — mutating Bash command blocked: <segment or command>`. The segment when the
halted command was ALSO protected — that verdict does carry `offendingSegment`, already
rendered with its quoted literals redacted back into place — otherwise the raw command, which
is what the agent typed and carries no classifier placeholders. Both go through a new
`forEvent` helper that collapses whitespace to one line and truncates at 200 characters.

The collapse is for the reader and the monitor's single-line row, not for the file format:
`emitEvent` serialises through `JSON.stringify`, so a newline could never have broken the
JSONL framing. Truncation is what keeps an 80-operand `rm` from turning `events.jsonl` into a
transcript.

`mutation.targetPath` is still passed as the file field. It is correct when set, and the
detail no longer depends on it.

### The closing observation: confirmed, and it was as cheap as it looked

`guard_halt` reaches the log from three kinds of place and the monitor renders all three into
one row type. They now say which they are:

```
  Halt active — write tool call blocked                    a halted guard refusing a write
  Halt active — mutating Bash command blocked: <segment>   a halted guard refusing a shell mutation
  Halt raised by this block — <cause>                      the block that tripped the threshold
```

The third prefix comes from ONE new `emitBlockEvent(halted, tool, file, detail)` helper, not
from four copies of an inline ternary at the four `recordBlock` sites (git deny, Bash
protected path, write-tool protected path, decision-governed). Four copies of one conditional
is the "pile of point-solutions" shape `rules/critical-stance.md` §2 names, and the
distinction is a property of the block/halt pair, so it lives with the pair. Non-halt details
pass through unchanged, so an ordinary `guard_block` row reads exactly as it always has.

### One correction to the issue text

The issue states the sibling protected-path deny "does it properly: it passes
`mutation.targetPath` … and a detail naming `mutation.offendingSegment`". It did not. It
passed the constant `"Protected path"`; the segment reached only the escalation record, via
the block reason that `recordBlock` stores. That site now carries
`Protected path: <segment>`, which is what the issue described as already true, and which is
the asymmetry worth closing: on the shell surface the file field cannot carry a command line.
The write-tool sibling keeps the bare `"Protected path"`, because there the tool call IS the
path and the file field already has it.

### The one existing test that had to move

`guard-bash-wiring.test.ts` asserted the literal `halted ? "guard_halt" : "guard_block"`
inside `bashPathCode()`, which slices `guard.ts` from `function guardBashCommand(` to
`async function main(`. The helper sits above that slice, so the assertion was split rather
than dropped: the Bash path must call `emitBlockEvent(`, the write path must call it too, and
a new `blockEmitterCode()` slice must still contain the event-type ternary. Asserting only
the call would let the ternary be deleted from the helper; asserting only the helper would
let either path stop using it.

### Tests

`hooks/lib/__tests__/guard-halt-event.test.ts`, 10 cases, all asserted on the `events.jsonl`
the guard actually wrote rather than on source text: the unprotected command (where
`targetPath` is undefined and the detail was all there was), a redirection, the
segment-preferred case, the collapse-and-truncate case, a read-only command that logs
nothing, the three source-distinguishing cases, the git branch block staying free of the
halt prefix, and the Bash protected-path deny naming its segment.

### Anti-vacuity, measured

Reverting all four detail strings to their pre-fix values and re-running: **7 of the 10
fail.** The 3 that still pass assert properties that already held — a read-only command logs
nothing under a halt, the Bash halt detail contains "mutating Bash command blocked", and the
git branch block carries no halt prefix. `guard-bash-wiring.test.ts` stays green under that
stub, which is the correct separation: it gates STRUCTURE (the helper exists and both paths
use it), while `guard-halt-event.test.ts` gates CONTENT.

## Residuals, each with its measurement

1. **`recentEvents` elements are unvalidated.** Measured: appended to, trimmed,
   re-serialised, and read only by `clear-halt.ts:20-22`, where a garbage element renders as
   `undefined` in a template string. No throw, so no fail-open. Not worth closing.
2. **`bin/monitor` reads `recentEvents` and `events.jsonl` and is T3-6's.** The new detail
   strings are longer than the old constants. Not measured against the monitor's row
   rendering, because the monitor is out of scope for this task; T3-6 should look at the
   three new shapes.
3. **The fail-open policy itself is unchanged and remains reachable.** Any exception in
   `guard.ts` outside a `try` still ends at `main().catch` → `allow()`. This task closed the
   one measured route into it; it did not close the door. That is the issue's own instruction
   and is named here so the choice stays visible.
4. **The git branch deny's detail is now truncated too**, because it shares `forEvent`. Not a
   behaviour change anyone asked for, and harmless: measured at
   `Git branch-switch denied: git switch main`, unchanged for every realistic command, and
   bounded for an unrealistic one.
