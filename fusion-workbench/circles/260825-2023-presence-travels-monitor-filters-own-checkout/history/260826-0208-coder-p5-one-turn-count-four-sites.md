# P-5 — One Turn count, one implementation, four sites

**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Date:** 2026-08-26 02:08
**Circle:** 260825-2023-presence-travels-monitor-filters-own-checkout
**Plan:** `260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md` step 5

## What the four sites now say

Two of them printed the Turn count and two defined it, and none of the four agreed with any other.

`agents/orchestrator.md` Setup Step 1 sub-step 3 and `skills/setup/SKILL.md` Step 1 sub-step 2
carried the same command, byte for byte:

```
T=$(grep -c '"event":"turn_start"' fusion-workbench/orchestrator-events.jsonl 2>/dev/null)
```

Both now run the same `[ -x ]`-guarded call to `bin/fusion-events turns` in its place. The guard is
the one every other prompt-called helper carries and for the same reason: `$FUSION_PLUGIN_ROOT` is
the installed copy, pinned for the session, so a helper added between releases is absent there and a
bare call is exit 127.

`agents/orchestrator.md` Phase 2 step 3 keeps the definition — the `turn_start` events **this
checkout wrote** since this session's `session_start` — and now names the helper as that definition's
one implementation. The `progress.turn` row of the Persistent-State derivation table cites the helper
and the Phase 2 step 3 definition instead of restating the derivation a second time.

## The `scope=` key, and why it is the point of the step

The plan says the replacement must never fall back to the whole-file count. Until commit `7ae6aae`
a caller could not tell that `bin/fusion-events turns` had: the widening was announced on stderr
while stdout carried a number and the exit was 0. The helper now prints `scope=checkout` or
`scope=all-checkouts` on stdout, and both call sites read it. `scope=all-checkouts` is reported as
`unavailable` with its reason, and the number is not printed at all. Printing it with a caveat is
how the defect would have survived the repair.

The other two outcomes join it: no `turns=` line at all (the helper's exit 3 and 4) and an absent
helper are each `unavailable` with their own reason named. `turns=0` stays a real figure — the log
was read and the session stopped before its first Turn — and the surrounding rule that a figure
which could not be taken is never reported as `0` is unchanged.

The `if`/`else` form is deliberate and both files now say so. A `&&`/`||` one-liner prints the
fallback word after a helper that ran and reported a real non-zero, which is the fault the removed
`grep -c` prose warned about in its own terms. That warning was the one piece of the deleted
paragraph worth carrying forward.

## Measured

Over this repository's log the replaced block returns **154** and the helper returns **2**. The true
`turn_start` count in the file is 147: the block was wrong twice over, counting every session in the
file and counting by substring, so seven lines carrying the token inside a `detail` field were
counted as Turns.

## Surface budget — both files gained bytes, and the plan expected both to lose them

| File | Before | After | Delta |
|---|---|---|---|
| `agents/orchestrator.md` | 161 430 | 162 144 | **+714** |
| `skills/setup/SKILL.md` | 46 649 | 47 149 | **+500** |

Stated plainly rather than trimmed to fit. The plan estimated each file would drop roughly 700 bytes
of shell block and gain roughly 300 of guarded call and explanation. What was actually removable was
the `grep -c` mechanics, about 250 bytes per file; what had to be added was the four-outcome policy
for the helper's `scope=` and exit codes, which is longer than the mechanics it replaces. The
guarded `if`/`else` block is also five lines where the `grep -c` was two.

Both surfaces stayed inside their bounds — `surface-growth-bound.test.ts` passed its bound assertions
and only its golden moved. Neither baseline was touched.

## Gates

- `reference-resolution-lint.test.ts`: paths 1411 -> 1421, anchors unmoved. Re-approved on the
  existing comment line with the share measured by reverting one edited file at a time against the
  other: `agents/orchestrator.md` six, `skills/setup/SKILL.md` four, all ten `bin/fusion-events`.
  Nothing left scope, because the `fusion-workbench/…` log paths the removed commands carried are
  workbench tokens and register in no pinned class.
- `surface-growth-bound.test.ts`: golden regenerated with `UPDATE_SURFACE_GOLDEN=1`; the diff is
  exactly the two files above and their two totals.
- `workbench-citation-lint.test.ts` was red on arrival over a record this task did not write:
  `260826-0158_*_a-staging-list-built-by-a-shell-pipeline-over-git-status-is-the-directory-sweep-the-rule-forbids.md`
  cited the `_o_` spelling of an issue that had since gone `_c_`. There the spelling **is** the
  datum — the record's subject is that exactly that filename was staged for deletion — so per the
  gate's own instruction the filename moved into a fenced code block rather than being corrected to
  the wildcard form, which would have deleted the finding. Nothing else in that record changed.

## Records closed

- `260825-2140_*_the-turn-count-defect-names-three-sites-and-a-fourth-carries-the-identical-whole-file-count.md`
  — `Resolved:` note appended, marker `_o_` -> `_c_`.
- `260822-1136_*_two-definitions-of-the-turn-count-disagree-and-the-resume-snippet-counts-every-session-in-the-log.md`
  — already `_c_` with `Resolved: referred (C4)`. A second note was appended **beside** it, not over
  it, so the record says both where the work went and where it landed. The note also records that
  this record's own proposed direction, finding the last `session_start` and counting after it, was
  not taken and could not be: a positional read does not survive the union merge (260823-1110).

Plan step 5 marked `[DONE]`.

## Verification

`cd hooks && npm test` — exit 0. 43 test files, 760 tests, all passing.
