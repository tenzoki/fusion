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
 * verdict. **Nothing about what the gate asserts or reads changed with the
 * move** — that gate's corpus is settled by
 * `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
 * and bounded by
 * `260820-0805_*_the-citation-gates-corpus-excludes-only-archive-so-a-frozen-copy-tree-would-enter-a-blocking-gate.md`,
 * and this file is a new home for it rather than a revision of it.
 *
 * ## What the predicate does NOT cover, and the judgement made instead
 *
 * TWO CLASSES OF FILE REACH THE REPORTER AND NOT THE GATE, and neither has a
 * marker to read. Both were named as costs in the answering decision and are
 * settled here rather than deferred.
 *
 * THE MARKER-LESS RECORD KINDS — `history/`, `analyses/`, `reviews/`,
 * `consult/`, `memos/`, `investigations/`. They carry no state marker at all,
 * so the live-versus-terminal test says nothing about them and this file
 * cannot derive an answer. **The judgement is that they are not edited**, and
 * it is a judgement rather than a derivation. Its ground: a history entry
 * records what was true when it was written, and the conventions say so
 * (`rules/fusion-workbench-conventions.md`); a review names the range it
 * opened; an analysis is a measurement dated to a commit. Correcting a
 * citation inside one falsifies the record rather than repairing it, which is
 * exactly the reason `archive/` is out. The measurement behind the answering
 * decision counted them among the rows nobody repairs — 191 of 312, more than
 * the frozen stores contribute — so this is where most of the scoping happens.
 * `isLiveRecord` returns false for them by falling through, not by naming
 * them: there is no clause here to delete if that judgement is ever revisited,
 * only a clause to add.
 *
 * THE SURFACES OUTSIDE THE WORKBENCH — `CLAUDE.md`, `rules/*.md`,
 * `.claude/rules/*.md`, `docs/**`, and every path a project declared in
 * `citations.extraPaths`. No marker exists there and every one of those files
 * is live by construction: they are the project's normative text and its
 * source. **They move the verdict**, and this predicate is not asked about
 * them at all — it takes a WORKBENCH-RELATIVE path, and `citation-check.ts`
 * scopes a non-workbench file in without consulting it.
 *
 * ## The corpus itself
 *
 * THE CORPUS IS A MARKER PREDICATE, NOT THE WORD "OPEN". The user's answer
 * named it as "the Circle records, portfolio.md, the open decisions and the
 * open issues", and the planning run then measured that "the open decisions"
 * has two readings which differ by 20 files and 39 dangling tokens. A word
 * that admits two corpora does not define one, so the predicate is written out
 * below and the reading it takes is named.
 *
 * IT TAKES THE WIDE READING — decisions carrying `_o_` OR `_a_` — for three
 * reasons, in descending weight:
 *
 *   1. It is this project's own definition of a live decision.
 *      `rules/fusion-workbench-conventions.md` `## Decision Records` states
 *      that `_o_` and `_a_` together are Grounding-Stand, "the current best-of-
 *      knowledge the project is working with", and that a reconciliation pass
 *      listing active Grounding filters on `_o_` + `_a_`. An answered decision
 *      awaiting realisation is a document people still open and act on.
 *   2. It is a superset of the narrow reading, so it can only judge more. Where
 *      the two disagree the wide one is the stricter, and a citation gate
 *      erring strict costs a repair while erring loose costs a dead pointer
 *      nobody sees.
 *   3. It is the reading the repair was performed against. Plan steps 5 to 9b
 *      cleared the wide corpus deliberately, so that the arming would satisfy
 *      either answer. Choosing the narrow one now would discard measured work.
 *
 * THE HOLE THIS PREDICATE HAS, recorded because it is real and because the
 * answering decision's own footer records it. Membership follows markers, so a
 * record LEAVES the corpus when it reaches a terminal state, carrying whatever
 * citations it holds. That happened inside the Circle that armed the gate: a
 * decision moved `_a_` -> `_i_` at plan step 4 and took three dangling
 * citations out of reach, silently, and the gate would have shown green over
 * them. It is a cost of the recomputed corpus — the same property that makes a
 * baseline unnecessary is the property that lets a record walk out of scope —
 * and not a defect in it. The fix would be a predicate that does not narrow at
 * terminal state. Nobody has proposed one and this file does not.
 */
