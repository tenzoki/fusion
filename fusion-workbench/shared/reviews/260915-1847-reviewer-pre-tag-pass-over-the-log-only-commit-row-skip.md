# Pre-tag review — the log-only commit row skip

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `da8c4cb2..1401a71d`
**Not-opened:** none
**Review domain:** code

## Summary

The mechanism in `8d4bbe07` is sound in the geometries it was built for and the two it was not.
`commit_is_log_only` asks the repository after the fact, computes the toplevel offset rather than
assuming it, cannot escape the best-effort contract, and its two new `git` calls are inside a
region whose caller already discards stderr and exit status. The suite is green at a clean `HEAD`.

Two things are wrong. The change states an absolute about merge commits that its own default merge
driver falsifies, and the capability it adds has no caller: `/fusion:cleanup` still ends a session
with a dirty tree and an unmet push precondition, which is the failure the change was made to end.

One item outside the range blocks the tag: the release-prep edits sitting uncommitted in the
working tree turn two gates red.

## Totals

Critical 0 · High 1 · Medium 1 · Low 2. Filed: four issues. One release blocker reported, not
filed, because it is another session's work in flight.

## What was verified, and how

Every claim below was measured against a throwaway fixture driving the real
`bin/fusion-commit-lock`, not read off the diff.

- **Exit code cannot escape.** `bin/fusion-commit-lock:414-416` calls
  `emit_commit_event "$head_before" 2>/dev/null || true`. The `|| true` suspends `set -e`
  (line 61) through the whole function body including `commit_is_log_only`, and the redirection
  covers both new `git` calls. `prefix` is assigned with `|| true`; `names` ends in a `sed` whose
  status is the pipeline's without `pipefail`. Nothing here reaches the wrapped command's `rc`.
- **The three geometries.** Workbench root equal to the git toplevel: `--show-prefix` is empty and
  the comparison matches. Workbench root below the toplevel: `--show-prefix` is `sub/` and the
  comparison matches. Both are pinned by the new loop at
  `hooks/lib/__tests__/fusion-commit-lock.test.ts:367-385`. Workbench root **above** the toplevel,
  which no test covers: measured with a repo nested inside a workbench root, `git rev-parse` fails,
  `prefix` is empty, `git show` fails, `names` is empty, the `[ -n "$names" ]` guard returns 1, and
  the pre-existing HEAD comparison had already returned 0 because HEAD does not move in that
  context. No row, no false skip.
- **Configuration cannot leak into the name list.** `log.showSignature true` and
  `log.decorate full` both leave `git show --name-only --format= HEAD` printing the path and
  nothing else.
- **Empty commits still emit.** Every other case in the test file commits `--allow-empty`, which
  lists no path, and the first case asserts the row.
- **`bin/monitor:1543` is the only reader of a `commit` row.** Confirmed against `bin/`,
  `hooks/lib/` and the skill bodies: no other executable matches on that event kind,
  `hooks/lib/staging-drift.ts` decides a moved HEAD from git rather than from the log, and
  `skills/cadence/SKILL.md` counts git commits directly. The ruling's measurement holds.
- **The test material that was cut carried nothing load-bearing.** The `agentstate.yaml` fixture
  and the case pinning the second arm of the session gate both named a file removed on
  2026-09-10; the first arm is still pinned, and more sharply than before, because the surviving
  first case no longer writes that file at all. The `Blocking` interface had one use. The new
  `gitRepo` is stronger than the one it replaced: its root commit tracks the workbench marker, so
  `git status --porcelain` can reach empty, which an untracked fixture would have hidden. The
  `beforeEach` at `hooks/lib/__tests__/fusion-commit-lock.test.ts:113-120` writes that marker, so
  the root commit has content and no assertion is vacuous.
- **The suite at a clean `HEAD`.** 925 of 928 pass in a detached worktree; the three failures are
  `committed-dist.test.ts` reporting a toolchain mismatch caused by the worktree's borrowed
  `node_modules`, which is the failure that file names as a toolchain case rather than an artifact
  defect. Both growth-bound gates and the reference-resolution lint pass.

## Findings

### 1. The capability has no caller (High)

`skills/cleanup/SKILL.md` Step 1 reads the tree once, before any commit. Step 2 commits the
splits, each appending a row. Step 3 gates the push on "When the working tree is clean", which is
false by then in every run that committed anything, and nothing between them re-reads or commits
the log. `rules/commit-lock.md:68` now says "one further commit settles it" and "a loop that
commits until clean terminates"; no shipped body is that loop.

The corroboration is inside the range: `6f744b15` is a hand-made log-only commit filed by the
previous session because nothing made it, and this checkout's tree at `1401a71d` carries
` M fusion-workbench/orchestrator-events.jsonl` for the same reason.

Honest about the bound: whether the push is skipped is a model's reading of a natural-language
precondition, so the outcome is undefined rather than deterministically broken. What is certain is
that the body's stated guard no longer holds, and that the user-visible pain the change names was
not closed by the change alone.

Filed: `260915-1843_*_the-commit-lock-can-settle-the-tree-and-no-shipped-body-makes-the-settling-commit.md`

### 2. The merge absolute is false under the project's own merge driver (Medium)

