# Coder — the `git add` prohibition gets one justification per shape

---
**Status:** Complete
**Date:** 2026-08-17
**Agent:** coder
**Dispatched by:** the user, top-level (task T2)
**Domain:** code
**Task:** Fix two findings from the review of `82a860d..bd2db5c`, both from the same incident, in one
change: `shared/issues/260817-2130_*_the-git-add-prohibition-s-restated-justification-holds-for-u-alone-and-is-false-for-the-other-three-shapes.md`
(M1, the shipped sentence) and `shared/issues/260817-2132_*_the-staging-sentences-source-comment-attributes-f38f37d-to-git-add-a-while-the-same-file-attributes-it-to-u.md`
(L1, the source comment above it). No commit; leave the tree for the cleanup pipeline.

---

## What was done

### 1. `hooks/lib/staging-drift.ts` — `stagingSentence()`, the final part (M1)

The prohibition's justification was one mechanism claim ranging over four shapes. The reviewer
measured all four against git 2.49.0 and found it true of `-u` alone: `-A`, a bare directory
argument and a quoted git pathspec glob each stage a renamed record whole, and an unquoted shell
glob stages the successor while leaving the deletion behind. The claim was therefore false of
the shape the sentence names first.

Each justification is now attached to the shape it holds for:

- **`-A` and a directory argument** are *routed* to the over-staging hazard the preceding clause
  already names ("are the over-staging that shape prevents") rather than given a hazard of their
  own. That was the task's third constraint: the clause before it covers over-staging, so this
  one points at it instead of restating it.
- **`-u`** keeps the deletion-without-successor mechanism, which the measurement shows it is the
  only shape to exhibit.
- **An unquoted glob** gets the reverse failure the table measured — successor staged, deletion
  left behind, both names in HEAD.

`-A` is no longer the subject of the deletion mechanism, which was the defect.

**The quoted git pathspec glob is deliberately not named separately.** It behaves as the
directory argument does (`R100`, the rename whole), so it is already accounted for by the
over-staging routing; the word "unquoted" is exactly what separates the case that fails
differently. Naming both glob forms would have cost a clause to say that one of them is a case
already covered.

**The unquoted glob was included rather than dropped**, though the recommendation leaves it out.
The new formulation claims each way of loosening the shape fails *on its own*, and a reader who
checks that claim checks it against the list — three accounted shapes out of four leaves the hole
exactly where the sentence is being tested. Its failure is also the only one neither other clause
reaches: it is not over-staging and it is not `-u`'s under-commit, and both names reaching HEAD is
a distinct outcome an agent would not predict.

`STAGING_SPOKE` (`hooks/lib/__tests__/staging-drift.test.ts:110`, the literal
`` "Do NOT reach for `git add -A`" ``) is untouched and remains a substring; the list of forbidden
shapes was not reordered or reworded.

### 2. `hooks/lib/staging-drift.ts` — the docstring above `stagingSentence()` (L1)

It attributed `f38f37d` to `git add -A`. Three other statements of the same incident name `-u` —
the account at the head of this file (`:27-29`), `agents/orchestrator.md` Step 3b, and `f38f37d`'s
own commit message ("The cause is the directory-wide `-u`"). The behavioural observation was kept
(an agent told files were missed reaches for `-A`) and its apposition replaced: `-A` over-stages;
the defect on the other side was a directory-wide `git add -u` over records whose renamed
successors were untracked. The comment now cites its agreement with the other two in-file and
in-prompt accounts, so the next editor meets the pairing rather than the trap.

`agents/orchestrator.md` was not touched — it is already correct.

### 3. `hooks/dist/` rebuilt

`npm run build` in `hooks/` refreshed `dist/lib/staging-drift.js` and its `.d.ts`. No test file
changed, so the hook-test surface did not move and no golden needed regenerating. **No baseline
was edited.**

## Verification

```
cd hooks && npm test        # 35 files, 653 tests, exit 0
```

The sentence was rendered from the rebuilt `dist/` with a synthetic one-record report and read end
to end; the substring check for `STAGING_SPOKE` was run against that rendered string and returned
true. The emitted prohibition now reads:

> Do NOT reach for `git add -A`, `-u`, a directory argument or a glob: the shape at Step 3b step 4
> is what makes over-staging impossible, it is not what failed here, and each way of loosening it
> fails on its own — `-A` and a directory argument are the over-staging that shape prevents; `-u`
> stages a renamed record's deletion and adds nothing in its place, taking that record out of HEAD;
> an unquoted glob does the reverse, staging the successor and leaving the deletion behind, so both
> names land in HEAD.

Every clause is checkable against the measurement table in `260817-2130`, and none contradicts a
row of it.

## Files changed

- `hooks/lib/staging-drift.ts`
- `hooks/dist/lib/staging-drift.js`
- `hooks/dist/lib/staging-drift.d.ts`
- `fusion-workbench/shared/issues/260817-2130_c_*.md` (Resolved note, `_o_` -> `_c_`)
- `fusion-workbench/shared/issues/260817-2132_c_*.md` (Resolved note, `_o_` -> `_c_`)

`260817-2131` (the lint gate) was out of scope and stays open. Nothing was staged or committed.
