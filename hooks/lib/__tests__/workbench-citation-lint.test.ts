import { describe, it, expect } from "vitest";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import {
  workbenchRoot,
  WORKBENCH_PRESENT,
  MARKER_SLOT,
  MARKER_WORDS,
  report,
  scanRecordCitations,
  type Violation,
} from "./helpers/citation-scan.js";
import { createScanner, workbenchMarkdownFiles } from "../citation-scan.js";
import { FROZEN_PREFIXES, isLiveRecord, isMigrationOriginal, unreadControls } from "../citation-corpus.js";
import type { IndexEntry, RecordIndex } from "../record-index.js";
import { CASE_TIMEOUT } from "./helpers/guard-harness.js";
import { indexOf, jsonWorkbenchAt, placeRecord } from "./helpers/json-workbench.js";

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
// grammar, the exemptions, what resolves, what dangles and why a store
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
// `circles/260819-1645-four-constraints-on-deep-change/issues/260820-0805_*_the-new-gate-says-the-sibling-pin-was-re-approved-four-times-and-the-file-carries-fourteen-notes.md`.
// The cost the user accepted with that design — an archive sweep or a newly
// filed record reddening `npm test` for somebody who touched no citation — is
// stated in `CLAUDE.md`'s row for this gate. Do not soften this into a warning.
// ---------------------------------------------------------------------------

// --- the corpus -------------------------------------------------------------

// THE CORPUS PREDICATE MOVED TO `hooks/lib/citation-corpus.ts` on 2026-09-01,
// whole and with its reasoning, when decision
// `260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md`
// scoped `citation-check.ts`'s `verdict=` line to the files somebody still
// edits — which is this predicate, read by a reporter instead of by a gate.
// Read that file for what the corpus IS and why. Since FJ03d step 8 it reads a
// record's liveness from the workbench's record index, never from a marker in
// a file name, so this gate reads fusion's own workbench through the codec.
// A workbench that does not read as `json-control` fails every own-tree case
// below by its format, `legacy` by name: the gate has no corpus to judge.

let own: RecordIndex | undefined;

/** This workbench's record index, or a failure naming the format it read as. */
function ownIndex(): RecordIndex {
  if (own !== undefined) return own;
  const read = indexOf(workbenchRoot);
  if (read.format === "json-control") return (own = read.index);
  const why = read.format === "legacy" ? "legacy (no workbench.json: its control data is Markdown); run /fusion:migrate" : `not read (${read.unread.cause})`;
  throw new Error(`fusion-workbench is ${why}. The citation gate takes its corpus from the record index and has none to judge.`);
}

/**
 * Workbench-relative paths of every file the gate judges under `root`. A
 * control file that did not read is in no map of the index, so its narrative
 * would leave the corpus unjudged and unnamed: the gate fails on it by name.
 */
function corpusFiles(root = workbenchRoot, index = ownIndex()): { rel: string; abs: string }[] {
  if (index.unreadable.length > 0) throw new Error(unreadControls(index.unreadable, "the citation gate cannot say its corpus is whole"));
  return workbenchMarkdownFiles(root).filter((f) => isLiveRecord(f.rel, index));
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
  "ONE VERDICT THE FENCE DOES NOT COVER: `store-prefixed`. It is decided from " +
  "the token's shape and never needs a lookup, so no exemption premised on not " +
  "looking a record up reaches it — the fence and RECORD_EXAMPLE_FILES included. " +
  "To report a store segment, NAME IT IN WORDS (\"carries the segment " +
  "`analyses/`\") instead of spelling the whole token.\n" +
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
  let ran: ReturnType<typeof runAll> | undefined;
  const all = () => (ran ??= runAll());

  it("passes on the whole corpus — no dangling citation in any live record", () => {
    const { violations } = all();
    expect(
      violations,
      `${VIOLATION_MESSAGE}\n\ndangling citations in live workbench records:\n${report(violations)}`,
    ).toEqual([]);
  }, 4 * CASE_TIMEOUT);

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
    const { resolved, files } = all();
    expect(files, "the corpus predicate selected no files at all").toBeGreaterThan(0);
    expect(resolved, "no citation in the corpus resolved — the parser is not running").toBeGreaterThan(0);
  }, 4 * CASE_TIMEOUT);
});

