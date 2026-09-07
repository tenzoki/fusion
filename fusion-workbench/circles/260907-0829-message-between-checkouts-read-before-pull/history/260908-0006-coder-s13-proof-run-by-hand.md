# S13 — prove what can be proved in this session, and name what cannot

**Date:** 2026-09-08
**Agent:** coder
**Status:** Complete
**Plan:** `260907-1942_*_message-between-checkouts-read-before-pull.md`, step 13
**Range read against:** `abcaa823..ec07e1b0`, branch `main`

This step wrote no source file. It ran the new mechanism by hand, wrote one real
forum entry, and separates what was executed from what this session cannot reach.

## 1. `bin/fusion-forum new` against this repository's own origin

Run from the work tree by path, because `$FUSION_PLUGIN_ROOT/bin/` does not carry
the helper yet:

```
$ ./bin/fusion-forum new shared/forum
state=ok
branch=main
ref=origin/main
head=abcaa8239fd301c6c4fdd34c193fd91a10370ece
mark=none
new=0
exit 0
```

The fetch completed, the branch and its upstream resolved, and `new=0` came back
as the printed answer rather than as an error or an empty result. `mark=none` is
the no-mark case: `fusion-workbench/.cadence-anchors` carries no
`last_forum_read_commit` on this checkout, so the whole upstream store would read
as new if the store existed. It does not:

```
$ git ls-tree -r --name-only origin/main -- fusion-workbench/shared/forum/
(no output)
```

`origin/main` stands at `abcaa823` and this checkout is 11 commits ahead of it, so
nothing this Circle produced has reached the remote. No `note=` line was printed,
which is correct: the identifier resolved, so the self-filter ran.

Only `state=ok` was produced here. The five failing states and the six exit codes
are covered by `hooks/lib/__tests__/fusion-forum.test.ts` against scratch trees
(S6), not by this run, and this run does not claim them.

## 2. The message half of cleanup Step 6, executed inline

Read from `skills/cleanup/SKILL.md` `### The message half` as it now stands and
performed by hand.

- **Inputs.** Range `abcaa823` (`session.git_head_at_start` in `agentstate.yaml`)
  to `ec07e1b0`; session history `260907-1659-orchestrator-session.md`; the
  records filed in the range taken from `git diff --diff-filter=A`; checkout
  `1d05b0e4` from `bin/fusion-identity`; stamp from `date +%y%m%d-%H%M`.
- **Store path.** Resolved as `$OUT_FORUM` through the work-tree `bin/fusion-paths`,
  never spelled as a literal in the composition.
- **Language.** The person's part in the chat language (`de`), the pointer block in
  the artifact language (`en`), both resolved from `CLAUDE.md`'s two declarations.
- **The cap was enforced by counting, not by trimming afterwards.** The first draft
  measured 21 lines with `wc -l`, one over: the pointer block ran to ten lines
  against its allowance of nine. Two lines were rewritten as one and the file was
  recounted at 20 before it was written anywhere.

Written to `fusion-workbench/shared/forum/260907-2354-1d05b0e4-read-before-pull.md`
after `mkdir -p`, 20 lines, no `**Filed by:**`.

**Citations.** `bin/fusion-citation-check` reports `verdict=clean` with
`edited-violations=0` over 2614 files, and no violation row names this entry. Each
of the four record citations was additionally resolved by basename lookup and each
matches exactly one file: the session history, the plan, the ruled decision on the
second question, and the two records left open.

**Context freedom.** The person's part carries no state marker, no framework noun,
no agent name as a sentence subject and no bare identifier. It names what the
reader gains, what it does not touch, where the notes live, how long they last, and
that the command needs an update and a restart before it resolves.

## 3. `skills/news/SKILL.md`, executed inline

- **Step 0.** Source root resolved to the work tree. Workbench found. The resolver
  call the body specifies, `"$FUSION_PLUGIN_ROOT/bin/fusion-paths" news`, **exits 4**
  and prints its internal-error line: the installed resolver predates step 1 and
  does not know `$SCAN_FORUM`. A real `/fusion:news` in this session halts here.
  The work-tree resolver answers `SCAN_FORUM=shared/forum`, and the rest of the
  procedure was run against that.
- **Step 1.** `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-forum" ]` reports `missing`, so
  the body's own instruction is to say the helper is not installed and stop. That
  branch fired as designed; the run continued by hand past it, which is the
  deviation this step was dispatched to make.
- **Step 2.** `new=0`, exit 0, as in section 1.
- **Step 3.** The terminating step. Nothing new on `origin/main` since the last
  time this checkout looked.
- **Steps 4 to 7 did not run**, and no substitute for them was arranged. Rendering,
  the mark advance and the pull question are all downstream of at least one new
  entry, and there is none to be had here for two independent reasons, either of
  which suffices: the entry has not been pushed, so it is in no ref the reader can
  fetch; and its filename carries this checkout's own identifier, so the self-filter
  would drop it even after a push. `show` and `seen` are exercised by the S6 test
  file, not by this run.

## 4. What this session cannot prove

- **`/fusion:news` cannot be invoked as a slash command here.** The skill roster is
  read from the installed copy at session start and never re-read.
- **The helper is one release behind for the same reason**, which is what made every
  command above a work-tree path call
  (`260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`).
- **A real `/fusion:cleanup` run would halt at its own Step 0**, measured rather than
  inferred: the installed `bin/fusion-paths cleanup` exits 4 on `$OUT_FORUM`, the
  same way it does on `$SCAN_FORUM` for `news`.
- **The end-to-end path across two checkouts is untested.** Nothing has read a forum
  entry out of a fetched ref. That needs a push, a second checkout, and a session
  started after `fusion --update` and a restart. It is the sixth stopping clause of
  the plan and the release precondition attached to it.

## 5. Verification

`cd hooks && npm test` — **exit 0, 924 of 924 passing, 53 of 53 files**, on a run
made with both the forum entry and this log already on disk, so the citation gate's
recomputed corpus included them.

The command was run six times and four of those runs were red. None of the failures
was this work's doing, and the evidence for that is the shape of the failure sets
rather than an assertion:

| Run | Result | Failing files |
|---|---|---|
| 1 | 10 failed | 6 files, `review-coverage`, `staging-drift` among them |
| 2 | 1 failed | `guard-state-shape` |
| 3 | **green** | — (taken before this log existed) |
| 4 | 1 failed | `review-coverage` |
| 5 | 3 failed | `hook-fail-open`, `review-coverage`, `staging-drift` |
| 6 | **green** | — (the reported run) |

No two red runs failed the same set, every failure landed in a harness file that
spawns scratch projects, and the three named in the standing defect records account
for all of run 5 and most of run 1. Nothing in the forum entry, the plan edit or
this log is reachable from any of them. The gates that *are* reachable from what
this step wrote, `workbench-citation-lint.test.ts` and `citation-sweep.test.ts`,
were additionally run alone after this log was written and passed, 30 of 30.

## Files changed

- `fusion-workbench/shared/forum/260907-2354-1d05b0e4-read-before-pull.md` (new)
- the plan `260907-1942_*_message-between-checkouts-read-before-pull.md` — step 13 marked `[DONE]`
- this file
