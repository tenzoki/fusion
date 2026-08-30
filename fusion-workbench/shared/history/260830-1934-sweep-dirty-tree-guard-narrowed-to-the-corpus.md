# Sweep guard (a): the clean-tree proxy replaced by the corpus question

**Date:** 260830-1934
**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Plan:** `260830-1841_*_citation-mechanism-four-defect-repair.md`, step 1
**Decision realised:** `260830-1843_*_how-does-the-commit-lock-stop-leaving-the-tree-it-just-committed-dirty.md`, option 4

## What changed

`hooks/citation-sweep.ts`, plus the regenerated `hooks/dist/`. Nothing else was
touched: `bin/fusion-commit-lock` and `rules/commit-lock.md` stay as they stand,
which is the whole point of the option chosen.

Guard (a)'s dirty-tree test no longer asks whether the work tree is clean. It
asks whether any uncommitted change names a file this run will read. The corpus
is built once at the top of `main()` (every `*.md` under `--root`, plus each
extra `<path>` resolved the way `main()` resolves it) and handed to `refusal()`,
so the guard and the run cannot disagree about what will be written.

Three mechanics, each stated in the file header rather than left to the code:

- The listing is taken with `git status --porcelain -z`. That is what makes the
  reading a split rather than a parse: no quoting, no C-escapes, and a rename
  or copy carries its original path as the next NUL-separated field instead of
  the ` -> ` infix. Both halves are compared.
- An untracked directory entry (`?? dir/`) counts when any corpus file sits
  beneath it.
- A deleted corpus file does not refuse. The run cannot read a file that is not
  there, so it falls outside the question the guard asks.

Corpus and porcelain paths are resolved through the filesystem's own spelling
before comparison (the toplevel is already a realpath; a corpus entry may have
been reached through a symlinked `--root`).

The refusal line keeps its `refused (dirty-tree):` shape and exit 4, and names
the offending paths, capped at ten with a count for the tail. The `no-git`,
`not-a-git-work-tree`, `workbench-untracked` and `path-outside-repo` branches are
untouched.

## Why

`fusion-workbench/orchestrator-events.jsonl` is tracked (class R2 in
`rules/workbench-tracking.md`) and `bin/fusion-commit-lock` appends the
machine-written `commit` row to it after every commit, so inside an orchestrator
session the tree is dirty again the moment it is committed and the clean-tree
test can never be satisfied. That test was a proxy for the property guard (a)
exists for, namely that a damaged rewrite has one revert back and the sweep's
diff is its own. The corpus question is the property itself, and the event log
leaves it by construction rather than through an exemption somebody maintains.

## Verified

- Scratch git work tree, `orchestrator-events.jsonl` the only modified path,
  `--write` without `--yes`: exit **5** (guard (b)), the census printed. It was
  exit 4 before this change.
- Same tree with `portfolio.md` modified, `--write --yes`: exit **4**,
  `refused (dirty-tree): uncommitted changes name 1 file this run reads:
  fusion-workbench/portfolio.md; ...`, and the record left byte-identical.
- Rename, a path with a space and non-ASCII, and an untracked directory each
  refuse with exit 4 and the decoded path named. A deleted corpus file and a
  dirty non-corpus file at the repo root each reach exit 5.
- `bin/fusion-citation-sweep --dry-run` over this repository:
  `files=0 rewrites=0 residual=2783 record=0 circle-record=0 circle-dir=0
  bare-record=0 stamp-bare=0 mode=dry-run`. The pinned `rewrites=0` holds;
  `residual` moved from 2782 to 2783 with the records filed since `cda72f71`,
  and it is pinned by nothing.

## Was blocked on, now resolved

`cd hooks && npm test` exited **1**: 1 failed file, 804 of 805 cases passed. The
one failure was `lib/__tests__/citation-sweep.test.ts:162`, "refuses a dirty
tree, before the census and without writing, exit 4", which dirties an
`unrelated.txt` at the repo root and asserts exit 4 plus the old message text.
That case pinned the retired proxy condition, so it could not survive this step.
The first dispatch forbade touching any test file, so the repair was left to the
orchestrator rather than raced.

## The test repair, on a widened dispatch boundary

The orchestrator widened the boundary to `lib/__tests__/citation-sweep.test.ts`
and confirmed the failure independently. The retired case is replaced by one
case with two arrangements, "passes a pending change outside the corpus and
refuses one inside it, exit 4, naming that file alone", so that the narrowing is
an assertion rather than an absence:

- `unrelated.txt` at the repo root, `--write` without `--yes`: exit **5** and
  the census, which is reachable only past guard (a).
- the same tree with a corpus record edited on top of it: exit **4**, and the
  refusal names that record alone while the root-level entry goes unnamed.

Net **+10 lines**, against the 25 the dispatch allowed. The hook-test surface
golden (`lib/__tests__/fixtures/surface-growth.golden`) was regenerated for the
same +10, its two lines being this file's own count and the total. That is not a
baseline edit and grants no head-room: the baselines in
`surface-growth-bound.test.ts` do not move with the golden, and the head-room
`it` for the surface passes on its own.

`cd hooks && npm test` now exits **0**, 805 of 805 cases over 47 files. All four
verifications above were re-run against fresh scratch trees rather than reported
from memory, and each still holds; the sweep's own dry-run over this repository
still reports `files=0 rewrites=0 residual=2783 ... mode=dry-run`.
