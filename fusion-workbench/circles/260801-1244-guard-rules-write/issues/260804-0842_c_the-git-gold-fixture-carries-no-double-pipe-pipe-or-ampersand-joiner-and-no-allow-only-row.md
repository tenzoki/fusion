# The git gold fixture carries no `||`, `|` or `&` joiner and no allow-only row

---

**Severity:** Low
**Domain:** code (test coverage)
**Filed by:** coderev, Turn 7 review of `260801-1244-guard-rules-write` (`048f3db..c9c44a3`)
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

---

**Reconciliation 260804-1021-reconciliation.md (reconciler, domain `code`) — stays `_o_`. Confirmed, and one adjacent gap found in the same verb.**

`hooks/lib/__tests__/fixtures/git-verdicts-head.json` was added by `c9c44a3` this session (2,864 lines). The coverage gap this issue describes is real and unaddressed.

**An adjacent gap in the same suite, filed separately.** `bash-mutation-guard.test.ts:196` holds the only `git -C` row in the whole suite, and it pins the direction where the protected path is the *operand* (`git -C /repo mv rules/x.md docs/` denies). The direction where `-C` *supplies* the protected directory — `git -C rules rm x.md`, which allows and deletes the file — has no row anywhere. Filed as `260804-1024_*_git-c-supplies-a-directory-the-model-skips-so-a-relative-operand-resolves-off-the-protected-list.md`. Whoever regenerates this fixture should take that issue's test list at the same time; both are "the git surface is under-covered in the families this Circle has been widening", and doing them together is one pass over the same fixture generator.

---

**Step 3 disposition (coder, 2026-08-05) — neither A nor B. STAYS `_o_`, and STAYS IN THIS CIRCLE.**

No delivered rule text is false and the classifier needs no new capability. Item 3 — the
test docstring overstating the corpus — is A in kind, but the sentence is in
`hooks/lib/__tests__/git-branch-guard.test.ts`, and step 3 changes no code and no test.

**It does not move to the shared store.** The fixture was added by `c9c44a3`, a commit of
this Circle's own Turns; under the Origin Rule the record stays here. The reference to
`260804-1205-shell-reachability-model` below is a citation, not a move.

**Where the work belongs.** The regeneration is one pass over the same generator as
`260804-1024_*_git-c-supplies-a-directory-the-model-skips-so-a-relative-operand-resolves-off-the-protected-list.md`'s test list, which that issue's reconciliation already pairs it with, and the
property that makes the fixture worth having — regenerate against a classifier materialised
out of git at the reference commit — has to survive it. The obvious moment is when
`260804-1205-shell-reachability-model` restructures `hooks/lib/shell-parse.ts`,
because that is the change the fixture exists to insulate the git classifier from, and a
fixture with no `||`, no `|` and no `&` row would not catch a joiner-shaped regression in
exactly that work.

Not load-bearing today, as this issue's own § "What is right first" establishes with two
independent reproductions.

---
Resolved: Both named artifacts, hooks/lib/__tests__/fixtures/git-verdicts-head.json and git-branch-guard.test.ts whose docstring was the third item, were deleted with the git branch/worktree guard in 7598073.

Closed as part of the Turn-1 housekeeping batch of session 260815-2147-orchestrator-session.md, after a re-verification pass against HEAD confirmed the condition no longer holds.
