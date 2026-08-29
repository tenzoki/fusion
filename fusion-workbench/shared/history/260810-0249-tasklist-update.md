# Tasklist rebuild — 34 open shared defect records

**Agent:** taskplanner
**Domain:** code
**When:** 2026-08-10 02:49
**Git HEAD:** `8960e1a`
**Active Circle:** none (`.active-circle` absent, so every store resolved to `shared/`)
**Output:** `fusion-workbench/tasklist.md` (rebuilt from scratch)

## What was scanned

One directory, by explicit instruction: `fusion-workbench/shared/issues/*_o_*.md`. All 34
matching records were read in full — several are long, several are German, and both languages
were treated identically.

Deliberately not scanned, and named as such in the queue's scope note so a later reader does
not misread their absence: the 16 open defect records under
`fusion-workbench/circles/*/issues/` (the user deferred these), plus open plans, open
decisions, reviews and analyses. One of the four open shared decisions turned out to block a
queued task and is cited there.

## What was produced

- **31 execution tasks**, dependency-ordered, each with a source path, a self-contained detail
  paragraph, acceptance criteria, a routed executor and a `**Verified open:**` line.
- **3 close-without-work entries**, with the evidence for each.
- **15 dependency edges** in a Mermaid `flowchart TD`: 11 from file collisions turned into
  sequencing, 4 carrying genuine content dependencies.

## Verification, and what it changed

Every record was checked against the working tree rather than against its own reconciliation
notes, several of which predate the last week's work. That check moved five records:

| Record | What verification found |
|---|---|
| `260717-0031_*_p8-lint-gate-scope-open-questions-from-conversions.md` (lint gate scope) | **Already resolved.** All four scope questions are settled inside `hooks/lib/__tests__/path-literal-lint.test.ts`, each with its reasoning in a comment. The record's secondary claim, that playmaker's `description` was stale, is also fixed. Closed without work. |
| `260717-0115_*_live-workbench-split-across-two-layouts-during-conversion.md` (two layouts at once) | **No longer reproducible.** The workbench root holds no pre-v4 type folder; the migration completed. Closed without work. |
| `260809-2255_*_the-branch-policy-verification-left-an-active-halt-and-24-consecutive-blocks-in-the-live-guard-state.md` (branch-policy halt) | **Overtaken on both criteria.** `escalation.json` reads `haltActive: false, consecutiveBlocks: 0` with two `halt_cleared` events, and commit `7598073` deleted the branch policy outright, so the second criterion has no subject. Closed without work, with one residual noted (the clearing is not written into a session history file). |
| `260801-1020` (archive durability) | **Two of three consequences dissolved.** The workbench is now git-tracked (710 files) and `CLAUDE.md` was corrected accordingly. What survives is one unconditional sentence in `skills/archive/SKILL.md` that is unsafe for a consumer whose workbench is untracked. Queued, much smaller than filed. |
| `260809-2258_*_readme-hooks-says-fourteen-ordering-sites-and-the-commit-that-wrote-it-converted-fifteen.md` (ordering-site count) | **The record's own evidence is stale.** It argued the true count was fifteen and named a site in `hooks/guard.ts` that the branch-policy deletion has since removed. Re-enumerated at HEAD: thirteen. Queued with the record's own alternative — drop the number rather than correct it, since it has now gone stale twice in a week. |

The other 29 were confirmed open by reading the exact line or running the exact command each
record cites. Several line-number citations had drifted (cadence's two definitions moved from
`:103`/`:136` to `:106`/`:139`; the stray markup tag is at `README.md:150`, not `:151`); the
text in each case was unchanged. That drift is itself one of the queued records
(`260808-0030`), so the queue prefers section anchors over line numbers where it can and marks
every line number as measured at HEAD.

**No pair among the 34 is a duplicate.** Two pairs look adjacent and are not, and both say so
themselves: `260807-1942_*_die-domaenenerkennung-entscheidet-vor-der-codezaehlung-und-erreicht-code-nie.md` and `260807-1951_*_die-tiefenschranke-der-codezaehlung-sieht-keinen-cargo-workspace.md` edit the same nine-line domain-detection block but
fix the branch order and the counting respectively; `260801-2038` and `260807-1515` are both
Turn-boundary writes a session can skip, on different surfaces.

## Blocked and gated

Nothing is blocked on a prerequisite *task*. **Twelve of the 31 are blocked on a human**, in
four kinds:

- Nine records name two or more candidate fixes and explicitly refuse to choose between them.
- One is blocked on a decision record that is already filed and still open:
  `260809-1731_*_how-should-the-domain-heuristic-count-a-projects-source-files.md`.
- Two are routed to `ontocoder`, or change a schema every consuming project holds a copy of.
- Two have acceptance criteria that cannot be pinned down from the record — one asks the user
  to confirm authorship of an edit from 260801, the other's own first step is a diagnosis
  question rather than an edit.

Nothing in the queue is structurally destructive. The closest is the `/fusion:circle-stash`
sweep, whose candidate fix changes what a rescue tool puts into a git stash; that is gated.

## Routing

29 to `coder`, 2 to `ontocoder` (`settings.json`, and the two `stilwerk/default-voice-*.yaml`
profiles). One task edits YAML frontmatter inside a skill body and is queued to `coder` anyway
with a routing note, because splitting a four-line frontmatter edit away from the body edit in
the same file costs more than the split buys.

Nine tasks write to a path on `guard.protectedPaths`. In this repository the protected-path
measurement stands down, so those writes are not blocked here; the queue says so and warns
against carrying the assumption to a consuming project.

## What the dependency graph shows about the backlog

Two things worth reading off the graph rather than out of the task list:

1. **`agents/orchestrator.md` is the contended file.** Seven of the 31 tasks touch it — the
   domain heuristic, the session loop, the dispatch contract, the Phase 4 bookkeeping and the
   post-dispatch verification. The graph draws them as two chains because I sequenced them, but
   the underlying fact is a god-file, and it is worth naming before someone reads seven
   sequenced tasks as seven unrelated ones.
2. **Eight tasks have no edges at all.** In a design DAG an orphan is a defect; in a work queue
   it is the good case, and the queue says so explicitly so the unconnected nodes are read as
   parallelisable rather than forgotten.

## Previous queue

The 260809-1751 queue covered ten records, all ten now closed, and its scope was a strict
subset of this one. Nothing carried forward as an open task and no progress marker survived,
because no task in it is still open. Its per-task verification notes were not reused; each of
the ten is closed and none appears in the new queue.
