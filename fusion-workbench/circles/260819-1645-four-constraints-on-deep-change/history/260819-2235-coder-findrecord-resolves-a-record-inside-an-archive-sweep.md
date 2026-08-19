# coder — let `findRecord()` resolve a record inside an archive sweep (plan step 6b)

**Status:** Complete
**Date:** 2026-08-19
**Agent:** coder
**Task:** Not a plan step. Opened by step 6's measurement, put to the user at the gate step 6's
report opened, and answered there: fix shape 1 of
`circles/260819-1645-four-constraints-on-deep-change/issues/260819-2213_*_the-citation-grammar-cannot-express-a-record-inside-archive-so-a-corrected-archive-path-still-scans-as-wrong-store.md`.
**HEAD at start:** `ad7ffed`, with step 6's workbench repairs uncommitted in the tree.

## What changed

`hooks/lib/__tests__/helpers/citation-scan.ts`, one behavioural edit. The two anchored branches of
`findRecord()` went from `startsWith(prefix)` to a new `anchoredUnder(relDir, prefix)`, which
accepts the prefix either at the workbench root or under **exactly one** `archive/<sweep>/`
directory. The store-only branch and the unanchored branch are untouched, `REC_RE` is untouched, and
no other function changed.

The bound is written as a pattern rather than left to a `startsWith`:
`/^archive\/[0-9]{6}-[0-9]{4}-[a-z0-9-]+\//`. That is the shape `/fusion:archive` creates —
`mkdir -p "$WORKBENCH/archive/<YYMMDD-HHMM>-<slug>/"`, `skills/archive/SKILL.md:211` — and it is one
level, never two. A looser pattern would let an anchored citation match a file anywhere under the
workbench, which does not make the resolver lenient about archiving; it makes it a resolver that
cannot fail, and step 9 arms a gate on it.

The comment at the branch carries three things the dispatch required and this project's history
argues for: the cost, the alternative, and the citation. An accepted residual that lives only in a
workbench record stops being read.

## The cost, as it is written in the code

Resolution of the two anchored branches is now prefix-**tolerant** rather than exact. A citation
whose line spells the full `archive/<sweep>/shared/issues/…` path and one that spells only
`shared/issues/…` produce the *same token* — `REC_RE` begins its match at the store segment either
way — and now reach the same record. So the scanner cannot distinguish a citation of an archived
copy from a citation of a live record sharing its basename, and it reports the archived copy as the
resolution of both.

Fix shape 2 — teaching `REC_RE` an optional leading `archive/<sweep>/` segment, so the prefix
becomes part of the token and resolution stays exact — was the shape that could tell the two apart.
It was available and was not taken. It also invalidates every citation already written in the
tolerant form, which is the 40 step 6 wrote.

Not answered by this change, and the record says so too: whether an archived record should be a
citation target at all. Tolerating the prefix settles "can the grammar express it", not "should
archiving end a record's life as a target". `skills/archive/SKILL.md` still neither says nor checks.

## Measurement

Re-measured rather than taken from step 6's report, in both directions, on the **same tree** —
the first before-run and the after-run straddled a record being filed into `shared/issues/`
(`260819-2227_o_a-plan-step-can-state-a-narrow-reading-…`), so the before-run was repeated against
HEAD's copy of the helper with that record present. Both figures below are the identical corpus.

Corpus: step 5's and step 6's wider reading, assembled from the tree and never from a written list
— Circle records in every state, `portfolio.md`, decisions carrying `_o_` or `_a_`, issues carrying
`_o_`, excluding `archive/`. **188 files, 1 745 tokens** in both runs.

| status | Before | After |
|---|---|---|
| `wrong-store` | 43 | **1** |
| `stale-marker` | 21 | 42 |
| `dangling` | 197 | 176 |
| `resolved` | 1 149 | 1 191 |
| partitioned `resolved` / `dangling` | 867 / 156 | 909 / 114 |

Every one of the 1 745 tokens was joined before-to-after on `file:line:token`. **Exactly two
transitions occurred and nothing else moved:**

- **42 `wrong-store` → `resolved`.** All 42 resolve to a path under
  `archive/260817-1907-safe-cleanup-scoped/`; none resolves anywhere else.
- **21 `dangling` → `stale-marker`.** All 21 point at archived records too. See below.

### Step 6's two claims, checked

**All 40 resolve.** Step 6 named 40 archive-class citations and 3 hits handed to step 7. The 42 that
flipped are those 40 plus 2 of the 3 step-7 hits, so **every one of the 40 resolves, and none is
left**. The 2 extra are the `shared/planning/260801-1122` pair
(`circles/260801-1244-curator/issues/260814-1419_*_…:39` and
`shared/issues/260812-1720_*_…:31`), which step 6 left because the token matched two candidates. The
anchored branch now picks the archived planning record and drops the `shared/history/` one, because
that one is in a different store. They resolve as a side effect of the tolerance rather than by any
judgement this step made — the ambiguity step 6 declined to settle is now settled by the resolver,
which is the prefix-tolerance cost showing up on its second day.

