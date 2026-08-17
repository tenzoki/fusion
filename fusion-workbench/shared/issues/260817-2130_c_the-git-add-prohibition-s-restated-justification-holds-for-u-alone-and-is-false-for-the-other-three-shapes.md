The `git add` prohibition's restated justification holds for `-u` alone and is false for the other three shapes

---

`stagingSentence()` forbids four staging shapes and attaches one justification to all four.
Measured against git 2.49.0, that justification is true of exactly one of them, and false of
the other three — including `git add -A`, the shape named first and the one the function's
own source comment says an agent actually reaches for.

**Emitted text** (`hooks/lib/staging-drift.ts:649-653`, compiled twin `hooks/dist/lib/staging-drift.js:550-554`):

```
"Do NOT reach for `git add -A`, `-u`, a directory argument or a glob: the shape at Step 3b step 4 is what " +
  "makes over-staging impossible, it is not what failed here, and loosening it stages the deletions of " +
  "records that were renamed, adds nothing in their place, and so takes those records out of HEAD. "
```

The clause after "loosening it" is a single mechanism claim ranging over the whole list.

---

## What was measured

A throwaway repository, one committed record `recs/260810-0501_o_x.md`, renamed on disk to
`recs/260810-0501_p_x.md` so the deletion is tracked and the successor is untracked — the
exact shape of the incident this text descends from. `git diff --cached --name-status` after
each command, index reset in between. git 2.49.0.

| Command | Staged |
|---|---|
| `git add -u recs/` | `D  recs/260810-0501_o_x.md` — deletion only |
| `git add -A recs/` | `R100  ..._o_x.md -> ..._p_x.md` — the rename, whole |
| `git add recs/` (directory argument) | `R100  ..._o_x.md -> ..._p_x.md` — the rename, whole |
| `git add recs/*.md` (shell glob) | `A  recs/260810-0501_p_x.md` — addition only |
| `git add 'recs/*.md'` (git pathspec glob) | `R100  ..._o_x.md -> ..._p_x.md` — the rename, whole |

So:

- **`-u`** does what the sentence says: stages the deletion, adds nothing, takes the record out
  of HEAD. The claim is exactly right here.
- **`-A`** and **a bare directory argument** stage the rename in full. They cannot take a
  renamed record out of HEAD; since git 2.0 a pathspec argument stages removals *and*
  additions. Their real hazard is the opposite one — over-staging — which the same sentence
  already covers in its preceding clause.
- **An unquoted shell glob** fails in the reverse direction: it stages the successor and leaves
  the deletion behind, so HEAD ends up carrying *both* names. That is also not "takes those
  records out of HEAD".

## Why this is the wrong list to attach it to

The plugin already states the accurate account in two places, and they disagree with the
emitted sentence:

- `agents/orchestrator.md:539` — "a `git add -u` given the directory a batch of records had
  just been renamed inside staged three deletions and added nothing, because the renamed
  successors were untracked."
- `hooks/lib/staging-drift.ts:27-29` — "a `git add -u` over a directory staged three deletions
  whose renamed successors were untracked, `f38f37d`".
- `f38f37d`'s own commit message — "The cause is the directory-wide `-u`."

The mechanism belongs to `-u`. The four-shape list is a *shape* rule with several independent
justifications (over-staging for `-A` and the directory argument, under-staging for the glob,
deletion-without-successor for `-u`), and the rewrite collapsed them into one.

## Why it matters, given what the sentence is for

This text is handed to the model on every guarded call in every consuming project where HEAD
moved with a record left behind. Its only job is to stop an agent widening `git add`. An agent
that knows git — and the sentence is addressed to one — can check the claim against `-A` in a
scratch repository and find it false, which puts the whole prohibition in doubt at the moment
it is meant to bind. The previous text (`"loosening it re-opens f38f37d"`) carried the same
over-attachment but was unfalsifiable in a consuming project; making the mechanism explicit
made the over-attachment checkable, which is an improvement in form and a regression in truth.

## Recommendation

Attach each justification to the shape it holds for, rather than one to the list. One
formulation that stays inside the sentence's length:

> Do NOT reach for `git add -A`, `-u`, a directory argument or a glob: the shape at Step 3b
> step 4 is what makes over-staging impossible, it is not what failed here, and each way of
> loosening it fails on its own — `-u` stages a renamed record's deletion and adds nothing in
> its place, taking that record out of HEAD, while `-A` and a directory argument commit
> whatever else the tree is holding.

Any wording works provided `-A` is not the subject of the deletion mechanism. Rebuild
`hooks/dist/` in the same change; `STAGING_SPOKE` in
`hooks/lib/__tests__/staging-drift.test.ts:110` is the literal `` "Do NOT reach for `git add -A`" ``
and must stay a substring of whatever is written.

## Scope

`hooks/lib/staging-drift.ts` and its committed build. Model-facing in every consuming project.
`agents/orchestrator.md:539` is already correct and needs no change.

**Severity:** Medium
**Filed by:** coderev, review of `82a860d..bd2db5c`
**Cross-references:** `shared/issues/260817-2110_*_the-hook-sentences-cite-fusions-own-workbench-ids-and-a-fusion-commit-hash-into-a-consuming-projects-session.md` (the change that introduced this wording), `shared/issues/260817-2132_*_the-staging-sentences-source-comment-attributes-f38f37d-to-git-add-a-while-the-same-file-attributes-it-to-u.md` (the comment the wording was derived from)

---
Resolved: `hooks/lib/staging-drift.ts` `stagingSentence()` now attaches one justification per shape instead of one to the list — `-A` and a directory argument are routed to the over-staging hazard the preceding clause already names, `-u` keeps the deletion-without-successor mechanism it is the only shape to exhibit, and the unquoted shell glob gets the reverse failure the table measured (successor staged, deletion left behind, both names in HEAD). The quoted git pathspec glob is not named separately: it behaves as the directory argument does and is already routed there, and "unquoted" is what distinguishes the case that fails differently. `STAGING_SPOKE` stays a substring. `hooks/dist/` rebuilt; `npm test` in `hooks/` green (653 tests). Filed with `260817-2132`, which corrected the source comment the wording was derived from.

---
Revised by: `307a696`, and `shared/issues/260817-2147_*_the-staging-sentences-completeness-claim-leaves-the-quoted-pathspec-glob-unaccounted-for.md` — the `Resolved:` note's closing judgement, that the quoted git pathspec glob need not be named separately because it behaves as the directory argument does, was withdrawn. At HEAD `stagingSentence()` names the quoted form explicitly ("`-A`, a directory argument and a quoted pathspec glob are the over-staging that shape prevents") and the reverse clause reads "an unquoted shell glob". The defect this record closes stays closed and the marker stays `_c_`; only the reasoning moved.
