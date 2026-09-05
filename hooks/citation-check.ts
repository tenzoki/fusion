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
 * ## The verdict scope: only a file somebody still edits moves `verdict=`
 *
 * Since 2026-09-01, by decision
 * `260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md`
 * (option 3). EVERY VIOLATION IS STILL PRINTED — the scope narrows the verdict
 * and never the search, because a row nobody prints is a row nobody can check
 * and hiding one is the coverage claim the corpus decision already refused.
 *
 * WHY. `verdict=` is the one figure a reader acts on, and a violation nobody
 * will repair cannot be acted on. Over this repository at `d30ca04a` the line
 * read `violations` and structurally could not read anything else: of 299 rows,
 * 297 sat in text nobody edits — 60 under the archive, the rest in history,
 * analyses, reviews and in closed issues and implemented decisions. A figure
 * pinned at one value carries no information, and a reader who learns that
 * stops reading it. Archived-ness was the intuition behind the question and was
 * NOT the criterion: the frozen stores are under a quarter of the mass.
 *
 * WHAT IS IN SCOPE, in three parts, which are disjoint and cover the corpus:
 *
 *   - A workbench file, by `isLiveRecord()` in `lib/citation-corpus.ts` — the
 *     blocking gate's own corpus predicate, moved there so the two share one
 *     definition instead of authoring two. Circle records in any state,
 *     `portfolio.md`, open issues, live decisions, live plans; the frozen
 *     stores out, terminal issues and decisions out.
 *   - A workbench record kind that carries NO marker — history, analyses,
 *     reviews, consult, memos, investigations. Out of scope, by a JUDGEMENT
 *     rather than a derivation, reasoned at `lib/citation-corpus.ts`: a history
 *     entry records what was true then, so correcting its citation falsifies
 *     the record rather than repairing it. This class is where most of the
 *     scoping happens — 191 of the 312 rows measured when the question was put.
 *   - Everything outside the workbench — `CLAUDE.md`, `rules/*.md`,
 *     `.claude/rules/*.md`, `docs/**` and every declared path. IN scope: no
 *     marker exists there and every one of those files is live.
 *
 * The scope reaches the verdict and NOTHING else. `dangling`, `store-prefixed`,
 * `files` and the row list are unchanged by it, and no exit code carries the
 * verdict — that rule is shared with `bin/fusion-review-coverage` and
 * `bin/fusion-staging-drift` and this change does not reopen it.
 *
 * ## Output, one `KEY=value` per line, then one row per violation
 *
 *   anchor=workbench-root
 *   root=<project directory>
 *   files=<n>            edited-files=<n>
 *   declared-patterns=<n>   declared-files=<n>
 *   tokens=<n>           judged=<n>
 *   resolved=<n>         dangling=<n>        store-prefixed=<n>
 *   edited-violations=<n>   unedited-violations=<n>
 *   undecidable=<n>      exempt=<n>
 *   verdict=clean|violations
 *     <file>:<line>  '<token>'  <status>  <scope>  <problem>
 *
 * `edited-files` is how many of `files` are in the verdict scope, and
 * `edited-violations` / `unedited-violations` split the printed rows the same
 * way — they sum to `dangling` + `store-prefixed`, and the first is what
 * `verdict=` reads. A scoped verdict whose scope is not in the output would be
 * worse than an unscoped one, so the three figures are mandatory rather than
 * decorative. `<scope>` repeats the split per row, `edited` or `not-edited`, so
 * a reader looking at three hundred rows can see which ones the verdict was
 * taken over. An `--undecidable` row carries no scope column: it reaches no
 * verdict by kind, before any scoping question is asked.
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
 * `verdict=violations` when `edited-violations` > 0 — which is the scoped half
 * of dangling + store-prefixed, not their whole; see `## The verdict scope`.
 * `--undecidable` adds one row per undecidable token after the violations.
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

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
  createScanner,
  declaredCitationFiles,
  declaredCitationNotes,
  markdownFilesUnder,
  partition,
  GATE_KINDS,
  type CitationHit,
} from "./lib/citation-scan.js";
import { isLiveRecord } from "./lib/citation-corpus.js";
import { loadConfig } from "./lib/config.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
import { exitZeroOnStdoutEpipe } from "./lib/fail-open.js";

// The reader may close stdout first; see exitZeroOnStdoutEpipe.
exitZeroOnStdoutEpipe();

const USAGE = "usage: fusion-citation-check [--undecidable]";

/**
 * One corpus file. `edited` is the verdict scope: true when somebody still
 * edits this file, so a violation in it moves `verdict=`. See `## The verdict
 * scope` above; the workbench half is `isLiveRecord()` in
 * `lib/citation-corpus.ts` and everything outside the workbench is `true`.
 */
interface CorpusFile {
  rel: string;
  abs: string;
  edited: boolean;
}

