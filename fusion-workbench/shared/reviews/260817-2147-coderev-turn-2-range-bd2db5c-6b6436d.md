# Code review — Turn 2, `bd2db5c..6b6436d`

**Sender:** coderev
**Reviewed-range:** `bd2db5c..6b6436d`
**Not-opened:** none

Carried scope: none. `bin/fusion-review-coverage` reports `carried=none` from
`260817-2130-coderev-turn-1-range-82a860d-bd2db5c.md`, which declared its
`**Not-opened:**` field explicitly — a recorded absence, not a missing declaration. All eight
files the commit touched were opened, not only the three the dispatch scoped.

## Summary

The commit fixes what it set out to fix. Every clause of the new sentence is true, re-measured
independently against git 2.49.0; the corrected source comment agrees with all three sibling
accounts; the committed build is byte-identical to a fresh compile of the whole tree. Two Low
findings, both about completeness rather than truth: the sentence's own completeness claim leaves
one of its four forbidden names half-accounted, and the shell wrapper still carries the wording
two commits have now corrected in the TypeScript.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 2 |

## The three questions in the dispatch

### 1. Is the new sentence true? — Every clause, yes. The completeness claim, not quite.

The measurement was re-run rather than carried over, on a scratch repository holding one committed
record renamed on disk (tracked deletion, untracked successor) plus one unrelated modified file at
the repository root, index reset between commands, git 2.49.0:

| Command | `git diff --cached --name-status -M` |
|---|---|
| `git add -u recs/` | `D  ..._o_x.md` |
| `git add -A recs/` | `R100  ..._o_x.md -> ..._p_x.md` |
| `git add recs/` | `R100  ..._o_x.md -> ..._p_x.md` |
| `git add recs/*.md` (unquoted shell glob) | `A  ..._p_x.md` |
| `git add 'recs/*.md'` (quoted pathspec glob) | `R100  ..._o_x.md -> ..._p_x.md` |
| `git add -A` (bare) | `R100` + `M top.md` |
| `git add -u` (bare) | `D` + `M top.md` |

Reproduces the table in `260817-2130` row for row, and adds the two bare forms.

**Clause 1, the over-staging routing for `-A` and a directory argument — correct.** Neither can
take a renamed record out of HEAD; both stage the rename whole, and the bare `-A` additionally
takes the unrelated root file. Over-staging is their hazard and the shape is what prevents it
(`agents/orchestrator.md:536`, `hooks/lib/staging-drift.ts:25-30`).

**Clause 2, the deletion mechanism confined to `-u` — correct, and it is the only shape that
exhibits it.** It matches `f38f37d`'s own account ("The cause is the directory-wide `-u`") and
`agents/orchestrator.md:539`.

**Clause 3, the unquoted glob — correct, including "both names land in HEAD."** The shell expands
the pattern over files that exist, so the deleted old name is never passed to `git add`; the
successor is added, the deletion stays unstaged, and the commit leaves HEAD carrying the old path
unchanged beside the new one. "Land" is doing light work for a name that was already there, but
the claim about the resulting HEAD is exact.

**The enumeration against the list — one name is half-accounted.** The prohibition forbids four
shapes: `-A`, `-u`, a directory argument, "a glob". The justification accounts for `-A`, a
directory argument, `-u`, and an *unquoted* glob. A quoted git pathspec glob is a glob, is
forbidden by the list, and reaches no clause; the failure it does have — over-staging — is
attributed to a closed pair, "`-A` and a directory argument", which does not contain it.

The implementer's reasoning for this is recorded in
`260817-2138-coder-staging-sentence-per-shape-justification.md`: the quoted form is
"already accounted for by the over-staging routing", and naming both forms "would have cost a
clause to say that one of them is a case already covered". Judged: it does not hold, on the
implementer's own argument two paragraphs later. That same record justifies *keeping* the unquoted
glob clause on the ground that "three accounted shapes out of four leaves the hole exactly where
the sentence is being tested". The argument applies unchanged to the fourth name, which is now
accounted for in one of its two forms while the prohibition covers both. And the stated cost does
not apply to the cheapest fix, which adds no clause: putting "and a quoted pathspec glob" into the
subject of the over-staging clause is six words, and it restores a one-to-one accounting between
the four names and the failures. Filed as `260817-2147`.

This is not a false clause and nothing is mis-staged as a result — the prohibition is unqualified,
so an agent that obeys it is right whichever glob form it was reaching for. What is at stake is the
sentence's standing as a claim a reader can check, which is exactly the property the last two
commits were spent buying.

### 2. Does the source comment agree with its siblings? — Yes, all three.

