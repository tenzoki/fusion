/**
 * The citation check over a consuming project, printed for a human or an agent.
 *
 * The grammar is `lib/citation-scan.ts`; this is its shipped caller, the one
 * decision `260828-0904_*_does-fusion-ship-a-citation-checker-to-consuming-projects.md`
 * asked for. Called through `bin/fusion-citation-check` by whoever runs it.
 *
 * ## The format, asked by the gate
 *
 * The workbench's format is asked first, through `lib/record-index.ts` and the
 * codec's `inspect`, and the first line of stdout names it (`format=`). Only
 * `json-control` is read: the verdict scope of a workbench file is
 * `isLiveRecord()` over the index, its record's `live` (a status outside its
 * kind's terminal set) and never a marker in its name; a narrative with no
 * record, a report or a legacy file in the archive, is not live. A citation of
 * a GATE_KINDS kind that matches more than one file is a `conflict`
 * violation, not an undecidable token (Prior's spec, section 4.4). Record
 * references that resolve to no control file are counted in
 * `uuid-unresolved=`, one row each after the violations. Control files the
 * codec could not read are counted in `unreadable=`, one row each after those.
 *
 * A `legacy` workbench is refused by name and pointed at `/fusion:migrate`
 * (FJ03d step 8; section 9's FJ03 row keeps the old control parsers in import
 * and `archive/` read mode only). It and every other answer stop the check
 * before a line of stdout (exit 3 or 4 below). The grammar indexes no control
 * file (`lib/citation-scan.ts` `workbenchIndex`).
 *
 * ## Corpus
 *
 * Every `.md` under the workbench, exactly as `workbenchMarkdownFiles()`
 * returns it (the whole tree less the migrations' kept originals), plus at
 * the directory the workbench root names: `CLAUDE.md`, `rules/*.md`,
 * `.claude/rules/*.md` and `docs/**\/*.md`, where present.
 * Workbench files are named `fusion-workbench/<rel>` in every row.
 *
 * Every name here is relative to the project root, and that spelling is not
 * cosmetic: it is the `rel` handed to `scanCitationTokens()`, which keys
 * `RECORD_EXAMPLE_FILES` and `RETIRED_LAYOUT_FILES` on it. `citation-sweep.ts`
 * names its corpus by the same anchor for that reason — it used a cwd-relative
 * one until 2026-09-05, so one file carried two names across a corpus the two
 * share and the sweep's file-wide exemptions fired only from the project root
 * (issue
 * `260901-0324_*_the-checker-and-the-sweep-key-file-exemptions-on-two-different-spellings-of-the-same-file.md`).
 * A caller normalising at the call site would have been a third spelling.
 *
 * Plus, since 2026-08-31, every file the project DECLARED as citation-bearing
 * in `citations.extraPaths`, resolved by `declaredCitationFiles()` and
 * deduplicated against the above by absolute path, so a declared `*.md`
 * already in the corpus contributes nothing and a declared `.go` is added. A
 * project that declares nothing reads exactly the corpus it read before.
 *
 * And since 2026-09-21 the corpus can be NARROWED by one record at a time:
 * `citations.exhibits` names records, by storeless basename with the marker
 * wildcarded, whose every token is an exhibit; `createScanner()` takes the
 * list and reports each such token `exempt` with the reason
 * `declared-exhibit`, shape-decided verdicts included, so a fenced
 * store-prefixed transcript in a declared record is no longer a row. The
 * declaration is printed as `declared-exhibits=` beside the `verdict=` line, because
 * a silencing leaf that is invisible is the one most likely to be reached for
 * when a check is inconvenient; the residual — a genuine violation declared
 * away is silenced, and nothing mechanical tells the two apart — is accepted
 * in `lib/citation-scan.ts`'s header on the reasoning `foreign:` was.
 *
 * ## The declaration reaches both hand-run helpers and neither check
 *
 * `citation-sweep.ts` resolves the same leaf through the same function, and
 * that is the point rather than an incidental symmetry: a reporter narrower
 * than the rewriter is the defect the frozen-store exclusion was, one class
 * further out — a declared file the sweep rewrites and this check never
 * reports. The two hand-run helpers share one corpus.
 *
 * `lib/__tests__/workbench-citation-lint.test.ts` deliberately does NOT read
 * the declaration, and it is not to be made to. That check runs inside
 * `npm test` and recomputes its corpus on every run with no approvable
 * baseline, so a corpus set by an editable configuration leaf would turn a
 * one-line edit into a red suite for everyone who pulls. It is the same split
 * the frozen stores are on, from the same reason: a check reddens the suite of
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
 * and the divergence is the point rather than an oversight: that check reddens
 * the suite of somebody who compiled nothing, over text an archive sweep moved
 * or a marker rename stranded, and this reporter costs its reader one row.
 * The check's own comment reasons its exclusions; nothing here overrides it, and
 * the two corpora are not to be re-unified by making the check wider.
 *
 * ## The verdict scope: only a file somebody still edits moves `verdict=`
 *
 * Since 2026-09-01, by decision
 * `260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md`
 * (option 3). EVERY VIOLATION IS STILL PRINTED — the scope narrows the `verdict=` line
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
 *   - A workbench file, by `isLiveRecord()` in `lib/citation-corpus.ts`: a
 *     narrative whose record is live, the frozen stores out. The blocking
 *     check's corpus is the same predicate less the discussion kind, authored
 *     beside it; an open discussion is in this scope and not in that corpus.
 *   - A workbench narrative with NO record — history, analyses, reviews,
 *     consultations, memos, investigations. Out of scope, by a JUDGEMENT
 *     rather than a derivation, reasoned at `lib/citation-corpus.ts`: a history
 *     entry records what was true then, so correcting its citation falsifies
 *     the record rather than repairing it. This class is where most of the
 *     scoping happens — 191 of the 312 rows measured when the question was put.
 *   - Everything outside the workbench — `CLAUDE.md`, `rules/*.md`,
 *     `.claude/rules/*.md`, `docs/**` and every declared path. IN scope: no
 *     record exists there and every one of those files is live.
 *
 * The scope reaches the `verdict=` line and NOTHING else. `dangling`, `store-prefixed`,
 * `files` and the row list are unchanged by it, and no exit code carries the
 * result — that rule is shared with `bin/fusion-review-coverage` and
 * `bin/fusion-staging-drift` and this change does not reopen it.
 *
 * ## Output, one `KEY=value` per line, then one row per violation
 *
 *   format=json-control
 *   anchor=workbench-root
 *   root=<project directory>
 *   files=<n>            edited-files=<n>
 *   declared-patterns=<n>   declared-files=<n>   declared-exhibits=<n>
 *   tokens=<n>           judged=<n>
 *   resolved=<n>         dangling=<n>        store-prefixed=<n>
 *   conflict=<n>
 *   edited-violations=<n>   unedited-violations=<n>
 *   unrewritable-violations=<n>
 *   undecidable=<n>      exempt=<n>
 *   uuid-unresolved=<n>
 *   unreadable=<n>
 *   verdict=clean|violations
 *     <file>:<line>  '<token>'  <status>  <scope>  <rewrite>  <problem>
 *     fusion-workbench/<control>  <pointer>  uuid-unresolved  <class>/<reason>
 *     fusion-workbench/<control>  unreadable  <class>/<reason>
 *
 * The violations are dangling + store-prefixed + conflict, and `verdict=`
 * reads their edited half. An unresolved
 * record reference is a finding about a control file rather than a citation
 * in a text, and `verdict=` does not read `uuid-unresolved=`.
 *
 * `unreadable=` counts the control files the codec could not read
 * (`index.unreadable` of `lib/record-index.ts`), as `bin/fusion-plan-size`
 * counts its own. Such a record is in no map of the index, so its narrative is
 * scoped `not-edited` although whether it is live is exactly what could not be
 * read: every violation in it is still printed, and the count and its rows say
 * which files the scope could not be taken for. `verdict=` DOES NOT READ IT,
 * for the reason it does not read `uuid-unresolved=`: it is a finding about a
 * control file, and `verdict=` stays the scoped half of the citation rows. A
 * reader gating on `verdict=` reads `unreadable=` beside it; the blocking check
 * fails on the same list (`lib/citation-corpus.ts`).
 *
 * `edited-files` is how many of `files` are in the verdict scope, and
 * `edited-violations` / `unedited-violations` split the printed rows the same
 * way — they sum to `dangling` + `store-prefixed`, and the first is what
 * `verdict=` reads. A scoped result whose scope is not in the output would be
 * worse than an unscoped one, so the three figures are mandatory rather than
 * decorative. `<scope>` repeats the split per row, `edited` or `not-edited`, so
 * a reader looking at three hundred rows can see which ones the result was
 * taken over. An `--undecidable` row carries no scope column: it reaches no
 * result by kind, before any scoping question is asked.
 *
 * ## `unrewritable-violations`: the rows nobody is allowed to repair
 *
 * How many of the printed rows the grammar has ITSELF ruled must stand as they
 * are. Such a hit carries an exemption `reason`, and `citation-sweep.ts`
 * rewrites no hit that carries one (`rewriteOf()`), because a fenced transcript
 * or a worked example is quoted rather than followed and respelling it deletes
 * what it was filed to show. Without the figure the output says "this is a
 * violation" and "nothing may touch this" about one row at once, and a reader
 * has no way to tell that half from the half a human can act on — a consuming
 * project measured 11 of 13 standing violations as verbatim exhibits.
 *
 * NAMED FOR WHAT IS TRUE OF THE CLASS, not for the exemption that produced it:
 * `record-example-file` and `fenced-code` produce it today
 * (`RESOLUTION_PREMISED_EXEMPTIONS` in `lib/citation-scan.ts`, whose premise is
 * "do not look this token up" while `store-prefixed` needs no lookup), and a
 * third reason could later. The predicate here is the presence of a reason, not
 * the reason's value, so a third arrives counted.
 *
 * A MARGINAL, not a subset of `edited-violations`: the scope split and this one
 * are independent, and the cell is on the rows, which carry both columns. Each
 * violation row reads `unrewritable` or `rewritable` in a column after
 * `<scope>`, and `rewritable` says only that no exemption forbids respelling
 * this token — never that a rewrite exists for it, which a dangling pointer has
 * not. `verdict=` does not read this figure: what makes it `violations` is
 * `edited-violations` > 0 and nothing else, so a project gating on `verdict=`
 * sees exactly what it saw before this figure existed.
 *
 * `declared-patterns` is what the project wrote; `declared-files` is what those
 * patterns name, which is a different figure and is why both are printed. It
 * reads `unavailable` — never `0` — where git would not answer for the tree,
 * because a count that could not be taken is not a count of none. `files`
 * counts the whole corpus after the deduplication above. `declared-exhibits`
 * is what the project wrote under `citations.exhibits`, like
 * `declared-patterns`: an entry naming no file in the corpus is not reported.
 *
 * The loader's diagnostics, and one line per pattern that matched nothing or
 * was refused, go to **stderr**: they are about the declaration rather than
 * about the corpus, and stdout is what a consumer greps.
 *
 * `judged` is every token the check reads (`GATE_KINDS`, resolved or not);
 * `dangling` counts `dangling` and `stale-marker` together, the two ways a
 * pointer fails to find its record; `store-prefixed` is the spelling the
 * storeless form retired; `undecidable` is the bare stamps, the ambiguous
 * tokens and, since 2026-09-21, the head-field values naming no record
 * (status `undecidable`: an identifier, or a citation whose record moved),
 * which no reader of the token can settle and which reach no result.
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
 *   3  the plugin itself could not run: the codec bundle is not installed,
 *      so nothing could be asked (the wrapper's own 3 covers the compiled
 *      hooks), or an internal error stopped this entry, named with its stack.
 *   4  the workbench was not read: `legacy` (refused by name, pointing at
 *      `/fusion:migrate`), `unsupported`, a refusal of the codec
 *      (`recovery-blocked` among them, inside an `ok: true` answer too), or
 *      no answer. The cause is on stderr and NOTHING is on stdout.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
  createScanner,
  declaredCitationFiles,
  declaredCitationNotes,
  markdownFilesUnder,
  workbenchMarkdownFiles,
  partition,
  GATE_KINDS,
  type CitationHit,
} from "./lib/citation-scan.js";
import { isLiveRecord } from "./lib/citation-corpus.js";
import { bundleMissing, legacyLine, notReadLine, readRecordIndex } from "./lib/record-index.js";
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
 * Whether the tool has already ruled that this token must stand as written. A
 * hit carrying an exemption `reason` is one `citation-sweep.ts` refuses to
 * rewrite, whatever its status — see `## unrewritable-violations` above. The
 * test is the presence of a reason and never its value, so a reason added later
 * arrives counted.
 */
