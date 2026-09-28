# The byte reckoning: what the build spent against what it was budgeted

**Status:** Complete
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

Step 15 of `260907-1450_*_plan-bounded-executor-dispatches.md`. Measurement only; the step makes no
cut, because the cut it once held in reserve became step 8 and has been spent. Taken by the
orchestrator rather than dispatched: the step edits nothing, and a dispatch to run `wc -c` would be
the cost this Circle exists to reduce.

## The reckoning

| | Bytes | Where it comes from |
|---|---|---|
| Head-room before step 8 | 3 509 | measured at Setup, 414 334 against the `AGENT_BASELINE` sum of 399 843 and `AGENT_HEAD_ROOM` 18 000 |
| Step 8 net yield | +735 | 1 032 removed as two narrative lines, about 297 written back as two pointers |
| Head-room after step 8 | 4 244 | measured on that tree and carried in commit `bb5dbda4`'s message, as the step required |
| Step 9 spent | −1 593 | of a 1 600 cap |
| Step 10 spent | −1 953 | of a 2 190 cap |
| **Head-room now** | **698** | `cat agents/*.md \| wc -c` = 417 145, less 399 843, subtracted from 18 000 |

Steps 9 and 10 together spent **3 546** against the **3 790** the plan budgeted, so the build came in
**244 bytes under**. The plan's own forecast for this moment was about 456 bytes of margin; the actual
is 698, and the whole difference is the two steps underrunning their caps. Every budget was a cap
rather than an estimate, which is what makes the surplus real slack instead of a rounding artefact.

The plan noted that this project has no other record of a text budget being met. It has one now.

## The margin is not a cushion

698 bytes is less than the 1 109 that one other session put into this same directory in a single day,
which is the event that made step 8 necessary. Nothing about this reckoning makes the surface safe for
the next arrival; it makes this build's own spending accounted for.

## The four pinned values, checked rather than asserted

The closure clause asks whether `AGENT_BASELINE`, `RULE_BASELINE`, `RELEASE_CAP` and `DRIFT_CEILING`
are byte-identical to what they were at `abcaa823`. Three are, exactly: `AGENT_BASELINE`'s whole map,
`RELEASE_CAP = 105_354` and `DRIFT_CEILING = 145_144`, and so are `AGENT_HEAD_ROOM`, `SKILL_BASELINE`
and `TEST_LINE_BASELINE` beside them.

`RULE_BASELINE` is **not** byte-identical, and the difference is worth stating precisely rather than
rounding to a yes or a no. Every numeric entry in the map is identical to `abcaa823`, compared entry
by entry. What changed is the comment block above and beside those entries, rewritten by commit
`01e0f688`, which is one of the 21 commits this session pulled from the other checkout before it
began. Measured against this session's own starting commit `637d0b04`, `RULE_BASELINE` is
byte-identical.

So no baseline moved in this build, and the clause as literally written is answered `no` by a
documentation edit made elsewhere. Whoever closes this Circle should read the clause as asking about
values rather than bytes, or say plainly that it was answered against the session's start.

## Verification

- `cat agents/*.md | wc -c` — 417 145. Head-room 698 against `AGENT_HEAD_ROOM` 18 000.
- `cd hooks && npm test` — exit 0, 55 files, 947 tests, with `surface-growth-bound.test.ts` green.
- `git diff 637d0b04..HEAD --stat` over `surface-growth-bound.test.ts` and `helpers/growth-bound.ts` —
  empty.
- Entry-by-entry comparison of `RULE_BASELINE` against `abcaa823` — no numeric difference.
