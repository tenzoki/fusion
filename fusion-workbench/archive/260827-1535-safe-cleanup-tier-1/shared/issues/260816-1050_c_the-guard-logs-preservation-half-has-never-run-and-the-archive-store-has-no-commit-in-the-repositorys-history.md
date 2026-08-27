The guard log's preservation half has never run, and the archive store has no commit in the repository's entire history

---

Two shipped texts state that the guard's append-only event log is preserved by the archive roll
rather than by tracking the live file:

`rules/fusion-workbench-conventions.md:81` (always-on rule, every agent, every dispatch):

> That step — the whole pipeline, or `/fusion:cleanup --only archive` alone — rolls the live log into
> the archive store under a dated name and starts a fresh empty one, so the rolled copies are ordinary
> archived files and are kept wherever the archive store is kept. A project may therefore leave the
> live log untracked and still hold the evidence, paying no diff on every tool call — the record side
> of the split is satisfied by the rolled copies. That is the one entry above where "track them" reads
> as "keep what the roll produces", and **it is the configuration this repository runs**.

`.gitignore:70-72` (rewritten by `b18a8cf`):

> what preserves it is the archive step of `/fusion:cleanup`, which rolls it into
> `fusion-workbench/archive/` under a dated name, and the archive store is tracked. **So the evidence
> lands in git** without the live log producing a diff on every tool call.

## Measured

| | |
|---|---|
| `fusion-workbench/archive/` on disk | empty — zero entries |
| `git log --all -- fusion-workbench/archive` | **zero commits, across the repository's entire history** |
| `git ls-files fusion-workbench/archive` | zero files |
| `fusion-workbench/.guard-state/events.jsonl` | 18 128 lines |
| `git check-ignore -v` on that file | ignored, by `.gitignore:78` (`fusion-workbench/.guard-state/*`) |
| `git ls-files fusion-workbench/.guard-state/` | empty — nothing under it is tracked |

The roll has never fired. Not once, in the whole life of the store.

## Why it matters

`skills/archive/SKILL.md:130` states the roll is the **only** thing that bounds the log's size, and
`rules/fusion-workbench-conventions.md:81` says the log deliberately has no line or byte limit
anywhere, because "every such limit discards the oldest lines first, and the oldest lines are the
block, halt and clear events, which are the only ones recording the guard enforcing anything."

So the whole preservation argument rests on one step that has never executed. Every guard block,
halt, cleared halt, advisory override and fail-open this project has ever emitted — 18 128 lines of
it — sits in a single ignored, untracked, unbounded file. A fresh clone does not have it. `git clean
-xdf` deletes it. `git stash --all` sweeps it (`rules/fusion-workbench-conventions.md:83` says so
explicitly about ignored paths). That is precisely the outcome that classifying the log as a *record*
rather than as live state was meant to prevent, per decision
`shared/decisions/260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md`.

## What is and is not being claimed

Neither sentence is false as a statement about the mechanism: the archive step exists
(`skills/archive/SKILL.md:214-220` carries the `mv` and the truncate), and it would do what the texts
say. What is unsupported is the closing clause of `:81` — "it is the configuration this repository
runs". The configuration this repository runs is the *untracked live log* half of that pair without
the *preserving* half, and has been for the store's whole existence.

This is not a defect `b18a8cf` introduced. It is a defect that commit's text now certifies as
working, in a block it rewrote.

## Fix direction — a choice, not a mechanical edit

Three options, and picking one is the work:

1. **Run the roll.** `/fusion:cleanup --only archive` rolls the live log into
   `fusion-workbench/archive/<stamp>-<slug>/.guard-state/events-<stamp>.jsonl`
   (`skills/archive/SKILL.md:139`) and truncates the live file. That makes both texts true and puts
   18 128 lines of guard evidence into git for the first time. Check the file's size before
   committing it.
2. **Soften `:81`'s closing clause** to say what the repository actually runs — the untracked live
   log, with the roll available and not yet exercised — so the always-on rule stops asserting a
   worked example that has never been worked.
3. **Ask why the step never fires.** `/fusion:cleanup` Step 4 runs tier-1 autonomously
   (`skills/cleanup/SKILL.md:115`), the project runs cleanup routinely, and yet `archive/` has never
   received a commit. Either the roll is not reached on the paths actually taken, or its output has
   never been staged. If it is the second, that is a live defect in its own right and options 1 and 2
   both paper over it — `bin/fusion-staging-drift` exists for exactly this class.

Option 3 should be settled before 1 or 2, because it decides whether this is a text problem or a
mechanism problem.

**Related, and distinct:** `shared/issues/260801-1020_o_scan-keys-never-reach-the-archive-store.md`
is about no `SCAN_*` key resolving into `archive/`. That record assumes the store fills up over time.
This one measures that it never has.

**Found by:** coderev, reviewing `433e206..b18a8cf`
(`shared/reviews/260816-1049-coderev-tracked-workbench-split-and-kept-line.md`, F2).

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `fusion-workbench/archive/` is empty on disk, `git log --all -- fusion-workbench/archive` returns no commit, and `.guard-state/events.jsonl` stands at about 18 250 lines, untracked. The roll has still never fired. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
Resolved: The preservation half has now run, and both measured claims are false at HEAD `e435f03`.
`e59dea2` ("chore(workbench): the archive pass that had to be narrowed twice before it was safe",
260817-1912) is the first commit in the repository's history to touch `fusion-workbench/archive/`, and
it carries the rolled log as a tracked file:
`fusion-workbench/archive/260817-1907-safe-cleanup-scoped/.guard-state/events-260817-1907.jsonl`,
18 251 lines, confirmed by `git ls-files`. The live `.guard-state/events.jsonl` restarted at 73 lines,
which is the roll-and-truncate behaviour the two shipped texts describe. The configuration the
conventions rule and `.gitignore` assert — live log untracked, evidence preserved in git by the roll —
is now demonstrated rather than merely stated. Verified by `git log --all -- fusion-workbench/archive`,
`git ls-files`, and `wc -l` on both files. Closed by reconciliation 260819-1400.
