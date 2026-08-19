# HEAD carries six records twice, and the class fix was deferred to a decision that was never filed

---

**Severity:** Medium (no data loss on disk; the git-tracked workbench is internally contradictory, and a marker glob at HEAD returns the wrong open set — 52 instead of 46)
**Domain:** code
**Filed by:** reconciler, Phase 3 pass of orchestrator session `260810-0241`
**Affects:** commits `c923935`, `3df0c17`, `dd50efd`; `fusion-workbench/shared/issues/`; any consumer that reads the workbench out of git rather than off disk
**Cross-references:** `archive/260817-1907-safe-cleanup-scoped/shared/issues/260807-1941_*_marker-renames-landed-add-only-so-head-carries-each-of-three-records-twice.md` (the same defect, closed 260807 for three records); `shared/history/260810-0819-reconciliation.md`

---

## The defect

Three commits this session performed `_o_` → `_c_` marker renames add-only: the new filename was
staged, the old one was not. HEAD therefore carries six records under two names each.

| Record | `_c_` twin added by |
|---|---|
| `260810-0456_…fusion-plane-dry-run-rewrites-the-map…` | `c923935` |
| `260810-0457_…rebuild-map-drops-a-colliding-plane-uuid…` | `c923935` |
| `260810-0500_…the-queue-retirement-writes-through-unchecked-resolver-values…` | `3df0c17` |
| `260810-0743_…map-put-reports-success-on-a-failed-write…` | `dd50efd` |
| `260810-0744_…map-view-s-cache-and-cleanup-die-in-the-subshell…` | `dd50efd` |
| `260810-0750_…an-unreadable-record-yields-an-empty-plane-comment…` | `dd50efd` |

Measured at HEAD `dd50efd`:

- `git ls-tree -r --name-only HEAD -- fusion-workbench/shared/issues | grep -c '_o_'` → **52**
- `ls fusion-workbench/shared/issues | grep -c '_o_'` → **46**

The six-record gap is exactly this duplication. On disk every record appears once, under its
current marker; the six `_o_` deletions sit unstaged in the working tree.

## Why this is not simply a repeat

`260807-1941_c_` closed the identical shape for three records on 260807, and its own "The fix"
section is explicit that it was closing the *instance* and not the *class*:

> Worth considering separately, and deliberately not proposed here as a solution: whether a marker
> rename should go through `git mv` as a convention, so the two halves of a rename cannot be staged
> apart. **That is a decision, not a fix**, and it should not be bundled into closing this defect.

That deferral was honest. But no decision record was ever filed for it — `shared/decisions/`
contains nothing on marker-rename staging — so the class was left with neither a fix nor an open
question tracking it. Three days later it recurred at twice the volume, in three separate commits,
in a session that never noticed.

The general lesson `260807-1941_c_` recorded ("stage the containing directory with `-A`, or name
both the old and the new path") lives only in a closed defect record. Nothing an agent loads at
Setup carries it.

## Reproduction

```
cd /Users/k1/Projects/productive/fusion
git ls-tree -r --name-only HEAD fusion-workbench/shared/issues/ \
  | sed 's|.*/||' | sed -E 's/_[a-z]_/_X_/' | sort | uniq -d
git status --short -- fusion-workbench/shared/issues/
```

The first command prints the six duplicated stems; the second shows six unstaged deletions.

## Acceptance criteria

- [ ] The six deletions are staged and land, so `git ls-tree -r HEAD` returns each record exactly
      once under its current marker only.
- [ ] The class is addressed rather than the instance: either a decision record is filed on the
      staging convention for marker renames (the question `260807-1941_c_` deferred and nobody
      raised), or the convention is written where an agent reads it — `rules/fusion-workbench-conventions.md`
      `## State Markers` is the authoring home — and given a gate.
- [ ] Whichever route is taken, `260807-1941_c_`'s deferral is answered explicitly rather than
      left standing for a third recurrence.

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`; log `shared/history/260817-1836-reconciliation.md`). The instance is gone and the class is not. `git ls-tree -r --name-only HEAD -- fusion-workbench/shared/issues | grep -c _o_` and `ls fusion-workbench/shared/issues | grep -c _o_` agree at HEAD, so no record is carried twice. The class fix is still absent: `rules/fusion-workbench-conventions.md` `## State Markers` still says only "State change = `mv` (rename)" with no `git mv` or stage-both-halves convention, and no decision record on marker-rename staging exists in any decision store. This pass reproduced the failure mode while making its own renames — two marker renames show as a delete plus an untracked file in `git status`, not as renames. Marker stays open on the class.
