# Reconciliation — the shared open-defect store

**Date:** 2026-08-19
**Agent:** reconciler
**Domain:** code
**Pass:** B of three (siblings covered `shared/decisions/` and `circles/*/`; neither store was touched here)
**Scope:** `fusion-workbench/shared/issues/` only
**HEAD verified against:** `e435f03`, tag `v10.3.0`
**Active Circle:** none, so every store resolved to `shared/`
**Status:** Complete

## Verdict

The store is honest. Of 95 open records, 90 still reproduce at HEAD, 3 no longer do and are now
closed, and 2 cannot be decided from the tree. The premise this pass was commissioned on, that an
unknown and possibly large fraction of a months-old store no longer reproduces, does not hold, and
the reason is on disk rather than a matter of judgement: **78 of the 95 already carried a
`Reconciliation 260817-1836` annotation**, written two days ago against HEAD `2552586`, and only 35
commits have landed since. The removals that would have mooted these records in bulk, the guard's
protected-path half on 260812, the churn heatmap on 260815, the last guard verdict and the escalation
module on 260816, the v9 fold of eight mechanisms and two agents, the v10 configuration rename, were
all already harvested. `4f7508d` closed eighteen records on exactly that basis and `f4f01b0` triaged
175.

So the yield here is three records rather than the dozens the store's age suggests. That is the
finding, not a shortfall of the method: a baseline the user can rely on is what was asked for, and
the store already was one.

## Method

Every open record was read and its central claim checked against the tree, by opening the file it
names at the line it names and grepping for the string where line numbers had drifted. The work was
split across six independent read-only verification passes of roughly sixteen records each, none of
which could write, rename, or run the test suite. Each returned a per-record verdict with the command
or file:line it was reached from.

The passes were not trusted on their own. Every closure was independently re-verified before the
marker moved, and seven further verdicts were spot-checked at random across the two passes that
reported no closures at all: the absence of an archive key in `bin/fusion-paths`, the deletion of
`queue-ground-lint.test.ts`, the absence of "scratch copy" from `agents/` and `rules/`, the absence of
duplicate record names at HEAD, the `/fusion:monitor-reset` citation in `agents/orchestrator.md:209`,
the zero occurrences of `Cargo.toml` in that same file, and the `WARNING_EVENT_TYPES` set in
`bin/monitor:170`. All seven confirmed. No verdict was overturned on re-check.

The test suite was deliberately not run: two sibling agents were working in the same checkout, and a
full run would have reported their state rather than HEAD's.

## The three closures

### `260816-0723` — the next skill's head-block claim, and the dropped CR

Both halves concerned one `awk` pass in `/fusion:next`'s Circle-activation block. `95bebe1` removed
the `**Status:**` head field from the Circle-record template and deleted that pass with it. At HEAD
`grep -n awk skills/next/SKILL.md` returns nothing, section 6.2 is a bare `mv`, and `:224` states
positively that there is no `**Status:**` field to set. Neither the overstated heading bound nor the
line-ending side effect has a code path left to occur in. The subject was deleted rather than
corrected.

### `260816-1050` — the guard log's preservation half had never run

Both measured claims are now false. `e59dea2` (260817-1912) is the first commit in the repository's
entire history to touch `fusion-workbench/archive/`, and it carries the rolled log as a tracked file
at `archive/260817-1907-safe-cleanup-scoped/.guard-state/events-260817-1907.jsonl`, 18 251 lines,
confirmed present in `git ls-files`. The live log restarted at 73 lines, which is the roll-and-truncate
behaviour the conventions rule and `.gitignore` both assert. The configuration those two texts describe
is now demonstrated rather than merely stated.

### `260819-0837` — the untracked zero-byte `Test.txt`

The file is gone. `find . -maxdepth 1 -iname 'test.txt'` returns nothing and there is no untracked
entry at the repository root. The record's own fix direction was `rm Test.txt`, and it has been
carried out.

