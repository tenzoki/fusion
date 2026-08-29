# The citation gate's corpus is corrected in both directions

**Status:** Complete
**Agent:** coder
**Circle:** `260819-1645-four-constraints-on-deep-change`
**Task:** Turn 2, task F2 — the two corpus defects filed against
`hooks/lib/__tests__/workbench-citation-lint.test.ts`
**HEAD at start:** `8e7cae7`
**Files changed:** `hooks/lib/__tests__/workbench-citation-lint.test.ts` (241 -> 343 lines)

---

## What the two records asked for, and what landed

**Over-inclusion** (`260820-0805_*_the-citation-gates-corpus-excludes-only-archive-…`).
`ARCHIVE_PREFIX` became `FROZEN_PREFIXES = ["archive/", "stashes/", ".migration-v2-backup/"]`,
still tested with `startsWith`, so the exclusion stays anchored at the workbench root.

**Three of the precedent's four entries, not four.** `skills/log-activity/SKILL.md:89` names
`archive/`, `stashes/`, `stilwerk/` and `.migration-v2-backup/`. Three of those transfer: they are
frozen copy trees of the workbench layout, so they carry the `issues/` and `decisions/` subtrees the
unanchored predicates match, and repairing a frozen copy's citations falsifies the copy — the reason
the file already gave for `archive/`. `stilwerk/` does not transfer. It is on the activity-log's list
under that skill's own criterion (configuration rather than activity); it holds four fixed-name
`.yaml` voice profiles, no `.md` at all, and no path under it can match a predicate here. Carrying it
would be an exclusion with no reason of this gate's own. The three that landed are exactly the set
`rules/fusion-workbench-conventions.md` ("Two legacy stores are absent from this tree on purpose")
and `skills/setup/SKILL.md:60` call content taken out of circulation.

**Under-inclusion** (`260820-0906_*_the-citation-gates-corpus-has-no-planning-clause-…`).
`LIVE_PLAN_RE = /(?:^|\/)planning\/[0-9]{6}-[0-9]{4}_[op]_[^/]+\.md$/` — `_o_` and `_p_` and no
others. `rules/fusion-workbench-conventions.md` `## State Markers — issues and planning` gives a
planning file four states: `_o_` open, `_p_` in progress, `_c_` closed, `_d_` deferred. The first two
are the states in which an executor is dispatched against the document, so a citation in it is one
somebody is about to follow; `_c_` and `_d_` are terminal and out for the reason a closed issue is
out. The backlog half of that record's question (`_o_`/`_p_` backlog entries) is left open, named in
the code and not answered.

The predicate was also factored into a pure `inCorpus(rel)` that `corpusFiles()` calls, because the
two defects share a shape — neither is visible in this tree — and a walk-derived assertion over
either would pass vacuously.

## Measured before and after, not asserted

Both readings, whole workbench, `scanRecordCitations`:

| Corpus | Files | Violations |
|---|---|---|
| before — `archive/` only, no planning clause | 199 | 0 |
| after — three frozen stores, planning `_o_`/`_p_` | 199 | 0 |
| had the clause taken `_c_` too | 223 | 157 |

**No file newly enters, and the gate stays green.** Every plan outside `archive/` carries `_c_`,
including this Circle's own (`…/260819-2016_*_four-constraints-on-deep-change.md`), and the
tree's single `_p_` plan sits inside `archive/`, where the frozen-store exclusion takes it. The
clause is armed for the next plan somebody writes; it admits nothing today. Admitting `_c_` would
have added 24 files and reddened the gate with 157 findings — the outcome the report says to stop at
rather than narrow around, and the reason the marker set is `_o_`/`_p_`.

The 157 was 170 when first measured at `8e7cae7`; a sibling coder's parser change moved it inside
this task. Both figures are the same fact.

## Demonstrated, not argued

Detached worktree at `8e7cae7`, this file copied in, two demo plans written into
`shared/planning/` carrying the same broken citation
(`260101-0000_*_this-record-was-never-filed.md`):

- `260820-1100_*_demo-live-plan.md` — gate **red**, exit 1, one finding, naming file, line 3 and
  token, with `no record in the workbench matches this citation`.
- `260820-1101_*_demo-closed-plan.md` — **no finding**. The identical citation in a closed plan does
  not enter.

Then the plan was removed and `.migration-v2-backup/260101-0000_*_frozen-copy.md`
written with the same broken citation: **green (exit 0)** with this file, **red (exit 1)** with the
`8e7cae7` version of it, naming the backup path. Worktree removed.

## What the consolidation pass needs to know

The hook-test growth surface is nearly spent. Measured after this change, with both siblings' work
present in the tree: total 20 184 lines against a floor of 17 875 and a budget of 20 375 — **191
lines of head-room left** in a 2 500-line budget. This file contributed +102 of the 2 309 spent. It
carries no `TEST_LINE_BASELINE` entry, so its whole size counts as growth. Nothing was written to a
baseline here, per the dispatch.

## Not done, deliberately

No commit, no marker transition, no plan step marked. The two issue records stay `_o_`.
