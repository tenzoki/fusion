/**
 * Which workbench records are LIVE — the files somebody still edits.
 *
 * Two readers with different stakes, each with its predicate, both authored
 * here so that the one difference between them is stated once:
 *
 *   - `lib/__tests__/workbench-citation-lint.test.ts` takes `inCitationCorpus()`
 *     as its CORPUS. A file it admits must carry no dangling citation or
 *     `npm test` goes red.
 *   - `citation-check.ts` takes `isLiveRecord()` as its VERDICT SCOPE. Every
 *     violation it finds is printed whatever the predicate says; only
 *     `verdict=` narrows.
 *
 * `inCitationCorpus()` is `isLiveRecord()` less the discussion kind, and
 * nothing else separates the two (`AN OPEN DISCUSSION` below).
 *
 * It lived in that test file until 2026-09-01 and moved here whole, with its
 * reasoning, when decision `260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md`
 * chose option 3: only rows in a file somebody still edits move the reporter's
 * `verdict=` line. That check's corpus is settled by
 * `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
 * and bounded by
 * `260820-0805_*_the-citation-gates-corpus-excludes-only-archive-so-a-frozen-copy-tree-would-enter-a-blocking-gate.md`.
 *
 * ## Liveness is the record's, since FJ03d step 8
 *
 * A narrative is live when its record's `status` lies outside its kind's
 * `terminal` set in `codec/contract/transitions.json`, read through
 * `lib/record-index.ts`, the table the kernel reads too. A marker in the file's
 * name is history and decides nothing (section 4.4 of Prior's spec): an issue
 * named `_c_` whose record is `open` is live, a plan named `_o_` whose record is
 * `closed` is not. Until step 8 the predicate read that marker — `_o_` issues,
 * `_o_`/`_a_` decisions, `_o_`/`_p_` plans, Circle and work-item records in
 * every state — and the regexes that did so are gone with the format they read:
 * a legacy workbench is refused by the readers before this predicate is asked
 * (section 9's FJ03 row: old control parsers survive only in import and in
 * `archive/` read mode).
 *
 * The wide reading of a live decision survives the change as the contract's
 * own: `open` and `answered` are both outside the decision kind's terminal set,
 * which is the `_o_` + `_a_` corpus the answering decision chose.
 *
 * ## What the predicate does NOT cover, and the judgement made instead
 *
 * THE CRITERION UNDER EVERY EXCLUSION IN THIS SECTION: A RECORD KIND ENTERS THE
 * CITATION CORPUS WHEN A PERSON WRITES IT AND STOPS. A KIND THAT A MECHANISM
 * REWRITES IS OUT. The corpus is the stretch in which a person is the one
 * writing the file. Inside it a repair is a correction its writer would have
 * made; outside it a repair is either a falsification or futile, and the file
 * is out either way.
 *
 * A NARRATIVE WITH NO RECORD IS OUT — history, analyses, reviews, consultations,
 * memos, investigations. **The judgement is that they are not edited**, and it
 * is a judgement rather than a derivation: a history entry records what was
 * true when it was written (`rules/fusion-workbench-conventions.md`), a review
 * names the range it opened, an analysis is a measurement dated to a commit.
 * Correcting a citation inside one falsifies the record rather than repairing
 * it. They are out by falling through, not by being named: there is no clause
 * here to delete if that judgement is ever revisited, only one to add.
 *
 * THE SURFACES OUTSIDE THE WORKBENCH — `CLAUDE.md`, `rules/*.md`,
 * `.claude/rules/*.md`, `docs/**`, and every path a project declared in
 * `citations.extraPaths` — are live by construction, and this predicate is
 * not asked about them: it takes a WORKBENCH-RELATIVE path, and
 * `citation-check.ts` scopes a non-workbench file in without consulting it.
 *
 * AN OPEN DISCUSSION IS OUT OF THE BLOCKING CHECK AND IN THE REPORTER'S SCOPE.
 * `/fusion:discuss` rewrites its record at every round, so by the criterion
 * above a repair is futile until it closes, and closed it is terminal:
 * `inCitationCorpus()` excludes the discussion kind in both states, as the
 * marker predicate did. Step 8 had carried the contract's reading (`open` is
 * live) into the blocking check against that criterion, and the user's ruling
 * of 2026-10-05, on the review finding that named the contradiction, took it
 * out again. `isLiveRecord()` still follows the record's state alone,
 * the departure FJ03b recorded for `citation-check.ts`: there an open
 * discussion is scoped `edited`, which costs its reader a row and blocks
 * nothing. That ruling left the reporter as it was.
 *
 * A CONTROL FILE THAT DID NOT READ IS NEITHER IN NOR OUT, AND IS NEVER SILENT.
 * `lib/record-index.ts` puts it in `unreadable` and in no map, so the predicate
 * answers "not live" for its narrative although liveness is exactly what could
 * not be read. Each reader therefore reads that list beside the predicate: the
 * blocking check and the stopping-section lint fail on a non-empty one, naming
 * every file through `unreadControls()` below, and `citation-check.ts` prints
 * `unreadable=` with one row per file. Until FJ03d step 8 the marker in the name
 * decided, so a file could not leave a gate this way.
 *
 * THE HOLE THIS PREDICATE HAS, recorded because it is real: membership follows
 * the record's state, so a record LEAVES the corpus when it reaches a terminal
 * state, carrying whatever citations it holds. It is the cost of a recomputed
 * corpus — the property that makes a baseline unnecessary is the property that
 * lets a record walk out of scope.
 */