**27 distinct paths, one file each.** Re-checked: all 42 resolutions are single-match (`resolved`,
not `ambiguous`), which is the same property stated per-file.

### The one `wrong-store` that remains, named

```
circles/260801-1244-curator/issues/260814-2153_o_the-commit-that-closes-the-last-reviews-own-high-finding-is-the-one-commit-no-review-opens.md:77
  token: shared/issues/260814-2153_o_…
  -> circles/260801-1244-curator/issues/260814-2153_o_…
```

This is the third of step 6's three, and it is correct that it stays: the wrong path **is** the
statement. The line reads "Decision `260815-2109` cites this record as `shared/issues/260814-2153_o_…`.
No such path exists", and correcting the quoted path deletes what the sentence reports. Its target
is a live Circle record, not an archived one, so nothing in this change could have touched it.

## Unasked-for finding: 21 citations were mis-diagnosed as `dangling`

Not predicted by the dispatch or by step 6, and it is a real class rather than noise. 21 citations
across 13 files cite an archived record with a literal marker that the archived copy does not carry
— `shared/planning/260801-1122_o_spec-normative-consolidation.md` against
`archive/260817-1907-safe-cleanup-scoped/shared/planning/260801-1122_c_…`, and 20 like it. Before
this change the anchored branch missed the record, the wildcard retry missed it, and the
"anywhere" fallback missed it too (that fallback keeps the literal marker in the basename matcher),
so the hit came out `dangling` — the scanner said the record does not exist, when it exists under
another marker one sweep away.

They are now diagnosed as `stale-marker`, which is step 5's class: the treatment is to star the
marker position. Step 5 could not have seen them, because they did not carry that status while it
ran. **They are not mine** — my file set excludes workbench records — and they are not step 6's
class either. They will be violations when step 9 arms the gate. Handing them on rather than fixing
them out of scope.

## The bound, verified rather than asserted

`anchoredUnder` was exercised on ten cases. It accepts a live path and a one-sweep path, for both
the `circles/<dir>/<store>` and `shared/<store>` anchors. It **rejects** two nested sweeps
(`archive/…-a/archive/…-b/shared/issues`), a non-sweep directory under `archive/`
(`archive/notasweep/…`), an unrelated leading path, a different store under a valid sweep, and a
different Circle under a valid sweep. All ten behaved as intended.

**One residual, stated rather than left to be found.** No test pins that bound. The dispatch's file
set does not include a new test, and adding one grows a surface that is under a failing growth bound,
so this step did not add scope on its own authority. What holds the bound today is the pattern and
the comment at the branch. If step 9's gate is to depend on the bound, it wants a negative-control
test — the two-sweep case is the one that matters, because it is the case that turns the gate into
one that cannot go red.

## Baselines and goldens

**`reference-resolution-lint.test.ts` `BASELINE` did not move.** It stands at
`{ paths: 1179, anchors: 155, records: 104 }` and the pin passed untouched. That gate scans the
*shipped* text, not the workbench, and no shipped file cites a record that the sweep moved — so the
class that newly resolves is absent from its surface by construction. **No re-approval was needed
and none was written**, which is the correct outcome rather than an omission: a re-approval note
against an unmoved constant would claim a measurement that did not happen.

**One golden went stale and was regenerated:** `hooks/lib/__tests__/fixtures/surface-growth.golden`.
The diff is exactly two lines — `helpers/citation-scan.ts 574 -> 621` and `total 18850 -> 18897`, the
+47 lines this comment and helper cost. No other surface moved. Regenerated with
`UPDATE_SURFACE_GOLDEN=1`, diff read, then re-run without the flag per that file's own procedure.
Regenerating records growth and does not absolve it: `TEST_LINE_BASELINE` was **not** touched, and
the hook-test surface's own head-room assertion passed on its own.

## Verification

`cd hooks && npx vitest run` — **exit 0**, 37 test files and 678 tests passed. Run without a pipe so
the exit code is the process's own.

## Files changed

```
hooks/lib/__tests__/helpers/citation-scan.ts        +47 lines (one behavioural edit, the rest comment)
hooks/lib/__tests__/fixtures/surface-growth.golden  2 lines (regenerated inventory)
```

Nothing was committed and no plan step was marked. No workbench record was edited — step 6's repairs
sit uncommitted in the tree exactly as they were handed over.
