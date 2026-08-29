# Tasks 12 and 13 — the record counts print what needs no git, and the cause list names the branch that fires

**Agent:** coder
**Status:** Complete
**Started:** 260811-2005
**Task:** `fusion-workbench/tasklist.md` tasks 12 (`I:260811-1610_*_the-unmeasured-branches-discard-the-filed-count-which-needs-no-git-and-a-test-now-pins-the-discard.md`) and 13 (`I:260811-1616_*_the-unmeasured-cause-list-assigns-a-project-outside-git-to-the-branch-that-cannot-reach-it.md`)
**Records:** `260811-1610_*_the-unmeasured-branches-discard-the-filed-count-which-needs-no-git-and-a-test-now-pins-the-discard.md`, `260811-1616_*_the-unmeasured-cause-list-assigns-a-project-outside-git-to-the-branch-that-cannot-reach-it.md`
**Active Circle:** none (`.active-circle` absent; every `OUT_*` resolved into `shared/`)
**Git HEAD at start:** `9f84254`

Both tasks touch the same paragraph of `agents/orchestrator.md`, which is why they were one
dispatch; 13 landed on top of 12.

## Task 12 — the two halves are gated on what each half needs

The block had one combined gate: `[ -z "$A" ] || [ -z "$T" ]`, else the `git cat-file -e "$A:./"`
probe, else the measurement. Both failing branches printed a cause and nothing else, so the
`filed <kind>` count — a filename stamp compared against `session.started`, no git anywhere — went
down with the git-dependent `now_<marker>` half in every project that does not track its workbench.

The condition is now computed in two steps:

```
if [ -z "$A" ];      then WHY=no-anchor-in-agentstate
elif ! git … cat-file -e "$A:./"; then WHY=workbench-not-in-anchor-commit
else WHY=; fi
if [ -z "$T" ]; then records=unmeasured why=no-anchor-in-agentstate
else <header per WHY>; <the find loop>; fi
```

Inside the loop the `now_` probe is guarded by `[ -n "$WHY" ] ||`, so an unusable anchor withholds
exactly the counts that need it. Three header shapes, disjoint:

| Header | What it means | The four cells |
|---|---|---|
| `records anchor=… start=…` | both halves measured | all four counts |
| `records=partial why=… anchor=… start=…` | filed half only | `Issues created` measured, the three `now_` cells `unmeasured` |
| `records=unmeasured why=… anchor=none start=none` | no `session.started` | all four `unmeasured` |

`records=partial` is a new header word. Nothing outside `agents/orchestrator.md` and its gate reads
these lines (`grep -rln 'records=unmeasured'` over the shipped tree), so no consumer had to move.

The closing prose was rewritten to match: a bullet per header line in place of "write `unmeasured`
into those four cells verbatim", plus a paragraph stating why the halves are gated separately. The
sentence claiming the probe "turns that into `records=unmeasured`" was corrected — it withholds the
`now_` counts, it no longer condemns the read.

## Task 13 — the cause list

`no-anchor-in-agentstate` now carries "a project outside git", with the reason: Setup Step 5 records
a HEAD only in a git repository, so `git_head_at_start` is never written there and `[ -z "$A" ]` is
the branch that fires. `workbench-not-in-anchor-commit` keeps the two causes it can reach — an
untracked workbench, and an anchor that has left this repository's history. The branch-1 description
went from the conjunction "carries no `git_head_at_start` and `started`" to "missing either
`git_head_at_start` or `started` — either one alone is enough", which is what `||` does.

## The gate

`hooks/lib/__tests__/record-counts-measurement.test.ts`. The fixture gained two knobs — `outsideGit`
(no `.git` anywhere) and `anchor` (override or omit `git_head_at_start`) — and `Reading` gained a
`partial` field, since the header regex now distinguishes `unmeasured` from `partial`.

The `toEqual({})` assertion at `:271` was **replaced, not deleted**, as the record asked: the same
case asserts `toEqual(EXPECTED.filedOnly)` (`{"filed issue": 2}`) plus a shared `noNowCounts` helper
that fails if any `now_` line appears without a usable anchor. Four cases per shell now:

- untracked workbench → `partial why=workbench-not-in-anchor-commit`, filed counts present
- no `agentstate.yaml` → `unmeasured why=no-anchor-in-agentstate`, `counts` empty
- state file with `started` and no anchor → `partial why=no-anchor-in-agentstate`, filed counts
- no `.git` at all, in both anchor states → the two causes, each from its own branch, filed counts in
  both

Two prose cases were added: "outside git" must fall between the two backticked cause names in the
section, and the disjunction wording must be present with the old conjunction absent.

What this does not prove (`rules/critical-stance.md` §3): that a session runs the block. Nothing here
executes at session time. It proves the block, run as written in both shells, prints what the disk
holds and names the cause its own branch produced.

## Verification

`cd hooks && npm test` — exit 0, 50 files, 1301 tests. This file went from 22 cases to 28: four
behaviour cases per shell in the split describe where there were three, plus the two prose cases.
The suite's baseline at `9f84254` was 1293, so two of the eight added tests are not mine — three
other executors were landing work into the same suite while this ran (`CLAUDE.md`,
`hooks/lib/rules-write-exemption.ts`, `hooks/lib/__tests__/commit-message-path.test.ts`), and their
cases were in the tree when the run was taken. The run was green over all of it.

## Files changed

- `/Users/k1/Projects/productive/fusion/agents/orchestrator.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/record-counts-measurement.test.ts`