/** An index holding `live` and `terminal` narratives, for the cases that need no codec. */
function indexHolding(live: string[], terminal: string[] = []): RecordIndex {
  const entry = (narrative: string, isLive: boolean): [string, IndexEntry] => [narrative, { id: narrative, kind: "issue", status: isLive ? "open" : "closed", live: isLive, control: narrative.replace(/\.md$/, ".record.json"), narrative }];
  return { byNarrative: new Map([...live.map((n) => entry(n, true)), ...terminal.map((n) => entry(n, false))]), byId: new Map(), byControl: new Map(), unreadable: [], unresolvedRefs: [], bindings: new Map() };
}

describe("workbench citation lint: the corpus predicate", () => {
  it("takes a narrative whose record is live, whatever marker its name carries, and nothing without a record", () => {
    // Over records the codec reads, so the index this gate takes from the
    // workbench is the one put to the predicate. The marker in each name says
    // the opposite of the record's state: the record decides.
    const tmp = mkdtempSync(join(tmpdir(), "citation-corpus-"));
    try {
      const wb = jsonWorkbenchAt(tmp);
      placeRecord(wb, "issue-open", "shared/issues/260101-0000_c_open.md", "open");
      placeRecord(wb, "issue-closed", "shared/issues/260101-0001_o_closed.md", "closed");
      placeRecord(wb, "decision-answered", "shared/decisions/260101-0002_i_answered.md", "answered");
      placeRecord(wb, "decision-implemented", "shared/decisions/260101-0003_a_implemented.md", "implemented");
      placeRecord(wb, "plan-in-progress", "shared/plans/260101-0004_c_under-way.md", "in_progress");
      writeFileSync(join(wb, "shared/issues/260101-0005-no-record.md"), "a narrative nothing controls\n");
      const read = indexOf(wb);
      if (read.format !== "json-control") throw new Error(JSON.stringify(read));
      expect(corpusFiles(wb, read.index).map((f) => f.rel).sort()).toEqual([
        "shared/decisions/260101-0002_i_answered.md",
        "shared/issues/260101-0000_c_open.md",
        "shared/plans/260101-0004_c_under-way.md",
      ]);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);

  it("fails, naming the control file, when one does not read: its narrative is never dropped in silence", () => {
    const tmp = mkdtempSync(join(tmpdir(), "citation-unread-"));
    try {
      const wb = jsonWorkbenchAt(tmp);
      placeRecord(wb, "issue-open", "shared/issues/260101-0000-open.md", "open");
      for (const [rel, text] of [["shared/issues/260101-0001-broken.md", "# x\n"], ["shared/issues/260101-0001-broken.record.json", "{\n"]]) writeFileSync(join(wb, rel), text);
      const read = indexOf(wb);
      if (read.format !== "json-control") throw new Error(JSON.stringify(read));
      expect(() => corpusFiles(wb, read.index)).toThrow(/1 control file did not read[\s\S]*\n {2}shared\/issues\/260101-0001-broken\.record\.json {2}\S+\/\S+/);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);

  it("excludes every frozen store, whatever the record under it says, anchored at the workbench root", () => {
    // Put to the predicate rather than to a tree: two of the three stores exist
    // in no tree here, and a walk-derived assertion would pass vacuously. The
    // exclusion is `startsWith`, so the same store name below the root is not
    // a frozen store: an unanchored exclusion is the fault this clause answers.
    const frozen = FROZEN_PREFIXES.map((p) => `${p}b/shared/issues/260101-0000_o_x.md`);
    const nested = ["shared/archive/issues/260101-0000_o_x.md", "work-packages/c/stashes/issues/260101-0000_o_x.md"];
    const index = indexHolding([...frozen, ...nested]);
    expect([...frozen, ...nested].filter((r) => isLiveRecord(r, index))).toEqual(nested);
    // the migration's originals are anchored the same way, and nothing beside them is taken for one
    const inside = "archive/migrations/m1/originals/shared/issues/260101-0000_o_x.md";
    const beside = ["archive/migrations/m1/receipt.md", "archive/260102-0000-sweep/shared/issues/260101-0000_o_x.md", `shared/${inside}`];
    expect([inside, ...beside].filter(isMigrationOriginal)).toEqual([inside]);
  });

  it("follows the record out of the corpus at a terminal state", () => {
    // The hole named in `lib/citation-corpus.ts`, pinned as behaviour so that a
    // later reader meets it as a fact rather than rediscovering it.
    const index = indexHolding(["shared/issues/a.md"], ["shared/issues/b.md"]);
    expect(["shared/issues/a.md", "shared/issues/b.md"].map((r) => isLiveRecord(r, index))).toEqual([true, false]);
  });

  it.runIf(WORKBENCH_PRESENT)("excludes, in this workbench, the stores that carry no record", () => {
    // history/, analyses/, reviews/, consultations/, memos/ and investigations/
    // are outside: session logs cite records by the marker they carried on the
    // day, and correcting them would falsify the log. They fall through because
    // no record controls them; this case is where a record arriving there shows.
    const outside = corpusFiles().map((f) => f.rel).filter((r) =>
      /(?:^|\/)(?:history|analyses|reviews|consult|consultations|memos|backlog|investigations)\//.test(r),
    );
    expect(outside).toEqual([]);
  }, CASE_TIMEOUT);
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
  const all = workbenchMarkdownFiles(workbenchRoot).map((f) => f.rel);

  /** The stamped basenames among `rels`, marker-normalised, and those more than one path carries. */
  function shared(rels: string[]): { stamped: number; collisions: string[] } {
    const seen = new Map<string, string[]>();
    for (const rel of rels) {
      const base = rel.slice(rel.lastIndexOf("/") + 1);
      if (!STAMPED_RE.test(base)) continue;
      const key = base.replace(/^([0-9]{6}-[0-9]{4})_[a-z]_/, "$1_*_");
      seen.set(key, [...(seen.get(key) ?? []), rel]);
    }
    const collisions = [...seen]
      .filter(([, paths]) => paths.length > 1)
      .map(([key, paths]) => `${key}: ${paths.join(" | ")}`);
    return { stamped: seen.size, collisions };
  }

  it("no two stamped artifacts share a marker-normalised basename, archive/ included", () => {
    const { stamped, collisions } = shared(all);
    expect(stamped, "the walk saw stamped artifacts").toBeGreaterThan(0);
    expect(collisions, "two artifacts share a basename; a storeless citation cannot tell them apart").toEqual([]);
  });

  it("a migration's kept original is no second artefact: out of the walk and out of the index, the swept archive still in", () => {
    // The original keeps the record's own basename by design (decision
    // `261005-1042_*_do-the-migrations-originals-leave-the-uniqueness-scope-or-get-names-that-do-not-collide.md`,
    // option 1), so the scope the rule states ends at `originals/`.
    const tmp = mkdtempSync(join(tmpdir(), "citation-originals-"));
    try {
      const wb = jsonWorkbenchAt(tmp);
      const live = "shared/issues/260101-0000_o_kept.md";
      const swept = "archive/260102-0000-sweep/shared/issues/260101-0001_c_swept.md";
      for (const rel of [live, swept, `archive/migrations/m1/originals/${live}`]) {
        mkdirSync(dirname(join(wb, rel)), { recursive: true });
        writeFileSync(join(wb, rel), "# x\n");
      }
      const rels = workbenchMarkdownFiles(wb).map((f) => f.rel);
      expect(rels).toEqual([swept, live]);
      expect(shared(rels)).toEqual({ stamped: 2, collisions: [] });
      const hits = createScanner(wb).scanCitationTokens("shared/issues/260101-0002-citing.md", [{ line: 1, text: "`260101-0000_*_kept.md` and `260101-0001_*_swept.md`" }]);
      expect(hits.map((h) => [h.status, h.matches])).toEqual([["resolved", [live]], ["resolved", [swept]]]);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
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
