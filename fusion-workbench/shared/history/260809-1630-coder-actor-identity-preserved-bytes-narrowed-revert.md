# Step 5 of the five-severe-guard-defects plan: the bytes are kept, and the revert narrows at the four write tools

**Date:** 2026-08-09
**Agent:** coder
**Status:** Complete
**Plan:** `shared/planning/260809-1229_o_plan-five-severe-guard-defects.md`, Step 5
**Binding decision:** `shared/decisions/260809-1527_a_should-the-revert-narrow-to-the-payload-path-for-the-four-write-tools.md` (option 2, taken at the plan gate) — it **overrules** point 5 of the planned step
**Closes (code half):** `shared/issues/260809-1107_o_any-writer-active-during-the-tool-call-window-is-attributed-to-the-agent-and-reverted.md` (High). Its specification half is Step 6.

---

## What was implemented

The guard cannot tell who wrote inside the tool-call window. Two answers to that,
one for each half of the damage.

**1. What is written over is kept.** A new module, `hooks/lib/reverted-copy.ts`,
copies what a protected path was *observed* to hold into
`fusion-workbench/.guard-state/reverted/<timestamp>-<flattened path>` before
anything is written back, and hands the name of the copy to `tracker.ts`, which
puts it in the sentence the model reads and in the `guard_block` event. A revert
that is recoverable is a different failure from one that is not.

The observed value comes from `after.paths[change.path]` — the after-snapshot the
measurement already took, exactly the seam Step 4 left. The file is not read a
second time: that would be a second answer to a question the comparison has
already answered, and the two are free to disagree.

The copy is total over the fingerprint's three-value domain rather than handling
only the common case: `ABSENT` keeps nothing (there were no observed bytes, and
the revert restores content rather than destroying any), a `LINK_PREFIX` value
recreates the link, base64 writes the bytes as bytes.

**2. What is written back narrows, for the four write tools only.** For `Write`,
`Edit`, `MultiEdit` and `NotebookEdit` the payload names the path the tool
writes, so a changed protected path *other* than that one was moved by something
that is not this tool call. That path is preserved, described, emitted as its own
`guard_block` and still raises the halt — but it is not written back.

`Bash` keeps the full revert of every changed protected path. The narrowing rests
on the payload naming the target, and a shell command's text names nothing of the
kind; extending it there would bring back exactly the undecidable question
v6.0.0 removed.

Two directions were chosen conservatively and are stated in the code:

- A write tool whose payload holds no usable path yields the **full** revert.
  Absence of evidence is not evidence of a concurrent writer.
- The payload path is lifted into the measurement's coordinate space
  (`resolve(process.cwd(), raw)` then `projectRelative(…, root)`) and compared
  **folded**, because the protected patterns match folded. A payload landing
  outside the root matches nothing and therefore spares nothing.

**3. Retention is a count.** `RETAINED_COPIES = 20`, pruned on every write. The
plan's open question offered count, age, or both; the count was taken, and the
reason is recorded in the module: an age bound expires the evidence exactly when
a long session finally goes looking for it. `events.jsonl` is already an
unbounded writer with an open issue against it and a second one is not something
a defect fix gets to add.

**4. The message stopped asserting a cause.** The per-path sentences are
unchanged in substance — they say what was measured and what was done — and the
framing sentence is new: *"What the guard measures is the window around the call,
not who wrote in it: your own tool call, the user saving in their editor, a file
watcher and a second session are indistinguishable here, so this may not have
been you."* A spared path gets its own sentence naming the payload path that
spared it.

**5. The root arrives as a parameter.** `preserveObserved(root, rel, observed)`
does not walk up for itself. That is consolidation target C4's shape, taken now
so C4 has one fewer call site to convert — and so the writer cannot answer a
different directory from the one the measurement is anchored at.

## Files

- `hooks/lib/reverted-copy.ts` — new.
- `hooks/tracker.ts` — `WRITE_TOOLS` hoisted to module scope (two readers now:
  the churn filter and the narrowing), `RevertOutcome` → `MeasuredOutcome` with a
  three-value verdict, `preserve`, `narrowingTarget`, `describe` extended, the
  measurement body and the message.
- `hooks/lib/__tests__/protected-snapshot-integration.test.ts` — two new describe
  blocks, nine cases. No existing case edited.
- `README-hooks.md` — the `lib/` file table. Required, not optional: the
  derivable-enumerations lint asserts that table lists exactly the files that
  exist, so a new module without a row is a red suite.

## Verification

