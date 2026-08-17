# The Phase 4 queue retirement writes through unchecked resolver values, and can move the queue to the workbench root

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241`, Turn 1)
**Affects:** `agents/orchestrator.md` Phase 4 step 4, the retirement snippet (`P=$(... fusion-paths orchestrator ...)`, `mkdir -p "$WORKBENCH/$P"`, `mv "$Q" "$WORKBENCH/$P/..."`)
**Cross-references:** commit `ff70d3a`; `rules/fusion-workbench-conventions.md` `## Path Resolution` → *Where the call belongs* (added by `e99f0ef` in this same range); commit `6a69717` (`/fusion:cadence`, the same hazard guarded)

---

## The defect

The retirement snippet added at Phase 4 step 4 resolves a store path and then writes through it
without checking it:

```bash
Q=fusion-workbench/tasklist.md
G=$(grep -m1 '^\*\*Active Circle:\*\*' "$Q" 2>/dev/null | ...)
if [ -n "$G" ] && [ "$G" = "$(basename "$DIR")" ]; then
  P=$("$FUSION_PLUGIN_ROOT/bin/fusion-paths" orchestrator | sed -n 's/^OUT_PLAN=//p')
  mkdir -p "$WORKBENCH/$P"
  mv "$Q" "$WORKBENCH/$P/$(date +%y%m%d-%H%M)_c_retired-tasklist.md"
fi
```

Two expansions are unguarded.

**`$P` empty.** `fusion-paths` exiting 3 or 4 prints nothing on stdout, so `sed -n 's/^OUT_PLAN=//p'`
yields the empty string. `mkdir -p "$WORKBENCH/"` then succeeds, and the `mv` lands the queue at
`$WORKBENCH/<stamp>_c_retired-tasklist.md` — the **workbench root**, among the root-anchored surfaces
that `rules/fusion-workbench-conventions.md` marks as not negotiable. The `_c_` marker on a file at
the root is also a shape no scan expects.

**`$WORKBENCH` empty.** The prompt notes elsewhere that the Bash tool starts a fresh shell for every
call, so nothing exports resolver values between calls; they are held by the agent and substituted.
An unsubstituted `$WORKBENCH` alongside an empty `$P` makes the destination `//<stamp>_…`, i.e. the
filesystem root.

## Why this is the same range's own rule, broken

`e99f0ef` added this paragraph to `rules/fusion-workbench-conventions.md` — a file every agent loads
on every dispatch — three commits before `ff70d3a` added the snippet:

> **And what a consumer does with a key it cannot use: it stops and names that key.** An empty or
> unset value is never a default, a fallback, or an empty result — nothing is scanned through it,
> nothing written through it, and the run halts naming the key. […] An empty expansion is silent, so a
> consumer that does not check reports it as a finding.

And `6a69717`, two commits earlier still, added exactly the guard this snippet lacks to
`/fusion:cadence`, naming the identical failure:

> Without it an empty pair makes `mkdir -p "$WORKBENCH/$OUT_MEMO"` read as `mkdir -p "/"`, which
> succeeds, and the digest lands at `/cadence-$USER.md` instead of the memo store.

So the session established the rule, mechanised it in one consumer, and then wrote a new consumer
without it. This is a cross-cutting finding rather than an isolated one: it is evidence that the rule
landed as text and not yet as a habit.

## Why it matters more here than in cadence

`/fusion:cadence` writes a digest that can be regenerated. This snippet **moves** the work queue, and
the same section argues at length that the queue is the one artefact whose prose is not re-derivable
from the records ("Plain `mv`, never `rm`"). A misdirected `mv` puts the irreplaceable file somewhere
nobody will look for it, on the closure path, in the same command as the pointer clear — so the
session ends immediately afterwards and the operator is not there to notice.

## Fix direction

Add the emptiness assertion `/fusion:cadence` now carries, before the `mkdir`, and halt naming the key
rather than falling back. Reuse the wording already in `skills/cadence/SKILL.md` so there is one
spelling of this check in the tree, not two. Retiring nothing is the safe outcome; the queue stays
where it is and the closure still completes.

---

**Resolved:** 260810-0706 by `coder` (Turn 2, task R3). The `mkdir`/`mv` pair now sits inside
`[ -n "$WORKBENCH" ] && [ -n "$P" ]`, in the same spelling `/fusion:cadence` step 8 carries, with an
`else` that names both keys on stderr. The assertion is inside the `if` rather than in front of the
whole command, so an empty key skips the retirement without skipping the pointer clear — aborting
there would leave a renamed `_c_` record beside a live pointer.

The same shape was closed at two read sites in the same prompt: Setup Step 5's Circle count (an
unsubstituted pair made `find "/"` return nothing, indistinguishable from a workbench with no Circles,
so the portfolio hint was silently withheld) and the drift check's Circle Turn log row (silently
dropped; now named as unchecked).

Gate: `hooks/lib/__tests__/queue-retirement-empty-key.test.ts` extracts the Phase 4 block and runs it
against throwaway workbenches with a stub `fusion-paths`. Its negative control is
`git show ff70d3a:agents/orchestrator.md` run through the same helpers, not a transcribed fixture.

History: `fusion-workbench/shared/history/260810-0706-coder-queue-retirement-empty-key.md`