**This closure is narrower than it looks, and the record says so.** Nobody claimed creating the file
and nobody has claimed deleting it. It was never tracked, so no commit records its removal and `git
log` cannot answer the question. The conditional half of the fix direction, that a deliberate fixture
needs a self-describing name and a `.gitignore` line, is untested rather than satisfied. A file of this
shape reappearing at the root should be read as a recurrence.

## The two records that gained a line

Only two standing records learned something that changes their severity or fix direction. The rest
were left unannotated on purpose: a store where every file gains a "still open" stamp is a store whose
annotations carry no information.

**`260801-1020_o_scan-keys-never-reach-the-archive-store`.** The mechanism is unchanged, no `SCAN_*`
key resolves into `archive/`, but the premise moved from hypothetical to live. Until 260817 an agent
reading only `$SCAN_*` missed nothing, because the store was empty. `e59dea2` filled it with a
manifest, six planning records, decisions, issues, and the rolled guard log. One consequence is
already measurable: `shared/decisions/260811-1146_i_*.md:7` cross-references a record that now lives
under `archive/`, so the citation resolves for no reader following it at the path written.

**`260816-0725_o_the-citation-gates-new-exact-count-pin-is-coupled-to-workbench-contents`.** The event
this record predicted has now happened once without tripping the gate. The archive pass moved records
out of `shared/issues/`, which is precisely the housekeeping-turns-the-suite-red scenario. It did not
turn red for a narrow reason: the one surviving citation to a moved record sits in a workbench decision
record, and the lint's scanned surface stops before the workbench. Had the same citation been written
into any shipped surface, the archive pass alone would have failed `npm test` with no text edit behind
it. `BASELINE` has moved again since filing, to `{ paths: 1178, anchors: 155, records: 102 }`.

## The two that could not be decided

Neither marker was moved.

**`260814-2118`, the hooks suite failing differently on repeated full runs.** Two of its three named
failure shapes were already closed on their own evidence. The third, a test worker dying under
concurrent full-suite load, was reproducing at the last pass, and `git log 2552586..e435f03` shows no
commit touching `monitor-warnings-panel.test.ts`, `hooks/scripts/`, `hooks/vitest.config.mjs`, or
`hooks/package.json`. The surface is unchanged, so the flake is neither confirmed nor refuted. Settling
it needs a suite run this pass was correctly barred from making.

**`260814-2258`, a tracked `install.sh` vanishing from the working tree.** The record's own closing
condition is a second occurrence or an explicit decision to close. `install.sh` is present and parses
clean, and no second occurrence appears anywhere in `shared/issues/` or `shared/history/`. A one-time
anomaly with no established cause cannot be settled from the tree in either direction.

## Two cohorts, as requested

**The fresh cohort.** Session `260818-2301` filed 24 records into this store. Thirteen were closed
during that session itself. Of the eleven that remained open, ten still reproduce and one is the
`Test.txt` closure above. This is the expected shape for records filed hours before a release and is
not a sign of anything wrong.

**The old cohort.** Everything predating 2026-08-12 was expected to be where the yield lay. It was not.
All 32 records in the two oldest batches reproduce, every one re-verified against a file rather than
read off a prior note. The guard removals did moot a great deal, but that harvest happened in
`4f7508d` and in the 260817-1836 pass, not here. What survives from July and early August survives
because it was never about the guard.

## What would obstruct a deep architectural change

Ranked by how directly each one would interfere with the work rather than by the severity on the
record. The first four are the ones worth reading before the change is planned.

### 1. Parallel executors can destroy each other's work, and nothing forbids it

`260819-0001` records an executor reaching for `git stash` while a second was dispatched against a
disjoint file set. Nothing in `agents/coder.md` or the orchestrator's dispatch text forbids a
whole-tree command, `stash`, `checkout .`, `reset`, or `clean`, from an agent that holds only part of
the tree. A deep change is the case that dispatches executors in parallel, so this is the hazard most
likely to be met and the one whose failure mode is silent loss rather than a red test.

### 2. Marker renames and staging corrupt the commit trail