import type { RecordIndex } from "./record-index.js";

/**
 * The failure text of a gate whose corpus comes from the record index, for the
 * control files that did not read: the count, what follows from it
 * (`consequence`, the gate's own clause), and one row per file with the
 * codec's finding. `problem` is the index's refusal or `lib/plan-size.ts`'s
 * rendering of it.
 */
export function unreadControls(unread: Array<{ path: string; problem: string | { class: string; reason: string } }>, consequence: string): string {
  const rows = unread.map((u) => `  ${u.path}  ${typeof u.problem === "string" ? u.problem : `${u.problem.class}/${u.problem.reason}`}`);
  const [files, their] = unread.length === 1 ? ["file", "its record is"] : ["files", "their records are"];
  return `${unread.length} control ${files} did not read, so whether ${their} live is unknown and ${consequence}. The way out is the control file, repaired to what the codec's finding names:\n${rows.join("\n")}`;
}

/**
 * The frozen stores, excluded at the workbench root.
 *
 * An archived record is a frozen copy of what was true when it was swept, and
 * repairing its citations would rewrite history rather than correct it.
 * `stashes/` (the removed Circle stash skills) and `.migration-v2-backup/` (the
 * retired `/fusion:migrate-workbench-v2`'s rollback copy) are copy trees of the
 * same layout. The pair is authored in `rules/fusion-workbench-conventions.md`
 * ("Two legacy stores are absent from this tree on purpose"), and
 * `skills/cadence/SKILL.md` `### 3. Scan git and the workbench tree — once` is
 * the precedent this list follows. `stilwerk/` is on that list as configuration
 * and holds no `.md`, so it is not carried here.
 *
 * ANCHORED AT THE ROOT: all three are workbench-root stores, and a substring
 * test would be an unanchored predicate. Excluding a store is still not a way
 * to make the gate green: the citations OF a moved record in live records stay
 * judged and go red, and the reporter still PRINTS every row it finds in one.
 */
export const FROZEN_PREFIXES = ["archive/", "stashes/", ".migration-v2-backup/"];

/**
 * A migration's kept originals, which no citation reader takes.
 *
 * `/fusion:migrate` keeps every converted record's pre-migration bytes under
 * `archive/migrations/<id>/originals/`, at the record's own workbench-relative
 * path and so under its own basename, beside the rewritten narrative in the
 * live tree. That copy is the rollback store the receipt hashes, not a second
 * artefact: read as one, every migrated record resolved to two files (a
 * `conflict` in the checker, a collision in the uniqueness lint), and a
 * writing sweep would have rewritten bytes the receipt pins. The user's ruling
 * of 2026-10-05 takes them out of the scope rather than renaming them, which
 * would have changed what the migration writes; an original stays reachable
 * through the receipt beside it (`rules/fusion-workbench-conventions.md`
 * `## Filename Patterns`).
 *
 * THE ONE PLACE THE PATH IS TESTED. `lib/citation-scan.ts` applies it in the
 * two walks every reader goes through: `workbenchIndex()`, which a citation
 * resolves against, and `workbenchMarkdownFiles()`, the files a reader scans.
 * Anchored at the workbench root like `FROZEN_PREFIXES`, and only the
 * `originals/` subtree: the receipt and the plan beside it are not `.md` and
 * were never read. The rest of `archive/` stays in both walks.
 */
const MIGRATION_ORIGINALS = /^archive\/migrations\/[^/]+\/originals\//;

/** Whether the WORKBENCH-RELATIVE path lies inside a migration's `originals/`. */
export const isMigrationOriginal = (rel: string): boolean => MIGRATION_ORIGINALS.test(rel);

/**
 * The reporter's verdict scope, over a WORKBENCH-RELATIVE path and the
 * workbench's record index: live when the path is a narrative whose record is
 * live, and never inside a frozen store.
 *
 * Twin: `skills/archive/SKILL.md` filter 3 enumerates the shipped files whose
 * citations an archive move must keep resolvable (decision 260827-1756).
 */
export function isLiveRecord(rel: string, index: RecordIndex): boolean {
  if (FROZEN_PREFIXES.some((p) => rel.startsWith(p))) return false;
  return index.byNarrative.get(rel)?.live === true;
}

/**
 * The blocking check's corpus: a live record a person writes. The discussion
 * kind is the one a mechanism rewrites, and it is out whatever its state.
 */
export function inCitationCorpus(rel: string, index: RecordIndex): boolean {
  return isLiveRecord(rel, index) && index.byNarrative.get(rel)?.kind !== "discussion";
}
