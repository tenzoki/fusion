# The git gold fixture carries no `||`, `|` or `&` joiner and no allow-only row

---

**Severity:** Low
**Domain:** code (test coverage)
**Filed by:** coderev, Turn 7 review of `circles/260801-1244-guard-rules-write` (`048f3db..c9c44a3`)
**Affects:** `hooks/lib/__tests__/fixtures/git-verdicts-head.json`,
`hooks/lib/__tests__/git-branch-guard.test.ts` (the describe block's docstring)
**Kind:** NEW in `c9c44a3`.

---

## What is right first

The fixture's provenance claim holds. I materialised `hooks/lib` at `048f3db` out of git
and ran the **pre-change** classifier over the fixture's 98 commands × 4 override
combinations: **98/98 reproduce**. The current classifier also reproduces 98/98. So it is
a genuine before/after and not a snapshot of the code asserting itself. The floor
assertion (`rows.length > 80`) does its job, and the source check
(`expect(src).not.toMatch(/\bparseCommand\b/)`) is the assertion that actually carries the
weight — the git classifier never enters the changed code path.

Independently: I ran 25,845 git-shaped commands × 4 override combinations through both
classifiers and found **zero** differences, and the two segmenters produce byte-identical
output over 222,319 commands in both quoting modes. The git classifier really did not
move.

## What is wrong

Two coverage gaps, neither load-bearing given the above, both worth correcting because
the fixture will be reused.

**1. Three of the six joiners are absent.** Counted over the 98 rows:

```
  &&       13 rows
  ;         9 rows
  newline  13 rows
  ||        0 rows
  |         0 rows
  &         0 rows
```

The change under test is *about joiners*. A fixture built to pin a joiner widening that
contains no `||`, no pipe and no background operator would not have caught a joiner-shaped
regression by itself.

**2. No row is allow-only.** Every one of the 98 denies or uses an override in at least
one combination (verified: 0 rows with no `deny: true` anywhere). The corpus was filtered
to "produces a deny or an override", which the history states accurately. So an
allow → deny drift on a command outside the 98 is outside the fixture's reach.

**3. The test docstring overstates it.** It says the gold holds this classifier's verdicts
"over **every command string in the whole test suite**". It holds the filtered subset.

## Recommended fix

Regenerate the fixture from the same script with the deny/override filter removed and
with a small joiner sweep appended (`ls || git switch main`, `ls | git switch main`,
`ls & git switch main`, and each with the `git` command first). Correct the docstring to
say what the corpus is. The regeneration must still run against a classifier materialised
out of git at the reference commit, or the fixture loses the property that makes it worth
having.