const unrewritable = (h: CitationHit) => h.reason !== undefined;

/**
 * One violation row. The scope column sits between the status and the problem,
 * reading `edited` or `not-edited`, so a reader with three hundred rows can see
 * which of them the result was taken over without counting stores by eye. The
 * rewrite column follows it, `unrewritable` or `rewritable`. Both are columns
 * and not filters: every row is printed under either value.
 */
function row(h: CitationHit, scope?: string, rewrite?: string): string {
  const cols = [`${h.file}:${h.line}`, `'${h.token}'`, h.status, scope, rewrite, h.problem];
  return `  ${cols.filter((c) => c !== undefined).join("  ")}`.trimEnd();
}

/**
 * A judged citation matching more than one file, read as the `conflict`
 * section 4.4 names. The hit keeps its matches;
 * the status and the problem are what the row prints.
 */
const asConflict = (h: CitationHit): CitationHit =>
  ({ ...h, status: "conflict" as CitationHit["status"], problem: `${h.matches.length} artefacts match: ${h.matches.join(", ")}` });

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
  // the format before anything else is read: see `## The format`
  const read = readRecordIndex(workbenchRoot);
  if (read.format === "legacy") {
    process.stderr.write(`fusion-citation-check: ${legacyLine(workbenchRoot)} Nothing was checked.\n`);
    return 4;
  }
  if (read.format === "unknown") {
    process.stderr.write(`fusion-citation-check: ${notReadLine(read.unread, workbenchRoot)} Nothing was checked.\n`);
    return bundleMissing(read.unread) ? 3 : 4;
  }
  const { index } = read;
  // the configuration first: the scanner takes the declared exhibits
  const config = loadConfig({ projectRoot: root });
  const scanner = createScanner(workbenchRoot, { exhibits: config.citations.exhibits });

  const files: CorpusFile[] = [
    ...workbenchMarkdownFiles(workbenchRoot).map((f) => ({
      rel: `fusion-workbench/${f.rel}`,
      abs: f.abs,
      // the one place the workbench half of the verdict scope is decided, on
      // the workbench-RELATIVE path both readers are keyed on
      edited: isLiveRecord(f.rel, index),
    })),
    ...projectFiles(root).map((f) => ({ ...f, edited: true })),
  ];

  // what the project declared, added to the corpus and never subtracted from
  // it: a declared file already in the list above contributes nothing
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
  const isConflict = (h: CitationHit) => h.status === "ambiguous" && GATE_KINDS.includes(h.kind);
  const conflicts = p.undecidable.filter(isConflict).map(asConflict);
  const undecided = p.undecidable.filter((h) => !isConflict(h));
  const violations = [...dangling, ...storePrefixed, ...conflicts].sort(
    (a, b) => a.file.localeCompare(b.file) || a.line - b.line,
  );
  const moves = (h: CitationHit) => editedFile.get(h.file) === true;
  const edited = violations.filter(moves);

  const out = [
    `format=${read.format}`,
    "anchor=workbench-root",
    `root=${relative(process.cwd(), root).split(sep).join("/") || "."}`,
    `files=${files.length}`,
    `edited-files=${files.filter((f) => f.edited).length}`,
    `declared-patterns=${config.citations.extraPaths.length}`,
    `declared-files=${declared.unavailable ? "unavailable" : declared.files.length}`,
    `declared-exhibits=${config.citations.exhibits.length}`,
    `tokens=${hits.length}`,
    `judged=${judged.length}`,
    `resolved=${p.resolved.length}`,
    `dangling=${dangling.length}`,
    `store-prefixed=${storePrefixed.length}`,
    `conflict=${conflicts.length}`,
    `edited-violations=${edited.length}`,
    `unedited-violations=${violations.length - edited.length}`,
    `unrewritable-violations=${violations.filter(unrewritable).length}`,
    `undecidable=${undecided.length}`,
    `exempt=${p.exempt.length}`,
    `uuid-unresolved=${index.unresolvedRefs.length}`,
    `unreadable=${index.unreadable.length}`,
    `verdict=${edited.length > 0 ? "violations" : "clean"}`,
  ];
  for (const h of violations) {
    out.push(row(h, moves(h) ? "edited" : "not-edited", unrewritable(h) ? "unrewritable" : "rewritable"));
  }
  for (const r of index.unresolvedRefs) {
    out.push(`  fusion-workbench/${r.path}  ${r.at}  uuid-unresolved  ${r.problem.class}/${r.problem.reason}`);
  }
  for (const u of index.unreadable) out.push(`  fusion-workbench/${u.path}  unreadable  ${u.problem.class}/${u.problem.reason}`);
  if (undecidable) for (const h of undecided) out.push(row(h));
  process.stdout.write(out.join("\n") + "\n");
  return 0;
}

// An internal error is 3, "the plugin itself could not run", and never Node's
// own 1, which is the usage error here.
try {
  process.exitCode = main(process.argv.slice(2));
} catch (e) {
  process.stderr.write(`fusion-citation-check: an internal error stopped the check, a fusion bug or an incomplete install and not the workbench's. Nothing was checked.\n${e instanceof Error ? e.stack : String(e)}\n`);
  process.exitCode = 3;
}
