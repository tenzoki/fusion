# coder — `R:260810-1918-commit-procedure` (Turn 2, session `260810-1646-orchestrator-session.md`)

**Status:** Complete
**Domain:** code
**Files owned:** `agents/orchestrator.md` (Phase 2 Step 3b + the bugfixer pointer), `skills/commit/SKILL.md`

## What the task was

Four findings from the Turn-1 review (`260810-1918-coderev-turn-1-range-5ef92eb-940d522.md`),
one of them a regression this session introduced in `a7d02da`.

## The decision on the lock form

Fix direction (a) of the H2 record: **restore `with` for the Step 3b commit sequence.**

The reason the explicit form was chosen in `a7d02da` does not survive contact with the code. It said
the commit message would have to travel inside the `--` argument. It does not: step 3 writes the
message with the `Write` tool, and step 5 passes `-F /tmp/fusion-commit-msg-<task-id>.txt`, which is
a fixed literal path the session authored — the exact case the same paragraph called correct for
`with`. `/fusion:commit:94` and `/fusion:cleanup:93` already run that shape.

What `with` buys is measured, not asserted: `bin/fusion-commit-lock:323` traps `EXIT INT TERM`. The
four-command replacement had no `trap`, no `||`, nothing that runs `release` when `git add` fails,
and stated the obligation in prose one line after showing a sequence that does not honour it.

**On the rule's "internal control-flow" carve-out.** `rules/workbench-stash-and-lock.md:135` scopes
the explicit form to internal control-flow and names the bugfixer retry as its example. That retry
is control-flow of Step 3b *as a whole*, not of the region that must stay held: it lives at step 2
and is finished before step 5 acquires. Holding a commit lock across an agent dispatch would be
wrong on its own terms. So the carve-out does not reach this sequence, and the prompt now carries
exactly one criterion — the rule's — instead of the second one `a7d02da` invented.

The `260810-1535_*_the-orchestrators-commit-procedure-truncates-any-message-containing-an-apostrophe.md` constraint is preserved unchanged: nothing inside the `bash -c` string is prose.
The prompt now says *why* the wrapper is safe here rather than leaving it to be re-derived.

## Changes

`agents/orchestrator.md`

- `:402` — bugfixer-success pointer now names the shifted numbering (finding 3).
- New numbered **step 4, "Assemble the staging list"** — the staging instruction is a step again,
  and the rule is a shape rather than a flag ban: every path passed to `git add` is written out; no
  `-A`, no `-u`, no directory argument, no glob, no `.`. Renames called out as two paths. `f38f37d`
  cited with the corrected reading (finding 2).
- **Step 5** — one held command, `with orchestrator -- bash -c 'git add … && git commit -F …'`,
  plus two paragraphs: which lock form and why (one criterion, the rule's), and why the message is
  not a criterion (finding 1). The old prose release obligation is deleted; the helper does it.
- Steps renumbered 4→5, 5→6.

`skills/commit/SKILL.md`

- Step 6's heredoc block moved to column 0, with the dedent announced so it is not "corrected" back,
  and the terminator rule stated: whole line, column 0, nothing before it; `<<-` strips tabs only;
  an indented body line indents that line of the commit message (finding 4).

## Verification

Scratch repository at `<scratchpad>/lockdemo` (never the working tree — four executors were writing
here; the destructive-verification rule is decision `260810-1820_*_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md`).

| Case | Result |
|---|---|
| `with … -- bash -c 'git add tracked.txt && git commit -F <msg>'`, message containing `'`, backtick, `$`, `%` | exit 0; commit body diffs **identical** to the source file; subject intact in `git log --oneline` |
| Same form, `git add` fails on a missing pathspec | exit 128, helper prints `released commit lock`, `check` → `not held` |
| The four-command form it replaces, same failure | `git add` exits 128, agent stops, `check` → `held by orchestrator/pid … since …` |
| Parallel `with commit -- true` against that leaked lock | still blocked after 3 s — the H2 failure scenario, reproduced |
| `git add -u <dir>` after a record rename inside it | `D <old>`, successor untracked — `f38f37d` reproduced |
| `git add <old> <new>` | `R <old> -> <new>` |

`npm test` from `hooks/` — **exit 0**, 41 files, 1096 tests.

The first run was **exit 1**: `path-literal-lint.test.ts` rejected a store-path literal in the new
step 4, where I had quoted the `f38f37d` command verbatim. The command is described rather than
shown, and the note is in the finding-2 record for the next author.

## Records

`260810-1918_*_step-3b-drops-the-lock-form…`, `…_c_the-explicit-staging-instruction…`,
`…_c_the-bugfixer-success-path…`, `…_c_the-commit-skills-heredoc-example…` — each carries a
`Resolved:` note; `_p_` → `_c_`.

## Incident during this task

A `for f in 260810-1918_p_*.md` rename caught all eleven `_p_` records, including the seven owned by
the four coders running in parallel. Reverted in the next command; content untouched, only the
marker moved and moved back, and `git status` confirms the seven sit at `_p_` as before. The irony
is not lost: the defect is a glob standing in for paths written out, which is the exact shape the
step 4 I had just written forbids.

## Proposal for the orchestrator (rule file is read-only for this task)

`rules/workbench-stash-and-lock.md:135` — the criterion is right and the prompt now matches it, but
its only worked example ("retry after bugfixer in orchestrator Phase 2 Step 3b") now points at a
site that does *not* use the explicit form. Replace the parenthetical or drop it and keep the
criterion bare.
