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
