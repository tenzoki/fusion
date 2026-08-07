The three marker renames landed add-only, so HEAD carries each of the three records twice

---

**Severity:** Medium (no data loss on disk; the git-tracked workbench is internally contradictory, and a marker glob at HEAD returns the wrong open set)
**Domain:** code
**Filed by:** reconciler, Phase 3 pass of orchestrator session `260807-1917`
**Affects:** commit `1d6c8b3`; `fusion-workbench/shared/decisions/`, `fusion-workbench/shared/issues/`; any consumer that reads the workbench out of git rather than off disk
**Cross-references:** `shared/history/260807-1917-orchestrator-session.md` (the session that produced it); `shared/decisions/260807-0158_*_how-is-a-unique-record-filename-obtained.md` and `shared/decisions/260807-1515_*_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md` and `shared/issues/260807-0158_*_record-filenames-collide-on-the-minute-and-nothing-prevents-it.md` (the three records affected)

---

## The defect

Session `260807-1917` performed three state transitions, each of which is a filename rename per
`rules/fusion-workbench-conventions.md` `## State Markers`:

| Record | Transition |
|---|---|
| `shared/decisions/…_how-is-a-unique-record-filename-obtained.md` | `_o_` → `_a_` |
| `shared/decisions/…_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md` | `_o_` → `_a_` |
| `shared/issues/…_record-filenames-collide-on-the-minute-and-nothing-prevents-it.md` | `_o_` → `_c_` |

On disk all three are correct: the old name is gone, the new name carries the updated body. In git
they are not. Commit `1d6c8b3` staged only the three **additions**; the three deletions were never
staged and sit unstaged in the working tree to this day. Verified at `260807-1941`:

```
$ git ls-tree -r --name-only HEAD -- fusion-workbench/shared \
  | grep -E '260807-(0158|1515)_[ao c]_'
shared/decisions/260807-0158_a_how-is-a-unique-record-filename-obtained.md
shared/decisions/260807-0158_o_how-is-a-unique-record-filename-obtained.md
shared/decisions/260807-1515_a_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md
shared/decisions/260807-1515_o_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md
shared/issues/260807-0158_c_record-filenames-collide-on-the-minute-and-nothing-prevents-it.md
shared/issues/260807-0158_o_record-filenames-collide-on-the-minute-and-nothing-prevents-it.md

$ git status --short
 D fusion-workbench/shared/decisions/260807-0158_o_how-is-a-unique-record-filename-obtained.md
 D fusion-workbench/shared/decisions/260807-1515_o_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md
 D fusion-workbench/shared/issues/260807-0158_o_record-filenames-collide-on-the-minute-and-nothing-prevents-it.md
```

## Why it matters here specifically

This repository's `fusion-workbench/` is **git-tracked** — 612 files since `e8988d9`, and `CLAUDE.md`
calls that fact load-bearing rather than cosmetic. A tracked workbench means the commit is a
readable state of the workbench, and this commit's state is self-contradictory:

- The same decision exists at HEAD as both open and answered, with two different bodies. The `_o_`
  copy has no `## Answer` section and no `Answered:` footer; the `_a_` copy has both. Nothing in
  either file says which one is current.
- A glob for open decisions at HEAD (`shared/decisions/*_o_*.md`) returns three, not one. The
  session's own history file states one. Any agent, skill, or reconciler reading the workbench out
  of the commit rather than off the disk gets the wrong open set — and the counting that
  `/fusion:next`, playmaker and the orchestrator's Setup snapshot all do is exactly that shape of
  read.
- The defect at HEAD is simultaneously open and closed, which is the same failure one level down.

Nothing is lost, and nothing on disk is wrong. The damage is that the durable record disagrees with
the working one, in the direction that makes the durable record look *less* finished than the work
actually is.

## Not systemic — this is the first occurrence

Measured over every record at HEAD under `circles/` and `shared/`, normalising the marker position
and looking for a stamp-and-slug that exists under two markers in the same directory: exactly three
hits, and all three are the ones above. Every earlier transition in this workbench's history staged
its deletion correctly. So this is one session's staging slip, not a convention gap and not a
recurring pattern.

```
git ls-tree -r --name-only HEAD -- fusion-workbench/circles fusion-workbench/shared \
  | grep -E '/[0-9]{6}-[0-9]{4}_[a-z]_' \
  | sed -E 's|(.*/)([0-9]{6}-[0-9]{4})_[a-z]_(.*)|\1\2_X_\3|' | sort | uniq -d
```

## Probable cause

**inference, not verified:** the commit was assembled by naming paths rather than by `git add -A`
over the workbench, so the three new names were listed and the three vanished names were not.
`git mv` would have staged both halves as one rename. I have not read the session's shell history,
so treat the mechanism as plausible rather than established; the *effect* above is measured.

## The fix

Stage the three deletions and land them. Either amend `1d6c8b3` (it is the tip and unpushed at
filing time — check before amending) or add a follow-up commit that records the removals. Both
leave the disk untouched; only the index changes.

Worth considering separately, and deliberately not proposed here as a solution: whether a marker
rename should go through `git mv` as a convention, so the two halves of a rename cannot be staged
apart. That is a decision, not a fix, and it should not be bundled into closing this defect.

## Reproduction

```
cd /Users/k1/Projects/productive/fusion
git status --short -- fusion-workbench/shared
git ls-tree -r --name-only HEAD -- fusion-workbench/shared/decisions | grep 260807-1515
```
