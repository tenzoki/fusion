/**
 * The citation check over a consuming project, printed for a human or an agent.
 *
 * The grammar is `lib/citation-scan.ts`; this is its shipped caller, the one
 * decision `260828-0904_*_does-fusion-ship-a-citation-checker-to-consuming-projects.md`
 * asked for. Called through `bin/fusion-citation-check` by `/fusion:cleanup`
 * Step 8 and by anyone at a terminal.
 *
 * ## Corpus
 *
 * Every `.md` under the workbench, exactly as `markdownFilesUnder()` returns
 * it, plus at the directory the workbench root names: `CLAUDE.md`,
 * `rules/*.md`, `.claude/rules/*.md` and `docs/**\/*.md`, where present.
 * Workbench files are named `fusion-workbench/<rel>` in every row.
 *
 * Plus, since 2026-08-31, every file the project DECLARED as citation-bearing
 * in `citations.extraPaths`, resolved by `declaredCitationFiles()` and
 * deduplicated against the above by absolute path, so a declared `*.md`
 * already in the corpus contributes nothing and a declared `.go` is added. A
 * project that declares nothing reads exactly the corpus it read before.
 *
 * ## The declaration reaches both hand-run helpers and neither gate
 *
 * `citation-sweep.ts` resolves the same leaf through the same function, and
 * that is the point rather than an incidental symmetry: a reporter narrower
 * than the rewriter is the defect the frozen-store exclusion was, one class
 * further out — a declared file the sweep rewrites and this check never
 * reports. The two hand-run helpers share one corpus.
 *
 * `lib/__tests__/workbench-citation-lint.test.ts` deliberately does NOT read
 * the declaration, and it is not to be made to. That gate runs inside
 * `npm test` and recomputes its corpus on every run with no approvable
 * baseline, so a corpus set by an editable configuration leaf would turn a
 * one-line edit into a red suite for everyone who pulls. It is the same split
 * the frozen stores are on, from the same reason: a gate reddens the suite of
 * somebody who compiled nothing, and a reporter costs its reader a row.
 *
 * The frozen stores (`archive/`, `stashes/`, `.migration-v2-backup/`) are read
 * like the live tree. They were filtered out here until 2026-08-30, which made
 * the reporter's corpus strictly narrower than the rewriter's: `citation-sweep.ts`
 * calls the same `markdownFilesUnder()` with no exclusion at all, so the sweep
 * changed files this check then declared clean. What settled it was measured,
 * not argued:
 *
 *   - This repository swept its own archive in `f1099c5f`: 565 `.md` files,
 *     3082 insertions against 3082 deletions, a figure that commit's own
 *     message states. The rewriting-history position was overridden in practice
 *     for the sweep, and nobody stated it.
 *   - `workbenchIndex()` in `lib/citation-scan.ts` already walks the whole
 *     workbench with no prefix filter, and `circleDirs()` carries an explicit
 *     `archive/<sweep>/circles` branch whose comment says an archived Circle
 *     resolves wherever it is. So the frozen stores were in-corpus for
 *     resolution and out-of-corpus for reporting, in one file.
 *   - A store-prefixed citation inside an archived record is already dead: the
 *     three store-prefixed patterns are detectors, matched and never resolved.
 *     Rewriting one to the storeless form makes it resolve again, so for that
 *     class the rewrite restores a pointer rather than falsifying a record.
 *   - A consuming project's `.migration-v2-backup/` holds 0 store-prefixed
 *     citations across its 205 files. The exception this exclusion was expected
 *     to need has no measured case.
 *
 * `lib/__tests__/workbench-citation-lint.test.ts` keeps all three exclusions,
 * and the divergence is the point rather than an oversight: that gate reddens
 * the suite of somebody who compiled nothing, over text an archive sweep moved
 * or a marker rename stranded, and this reporter costs its reader one row.
 * The gate's own comment reasons its exclusions; nothing here overrides it, and
 * the two corpora are not to be re-unified by making the gate wider.
 *
 * ## Output, one `KEY=value` per line, then one row per violation
 *
 *   anchor=workbench-root
 *   root=<project directory>
 *   files=<n>            declared-patterns=<n>   declared-files=<n>
 *   tokens=<n>           judged=<n>
 *   resolved=<n>         dangling=<n>        store-prefixed=<n>
 *   undecidable=<n>      exempt=<n>
 *   verdict=clean|violations
 *     <file>:<line>  '<token>'  <status>  <problem>
 *
 * `declared-patterns` is what the project wrote; `declared-files` is what those
 * patterns name, which is a different figure and is why both are printed. It
 * reads `unavailable` — never `0` — where git would not answer for the tree,
 * because a count that could not be taken is not a count of none. `files`
 * counts the whole corpus after the deduplication above.
 *
 * The loader's diagnostics, and one line per pattern that matched nothing or
 * was refused, go to **stderr**: they are about the declaration rather than
 * about the corpus, and stdout is what a consumer greps.
 *
 * `judged` is every token the gate reads (`GATE_KINDS`, resolved or not);
 * `dangling` counts `dangling` and `stale-marker` together, the two ways a
 * pointer fails to find its record; `store-prefixed` is the spelling the
 * storeless form retired; `undecidable` is the bare stamps and the ambiguous
 * tokens, which no reader of the token can settle and which reach no verdict.
 * `verdict=violations` when dangling + store-prefixed > 0. `--undecidable`
 * adds one row per undecidable token after the violations.
 *
 * It decides nothing per line about pointer versus statement: a citation
 * inside a fenced code block or a blockquote is exempt, and that fencing is
 * the whole of the distinction (`rules/fusion-workbench-conventions.md`
 * `## Filename Patterns`). There is no `--fix`: the rewriter is
 * `citation-sweep.ts` through `bin/fusion-citation-sweep`, run by hand after
 * reading its census and behind its own three guards.
 *
 * ## Exit codes
 *
 *   0  the check ran. `verdict=` says what it found — a violation is a line
 *      of output and never an exit code, for the reason `bin/fusion-review-coverage`
 *      gives at the same place (issue `260810-0710_*_the-drift-checks-last-line-makes-the-whole-block-exit-non-zero-when-no-circle-is-active.md`).
 *   1  usage error.
 *   2  no fusion workbench above the working directory; nothing to check.
 */
export {};
