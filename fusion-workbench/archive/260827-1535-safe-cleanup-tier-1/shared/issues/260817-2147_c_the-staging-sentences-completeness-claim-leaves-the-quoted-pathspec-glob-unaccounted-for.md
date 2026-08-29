The staging sentence's completeness claim leaves the quoted pathspec glob unaccounted for

---

`stagingSentence()` forbids four staging shapes, claims that **each** way of loosening the
shape fails on its own, and then enumerates three failures covering `-A`, a directory
argument, `-u` and an *unquoted* glob. The fourth name in the prohibition is "a glob",
unqualified. A quoted git pathspec glob is a glob, is forbidden by the list, and is named by
no clause — and the failure it does exhibit is attributed to a closed pair it is not in.

**Emitted text** (`hooks/lib/staging-drift.ts:651-657`, compiled twin
`hooks/dist/lib/staging-drift.js:552-558`):

```
"Do NOT reach for `git add -A`, `-u`, a directory argument or a glob: the shape at Step 3b step 4 is what " +
  "makes over-staging impossible, it is not what failed here, and each way of loosening it fails on its own " +
  "— `-A` and a directory argument are the over-staging that shape prevents; `-u` stages a renamed record's " +
  "deletion and adds nothing in its place, taking that record out of HEAD; an unquoted glob does the reverse, " +
  "staging the successor and leaving the deletion behind, so both names land in HEAD. "
```

---

## What was measured

Re-measured independently for this review, not carried over: a throwaway repository, one
committed record `recs/260810-0501_o_x.md` renamed on disk to `recs/260810-0501_p_x.md` so the
deletion is tracked and the successor untracked, plus one unrelated modified file at the
repository root. `git diff --cached --name-status -M` after each command, `git reset` between.
git 2.49.0.

| Command | Staged |
|---|---|
| `git add -u recs/` | `D  ..._o_x.md` — deletion only |
| `git add -A recs/` | `R100  ..._o_x.md -> ..._p_x.md` |
| `git add recs/` | `R100  ..._o_x.md -> ..._p_x.md` |
| `git add recs/*.md` (unquoted shell glob) | `A  ..._p_x.md` — addition only |
| `git add 'recs/*.md'` (quoted git pathspec glob) | `R100  ..._o_x.md -> ..._p_x.md` |
| `git add -A` (bare) | `R100` + `M top.md` |
| `git add -u` (bare) | `D` + `M top.md` |

Every clause of the emitted sentence is **true** of the shape it names. This record is not
about a false clause.

## The gap

The sentence's clauses map onto the prohibition's names like this:

```
prohibition:   -A        -u        directory arg      a glob
                |         |             |             /     \
               over-    deletion      over-      unquoted   quoted
               staging  mechanism    staging      (named)   (nothing)
```

A quoted pathspec glob over-stages, exactly as the directory argument does — but the
over-staging clause names a closed pair, "`-A` and a directory argument", and a quoted glob is
neither of those. So the enumeration accounts for three of the four forbidden names in full and
the fourth only in one of its two forms.

Two readings, and both cost something:

- A reader who does not register the qualifier maps "a glob" onto "does the reverse" and comes
  away believing `git add 'recs/*.md'` under-stages a rename. It stages the rename whole. That
  is a mechanism attached to a shape that does not exhibit it — the same defect class
  `260817-2130` was filed for, one shape down.
- A reader who does register it — and the qualifier is conspicuous, because "unquoted" appears
  in the justification half and not in the prohibition half — asks what a quoted glob does,
  finds no clause, and finds the completeness claim unmet at exactly the point where the check
  is being made. The commit that introduced this wording named that outcome in its own message
  as the thing to avoid.

## Why it matters, and why it is only Low

The prohibition itself is unaffected: "or a glob" is unqualified, so an agent that obeys the
sentence commits no wrong act whichever form it was reaching for. Nothing is mis-staged as a
result of this. What is damaged is the sentence's standing as a checkable claim — which is the
entire property `bd2db5c` and `6b6436d` were spent buying, and which is worth more here than in
ordinary prose, because this text is handed to a model that knows git in every consuming project
where HEAD moved with a record left behind.

## Recommendation

Put the quoted form in the over-staging clause where it was measured to belong, and keep
"unquoted" on the clause that distinguishes the case failing in the other direction. One
formulation, +6 words:

> … each way of loosening it fails on its own — `-A`, a directory argument and a quoted
> pathspec glob are the over-staging that shape prevents; `-u` stages a renamed record's
> deletion and adds nothing in its place, taking that record out of HEAD; an unquoted shell
> glob does the reverse, staging the successor and leaving the deletion behind, so both names
> land in HEAD.

Any wording works provided every one of the four forbidden names reaches a clause. `STAGING_SPOKE`
in `hooks/lib/__tests__/staging-drift.test.ts:110` is the literal `` "Do NOT reach for `git add -A`" ``
and must stay a substring. Rebuild `hooks/dist/` in the same change.

## Scope

`hooks/lib/staging-drift.ts` and its committed build. Model-facing in every consuming project.
`agents/orchestrator.md` Step 3b needs no change: it forbids the shapes and makes no per-shape
mechanism claim, so it has nothing to under-cover.

**Severity:** Low
**Filed by:** coderev, review of `bd2db5c..6b6436d`
**Cross-references:** `260817-2130_*_the-git-add-prohibition-s-restated-justification-holds-for-u-alone-and-is-false-for-the-other-three-shapes.md` (the defect this residual is left over from; its resolution note states the deliberate decision not to name the quoted glob separately, which is the judgement this record disagrees with), `260817-2131_*_nothing-stops-a-fusion-workbench-id-returning-to-an-emitted-hook-sentence-because-the-lint-reads-comment-lines-only.md` (the same emitted sentence, no gate)

---
Resolved: The over-staging clause in `hooks/lib/staging-drift.ts` `stagingSentence()` now
names three shapes instead of two — "`-A`, a directory argument and a quoted pathspec glob
are the over-staging that shape prevents" — and the reverse clause reads "an unquoted shell
glob", so all four forbidden names in the prohibition half reach a clause and the quoted form
is attributed to the failure it was measured to exhibit. The recommendation's wording was
taken as given, +6 words. The prohibition half is unchanged, so `STAGING_SPOKE`'s literal
`` "Do NOT reach for `git add -A`" `` is still a substring. `hooks/dist/` rebuilt in the same
change; `npm test` in `hooks/` green (35 files, 653 tests, exit 0), the four growth bounds
included.
