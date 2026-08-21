# Close the three routes out of the length cap, and cap an agent's report on its own work

**Date:** 2026-08-21
**Agent:** coder
**Status:** Complete
**Circle:** `circles/260821-1042-reply-bounded-whole-question-answered`
**Plan step:** 2 of `circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_*_plan-reply-bounded-whole-question-answered.md`
**Base commit:** `58aae9b`

## What changed

`rules/user-facing-output.md`, five edits, four of them rewrites of an existing sentence.

1. **The sketch exemption** (`## Sketch structure instead of narrating it`). Was: *"A sketch that
   replaces a wall of prose does not count against the chat length cap in the same way. It is the
   shorter form."* Now: a sketch counts against the cap like every other line, and it earns its
   place by being shorter than the prose it replaces. The tightness clause after it is unchanged.
2. **The session-summary entry** (`## Length`). Was a cap on the ten lines before the first
   "Details" anchor, which left the tail unbounded. Now: 25 lines in total, of which at most 10
   before the anchor. The header cap and its stated reason survive. What will not fit stays in the
   session history file the summary already links. The line cites
   `circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1801_*_what-total-caps-a-session-summary-now-that-no-reply-has-an-uncapped-tail.md`,
   wildcarded at the marker position, which is where the 25 comes from: the user answered at the
   plan gate and took the planner's recommendation as filed.
3. **The chat-reply remedy** (`## Length`). The Details half of *"move detail to a Details trailing
   block or to a file and link it"* is gone; the file half, which was already correct, is kept.
4. **The section's closing instruction** (`## Length`). Was: *"Before sending, count the lines. If a
   cap is exceeded, move material to Details. Do not relax the cap."* Now every cap is stated as the
   budget for the whole output it names, trailing Details included; an over-count comes down by
   cutting rather than by moving material further down the same reply; and what is cut goes where
   that kind of thing already lives, a defect or an open question in its store and session detail in
   the history log. The final sentence is unchanged.
5. **One entry added** to the `## Length` list, for the habit no clause reached: a report on your own
   work is sized by what the reader needs to know, not by how much work there was. A long run does
   not buy more lines.

`hooks/lib/__tests__/reference-resolution-lint.test.ts`: `BASELINE.records` re-approved 115 -> 116,
with the attribution comment the gate's own failure message asks for.

No heading was renamed, added or removed. No test was added and no gate was built, per
`shared/decisions/260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`.
The clauses land unenforced, which is the decided outcome.

## Measurements

Byte delta of the rule file, which step 5 must cover:

```
$ wc -c rules/user-facing-output.md          # 20787
$ git show HEAD:rules/user-facing-output.md | wc -c   # 20144
```

**+643 bytes** against HEAD `58aae9b`, whose copy of this file is byte-identical to the plan's anchor
`e764637` at 20 144.

Always-on rule set, read off the emission the suite prints for `analyst`:
3455 + 57114 + 4495 + 20787 + 9858 = **95 709 bytes** against the 98 573 budget
(floor 86 573 + head-room 12 000). Head-room left: **2 864**, down from 3 507. The bound assertion
passes; only its golden fixture, which records the sizes, mismatches.

Prose metric, unchanged in verdict:

```
$ bin/fusion-prose-metric rules/user-facing-output.md
rules/user-facing-output.md   1 em-dash   2672 words   0.4/1000   permit 2   ok
```

The one em-dash predates this step and sits in a sentence none of the five edits touched.

Hook test suite: 20 354 -> **20 360 lines**, the six-line attribution comment in
`reference-resolution-lint.test.ts`. Its bound assertion passes; its golden mismatches
for the same reason as the other.

## Verification

```
$ cd hooks && npm test
Test Files  2 failed | 38 passed (40)
      Tests  2 failed | 716 passed (718)
exit 1
```

Both failures are golden-fixture mismatches and neither is a bound:

- `rules-emission-golden.test.ts` > *matches the checked-in golden* — `user-facing-output.md`
  20 144 -> 20 787, total 99 900 -> 100 543 for `analyst`.
- `surface-growth-bound.test.ts` > *matches the checked-in golden* — the `hook-tests` surface,
  20 354 -> 20 360 lines.

Every other test in both files passes, including each of the four growth bounds. The citation gate is
green at the re-approved number.

**The goldens were deliberately not regenerated here.** The plan's Testing Strategy assigns that to
step 6, once, and both numbers are still in flight until step 5: steps 3 and 5 each move the rule
file's size again, and step 3 adds citations that will need a second attribution comment in the same
test file, moving the hook-test line count with it. Regenerating now would put three diffs of a
number in front of a reader where the plan asked for one.

## Attribution of the citation delta

Measured rather than read: `rules/user-facing-output.md` alone was restored to HEAD with
`git show HEAD:<path>`, this gate re-run (37 tests, green at records 115), and the file put back. The
one new token is the decision-record citation on the session-summary entry. `paths` and `anchors` did
not move, because the other four edits rewrite sentences that named no path, heading or record and
none names one now.

## What this step did not do

- No voice profile was touched. Step 4 holds its own budget and paying either budget from the other
  is what the plan forbids.
- No `agents/` prompt was touched.
- Nothing was staged or committed.
