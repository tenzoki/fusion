import { describe, it, expect } from "vitest";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  workbenchRoot,
  WORKBENCH_PRESENT,
  markdownFilesUnder,
  MARKER_SLOT,
  MARKER_WORDS,
  report,
  scanRecordCitations,
  type Violation,
} from "./helpers/citation-scan.js";

// ---------------------------------------------------------------------------
// Workbench citation gate (Circle 260819-1645-four-constraints-on-deep-change,
// plan step 9 — the fourth of the Circle's four constraints).
//
// The second caller of `scanRecordCitations`. The first,
// `reference-resolution-lint.test.ts`, reads the plugin's SHIPPED text. This one
// reads the workbench's own live records, where citations are densest and where
// nothing had ever checked them (issue
// `shared/issues/260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md`).
//
// One parser serves both. Everything about what a citation IS — the storeless
// grammar, the seven exemptions, what resolves, what dangles and why a store
// segment (`shared/<store>/`, `circles/<dir>/`) is the `store-prefixed`
// violation — lives in `hooks/lib/citation-scan.ts` (bound to this checkout by
// the shim at `hooks/lib/__tests__/helpers/citation-scan.ts`) and is not
// restated here. What is this file's own is the CORPUS: which of the
// workbench's several hundred markdown files are held to the standard.
//
// WHAT THIS GATE ASSERTS, AND WHAT IT DELIBERATELY DOES NOT.
//
// It asserts zero violations, recomputed from the tree on every run. There is no
// baseline here and no approvable number, by decision
// `circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
// (option 1). The sibling gate pins the count of what it resolved, and that pin
// is a number somebody re-approves; this one has nothing to re-approve, so there
// is nothing an author meeting a red run can edit to make it green except the
// citation itself. The count of those re-approvals is deliberately not stated
// here: it is a measurement of the neighbouring file, it moves whenever that
// file's pin moves, and the argument needs the property and not the number —
// which is the defect
// `circles/260819-1645-four-constraints-on-deep-change/issues/260820-0805_*_the-new-gate-says-the-sibling-pin-was-re-approved-four-times-and-the-file-carries-fourteen-notes.md`. That is the whole design, and the cost the user accepted with
// it is stated rather than mitigated: an archive sweep, or a newly filed record
// carrying a bad citation, turns `npm test` red for somebody who touched no
// citation. Both are the gate working. Do not soften this into a warning.
// ---------------------------------------------------------------------------

// --- the corpus -------------------------------------------------------------

// THE CORPUS IS A MARKER PREDICATE, NOT THE WORD "OPEN". The user's answer named
// it as "the Circle records, portfolio.md, the open decisions and the open
// issues", and the planning run then measured that "the open decisions" has two
// readings which differ by 20 files and 39 dangling tokens. A word that admits
// two corpora does not define one, so the predicate is written out below and the
// reading it takes is named.
//
// IT TAKES THE WIDE READING — decisions carrying `_o_` OR `_a_` — for three
// reasons, in descending weight:
//
//   1. It is this project's own definition of a live decision.
//      `rules/fusion-workbench-conventions.md` `## Decision Records` states that
//      `_o_` and `_a_` together are Grounding-Stand, "the current best-of-
//      knowledge the project is working with", and that a reconciliation pass
//      listing active Grounding filters on `_o_` + `_a_`. An answered decision
//      awaiting realisation is a document people still open and act on. A gate
//      over live records should hold exactly the records that are live, and this
//      repository already wrote down which those are.
//   2. It is a superset of the narrow reading, so it can only judge more. Where
//      the two disagree the wide one is the stricter, and a citation gate erring
//      strict costs a repair while erring loose costs a dead pointer nobody sees.
//   3. It is the reading the repair was performed against. Plan steps 5 to 9b
//      cleared the wide corpus deliberately, so that the arming would satisfy
//      either answer. Choosing the narrow one now would discard measured work.
//
// THE HOLE THIS PREDICATE HAS, recorded because it is real and because the
// answering decision's own footer records it. Membership follows markers, so a
// record LEAVES the corpus when it reaches a terminal state, carrying whatever
// citations it holds. That happened inside this very Circle: a decision moved
// `_a_` -> `_i_` at plan step 4 and took three dangling citations out of reach,
// silently, and this gate would have shown green over them. It is a cost of the
// recomputed corpus — the same property that makes a baseline unnecessary is the
// property that lets a record walk out of scope — and not a defect in it. The
// fix would be a predicate that does not narrow at terminal state. Nobody has
// proposed one and this file does not.