Three shipped statements say a merge lists no path and therefore always emits:
`bin/fusion-commit-lock:323-324`, `rules/commit-lock.md:68`, and the test's own comment at
`hooks/lib/__tests__/fusion-commit-lock.test.ts:389`. A merge lists nothing only when its result
equals one parent on every path. `git show` defaults to the combined diff, which lists every path
differing from all parents, and a `merge=union` merge of two checkouts' logs produces exactly that
for the log alone.

Measured end to end: with `.gitattributes` carrying
`fusion-workbench/orchestrator-events.jsonl merge=union`, two branches each appending one line,
and `fusion-commit-lock with test -- git merge --no-ff -m merge side`, the merge commit exists and
**no row is written**. A conflicted merge whose only conflicted path is the log lists the same
single path and is suppressed the same way.

The test's merge case at `:388-402` merges `side.txt` against `base.txt`, which are disjoint, so
it pins the half that is true.

`merge=union` on that file is the workbench's own class R2 configuration
(`rules/workbench-tracking.md`), so this is the configuration fusion ships into, not an exotic one.
No skill body wraps a pull or a merge today, which is what keeps this below High;
`agents/coder.md:26` and `agents/ontocoder.md:44` wrap an arbitrary `<git command>`, and the test
itself wraps `git merge`, so it is reachable.

Filed: `260915-1844_*_a-union-merged-log-merge-is-read-as-log-only-so-three-shipped-statements-about-merges-are-false.md`

### 3. The predicate reads HEAD, the gate reads a range (Low)

`emit_commit_event` decides a commit landed by comparing `before` with HEAD
(`bin/fusion-commit-lock:338`) and then asks `commit_is_log_only`, which reads HEAD alone
(`:328`). A wrapped command landing two commits whose last is log-only now emits nothing, where
before it emitted one row naming the final HEAD. Unspent: every shipped call site commits once per
acquisition.

Filed: `260915-1845_*_the-log-only-predicate-reads-head-alone-so-a-wrapped-command-landing-two-commits-can-lose-its-row.md`

### 4. The one known consumer was not told (Low)

`bin/monitor:1510` describes its counter as "commits from `commit` rows" and `:1557` renders
"**Commits:** %d". The figure now reads low by the number of log-only commits. The ruling's Cons
entry predicted precisely this consumer; the acceptance covered the loss, not the silence.

Filed: `260915-1846_*_the-monitors-commit-counter-reads-low-and-its-own-docstring-does-not-say-so.md`

## Outside the range, and blocking the tag

The working tree at review time carries four uncommitted release-prep edits:
`.claude-plugin/plugin.json` (11.1.0 to 11.2.0), `README.md`, `install.sh` and
`skills/help/SKILL.md`. Applied to a clean `HEAD` in a scratch copy, they turn two gates red:

- `reference-resolution-lint.test.ts` drops to `paths: 1535` against a pinned 1536. The removed
  "Coming from a v10.26 install" paragraph in `skills/help/SKILL.md` carried
  `$FUSION_SRC/docs/upgrading-to-v11.md`; the new 11.2.0 paragraph adds no path. The gate's own
  message names re-approving `BASELINE` as the expected response.
- `surface-growth-bound.test.ts` reports the `skills` golden changed and needs regeneration. A
  run taken against the live tree mid-edit also showed the `skills` head-room bound 12 bytes over,
  which is not reproducible against the four edits as they now stand. Re-measure after the edits
  settle rather than trusting either reading.

Neither is a defect in this range, and neither is filed: the work is in flight in another session.
Both must be green before the tag.

**Re-measured at 260915-1855, after this pass had written its findings.** The session holding
those edits also changed `hooks/lib/__tests__/fixtures/surface-growth.golden` and
`hooks/lib/__tests__/reference-resolution-lint.test.ts`, and both gates are green against the
live tree: 50 of 50. The blocker above is cleared, and the paragraph is kept because it names
what the release-prep edits cost and what re-approved them.

## Cross-cutting observation

Both substantive findings are the same shape. The change was reasoned correctly about the
mechanism and not carried through to its edges: one edge is the flow that consumes the new
behaviour, the other is the configuration the project itself sets on the file the predicate names.
The pattern to watch is that the prose written with the change states each edge as settled
("both still emit", "a loop that commits until clean terminates") where the measurement had only
been taken at the centre.

## Recommended sequencing

1. Before the tag: green both gates the uncommitted release-prep edits turn red.
2. Before the tag, or with a named gap: finding 1. It is the user-visible half of the change and a
   release that ships the mechanism without the caller ships the same dirty tree.
3. After the tag: findings 2, 3 and 4. None of them loses data and none is reached by a shipped
   body today.

---
**Reconciliation 260921-2230 (reconciler, domain `code`, HEAD `cb8776f3`) — all four findings closed in one commit.** `260915-1843_*_the-commit-lock-can-settle-the-tree-and-no-shipped-body-makes-the-settling-commit.md`, `260915-1844_*_a-union-merged-log-merge-is-read-as-log-only-so-three-shipped-statements-about-merges-are-false.md`, `260915-1845_*_the-log-only-predicate-reads-head-alone-so-a-wrapped-command-landing-two-commits-can-lose-its-row.md` and `260915-1846_*_the-monitors-commit-counter-reads-low-and-its-own-docstring-does-not-say-so.md` each carry `_c_` and a `Resolved:` note, closed at `9c7f2575` ("the four findings of the pre-tag pass"). Findings themselves are not rewritten.