`hooks/lib/staging-drift.ts:612-618` now attributes `f38f37d` to a directory-wide `git add -u` over
records whose renamed successors were untracked, and states its agreement explicitly. Verified
against each named sibling:

- `hooks/lib/staging-drift.ts:27-29` — "a `git add -u` over a directory staged three deletions
  whose renamed successors were untracked, `f38f37d`". Agrees.
- `agents/orchestrator.md:539` — "a `git add -u` given the directory a batch of records had just
  been renamed inside staged three deletions and added nothing … Three `_o_` records left HEAD and
  returned only as the repair commit `f38f37d`". Agrees, and the citation "Step 3b" is right: the
  passage is the fourth bullet under Step 3b step 4.
- `f38f37d`'s commit message — "The commit before this one staged with
  `git add -u fusion-workbench/shared/issues/`" and "The cause is the directory-wide `-u`".
  Agrees, including the count of three.

The behavioural observation `260817-2132_*_the-staging-sentences-source-comment-attributes-f38f37d-to-git-add-a-while-the-same-file-attributes-it-to-u.md` asked to keep ("an agent told files were missed reaches
for `git add -A`") survives, now with the correct consequence attached to it. `agents/orchestrator.md`
was correctly left untouched.

One thing checked and cleared rather than filed: the phrase "the defect on the other side" survived
the rewrite while its subject changed. In the old text its antecedent was the module's own defect
(under-staging), so "the other side" meant over-staging and pointed at `-A`. In the new text the
antecedent is the immediately preceding clause, "`-A` … over-stages", so "the other side" means
under-committing and points at `-u`. The referent is locally unambiguous and the sentence is not
false; a reader arriving with the file-level framing from `:23-40` could bind it to the wrong axis,
but the clause names `-u` in the same breath, which settles it.

### 3. Source and build — identical, across the whole tree.

`./node_modules/.bin/tsc --outDir <scratch>` from `hooks/`, then `diff -r <scratch> dist`: no
difference in any file, not only the three. So the two rebuilt outputs match their source, the
`.d.ts` carries the corrected docstring verbatim, and nothing else under `dist/` was left stale.
`hooks/dist/lib/staging-drift.d.ts:311-318` and `hooks/dist/lib/staging-drift.js:522-529` both
carry the new comment; `hooks/dist/lib/staging-drift.js:552-558` carries the new sentence.

`npm test` in `hooks/`: 35 files, 653 tests, exit 0 — the count the implementer's record claims.
`STAGING_SPOKE` (`hooks/lib/__tests__/staging-drift.test.ts:110`) is still a substring: the literal
`` "Do NOT reach for `git add -A`" `` appears once in the source and once in the build. No test
asserts any part of the changed wording beyond that probe, so nothing was silently loosened.

The standing question of whether anything should *assert* this identity is already an answered
decision, `260816-0719_*_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md`.
Not refiled.

## Findings by theme

### Completeness of a claim over an enumerated set

**Finding 1 — Low — `hooks/lib/staging-drift.ts:651-657` + `dist/lib/staging-drift.js:552-558`.**
The sentence claims each way of loosening the shape fails on its own, then enumerates failures
covering three of its four forbidden names in full and the fourth only in its unquoted form. A
quoted pathspec glob over-stages, and the over-staging clause names a closed pair it is not in.
Detail and measurement above.
→ `260817-2147_*_the-staging-sentences-completeness-claim-leaves-the-quoted-pathspec-glob-unaccounted-for.md`

### One sentence, three copies, two corrected

**Finding 2 — Low — `bin/fusion-staging-drift:51-52`.** The wrapper header still reads "loosening
the shape re-opens f38f37d, where a `git add -u` over a directory took three records out of HEAD".
The first clause is word for word the formulation `bd2db5c` removed from the emitted text
(`82a860d:hooks/lib/staging-drift.ts:653`: "loosening it re-opens `f38f37d`") and that `6b6436d`
then replaced with per-shape justifications. It ranges over all four loosenings and is false for
three of them, by the same measurement. Softening it: `-u` is named in the same clause, so a reader
who checks meets the correct mechanism at once, and it is a shell comment that reaches no consuming
session. It is filed anyway on `260817-2132_*_the-staging-sentences-source-comment-attributes-f38f37d-to-git-add-a-while-the-same-file-attributes-it-to-u.md`'s own stated ground — correcting one copy and not the
other leaves the next editor the same trap — and because the head of the file it wraps
(`hooks/lib/staging-drift.ts:33-36`) never made the claim, so this copy is now the odd one of three.
→ `260817-2147_*_the-staging-drift-wrapper-header-still-carries-the-re-opens-f38f37d-wording-corrected-twice-in-the-typescript.md`

## Also checked, clean

**The emitted list is four names where `agents/orchestrator.md:536` forbids five** — the prompt
adds `no '.'`. Not a gap: `git add .` is the directory argument case, which the sentence names and
accounts for. It was four before this commit too.

**No new fusion-internal identifier entered either builder.** Grepped both sources and both builds
for the `YYMMDD-HHMM` record shape and for bare short hashes in string literals: the only
identifier-shaped tokens are `f38f37d` on comment lines, which is the fusion-developer surface the
user's gate at `260817-2110_*_the-hook-sentences-cite-fusions-own-workbench-ids-and-a-fusion-commit-hash-into-a-consuming-projects-session.md` explicitly kept. The gate that would make this durable is still open
as `260817-2131_*_nothing-stops-a-fusion-workbench-id-returning-to-an-emitted-hook-sentence-because-the-lint-reads-comment-lines-only.md` and was correctly left out of scope.

**No test surface moved.** No file under `hooks/lib/__tests__/` was touched, so the 2 500-line hook
test bound and the three other growth bounds are untouched and no golden needed regenerating. The
implementer's record states "no baseline was edited", and the diff confirms it — the commit's only
non-workbench files are the three under review.

**The two closed records carry conforming resolution notes.** `260817-2130` and `260817-2132_*_the-staging-sentences-source-comment-attributes-f38f37d-to-git-add-a-while-the-same-file-attributes-it-to-u.md` each
gained a `Resolved:` line and moved `_o_` → `_c_`, which is the issue-file annotation the conventions
mandate (`rules/fusion-workbench-conventions.md` `### Issue files`). `260817-2130`'s note states the
quoted-glob decision plainly rather than hiding it, which is why Finding 1 could be checked at all.

## Cross-cutting observation

Both findings, and both of the predecessor pass's Mediums, are one shape: a statement whose scope is
wider than the evidence attached to it. `rules/critical-stance.md` §4 asks a case split to be
disjoint **and** complete, and this sentence family keeps failing on one half or the other. `bd2db5c`
attached one mechanism to four shapes, which failed disjointness. `6b6436d` fixed that and left the
fourth name half-covered, which fails completeness. The shell wrapper still carries the pre-`bd2db5c`
version of the first failure. The pattern to notice for the next edit: this text enumerates a
prohibition and then enumerates justifications, and nothing checks that the two enumerations have the
same members — a reader has to hold four names in mind and match them by hand, which is what has now
gone wrong twice in three commits.

## Recommended sequencing

Neither finding blocks a release, and neither is urgent. Finding 1 is the one worth doing before the
next version bump: it costs six words in one string plus a rebuild, and it is the last thing standing
between this sentence and a claim that survives the check it invites. Finding 2 rides along with it
if the wrapper is convenient, or waits — it reaches no user. The durable answer to all four findings
across the two passes is the output gate already filed as `260817-2131_*_nothing-stops-a-fusion-workbench-id-returning-to-an-emitted-hook-sentence-because-the-lint-reads-comment-lines-only.md`, which would catch neither of
these two directly but is the mechanism that stops the family recurring by hand-inspection alone.

---

## Reconciliation annotation — 260817-2207

Reconciler, final pass of session `260817-2037-orchestrator-session.md`, at HEAD `307a696`
(log `260817-2207-reconciliation.md`). Findings only annotated, nothing rewritten.

- **Finding 1** (`260817-2147`, the completeness gap) — resolved in `307a696`. Verified by rendering
  `stagingSentence()` from the rebuilt `hooks/dist/lib/staging-drift.js`: the over-staging clause
  reads "`-A`, a directory argument and a quoted pathspec glob", the reverse clause reads "an
  unquoted shell glob", and `STAGING_SPOKE`'s literal is still a substring. Record closed (`_c_`).
- **Finding 2** (`260817-2147`, the wrapper header) — resolved in `307a696`. Verified at
  `bin/fusion-staging-drift:51-54`: the "re-opens f38f37d" generalisation is gone, the incident and
  the `-u` mechanism stay, and the commit hash is kept as provenance in a `bin/` header that reaches
  no consuming session. Record closed (`_c_`).

This pass's counter-argument prevailed over the judgement recorded one Turn earlier in
`260817-2130`'s `Resolved:` note, and that earlier record carries no pointer to the reversal. Filed
as `260817-2207_*_a-closed-records-resolution-note-states-a-judgement-head-reversed-and-every-citation-points-backward.md`.

The review's declared `**Reviewed-range:**` matches what it opened: `bin/fusion-review-coverage`
reports `not-opened=none covers=1` for this file. `307a696` was left uncovered by user decision at
the Turn 2 gate, so no third review file exists and none claims that range.