/** `circles/<dir>/_<marker>_circle.md` — a Circle record in ANY state. */
const CIRCLE_RECORD_RE = /^circles\/[^/]+\/_[atcbsd]_circle\.md$/;

/** An issue carrying `_o_`, in a Circle's store or in `shared/`. */
const OPEN_ISSUE_RE = /(?:^|\/)issues\/[0-9]{6}-[0-9]{4}_o_[^/]+\.md$/;

/** A decision carrying `_o_` or `_a_` — Grounding-Stand, per the wide reading. */
const LIVE_DECISION_RE = /(?:^|\/)decisions\/[0-9]{6}-[0-9]{4}_[oa]_[^/]+\.md$/;

/**
 * The portfolio briefing, at the workbench root. Class L since 2026-08-23, so it
 * is present in the checkout that generated one and in no other; the corpus
 * admits it either way and `corpusFiles()` judges it only where it exists.
 */
const PORTFOLIO = "portfolio.md";

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
 * Carrying it would be an exclusion with no reason of this gate's own.
 *
 * ANCHORED AT THE ROOT, and that is the point rather than a detail. All three
 * are workbench-root stores. A substring test would be a second unanchored
 * predicate, which is the defect this clause answers, repeated
 * (`circles/260819-1645-four-constraints-on-deep-change/issues/260820-0805_*_the-citation-gates-corpus-excludes-only-archive-so-a-frozen-copy-tree-would-enter-a-blocking-gate.md`).
 *
 * EXCLUDING A STORE IS STILL NOT A WAY TO MAKE THE GATE GREEN. A record moved
 * into one leaves the corpus, but so do the obligations of everything it cited,
 * and the citations OF it in live records stay judged and go red. That
 * asymmetry is intentional.
 */
