# Bugfix: the planability analysis' two backlog citations carried a literal marker

**Date:** 2026-09-08 00:11
**Status:** Complete (for the dispatched target; the suite is still red elsewhere — see below)
**Trigger:** Orchestrator test failure, against the already-filed issue
`260907-1939_*_the-planability-analysis-spells-a-backlog-entrys-marker-and-the-citation-sweep-gate-is-red-on-it.md`

**Filed by:** bugfixer, Kai Stalmann <kai@qantr.com>

## Error

`cd hooks && npm run build && npm test` exits 1. The failing case is the release gate in
`hooks/lib/__tests__/citation-sweep.test.ts` `## the release gate: fusion's own tree is swept`,
which requires `bin/fusion-citation-sweep --dry-run` over this repository to summarise
`files=0 rewrites=0`.

## Root Cause

`260907-0710-planability-of-the-bounded-dispatch-spec.md:21` and `:331` each cited the backlog
entry `260814-1733_*_bounded-executor-dispatches.md` with the letter `c` spelled at the marker
position instead of the wildcard the mandated citable form carries there
(`rules/fusion-workbench-conventions.md` `## Filename Patterns`, the "Cite a record by its
storeless basename with the state marker wildcarded" paragraph). The scanner classes such a token
`bare-record` and the sweep counts it as a rewrite; the gate fails on any non-zero count.

The analysis is committed in `b1e49fe0` and no later commit touched it, so the failure predates
every change in the working tree. Confirmed independently of the running work: the sweep census
names the file, and the gate reads the filesystem (it spawns the sweep entry with `cwd: REPO_ROOT`
and no `--root`), never the git index.

## Fix

Both tokens now read `260814-1733_*_bounded-executor-dispatches.md`. Two lines, one character each.
Nothing else in the file was touched — no sentence, no figure, no judgement — because the analysis
is the evidence a user decision was taken on.

| File | Change |
|------|--------|
| `260907-0710-planability-of-the-bounded-dispatch-spec.md:21` | `_c_` → `_*_` in the backlog citation |
| `260907-0710-planability-of-the-bounded-dispatch-spec.md:331` | the same token in the sources list |

## Verification

- [x] The dispatched target is out of the census: `bin/fusion-citation-sweep --dry-run` no longer
      names the analysis file, and `bare-record` fell from 4 to 2.
- [ ] The gate is green — it is not. `npx vitest run lib/__tests__/citation-sweep.test.ts` from
      `hooks/` still fails 1 of 17, now on a **second, unrelated file**:
      `260908-0003-coder-dispatch-minutes-config-leaf.md`, untracked, written by the coder of the
      session in flight. Its lines 8 and 41 cite the Circle plan
      (`260907-1450_*_plan-bounded-executor-dispatches.md`) and the issue named at the head of this
      log, both with the marker letter spelled instead of wildcarded — the same fault class, in a
      file that did not exist when the issue was filed. Not repaired here: it is a live
      artifact of another dispatch, and the instruction was to report a further red spot rather
      than widen the fix.
- [x] No regression: nothing outside those two lines was written; no tree-wide git command was run.
- The full run `cd hooks && npm run build && npm test` exits 1 with 3 of 911 cases failing. One is
  the citation gate above. The other two, `review-coverage.test.ts` ("speaks once for a gap that
  persists and again for one that grows") and `staging-drift.test.ts` ("names a modified queue, an
  untracked history entry and a workbench commit-message file"), both **pass in isolation**
  (`npx vitest run lib/__tests__/review-coverage.test.ts lib/__tests__/staging-drift.test.ts`,
  40/40 green). They are load-sensitive under the full parallel run — one sibling case in that same
  file takes 42 s — not a second defect. Recorded so the next reader does not chase them.

## Unrelated Issues Found

None filed. The remaining failure is reported to the dispatcher rather than filed, since a defect
record for the same fault class in this Circle already exists and a second one would duplicate it.