Two records, one class. `260810-0819` names the convention gap: a rename staged add-only leaves the old
filename unstaged, and HEAD has twice carried the same record under two names. `260816-0105` names the
mechanism: Step 3b runs `git commit -F` with no pathspec, so anything a sub-agent staged before the
orchestrator's own `git add` is absorbed into the wrong commit, which the staging list cannot prevent
because the surplus never passes through that `git add`.

**This was observable while the pass ran.** `git status` during the two sibling reconciliations showed
their renames as unstaged deletions beside untracked additions, which is exactly the shape `260810-0819`
describes. A deep change drives many such renames across issues, decisions, and plans.

### 3. A pre-existing red test blocks every executor report

`agents/coder.md:79` gives three verification forms and no fourth, and `Result: done` requires the
first form with `exit 0` on the whole suite. There is no form for "failed, and the failure predates
this task." One unrelated red test therefore turns every dispatched executor's report to `blocked`
until somebody fixes it, regardless of whether that executor's own work succeeded. Record `260810-0703`.
Given `260814-2118` above, the suite is not reliably green to begin with.

### 4. Nothing resolves a `path:N` citation, and a deep change moves every N

Two records, ten days apart, on one missing gate. `260808-0030` scopes it to workbench records citing
rule files; `260818-1637` scopes it to shipped surfaces and measures thirteen citations drifting in a
single change. `260812-1720` adds that the lint does not scan the workbench at all, which is the densest
citation corpus in the repository, and `260812-2136` adds that the scanner recognises only one of the
two ellipsis spellings and one of the two marker syntaxes in use. A restructuring pass shifts line
numbers across `agents/`, `skills/`, and `rules/` at once. Every stale citation it creates is invisible.

### Also constraining, lower down

- `260805-0629`: the executor dispatch prompt carries no origin, so a sub-agent's history lands wherever `.active-circle` points. A change spanning Circles misfiles its own record trail.
- `260803-1837`: no route attaches an existing spec or plan to a new Circle, and a deep change is exactly the work that gets shaped before its Circle exists.
- `260816-0719`: `reviewSender`'s regex requires a four-digit `HHMM`, while both reviewer prompts mandate a two-digit counter for per-topic files. Multi-pass review coverage over a large change is mis-scored as unmeasured.
- `260816-0717`: the resume paragraph names Phase 2 step numbers that renumbering invalidated, and now points at the `turn_start` emission it forbids double-firing. Long sessions get interrupted.
- `260810-1618`: no gate checks that a tagged range was reviewed. Both v7.2.0 and v10.0.0 shipped over an unreviewed range.
- `260801-1020`: the archive store is now outside every agent's read scope and is no longer empty.
- `260817-1613` and `260817-1836`: the reconciler's verdict vocabulary has no case for a Directive deliberately not reached, nor for a session that stated none. A change touching the Coherence machinery inherits both.
- `260812-0253` (orchestrator instructions to sub-agents): filed as often wrong, never measured, never addressed beyond one narrow convention.

### One cheap consolidation

`260811-1301` names a single missing `Cargo.toml` row in the orchestrator's routing table. `260811-1613`
records four prompts deferring to that table as authoritative for a rule it does not state, and the
umbrella `260811-1734` stays open only until that instance closes. One table row settles three records.

## Notes on store hygiene, not acted on

- 31 closed records carry no `Resolved:` line. Most use a `## Resolution` heading instead, which predates the convention. Outside this pass's scope.
- Nothing in the open set is misfiled as a defect when it is a decision, with one borderline case: `260816-0025` reads as a decision about an asymmetry that `rules/fusion-workbench-conventions.md` now documents deliberately. Left as filed.
- Seven open records carry `Also seen:` annotations, so the duplicate-filing check is being used.

## Counts

| | |
|---|---|
| Open records at start | 95 |
| Closed by this pass | 3 |
| Still reproducing | 90 |
| Undecidable from the tree | 2 |
| Open records at end | 92 |
| Records given a new annotation | 2 |
| Records left untouched | 90 |
| New defects filed by this pass | 0 |
| Files changed outside `shared/issues/` | 0, other than this log |

Nothing was committed.