const FROZEN_PREFIXES = ["archive/", "stashes/", ".migration-v2-backup/"];

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
 * decision
 * `circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
 * exists to refuse. An `_o_`/`_p_` backlog entry is a separate question, asked
 * by the record that asked for this clause and not answered here.
 *
 * MEASURED before it was written, 2026-08-20 at HEAD `8e7cae7`: the clause
 * admits zero files today. Every plan outside `archive/` carries `_c_`,
 * including this Circle's own, and the tree's only `_p_` plan sits inside
 * `archive/` where the frozen-store exclusion takes it. Corpus and findings are
 * unchanged by adding it — 199 files, 0 violations, before and after. It is
 * armed for the next plan somebody writes, which is the whole of its job.
 */
const LIVE_PLAN_RE = /(?:^|\/)planning\/[0-9]{6}-[0-9]{4}_[op]_[^/]+\.md$/;

/**
 * The predicate itself, pure and over a workbench-relative path, so that the
 * cases below can put a path to it that this tree does not carry. Two of the
 * three frozen stores are such paths, and so is every live plan — which is the
 * shape of both defects this clause answered: nothing in this repository's tree
 * would have shown either of them. Twin: `skills/archive/SKILL.md` filter 3 enumerates the shipped files whose citations an archive move must keep resolvable (decision 260827-1756).
 */
export function inCorpus(rel: string): boolean {
  if (FROZEN_PREFIXES.some((p) => rel.startsWith(p))) return false;
  if (rel === PORTFOLIO) return true;
  return (
    CIRCLE_RECORD_RE.test(rel) ||
    OPEN_ISSUE_RE.test(rel) ||
    LIVE_DECISION_RE.test(rel) ||
    LIVE_PLAN_RE.test(rel)
  );
}

/** Workbench-relative paths of every file the gate judges under `root`. */
export function corpusFiles(root = workbenchRoot): { rel: string; abs: string }[] {
  return markdownFilesUnder(root).filter((f) => inCorpus(f.rel));
}

// --- the gate ---------------------------------------------------------------

// THE FAILURE MESSAGE IS PART OF THE MECHANISM, not decoration on it. A red gate
// is the moment an author looks for the way out, and on this corpus the cheapest
// way out is a file allowlist — which is the option the user explicitly declined
// when this Circle's 26 statement-citations were rewritten instead
// (`circles/260819-1645-four-constraints-on-deep-change/issues/260820-0530_*_twenty-six-citations-in-the-corpus-are-statements-rather-than-pointers-and-no-exemption-expresses-that.md`,
// option 4, and the recurrence answer at its foot). So the message names both
// correct remedies and names the wrong one as wrong, in the shape
// `BASELINE_MESSAGE` uses in the sibling lint: say what IS expected, then say
// what is not.
const VIOLATION_MESSAGE =
  "a citation in a live workbench record does not resolve. Each finding below " +
  "names the file, the line and the token.\n" +
  "IF THE CITATION IS A POINTER — it exists to be followed — CORRECT IT. The " +
  "`fix` line on each finding says how: spell the marker position `_*_` so it " +
  "survives the next transition, name the store the record actually sits in, or " +
  "give the full path.\n" +
  "IF IT IS A STATEMENT *ABOUT* A CITATION — the record's subject is that some " +
  "other file spells a marker wrongly, and correcting the spelling here would " +
  "delete the finding — then it must not be written as an address at all. NAME " +
  "THE FILE AND THE LINE and let the reader open it, or put the verbatim form " +
  "in a FENCED CODE BLOCK, which this scanner exempts for exactly this case. " +
  "Prose is the default; the fence is for when the spelling itself is the datum.\n" +
  "WHAT IS NOT THE ANSWER: adding a file to RECORD_EXAMPLE_FILES. That exempts " +
  "every citation in the file, including the ones that go stale later, and the " +
  "records likeliest to trip this gate are the records ABOUT stale citations — " +
  "the files where a new dead citation is likeliest and least visible. This gate " +
  "carries no baseline and no count for the same reason: there is nothing here " +
  "to re-approve, and the citation is the thing to fix.";

function runAll(): { violations: Violation[]; resolved: number; files: number } {
  const violations: Violation[] = [];
  let resolved = 0;
  const files = corpusFiles();
  for (const f of files) {
    const lines = readFileSync(f.abs, "utf-8")
      .split("\n")
      .map((text, i) => ({ line: i + 1, text }));
    const r = scanRecordCitations(f.rel, lines);
    violations.push(...r.violations);
    resolved += r.resolved;
  }
  return { violations, resolved, files: files.length };
}

describe("workbench citation lint: every citation in a live record resolves", () => {
  const { violations, resolved, files } = runAll();

  it("passes on the whole corpus — no dangling citation in any live record", () => {
    expect(
      violations,
      `${VIOLATION_MESSAGE}\n\ndangling citations in live workbench records:\n${report(violations)}`,
    ).toEqual([]);
  });

  it("degrades loudly, not silently, when the workbench is absent", () => {
    // Without this the gate passes vacuously on a fresh clone: an empty violation
    // list over no files is indistinguishable from a clean one. In THIS repo the
    // workbench is tracked, so its absence means the checkout is broken.
    expect(
      WORKBENCH_PRESENT,
      "fusion-workbench/.fusion-setup not found — the workbench citation gate scanned nothing. " +
        "Run /fusion:setup, or check out the tracked fusion-workbench/ directory.",
    ).toBe(true);
  });

  it("is not vacuous — the corpus selects real files and judges real citations", () => {
    // Deliberately `> 0` and not a number. A floor that can drift is a floor
    // that gets re-approved, which is the mechanism decision 260819-1645
    // rejected. These two assertions can only be tripped by a predicate that
    // matches nothing, which is the one failure the case exists to catch.
    expect(files, "the corpus predicate selected no files at all").toBeGreaterThan(0);
    expect(resolved, "no citation in the corpus resolved — the parser is not running").toBeGreaterThan(0);
  });
});

describe.runIf(WORKBENCH_PRESENT)("workbench citation lint: the corpus predicate", () => {
  const rels = new Set(corpusFiles().map((f) => f.rel));
  const all = markdownFilesUnder(workbenchRoot).map((f) => f.rel);

  it("holds the four kinds the user's answer named", () => {
    // TWO KINDS ARE PUT TO THE TREE AND TWO ARE NOT. Circle records and live
    // decisions are class R1 (`rules/workbench-tracking.md`): git carries them,
    // so "the tree carries one" is a claim every checkout can keep. `portfolio.md`
    // is class L since 2026-08-23, absent from every fresh clone, where a tree
    // assertion was red
    // (`circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1110_*_the-untracked-portfolio-turns-npm-test-red-in-every-fresh-clone-of-this-repository.md`);
    // it is put to the predicate, BY LITERAL, so the case also fails when the
    // constant stops naming the file the workbench writes. An open issue is what
    // a clean workbench has none of by design, so a control needing one on disk
    // failed exactly when the project reached the state it works towards
    // (`circles/260824-1853-close-every-open-defect/issues/260824-2136_*_the-workbench-citation-lints-positive-control-requires-an-open-issue-on-disk-so-a-clean-workbench-fails-it.md`);
    // that control runs the production selection over a scratch workbench the
    // case writes. A positive control belongs to a fixture the test owns, not to
    // the state of the tree it lints. DROPPING A KIND IS NOT THE REPAIR: the
    // corpus is a user's recorded answer
    // (`circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`).
    expect(inCorpus("portfolio.md"), "the corpus predicate admits portfolio.md").toBe(true);
    const has = (re: RegExp) => all.some((r) => re.test(r) && rels.has(r));
    expect(has(CIRCLE_RECORD_RE), "at least one Circle record is selected").toBe(true);
    expect(has(LIVE_DECISION_RE), "at least one live decision is selected").toBe(true);
    const tmp = mkdtempSync(join(tmpdir(), "citation-corpus-"));
    const open = "shared/issues/260101-0000_o_x.md";
    mkdirSync(join(tmp, "shared/issues"), { recursive: true });
    writeFileSync(join(tmp, open), "an open issue\n");
    writeFileSync(join(tmp, "shared/issues/260101-0000_c_y.md"), "a closed one\n");
    try {
      expect(corpusFiles(tmp).map((f) => f.rel), "an open issue is selected, a closed one is not").toEqual([open]);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("takes a Circle record in every state, not only the active one", () => {
    // The Circle record is the one kind with no marker filter: a closed Circle's
    // record is still read, still cited from, and its citations still have to
    // resolve. Asserted against the tree so that narrowing the pattern to `_t_`
    // — the tempting simplification — fails here rather than passing silently.
    const records = all.filter((r) => CIRCLE_RECORD_RE.test(r));
    const states = new Set(records.map((r) => /_([atcbsd])_circle\.md$/.exec(r)![1]));
    expect(states.size, "the tree carries Circle records in more than one state").toBeGreaterThan(1);
    expect(records.filter((r) => !rels.has(r))).toEqual([]);
  });

  it("excludes every frozen store, whatever a swept file's marker says", () => {
    const archived = all.filter((r) => r.startsWith("archive/"));
    expect(archived.length, "the tree carries an archive/ to exclude").toBeGreaterThan(0);
    expect(archived.filter((r) => rels.has(r))).toEqual([]);
    // The other two exist in no tree here, so they are put to the predicate
    // instead. A walk-derived assertion would pass vacuously and go on passing
    // after somebody deleted the clause.
    for (const p of FROZEN_PREFIXES) {
      expect(inCorpus(`${p}b/shared/issues/260101-0000_o_x.md`), p).toBe(false);
      expect(inCorpus(`${p}b/circles/c/_t_circle.md`), p).toBe(false);
      expect(inCorpus(`${p}b/shared/planning/260101-0000_p_x.md`), p).toBe(false);
    }
  });

  it("anchors the frozen stores at the workbench root", () => {
    // The exclusion is `startsWith`, not a substring test. All three stores are
    // root stores, and an unanchored exclusion is the same fault as the
    // unanchored predicate this pair of clauses was filed against — fixing one
    // by adding the other would be no fix at all.
    expect(inCorpus("shared/archive/issues/260101-0000_o_x.md")).toBe(true);
    expect(inCorpus("circles/c/stashes/issues/260101-0000_o_x.md")).toBe(true);
  });

  it("takes a plan under work, and no plan that has stopped", () => {
    // Against the predicate, not the tree, because the predicate is what is under
    // test and which plans stand open on any given day is not a property of it.
    // The dated measurement at the clause itself is where a live count belongs.
    expect(inCorpus("shared/planning/260101-0000_o_x.md")).toBe(true);
    expect(inCorpus("circles/260101-0000-c/planning/260101-0000_p_x.md")).toBe(true);
    for (const m of ["c", "d"]) {
      expect(inCorpus(`shared/planning/260101-0000_${m}_x.md`), m).toBe(false);
    }
    // And against the walk, where the terminal plans really are: over 150 dangling
    // citations sit in them, so this case is what keeps the gate green for a
    // reason rather than by luck.
    const stopped = all.filter((r) =>
      /(?:^|\/)planning\/[0-9]{6}-[0-9]{4}_[cd]_[^/]+\.md$/.test(r),
    );
    expect(stopped.length, "the tree carries closed plans to exclude").toBeGreaterThan(0);
    expect(stopped.filter((r) => rels.has(r))).toEqual([]);
  });

  it("excludes the stores the user's answer did not name", () => {
    // history/, analyses/, reviews/, consult/, memos/, backlog/ and
    // investigations/ are outside. Session logs in particular cite records by
    // the marker they carried on the day, and correcting them would falsify the
    // log. This is the corpus the answer named, not every file in the workbench.
    // `planning/` left this list on 2026-08-20 and is now a marker predicate of
    // its own — see `LIVE_PLAN_RE` and the case above it.
    const outside = [...rels].filter((r) =>
      /(?:^|\/)(?:history|analyses|reviews|consult|memos|backlog|investigations)\//.test(r),
    );
    expect(outside).toEqual([]);
  });

  it("excludes an issue or decision that has reached a terminal marker", () => {
    // The hole named in the corpus block above, pinned as behaviour so that a
    // later reader meets it as a fact rather than rediscovering it. A closed
    // issue and an implemented decision are out of scope BY DESIGN; if that is
    // ever revisited, this case is where the change announces itself.
    const terminal = all.filter((r) =>
      /(?:^|\/)(?:issues|decisions)\/[0-9]{6}-[0-9]{4}_[cdis]_[^/]+\.md$/.test(r),
    );
    expect(terminal.length, "the tree carries terminal records to exclude").toBeGreaterThan(0);
    expect(terminal.filter((r) => rels.has(r))).toEqual([]);
  });
});

describe("workbench citation lint: the storeless form rests on basename uniqueness", () => {
  // The rule states the scope as the live tree AND `archive/`, so this walk
  // takes the whole workbench with no frozen-store exclusion (decision
  // `260828-0904_*_should-the-uniqueness-claim-state-its-scope.md`).
  // The marker slot is the grammar's own (`MARKER_SLOT`), so the set this walk
  // measures is the set `workbenchIndex()` resolves against: with a literal
  // `_[a-z]_` here the 24 `_coder_`/`_ontocoder_`/`_planner_` history files
  // were outside the claim while inside the index (issue
  // `260829-1347_*_the-grammars-marker-slot-is-one-letter-while-24-indexed-artifacts-carry-a-word-there-and-the-stamp-bare-rewrite-checks-no-boundary.md`).
  const STAMPED_RE = new RegExp(`^[0-9]{6}-[0-9]{4}(?:${MARKER_SLOT}|-).+\\.md$`);
  const all = markdownFilesUnder(workbenchRoot).map((f) => f.rel);

  it("no two stamped artifacts share a marker-normalised basename, archive/ included", () => {
    const seen = new Map<string, string[]>();
    for (const rel of all) {
      const base = rel.slice(rel.lastIndexOf("/") + 1);
      if (!STAMPED_RE.test(base)) continue;
      const key = base.replace(/^([0-9]{6}-[0-9]{4})_[a-z]_/, "$1_*_");
      seen.set(key, [...(seen.get(key) ?? []), rel]);
    }
    const collisions = [...seen]
      .filter(([, paths]) => paths.length > 1)
      .map(([key, paths]) => `${key}: ${paths.join(" | ")}`);
    expect(seen.size, "the walk saw stamped artifacts").toBeGreaterThan(0);
    expect(collisions, "two artifacts share a basename; a storeless citation cannot tell them apart").toEqual([]);
  });

  it("the walk saw archive/, so the scope the rule states is the scope measured", () => {
    expect(all.some((r) => r.startsWith("archive/"))).toBe(true);
  });

  it("every word the tree carries in the marker slot is one the grammar enumerates", () => {
    // `MARKER_WORDS` was read off the tree, not guessed; a fourth word arriving
    // in a filename would sit in the index and outside the grammar until it is
    // added there, so this is the check that notices it.
    const words = new Set<string>();
    for (const rel of all) {
      const m = /^[0-9]{6}-[0-9]{4}_([a-zA-Z]{2,})_/.exec(rel.slice(rel.lastIndexOf("/") + 1));
      if (m) words.add(m[1]);
    }
    expect([...words].sort()).toEqual([...MARKER_WORDS].sort().filter((w) => words.has(w)));
    expect(words.size, "the tree still carries word-marked files; drop this case with them").toBeGreaterThan(0);
  });
});
