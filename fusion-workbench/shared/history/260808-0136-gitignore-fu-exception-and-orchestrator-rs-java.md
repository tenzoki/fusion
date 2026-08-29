# Two unrelated small defects: stale `!bin/fu` exception, missing `.rs`/`.java` in orchestrator routing

**Agent:** coder
**Status:** Complete
**Date:** 260808-0136
**Scope constraint:** only `.gitignore` and `agents/orchestrator.md` (a parallel coder dispatch held `hooks/`)

---

## What was done

Two independent defects, each fixed exactly as its own record specified. Nothing committed; both
issue records left open (`_o_`) at the user's instruction.

### Defect 1 — `260716-1940_*_stale-bin-fu-exception-in-gitignore.md`

`.gitignore` carried `!bin/fu`, an un-ignore exception for the project-local launcher removed in
v3.20.0, plus a comment describing that launcher as copied from `bin/fu` at Setup.

Absence of `bin/fu` was re-verified rather than taken on the record's word: absent from the working
tree (`test -e`), absent from the index (`git ls-files bin/fu` empty), and `bin/` holds exactly the
eight shipped helpers.

Two edits:

1. Removed the `!bin/fu` line (was `.gitignore:23`).
2. Rewrote the stale `.fusion/` comment (was `.gitignore:53`, the record said 51 — drift). The
   replacement states what is true today, verified against `install.sh:35`
   (`INSTALL_DIR="${FUSION_HOME:-$HOME/.fusion}"`): `.fusion/` is the install directory, default
   `~/.fusion`, overridable via `FUSION_HOME`. The ignore rule itself was kept — the record asked
   for the comment, and removing the rule is a separate decision.

**Packaging rule verified afterwards** (`CLAUDE.md`: use `dir/*` so `!path` exceptions still work
for new files). `git check-ignore` on each remaining exception: all eight shipped helpers
(`monitor`, `fusion-rules`, `fusion-workbench-root`, `fusion-session-mark`, `fusion-commit-lock`,
`fusion-paths`, `fusion-plane`, `fusion-plugin-cwd`) resolve to *not ignored*, each via its own
`!bin/<name>` line. Control: `bin/fu` and a hypothetical `bin/some-new-helper` are both still
ignored via `.gitignore:20:bin/*`, so the file pattern still catches new files and the negations
still override it.

Method note: `git check-ignore -v` returns exit 0 when *any* pattern matches, including a negation,
so the verdict must be read from the non-verbose form. Reading the exit code of the `-v` form
inverts the answer for every negated path.

### Defect 2 — `260807-1943_*_die-routing-tabelle-und-das-review-routing-kennen-rs-nicht.md`

Added `.rs` and `.java` at the two sites the record names, in the ordering `coder.md` and
`planner.md` already use (`.go, .ts, .tsx, .py, .js, .rs, .java, …`):

- `agents/orchestrator.md:290` — Agent Routing Table, `coder` row.
- `agents/orchestrator.md:380` — Phase 2 Step 3c review routing, `coderev` branch. This is the
  load-bearing one: the branch list has no catch-all, so a Turn changing only `.rs` files matched
  neither the code nor the ontology branch and whether a review ran was left to model judgement.

Applied the minimum only. Per the record and the dispatch, no consolidation of the list, no lint
test for cross-site agreement, and no edits to `coder.md`, `ontocoder.md` or `planner.md`.

## Observation, not acted on

The extension list occurs at **four** places in `agents/orchestrator.md`, not the two the record
names:

| Line | Site | Carries `.rs` / `.java` |
|---|---|---|
| 123 | domain detection, `code_files` count | `.rs` yes, `.java` no |
| 178 | "You may NOT edit code" self-prohibition | neither |
| 290 | Agent Routing Table | both, after this fix |
| 380 | Step 3c review routing | both, after this fix |

Line 178 is a different kind of list (a self-restriction, not a routing decision) and the record's
enumeration of five sites does not include it or line 123. Left untouched under the
minimum-change instruction and reported to the user for a decision. Read literally, line 178 does
not forbid the orchestrator from editing `.rs` or `.java` files.

## Verification

| Check | Result |
|---|---|
| `lib/__tests__/rules-emission-golden.test.ts` | 9/9 passed — golden did not move |
| `lib/__tests__/reference-resolution-lint.test.ts` | 23/23 passed |
| `lib/__tests__/path-literal-lint.test.ts` | 19/19 passed |
| `git status` scope | only `.gitignore` and `agents/orchestrator.md` from this session |

The emission golden was expected to hold: `agents/orchestrator.md` is an emitted prompt, not a rule
file. The reference lint was run because it scans `.gitignore` and keeps `bin/fu` in its
`EXAMPLE_PATHS` allowlist; that entry stays justified by `CLAUDE.md:30`, which names `bin/fu` as
history deliberately, and the test asserts allowlisted paths do *not* exist in the tree.

The write guard stands down in this repository, so the `agents/**` edits were not reverted;
confirmed by re-reading both lines after the edits.

## Not done, by instruction

- Neither issue record closed or renamed (`_o_` on both).
- No commit.
- No files touched under `hooks/`, `bin/`, `rules/`, `stilwerk/`, or `CLAUDE.md`.
