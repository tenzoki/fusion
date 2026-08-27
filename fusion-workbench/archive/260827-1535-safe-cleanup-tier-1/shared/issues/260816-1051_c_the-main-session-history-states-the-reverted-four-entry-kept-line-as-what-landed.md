The pass's main session history states the reverted four-entry KEPT line as what landed

---

`fusion-workbench/shared/history/260816-1030-coder-tracked-workbench-split-remainder.md`, under
`## What changed`, item 1:

> **1. `.gitignore:67`** — the KEPT list now names the records group exactly as
> `rules/fusion-workbench-conventions.md:76` states it: `orchestrator-events.jsonl`,
> **`.guard-state/events.jsonl`**, `portfolio.md`, `.fusion-setup`.

Four entries. The landed line has three:

```
# KEPT: orchestrator-events.jsonl, portfolio.md, .fusion-setup.
```

The fourth is the one `b18a8cf`'s commit message says was "Reverted before commit", because the
records bullet at `:76` is a classification list and not a tracking list — `.guard-state/events.jsonl`
is ignored by `.gitignore:78` and appears in no `git ls-files` output.

## Why the record set is inconsistent rather than merely incomplete

The reversal **is** documented — in a different file, `shared/history/260816-1040-coder-gitignore-kept-line.md`,
committed in the same commit `b18a8cf`. Nothing in `1030` points at `1040`.

`1030` was reopened after the fact: it carries an addendum stamped 260816-1035 covering the golden
regeneration. So the file was edited again and the stale sentence was left standing.

The result is that one commit's record set says two different things about what one line contains,
and the wrong one is the file a reader reaches first — `1030` is the pass's main history, named for
the whole task, while `1040` reads as a sub-note on one edit.

## Why this class is worth closing here

A session history is the durable record of what a pass did; the reconciler, `/fusion:cadence` and
the next reviewer all read these files rather than re-deriving from diffs. A history that describes a
reverted state as landed is worse than a missing one, because it is confidently wrong about the exact
detail this session got wrong once already and caught.

## Fix direction

Two lines in `260816-1030-coder-tracked-workbench-split-remainder.md`:

1. Correct item 1 to the three entries that landed.
2. Add a pointer to `shared/history/260816-1040-coder-gitignore-kept-line.md` for the reversal and
   the reasoning, so the two files read as one record.

Do not delete the wrong-turn reasoning — `1040` is the reusable part and the commit message says so.

**Found by:** coderev, reviewing `433e206..b18a8cf`
(`shared/reviews/260816-1049-coderev-tracked-workbench-split-and-kept-line.md`, F4).

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `shared/history/260816-1030-coder-tracked-workbench-split-remainder.md:10-13` still lists the four-entry KEPT line as what landed, with no correction and no pointer to the follow-up file; the landed `.gitignore` line is the three-entry form. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
Resolved: fixed — item 1 is corrected to the three-entry line in an appended note that points at the 1040 file; shared/history/260816-1030-coder-tracked-workbench-split-remainder.md:100
