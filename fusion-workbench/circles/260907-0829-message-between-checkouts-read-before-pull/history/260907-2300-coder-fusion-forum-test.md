# A test that drives bin/fusion-forum

**Agent:** coder
**Task:** S6 of `260907-1942_*_message-between-checkouts-read-before-pull.md`
**Status:** Complete

## What was done

New file `hooks/lib/__tests__/fusion-forum.test.ts`, driving the real bash script through
`child_process` against scratch repositories, in the shape `fusion-checkout-name.test.ts`
and `fusion-identity.test.ts` use: a `gitEnv()` that cuts off all three git config layers, a
`run()` that returns the exit code plus per-key `value()`/`lines()` readers, and one fixture
builder.

The fixture is a **trio**: a bare origin, an author checkout that pushes into it, and a
reader checkout cloned from it. The workbench and its `.fusion-setup` are committed, so the
clone carries both the store and the upstream, and the reader's `.checkout-id` is written
rather than minted. No network call is made anywhere: every remote is a local path.

Nine cases, covering every state and every exit code the script's header declares:

- `state=ok` over an empty store, `new=0` reaching exit 0 with `entry=` and `note=` both absent
- a mark that resolves, cutting the answer to what the fetch brought in — the author pushes
  a second entry while the mark stands on the pre-fetch upstream, and `head=` is asserted to
  have moved while nothing reached the reader's working tree. The same case asserts `seen`
  writing `last_forum_read_commit` through `bin/fusion-cadence-anchor` and leaving a
  pre-seeded `last_reconcile_commit` standing
- a mark that does not resolve, reading the whole store as new, with its `note=`
- the self-filter dropping this checkout's own entry, and a malformed `.checkout-id`
  dropping none and emitting the identifier `note=`
- exit 5 once per state: `no-work-tree`, `no-branch`, `no-upstream`, `upstream-unresolved`
- a branch tracking a local ref: `state=ok`, no fetch, and the local-ref `note=`
- exit 7 `workbench-outside-repo`, with the marker in an ancestor of the repository
- exit 6 `fetch-failed`, exit 3 with no workbench, exit 2 on five usage errors
- `show` returning the blob at the pinned commit, and exit 1 rather than git's 128

## Three findings the test was written against

Handed over by the S4 agent and each one load-bearing here.

**Every fixture path is physicalised** (`realpathSync` on the `mkdtemp` result). The script
resolves both sides of the workbench-prefix strip with `pwd -P`; on macOS a `/var/…` fixture
against a `/private/var/…` toplevel would take the `workbench-outside-repo` branch by
accident, so a test on unresolved paths passes or fails for the wrong reason.

**The two states beyond the plan's three are covered.** `upstream-unresolved` is produced by
setting `branch.main.merge` to a ref the fetch does not create, which git still renders
through `%(upstream:short)` (verified: `origin/nowhere`, remotename `origin`, fetch succeeds,
`rev-parse` fails). The local-ref case is `branch.main.remote=.`, which skips the fetch and
emits its own note; it is also what keeps the exit-7 fixture off any remote.

**`show`'s failure is exit 1**, asserted as the number alone: git's stderr is locale-dependent
(it came back in German on this machine), so no case here asserts git's own wording — only
that stderr reached the caller in the `fetch-failed` case.

## Budget

220 lines against a ≤ 220 budget, so the hook-test surface's 1 518 lines of head-room at
`abcaa823` drops to 1 298. The first green draft was 249 lines; the cut to 220 merged the
`seen` case into the mark-resolves case (they share a fixture and a mark), reflowed the file
header, and collapsed five two-line comments to one line each. No assertion was dropped to
make room.

## Verification

`cd hooks && npx vitest run lib/__tests__/fusion-forum.test.ts` — exit 0, 9 tests passed.
The full `npm test` was deliberately NOT run: three sibling agents are mid-edit in this tree,
so a full-suite result would not have been about this change.

## Not done, deliberately

`bin/fusion-forum` was not touched, and no defect in it was found — every documented state,
exit code and note was reproduced exactly as its header states. The plan's step 6 was left at
its current marker rather than set to `[DONE]`: the dispatch scoped this task to the one test
file and named the concurrent editors as the reason. Whoever commits this should flip it.
