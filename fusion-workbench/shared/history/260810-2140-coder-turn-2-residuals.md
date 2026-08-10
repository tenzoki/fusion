# coder — Turn 3, task `P:turn-2-residuals`

**Session:** `260810-1646` · **Mode:** issues · **Domain:** code
**Status:** Complete
**Verification:** `npm test` from `hooks/` — exit 0, 41 files, 1139 tests.

---

## What was asked

Five records from the Turn-2 code review (`shared/reviews/260810-2110-coderev-turn-2-range-da8c9db-b3cc034.md`):
four mechanical consequences of Turn 2's changes plus one remainder from Turn 1. Owned files:
`skills/commit/SKILL.md`, `skills/cleanup/SKILL.md`, `skills/setup/SKILL.md`, `skills/next/SKILL.md`,
and `agents/orchestrator.md` Phase 2 Step 3b. Out of scope by instruction: `hooks/**`, `bin/monitor`,
`README-hooks.md`, and the two "one decision, several statements" questions (`260810-2030`, L4).
`bin/fusion-commit-lock` read-only.

## What was done

### 1. The staging directory (record `260810-2110_c_moving-git-add-inside-the-lock-wrapper-…`)

Established by reading the helper, then measured on a scratch repository — never in this tree, per
decision `260810-1820`.

`bin/fusion-commit-lock`, the `with` branch, runs `resolve_root` and then `cd "$root"` before the
command after `--`. `resolve_root` calls `bin/fusion-workbench-root`, which walks up from the
*caller's* working directory to the nearest ancestor holding `fusion-workbench/.fusion-setup`. So the
wrapped command runs at the **workbench root**: the directory that contains `fusion-workbench/`, not
the workbench directory, and not the git toplevel.

Scratch repository: git toplevel `repo/`, workbench root `repo/sub/`, caller `repo/sub/deeper/`.

| Staging list written as | Result |
|---|---|
| `pwd` of the wrapped command | `repo/sub` |
| toplevel-relative | exit 128, nothing staged |
| caller-relative | exit 128 |
| workbench-root-relative | exit 0 |
| absolute | exit 0, including a file *above* the workbench root |
| `:/` magic pathspec | exit 0 |
| marker rename, two absolute paths | exit 0, recorded `R100` |
| the same rename, toplevel-relative | exit 128, nothing staged |

**Chosen form: absolute paths.** Both absolute and workbench-root-relative work; only absolute
survives the question "relative to what?" being asked later, reaches files above the workbench root,
and costs nothing — the executor report shape already yields absolute paths and `$WORKBENCH` is
absolute. `:/` was rejected as obscure; root-relative was rejected because it looks identical to the
toplevel-relative form that fails.

Written into `agents/orchestrator.md` Step 3b item 4 as one bullet, and step 5's command placeholders
are now `<absolute-path>`. `skills/commit/SKILL.md` got the instruction in two sentences without the
argument.

### 2. `$FUSION_SRC` empty (record `260810-2110_c_fusion-src-resolves-to-the-empty-string-…`)

The branch in `skills/setup/SKILL.md` and `skills/next/SKILL.md` now separates an unset root from an
absent helper and prints `UNRESOLVED (FUSION_PLUGIN_ROOT is unset)` instead of an empty string. All
four copies updated (the announcing block and the inline `SEC=` re-resolution in each file), because
each shell call gets a fresh shell and the prose promises the check re-resolves the same two lines.

The report sits at the resolution point rather than at each of the five consumers: the governing rule
in `rules/fusion-workbench-conventions.md` `## Path Resolution` → *Where the call belongs* is about a
held value, the value is produced once, and five restatements is the pattern the same review flags
twice elsewhere. Each file gained one paragraph saying `UNRESOLVED` is not a path, that no
`$FUSION_SRC/…` step reads through it, and what to report instead.

Measured in `bash` and `zsh`, both under `nounset`, in four conditions (root unset; root set with cwd
inside the plugin repo; root set with cwd elsewhere; root set to a directory with no helper). All
four print what they should.

### 3. The heredoc and its list (record `260810-2110_c_the-heredoc-example-was-de-indented-…`)

`skills/commit/SKILL.md` ends its `## Process` list at step 5 and continues as `### 6. Stage and
commit as one held pair` and `### 7. Show result`, with a short paragraph saying why. All of step 6
now sits at column 0 inside its own section — including both `fusion-commit-lock` invocations, which
previously rendered outside the step introducing them.

The record's open question (does the verbatim-copy assumption hold?) was answered rather than left:
*inference* — the message body is a placeholder, but the heredoc opener and terminator are literals
an agent reproduces with their leading whitespace, and the terminator is the line that must be at
column 0. So the fence stays at column 0 and the structure moved.

### 4. The cleanup step pointer (record `260810-2110_c_the-cleanup-domain-capture-cites-step-4-…`)

`skills/cleanup/SKILL.md` Step 1 item 1 now reads "item 4 of this step removes `agentstate.yaml`, and
Step 3 (Reconcile) needs the value it holds." Checked against the file: the deletion is still Step 1
item 4 and `## Step 3 — Reconcile` is still the heading meant.

### 5. The citation rooting remainder (record `260810-1918_c_the-citation-rooting-reached-two-of-three-skills-…`)

`skills/setup/SKILL.md` and `skills/next/SKILL.md` now cite `$FUSION_SRC/skills/cleanup/SKILL.md:11`.
The anchor was verified against the file first: line 11 still carries the rooting instruction, so the
previous executor's decision to extend that paragraph in place did keep it valid.

**Deviation, stated:** the record prescribed `$FUSION_PLUGIN_ROOT/…`; `$FUSION_SRC/…` was written.
The two differ only inside this repository, where `$FUSION_PLUGIN_ROOT` is the install copy and
`$FUSION_SRC` the work tree — and this citation carries a line number, the anchor a stale install
gets wrong. It sits three lines under the paragraph that mandates `$FUSION_SRC`, so using that root
makes the sentence obey the rule it announces. The reference lint checks existence, not rooting, so
both forms pass.

## Files changed

- `/Users/k1/Projects/productive/fusion/agents/orchestrator.md` (Phase 2 Step 3b only)
- `/Users/k1/Projects/productive/fusion/skills/commit/SKILL.md`
- `/Users/k1/Projects/productive/fusion/skills/cleanup/SKILL.md`
- `/Users/k1/Projects/productive/fusion/skills/setup/SKILL.md`
- `/Users/k1/Projects/productive/fusion/skills/next/SKILL.md`
- five records under `fusion-workbench/shared/issues/`, appended and renamed `_p_` → `_c_`

## Left standing, deliberately

- `rules/workbench-stash-and-lock.md` `## Commit lock` is the authoring home for the `cd` and still
  does not document it. Outside this Turn's ownership; proposed in the record.
- `skills/cleanup/SKILL.md` runs the same lock shape and carries the same unstated assumption. A
  third copy of one sentence was not written.
- `260810-2030` and L4 (the fourth copy of the domain-capture one-liner) untouched, per the dispatch.

## Verification

`cd /Users/k1/Projects/productive/fusion/hooks && npm test` — exit 0, 41 files, 1139 tests. Run twice:
once after the source edits (1119 tests) and once after the five record renames, because one lint
resolves record citations against a live index of the workbench and a rename changes that index. The
suite includes two parallel executors' in-flight changes under `hooks/`, which is why the count moved
from the 1113 the review recorded and again between the two runs here — not from anything in this
task.
