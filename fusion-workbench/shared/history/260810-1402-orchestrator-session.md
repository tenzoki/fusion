# Orchestrator Session — 260810-1402

**Directive:** Fehlerbereinigung fortsetzen — die offenen Fehlermeldungen in `shared/issues/` abarbeiten
**Mode:** issues
**Status:** Complete — closed early at the user's request to cut a release, after one Turn

## Setup snapshot

- **Workspace:** `/Users/k1/Projects/productive/fusion` (workbench at `fusion-workbench/`)
- **Git HEAD at start:** `430d73a`
- **Active Circle:** none — every `OUT_*` resolves into `shared/`
- **Open defect records:** 45 open, 0 in progress (`shared/issues/`)
- **Open plans:** 1 open, 0 in progress (`shared/planning/`)
- **Decisions:** 5 open, 6 answered (`shared/decisions/`)
- **Analyses:** 9 (`shared/analyses/`)
- **Circles:** 1 anticipated (`260801-1244-curator`), 10 closed, 1 superseded
- **Guard:** not halted (`haltActive: false`); the last halt was cleared by hand on 2026-08-09 at 22:14 UTC. The block events preceding it were all `git_branch_switch`, a policy deleted on 260809; they are history, not live state.
- **Portfolio hint:** printed — 1 anticipated Circle, 0 active.

## Workbench domain

**Detected: `code`.** Inputs, counted from the project root with `bin/fusion-count-sources`
(`counted_by=git-ls-files`): `code_files=95`, `data_files=21`, `commits` against the
workbench 193, `analyses_count=9`, `issues_count=45`, `decisions_count=5`. Source files are
present and data does not outweigh them better than two to one, so the cascade stops at the
`code_files > 0 → code` branch.

Note on the measurement: the first run of the counter was taken from inside
`fusion-workbench/`, because the Bash tool's working directory persisted from an earlier
call in this Setup. It reported `code_files=0, data_files=8`, which would have carried the
cascade to `data`. The count was re-taken from the project root before the domain was
decided. Worth recording: `bin/fusion-count-sources` counts relative to the working
directory and has no anchoring of its own.

## Work queue

`fusion-workbench/tasklist.md` (written 260810-0437) names no Circle in its head, and no
Circle is active. Verdict: **unaffiliated backlog** — a queue over `shared/` with no Circle
to outlive. Current.

## Plugin version

The installed plugin at `$FUSION_PLUGIN_ROOT` (`~/.fusion`) reports **7.0.0**; this work
tree is at **7.1.0**. `bin/fusion-rules` and `bin/fusion-paths` read the work tree here (the
plugin-repo preference), but the hooks — guard and tracker — run from the installed copy and
are pinned for the whole session. Rule or guard work in this session runs against 7.0.0
hook behaviour until `fusion --update` and a session restart.

## Session log

- 14:02 — Setup complete. No interrupted session found (`agentstate.yaml` absent).

---

## Budget

| Metric | Count |
|--------|-------|
| Turns | 1 (of 5; closed early at the user's request) |
| Tasks resolved | 6 |
| Tasks skipped/deferred | 0 |
| Issues created | 4 |
| Issues resolved | 5 |
| Decisions answered (`_o_`→`_a_`) | 0 |
| Decisions implemented (`_a_`→`_i_`) | 2 |
| Commits | 7 |
| Agent errors | 0 |
| Human gates hit | 2 (scope, gate-handling strategy) |

## Per-Turn Log

### Turn 1

Tasks attempted: T1, T2, T4, T22, T27, plus one urgent out-of-queue fix.
Tasks completed: all six.

| Commit | What it did |
|---|---|
| `e0acdb6` | A stray `</content>` removed from `README.md` and `docs/philosophy.md`; shipped in every release since `43ee3b5` |
| `4f16c60` | `/fusion:archive` stops promising unconditionally that git preserves archived bytes |
| `7c4dfb2` | `docs/plane-setup.md` documents the marker-free Plane key the tool actually builds |
| `25c5454` | The churn key anchored to the workbench root, with a one-time migration and an existence filter on the read path |
| `26ea3c3` | Setup Step 5 guards its `bin/` helper call; also carries the churn-rank call site |
| `2679589` | `bin/monitor` opens a browser tab only for a person at a terminal |
| `8b2a206` | Release v7.2.0 and this session's bookkeeping |

Review findings: the `coderev` pass over `430d73a..HEAD` was dispatched but had
not returned when the release was cut. See `## What went wrong` below.

Circuit breaker status: OK — the loop was ended by the user, not by a breaker.

## The urgent fix, and what it was not

The user reported hundreds of focus-stealing browser tabs on `localhost:<port>`,
attributed to their consuming project `krk`. It was not from there. `bin/monitor`
ended with an unconditional `open`, and `monitor-warnings-panel.test.ts` spawns
the monitor eleven times per suite run on random free ports, each killed seconds
later. One `npm test` opened about eleven tabs; the suite ran many times today,
at one point under five agents in parallel.

The diagnosis was settled by the evidence rather than by the report: every
surviving process named this repository's own `bin/monitor`, and the ports varied,
where a consuming project's monitor uses one fixed port. The browser is
machine-wide, so the symptom surfaced wherever the user happened to be.

Six stray processes were killed. The fix gates the launch on `[ -t 1 ]` plus an
opt-out variable, and is pinned by three behaviour cases using a fake `open` on
`PATH` that records its argv to a marker file. Acceptance was observed rather than
inferred: the verifying full-suite run carried that fake, and no marker appeared.

## What went wrong

**The review lost a race it should have won.** The `coderev` pass over this
session's range was dispatched in parallel with the release mechanics so the user
would not wait. The release finished first, so v7.2.0 was tagged and pushed with
its review still running. That is precisely the defect open record `260810-1205`
describes — a range reaching a pushed tag with no reviewer having opened it — and
this session reproduced it while carrying the task to fix it in its own queue.
Any finding now lands in a 7.2.1, which is a worse position than holding the tag
for ten minutes would have been. Filed as its own record.

**Two staging faults, both mine.** A `bash -c` wrapper with a heredoc inside it
truncated a commit message at the first apostrophe (`045a14f`, repaired by amend
as `4f16c60`); the prompt's own Step 3b instructs both halves of that
combination, and it is filed as `260810-1535`. Separately, `git add -u` on
`shared/issues/` swept two in-flight records' `Resolved:` notes into `7c4dfb2`
ahead of their own commits, so both claimed resolution one commit early.

**A decision was marked implemented while two thirds of it were unbuilt.**
`260810-0921` bundled three questions; only part (a1) was realised. Reverted,
split into `260810-1544_o_...`, then marked implemented on its remaining scope.
A record bundling separable questions cannot hold a single state.

**Parallel dispatch cost more than it bought.** Two executors reached outside
their declared file sets into contended files, and concurrent suite runs pushed
a 90-second baseline to 126-292 seconds while a wall-clock test case flaked.
One executor's `npm run build` wiped `hooks/dist/` mid-run for another.

## Remaining work

37 of the 43 queued tasks are untouched, 18 of them behind a human decision that
was deferred to an end-of-session batch this session never reached. The batch is
owed. `fusion-workbench/tasklist.md` is current as of `430d73a` and its head
records the ground it was built on.