/** The project-side files the check reads beside the workbench. */
function projectFiles(root: string): { rel: string; abs: string }[] {
  const out: { rel: string; abs: string }[] = [];
  const claude = join(root, "CLAUDE.md");
  if (existsSync(claude)) out.push({ rel: "CLAUDE.md", abs: claude });
  for (const dir of ["rules", ".claude/rules"]) {
    const abs = join(root, dir);
    if (!existsSync(abs)) continue;
    for (const f of readdirSync(abs).sort()) {
      if (f.endsWith(".md")) out.push({ rel: `${dir}/${f}`, abs: join(abs, f) });
    }
  }
  for (const f of markdownFilesUnder(join(root, "docs"))) out.push({ rel: `docs/${f.rel}`, abs: f.abs });
  return out;
}

/**
 * One violation row. The scope column sits between the status and the problem,
 * reading `edited` or `not-edited`, so a reader with three hundred rows can see
 * which of them the verdict was taken over without counting stores by eye. It
 * is a column and not a filter: every row is printed under either value.
 */
function row(h: CitationHit, scope?: string): string {
  const cols = [`${h.file}:${h.line}`, `'${h.token}'`, h.status, scope, h.problem];
  return `  ${cols.filter((c) => c !== undefined).join("  ")}`.trimEnd();
}

function main(argv: string[]): number {
  let undecidable = false;
  for (const a of argv) {
    if (a === "--undecidable") undecidable = true;
    else {
      process.stderr.write(`fusion-citation-check: unknown argument ${JSON.stringify(a)}\n${USAGE}\n`);
      return 1;
    }
  }

  const root = findWorkbenchRoot();
  if (root === null) {
    process.stderr.write(
      "fusion-citation-check: no fusion workbench above the working directory — nothing to check.\n",
    );
    return 2;
  }
  const workbenchRoot = join(root, "fusion-workbench");
  const scanner = createScanner(workbenchRoot);

  const files: CorpusFile[] = [
    ...markdownFilesUnder(workbenchRoot).map((f) => ({
      rel: `fusion-workbench/${f.rel}`,
      abs: f.abs,
      // the one place the workbench half of the verdict scope is decided, on
      // the workbench-RELATIVE path the predicate is written against
      edited: isLiveRecord(f.rel),
    })),
    ...projectFiles(root).map((f) => ({ ...f, edited: true })),
  ];

  // what the project declared, added to the corpus and never subtracted from
  // it: a declared file already in the list above contributes nothing
  const config = loadConfig({ projectRoot: root });
  const declared = declaredCitationFiles(root, config.citations.extraPaths);
  for (const line of [...config.diagnostics, ...declaredCitationNotes(declared)]) {
    process.stderr.write(`fusion-citation-check: ${line}\n`);
  }
  const inCorpus = new Set(files.map((f) => f.abs));
  for (const f of declared.files) if (!inCorpus.has(f.abs)) files.push({ ...f, edited: true });

  const hits: CitationHit[] = [];
  const editedFile = new Map<string, boolean>();
  for (const f of files) {
    editedFile.set(f.rel, f.edited);
    const lines = readFileSync(f.abs, "utf-8")
      .split("\n")
      .map((text, i) => ({ line: i + 1, text }));
    hits.push(...scanner.scanCitationTokens(f.rel, lines));
  }

  const p = partition(hits);
  const storePrefixed = p.dangling.filter((h) => h.status === "store-prefixed");
  const dangling = p.dangling.filter((h) => h.status !== "store-prefixed");
  const judged = hits.filter((h) => h.status !== "exempt" && GATE_KINDS.includes(h.kind));
  const violations = [...dangling, ...storePrefixed].sort(
    (a, b) => a.file.localeCompare(b.file) || a.line - b.line,
  );
  const moves = (h: CitationHit) => editedFile.get(h.file) === true;
  const edited = violations.filter(moves);

  const out = [
    "anchor=workbench-root",
    `root=${relative(process.cwd(), root).split(sep).join("/") || "."}`,
    `files=${files.length}`,
    `edited-files=${files.filter((f) => f.edited).length}`,
    `declared-patterns=${config.citations.extraPaths.length}`,
    `declared-files=${declared.unavailable ? "unavailable" : declared.files.length}`,
    `tokens=${hits.length}`,
    `judged=${judged.length}`,
    `resolved=${p.resolved.length}`,
    `dangling=${dangling.length}`,
    `store-prefixed=${storePrefixed.length}`,
    `edited-violations=${edited.length}`,
    `unedited-violations=${violations.length - edited.length}`,
    `undecidable=${p.undecidable.length}`,
    `exempt=${p.exempt.length}`,
    `verdict=${edited.length > 0 ? "violations" : "clean"}`,
  ];
  for (const h of violations) out.push(row(h, moves(h) ? "edited" : "not-edited"));
  if (undecidable) for (const h of p.undecidable) out.push(row(h));
  process.stdout.write(out.join("\n") + "\n");
  return 0;
}

process.exitCode = main(process.argv.slice(2));