/** `circles/<dir>/_<marker>_circle.md` — a Circle record in ANY state. */
export declare const CIRCLE_RECORD_RE: RegExp;
/** An issue carrying `_o_`, in a Circle's store or in `shared/`. */
export declare const OPEN_ISSUE_RE: RegExp;
/** A decision carrying `_o_` or `_a_` — Grounding-Stand, per the wide reading. */
export declare const LIVE_DECISION_RE: RegExp;
/**
 * The portfolio briefing, at the workbench root. Class L since 2026-08-23, so
 * it is present in the checkout that generated one and in no other; the
 * predicate admits it either way and a walk judges it only where it exists.
 */
export declare const PORTFOLIO = "portfolio.md";
/**
 * The frozen stores, excluded at the workbench root.
 *
 * An archived record is a frozen copy of what was true when it was swept, and
 * repairing its citations would rewrite history rather than correct it. That
 * reason was written here for `archive/` alone and is not `archive/`'s alone.
 * `stashes/` (the removed Circle stash skills) and `.migration-v2-backup/` (the
 * retired `/fusion:migrate-workbench-v2`'s rollback copy) are copy trees of the
 * same layout, carrying the very `issues/` and `decisions/` subtrees these
 * predicates match. Neither exists in this workbench; one exists in any project
 * that ran that migration, and a blocking gate over a rollback copy has no
 * honest remedy. The pair is authored in `rules/fusion-workbench-conventions.md`
 * ("Two legacy stores are absent from this tree on purpose"), and
 * `skills/log-activity/SKILL.md:89` is the precedent this list follows.
 *
 * IT TAKES THREE OF THAT PRECEDENT'S FOUR ENTRIES. `stilwerk/` is on the
 * activity-log's list under that skill's own criterion — configuration rather
 * than activity. It is not a frozen copy of records: it holds fixed-name voice
 * profiles, no `.md` at all, and no path under it can match a predicate here.
 * Carrying it would be an exclusion with no reason of this predicate's own.
 *
 * ANCHORED AT THE ROOT, and that is the point rather than a detail. All three
 * are workbench-root stores. A substring test would be a second unanchored
 * predicate, which is the defect this clause answers, repeated.
 *
 * EXCLUDING A STORE IS STILL NOT A WAY TO MAKE THE GATE GREEN. A record moved
 * into one leaves the corpus, but so do the obligations of everything it cited,
 * and the citations OF it in live records stay judged and go red. That
 * asymmetry is intentional. It is also why the reporter still PRINTS every row
 * it finds in one: a scoped verdict is not a narrowed search.
 */
export declare const FROZEN_PREFIXES: string[];
/**
 * A plan or spec carrying `_o_` or `_p_`, in a Circle's store or in `shared/`.
 *
 * THOSE TWO MARKERS AND NO OTHERS. `rules/fusion-workbench-conventions.md`
 * `## State Markers — issues and planning` gives a planning file four states:
 * `_o_` open, `_p_` in progress, `_c_` closed, `_d_` deferred. The first two are
 * the states in which an executor is dispatched against the document, so a
 * citation in it is one somebody is about to follow. `_c_` and `_d_` are
 * terminal and out for the reason a closed issue is out — and measurably so: the
 * 24 closed plans outside `archive/` carry 157 dangling citations between them
 * (2026-08-20; the exact figure moves with the parser, the order does not).
 * Admitting them would arm a red gate over records nobody will open again, and
 * narrowing the corpus afterwards to get back to green is exactly the move
 * decision `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
 * exists to refuse. An `_o_`/`_p_` backlog entry is a separate question, asked
 * by the record that asked for this clause and not answered here.
 *
 * MEASURED before it was written, 2026-08-20 at HEAD `8e7cae7`: the clause
 * admits zero files then. Every plan outside `archive/` carried `_c_`,
 * including that Circle's own, and the tree's only `_p_` plan sat inside
 * `archive/` where the frozen-store exclusion takes it. Corpus and findings
 * were unchanged by adding it — 199 files, 0 violations, before and after. It
 * is armed for the next plan somebody writes, which is the whole of its job.
 */
export declare const LIVE_PLAN_RE: RegExp;
/**
 * The predicate itself, pure and over a WORKBENCH-RELATIVE path, so a caller
 * can put a path to it that no tree carries. Two of the three frozen stores are
 * such paths, and so is every live plan — which is the shape of both defects
 * this clause answered: nothing in fusion's own tree would have shown either.
 *
 * Twin: `skills/archive/SKILL.md` filter 3 enumerates the shipped files whose
 * citations an archive move must keep resolvable (decision 260827-1756).
 */
export declare function isLiveRecord(rel: string): boolean;
