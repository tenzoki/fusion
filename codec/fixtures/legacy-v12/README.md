# legacy-v12: a v12 Markdown workbench with one of each legacy shape

The input of FJ04's migration tests: step 1 of `261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md`. Every file is synthesised for a fictional parser project; nothing is copied from a real workbench. It is not a validation fixture (`src/__tests__/fixtures.test.ts` exempts `legacy-v12/` from its manifest coverage), and nothing here is imported by `src/`, so the bundle does not carry it.

- `workbench/` is the workbench root, in the v12 layout (`work-packages/`, `shared/`, `archive/`). It holds Markdown, directories and one symbolic link, and no JSON: no `.fusion-setup`, no `workbench.json`, no `.json-state/`. A test that needs the setup marker writes it into its copy.
- `untracked/` is not part of the workbench. Its tree mirrors the workbench's, and a test copies it in after committing the copy (see below).

Tests always work on a copy in a temp directory, never on this tree.

## What git cannot hold, and how a test recreates it

| Shape | How a test recreates it in its copy |
|---|---|
| An empty container tree | `mkdir -p work-packages/260816-0800-fuzzing-harness/issues work-packages/260816-0800-fuzzing-harness/analyses`: a container with directories and no file at all, so git drops it |
| An untracked file | after `git init`, `git add -A` and a commit of the copy, copy `untracked/shared/issues/260906-1500_o_parser-panics-on-empty-file.md` to `shared/issues/` of the copy; it is a live issue that git does not track |
| The v11-named twin | rename the copy's `work-packages/` to `circles/` and every `plans/` (in `shared/` and in each container) to `planning/`; it is derived, not committed |

The link is committed as a link (git mode 120000): `shared/analyses/latest-benchmark.md` points to `260906-1100-benchmark-run.md` beside it. A copy must keep it a link (`cp -R` on macOS and `cp -a` on Linux do; `fs.cpSync(src, dst, { recursive: true, verbatimSymlinks: true })` in Node).

## The shapes, and where each lives

Paths are relative to `workbench/`; `wp/` stands for `work-packages/`.

**Packages, v12 item records, one per status.** Live:

- `open`: `wp/260901-0900-tokenizer-handles-unicode/`
- `claimed`, with `**Claim:**` and `**Mode:** autonomous`: `wp/260902-1000-parser-error-recovery/`
- `paused`, no claim, the body naming what it waits for: `wp/260903-1200-streaming-input/`

Terminal:

- `done`, the claim kept: `wp/260903-0800-lexer-table-rewrite/`
- `dropped`, the body naming what replaced it: `wp/260904-1300-regex-backend/`

**Circle heads**, no item record and a free-text `**Status:**`:

- `_c_circle.md` in `wp/260810-0900-error-messages-name-the-rule/`, with the legacy field `**Active session history:**`
- `_b_circle.md` in `wp/260812-1000-grammar-coverage-report/`
- `_s_circle.md` in `wp/260814-1100-incremental-reparse/`, whose `**Status:**` still says active: head and marker disagree
- `_d_circle.md` in `wp/260815-1400-wasm-target/`

The empty container tree, `wp/260816-0800-fuzzing-harness/`, is recreated by the tests (above).

**Live records, every kind in every state its vocabulary admits:**

| Kind | State | Where |
|---|---|---|
| issue | `_o_` | `wp/260901-0900-tokenizer-handles-unicode/issues/` |
| issue | `_p_` | `wp/260902-1000-parser-error-recovery/issues/` |
| plan | `_o_` | `shared/plans/260905-0900_o_plan-benchmark-suite.md` |
| plan | `_p_` | `wp/260902-1000-parser-error-recovery/plans/`: the spec and the plan |
| discussion | `_o_` | `wp/260902-1000-parser-error-recovery/discussions/` (a discussion takes `_o_` and `_c_` only) |
| decision | `_o_` | `shared/decisions/260905-1200_o_should-the-ast-keep-trivia.md` |
| decision | `_a_` | `wp/260902-1000-parser-error-recovery/decisions/` and `shared/decisions/260905-1300_a_…` |

**Terminal records, every kind:**

| Kind | State | Where |
|---|---|---|
| issue | `_c_` | `wp/260903-0800-lexer-table-rewrite/issues/260903-1500_c_…`, with a `Resolved:` line |
| issue | `_d_` | `shared/issues/` |
| plan | `_c_` | `wp/260903-1200-streaming-input/plans/` (bound by a live package), `wp/260903-0800-lexer-table-rewrite/plans/` (bound by a terminal one), `wp/260810-0900-error-messages-name-the-rule/plans/` (bound by a Circle head) |
| plan | `_d_` | `shared/plans/260905-1000_d_…` |
| plan | `_s_` | `wp/260904-1300-regex-backend/plans/`: a value the plan vocabulary does not have |
| discussion | `_c_` | `shared/discussions/` |
| decision | `_i_` | `wp/260810-0900-error-messages-name-the-rule/decisions/` |
| decision | `_s_` | `shared/decisions/260810-1000_s_…`, with `Superseded by:` naming the `_i_` one |
| decision | `_d_` | `shared/decisions/260905-1400_d_…`, a `Deferred:` line naming no ruler |

**Plan steps.** `wp/260902-1000-parser-error-recovery/plans/260902-1100_p_…` numbers its steps `1` `[DONE]`, `2` `[IN PROGRESS]`, `12a` `[OPEN]`, and `12b` with no mark, the form most fusion plans write. `shared/plans/260905-0900_o_plan-benchmark-suite.md` carries step `2` twice. The spec beside the `_p_` plan carries ticked and unticked acceptance boxes, which no v12 grammar reads as criteria.

**`Answered:` citations.** Resolvable: the decision in `wp/260902-1000-parser-error-recovery/decisions/` cites the live plan by its storeless basename. Unresolvable: `shared/decisions/260905-1300_a_…` cites a document outside the workbench, in prose.

**Head-field bindings.**

- `**Depends-on:**` to a terminal package: the `open` package names the `done` one. To a live one: the `paused` package names the `open` one.
- `**Active spec/plan:**` with role clauses: the `claimed` package names its spec `(the spec)` and its plan `(plan, part 1 of 2)`. The `paused` package names a terminal `_c_` plan `(plan, closed before the pause)`: under the record cut that plan is the closure's one terminal record. The `done` and `dropped` packages name terminal plans too, and pull nothing in.

**A live record in a terminal container:** `wp/260903-0800-lexer-table-rewrite/issues/260904-0900_o_lexer-table-misses-tab-width.md`, an `_o_` issue under a `done` package.

**Artefacts that stay plain Markdown:** a review (`shared/reviews/`), analyses (`shared/analyses/`, and one inside the `_b_` Circle), a memo (`shared/memos/`), session histories (`shared/history/` and inside the `_c_` Circle), and an archive unit with its `MANIFEST.md` and one archived `_c_` issue (`archive/260820-0900-safe-cleanup-tier-1/`).
