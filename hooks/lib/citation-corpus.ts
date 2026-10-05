/**
 * Which workbench records are LIVE — the files somebody still edits.
 *
 * One predicate, two readers with different stakes, and it is authored here so
 * they cannot drift apart:
 *
 *   - `lib/__tests__/workbench-citation-lint.test.ts` uses it as its CORPUS.
 *     A file it admits must carry no dangling citation or `npm test` goes red.
 *   - `citation-check.ts` uses it as its VERDICT SCOPE. Every violation it
 *     finds is printed whatever this predicate says; only `verdict=` narrows.
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
 * AN OPEN DISCUSSION IS IN, where the marker predicate left it out. Its record
 * is rewritten at every round, so a repair is futile until it closes; the
 * contract gives `open` as live and the reader follows the contract, not this
 * comment. FJ03b's note on `citation-check.ts` records the same departure for
 * the reporter.
 *
 * THE HOLE THIS PREDICATE HAS, recorded because it is real: membership follows
 * the record's state, so a record LEAVES the corpus when it reaches a terminal
 * state, carrying whatever citations it holds. It is the cost of a recomputed
 * corpus — the property that makes a baseline unnecessary is the property that
 * lets a record walk out of scope.
 */

import type { RecordIndex } from "./record-index.js";

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
 * The predicate itself, over a WORKBENCH-RELATIVE path and the workbench's
 * record index: live when the path is a narrative whose record is live, and
 * never inside a frozen store.
 *
 * Twin: `skills/archive/SKILL.md` filter 3 enumerates the shipped files whose
 * citations an archive move must keep resolvable (decision 260827-1756).
 */
export function isLiveRecord(rel: string, index: RecordIndex): boolean {
  if (FROZEN_PREFIXES.some((p) => rel.startsWith(p))) return false;
  return index.byNarrative.get(rel)?.live === true;
}