Everything ran through `lib/__tests__/helpers/guard-harness.ts`, in throwaway
project roots outside this repository, with both hooks spawned as real
subprocesses. The write guard stands down here by design, so an assertion written
naively in this tree would pass without the mechanism running.

**Suite:** `npm test` in `hooks/` — 33 files, **1078 tests**, 0 failures, exit
code `0` read out explicitly. Baseline at `62f5490` was 33 files and 1069 tests;
the nine new cases are the difference, and no test was deleted or edited.

### Anti-vacuity, measured

Six runs: the tree at `62f5490` with the new tests in place, and five mutations
of the shipped code. Each run restored the sources afterwards and the restoration
was verified by diff. What falls where:

| Run | What was damaged | New cases failing |
|---|---|---|
| M0 | `tracker.ts` at `62f5490` (the module present but unused) | 6 of 9 |
| M1 | the preservation write removed | 6 |
| M1b | a copy written even when nothing was observed | 1 — the deleted-path case |
| M2 | the narrowing extended to `Bash` | 5, **including OBLIGATION 4** (plus 19 pre-existing revert cases) |
| M3 | the narrowing removed entirely | 2 — the two spared-path cases |
| M4 | an unreadable payload spares everything | 1 — the no-path control |
| M5 | the comparison inverted (the payload path is the spared one) | 3, plus one pre-existing write-tool revert case |

Three of the nine cases pass at M0, and that is reported rather than glossed:
they are complement cases, and a complement cannot be red before the change it
complements exists. Each is pinned by a named mutation instead — the deleted-path
case by M1b, the "still reverts the path the write tool names" control by M5, the
"no path in the payload" control by M4. No new case survives every mutation.

M1 is the row the plan's anti-vacuity table asks for from the other side as well:
removing the preservation write must **not** break the revert and halt
assertions. It does not — the 30 pre-existing cases in that file all stay green
under M1, and the six failures are all in the new blocks.

M2 is obligation 4 discharged by measurement rather than by assertion: extending
the narrowing to `Bash` turns 24 of 39 cases in that file red, and the case named
`OBLIGATION 4: Bash still reverts every changed protected path, narrowing
nothing` is among them.

### One existing expectation had to be written differently, and it is not a behaviour change

The Edit-spares-another-path case first asserted the `guard_block` events as a
list of two files and found three entries. The third is the **PreToolUse** guard
denying that Edit outright — its payload names a protected path — which emits its
own `guard_block` before the measurement runs. The assertion became a set, with
the reason written next to it. No existing test file was touched.

## The four obligations from the decision record

1. **Narrowing limited to the four write tools; `Bash` unchanged.** Done, and
   held by M2 above.
2. **A path that is not reverted is still preserved, reported and evented.** Done:
   preservation runs for every violation before any branch, the message carries a
   sentence naming the payload path that spared it, and the `guard_block` loop is
   over all outcomes.
3. **The halt is unchanged.** Done: the halt is raised whenever any violation is
   measured, whatever each outcome's verdict, and the case asserts it in the
   spared branch.
4. **A test pins the `Bash` half explicitly.** Done, named for the obligation.

None of the four is left open.

## Bookkeeping

- Step 5 marked `[DONE]` in the plan, with a correction note under its point 5
  recording that the gate overruled it and what shipped instead. Marking the step
  done while its own text said "do not change what is reverted" would have left a
  false record.
- Both Open Questions this step touched are answered in the plan: the narrowing
  (option 2, with the record cited) and the retention (count, not age).
- `260809-1107` stays `_o_`. The plan holds all five issues open until Step 6,
  and this issue's first acceptance criterion — the third price in
  `rules/protected-path-discipline.md` — is Step 6's.

## Open

- **The decision record's `Implemented:` line is still empty and its marker is
  still `_a_`.** The convention is to cite the commit hash, and this task was
  explicitly not to commit. Whoever commits should fill in
  `Implemented: <short-hash> — the revert narrows at the four write tools, Bash
  unchanged` and rename `_a_` → `_i_`.
- **Step 0 of the plan is still unsatisfied**, unchanged from the previous
  session: `~/.fusion` is at `6.0.1`, the work tree at `6.1.0`. It changes nothing
  about this verification, which spawns the work-tree build through `tsx`.
- **The copies live in `.guard-state/`, which an agent can delete.** Stated in the
  module rather than papered over: they protect against accident, which is the
  case `260809-1107` describes, not against an agent that means to lose them. The
  general form is the open decision `260807-0945_o_integritaet-des-eskalationsspeichers`.
