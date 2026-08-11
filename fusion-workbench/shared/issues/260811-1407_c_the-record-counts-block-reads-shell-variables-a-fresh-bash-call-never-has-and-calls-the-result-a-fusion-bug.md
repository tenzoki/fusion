# The record-counts block reads shell variables a fresh Bash call never has, and calls the result a fusion bug

---
**Severity:** Medium — a verbatim run of the shipped block aborts and blames fusion; the sibling block one section away carries the instruction that prevents it
**Domain:** code
**Filed by:** coderev, reviewing Turn 2 range `270c566..1d5eed6` (commit `7749845`, task 28)
**Affects:** `agents/orchestrator.md:615-636` — `### The record counts are computed, not tallied`
**Cross-references:** `agents/orchestrator.md:181` (the sibling block's substitution instruction); `agents/orchestrator.md:712` (the file's own statement that no resolved value survives); `rules/fusion-workbench-conventions.md` `## Path Resolution` → *Where the call belongs*

---

## The defect

The new block uses `$WORKBENCH`, `$SCAN_ISSUES` and `$SCAN_DECISIONS` as live shell variables and
asserts them non-empty:

```sh
[ -n "$WORKBENCH" ] && [ -n "$SCAN_ISSUES" ] && [ -n "$SCAN_DECISIONS" ] || { echo "fusion bug: a resolver key is empty — record counts not taken" >&2; exit 1; }
```

Nothing sets them. The Bash tool gives every call its own shell, which **this same prompt states
in full** at `:712`:

> The check repeats Setup step 2's because it has to: the Bash tool gives every call its own
> shell, so no value Setup resolved survives to here.

The prose introducing the new block (`:615`) says only *"`$WORKBENCH`, `$SCAN_ISSUES` and
`$SCAN_DECISIONS` are the values Setup step 2 resolved"*, which reads as "these variables hold
those values". The only other block in the file with this exact guard idiom — the Circle count at
`:178-179` — carries the missing sentence one line under it:

> **Substitute the `WORKBENCH` and `SCAN_CIRCLES` values from Step 2.**

The new block has no such line, and the third site (`:696-706`) re-resolves through
`bin/fusion-paths` inside the command instead.

## Measured

The block extracted verbatim from `agents/orchestrator.md:618-636` and run with the three
variables unset:

```
fusion bug: a resolver key is empty — record counts not taken
exit=1
```

So the first thing a model that pastes the block learns is that fusion is broken, when in fact
the values were simply never carried into that shell. The message is a correct assertion pointed
at the wrong cause.

## Fix direction

Add the substitution sentence the sibling block carries, or — preferably, since this block is
long enough that a model will paste rather than retype it — re-resolve inside the block the way
`:696-706` does:

```sh
eval "$("$FUSION_PLUGIN_ROOT/bin/fusion-paths" orchestrator | sed -n 's/^\(WORKBENCH\|SCAN_ISSUES\|SCAN_DECISIONS\)=/\1=/p')"
```

or three `sed -n 's/^KEY=//p'` reads. Whichever is chosen, the failure text should distinguish
"the resolver returned an empty key" (a fusion bug) from "the value was never substituted into
this shell" (a prompt-following error), because the remedies are opposite.

---
Resolved: The block resolves the three keys itself, the way the queue retirement at Phase 4 resolves
`OUT_PLAN`, rather than relying on a substitution sentence a reader has to act on:

```sh
R=$("$FUSION_PLUGIN_ROOT/bin/fusion-paths" orchestrator); X=$?
WORKBENCH=$(printf '%s\n' "$R" | sed -n 's/^WORKBENCH=//p')
SCAN_ISSUES=$(printf '%s\n' "$R" | sed -n 's/^SCAN_ISSUES=//p')
SCAN_DECISIONS=$(printf '%s\n' "$R" | sed -n 's/^SCAN_DECISIONS=//p')
```

The re-resolution was chosen over the sibling block's substitution sentence for the reason this
record gives: the block is long enough that a model pastes it rather than retypes it. `agentstate.yaml`
is now read through `$WORKBENCH` too, so the block no longer depends on the working directory being
the project root — verified by running it from `fusion-workbench/shared/`.

The assertion is kept, per `rules/fusion-workbench-conventions.md` `## Path Resolution` → *Where the
call belongs*, and now has real values to assert on. Its message stops calling the failure a fusion
bug: it prints `record counts not taken: fusion-paths exited $X and gave no value for WORKBENCH,
SCAN_ISSUES or SCAN_DECISIONS`, and the prose points at the resolver's exit-code table, where 3 is
the user's own `.active-circle` and 4 is a fusion bug. That is the distinction this record asked for;
the third possibility it named — a value never substituted into the shell — can no longer occur,
because nothing is substituted any more.

Measured: the block run in `/bin/bash` and `/bin/zsh` with `WORKBENCH`, `SCAN_ISSUES` and
`SCAN_DECISIONS` deleted from the environment exits 0 and prints the counts. With
`FUSION_PLUGIN_ROOT` pointed at a nonexistent directory it exits 1 with the message above and does
not say "fusion bug". Both cases are asserted in
`hooks/lib/__tests__/record-counts-measurement.test.ts`, whose runner deletes the three keys from the
environment on every run; its control shows the shipped block (commit `7749845`) exiting 1 with
`fusion bug` over the same fixture. `cd hooks && npm test` — 1270 passed, exit 0.
