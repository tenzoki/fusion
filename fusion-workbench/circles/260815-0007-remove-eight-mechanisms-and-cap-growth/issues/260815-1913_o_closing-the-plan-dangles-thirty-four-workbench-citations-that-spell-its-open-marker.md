# Closing the plan dangles thirty-four workbench citations that spell its open marker

---
**Severity:** Low — nothing breaks; the cost is that a reader following a citation gets nothing
**Domain:** code
**Filed by:** reconciler, Phase-3 pass `history/260815-1913-reconciliation.md`, HEAD `9306f0a`
**Owner:** none assigned — this is a class question, not a repair
**Cross-references:** `rules/fusion-workbench-conventions.md` `## State Markers — issues and planning` (state change is a rename); `issues/260815-1247_o_a-backlog-entrys-related-line-points-at-a-marker-the-playmaker-has-since-moved.md` (same class, one entry); `shared/issues/260812-1720_o_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md` (why no gate sees it)

---

This pass renamed `planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md` to `_c_`,
which the conventions require once every step carries `[DONE]`. Measured immediately before the
rename:

```
$ grep -rl '260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth' fusion-workbench/ | wc -l
34
```

Twelve in this Circle's `history/`, fourteen in its `issues/`, one each in its `decisions/`,
`reviews/` and record, one in `shared/history/`, one in `shared/planning/`, one in `.guard-state/`
and two at the workbench root. Every one spells the `_o_` marker literally rather than the `_*_`
glob form the conventions use throughout their own worked examples. No file outside
`fusion-workbench/` cites it, so no lint and no test is affected.

---

## Why this is filed rather than repaired

Rewriting 34 files to chase one rename is a worse trade than leaving them: the citations were
correct when written, the target is one directory away under a one-character difference, and a
reconciliation pass that mass-edits historical records is doing something other than reconciling.

The class is what is worth deciding. Three positions are visible in the corpus and none is written
down:

1. A citation of a marked artifact spells `_*_`, so it survives every transition. This is what
   `rules/fusion-workbench-conventions.md` does in its own examples and what the Circle record's
   `## Dependencies` bullets do.
2. A citation spells the marker it saw, and going stale is the record's honesty about when it was
   written.
3. Something reads the workbench and repoints them, which is
   `shared/issues/260812-1720_o_…` from the other side.

The same class already has an instance in this Circle at
`issues/260815-1247_o_a-backlog-entrys-related-line-points-at-a-marker-the-playmaker-has-since-moved.md`,
filed against one entry rather than thirty-four. Whether it is a defect at all depends on which of
the three positions holds, which makes it a decision this record does not take.
