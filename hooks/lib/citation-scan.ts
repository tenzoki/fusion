// ---------------------------------------------------------------------------
// The workbench-record citation parser — class (c) of the reference-resolution
// lint, lifted out of `reference-resolution-lint.test.ts` so the same grammar
// can be pointed at a corpus that gate does not scan.
//
// It is one parser with two callers, deliberately:
//
//   - `scanRecordCitations()` is the gate's entry point, unchanged in
//     behaviour. It returns violations and a resolved count, and the lint
//     asserts on exactly what it asserted before the move.
//   - `scanCitationTokens()` is the same walk reporting per token instead of
//     per failure: what the token was, what it resolved to, and how many
//     things it resolved to. The corpus scan below is built on it, because a
//     baseline needs the count of citations that resolve AMBIGUOUSLY, and a
//     boolean gate has nowhere to put that — one match and five matches are
//     both "ok" to a gate and are not the same fact about a corpus.
//
// THE GRAMMAR, storeless since 2026-08-29 (Circle
// `260828-2342-citation-form-drops-store-segment`, decision
// `260829-1225_*_which-path-shaped-tokens-does-the-storeless-form-reach-beyond-a-record-citation.md`
// option 1: one form everywhere):
//   A record is cited by its basename alone, `260806-0015_*_<slug>.md`
//   (`bare-record`); a markerless artifact by `<stamp>-<slug>.md` and a Circle
//   by its bare directory name `<stamp>-<slug>` (both `stamp-name`). Every
//   citation resolves by ONE basename lookup over the whole workbench index,
//   `archive/` included, with no path arithmetic: no two stamped artifacts share
//   a marker-normalised basename (the uniqueness test in
//   `workbench-citation-lint.test.ts` re-takes that measurement on every run).
//   The wildcard `_*_` at the marker position matches any state marker; a
//   citation carrying an exact marker resolves exactly, and one whose record
//   exists only under a DIFFERENT marker is the stale-marker class. An
//   ellipsis, `…` or ASCII `...`, is a deliberate truncation and matches any
//   infix. A citation not ending in `.md` is a prefix.
//
//   THE THREE STORE-PREFIXED SHAPES ARE DETECTED AND NEVER RESOLVED. A record
//   behind a store segment (`shared/<store>/…`, `circles/<dir>/<store>/…`,
//   `record`), a Circle's own record `circles/<dir>/_x_circle.md`
//   (`circle-record`) and a Circle directory `circles/<dir>` (`circle-dir`)
//   each get the status `store-prefixed`, a violation whose `fix` spells the
//   storeless form. The segment is what an archive sweep moves, so a citation
//   carrying it dies at the sweep; the storeless form survives it. Keeping the
//   three as detectors is what lets the gates report the old spelling instead
//   of silently resolving it through `archive/`, which is what they did until
//   the 2026-08-19 archive tolerance was deleted with this rewrite.
//
//   THE MARKER SLOT IS ONE LETTER OR ONE OF THREE LEGACY WORDS. Every record
//   filed since the underscore form carries `_x_`; 24 pre-Circle history files
//   (measured 2026-08-29) carry `_coder_`, `_ontocoder_` or `_planner_` there,
//   and `workbenchIndex()` holds them like any other file. Until 2026-08-29 the
//   slot read `_[a-zA-Z*]_` alone, so a citation of one of those 24 was no
//   `bare-record`, fell through to `STAMP_RE`, and the sweep chained the
//   basename onto the stamp it had already spelled (issue
//   260829-1347_*_the-grammars-marker-slot-is-one-letter-while-24-indexed-artifacts-carry-a-word-there-and-the-stamp-bare-rewrite-checks-no-boundary.md).
//   `MARKER_SLOT` is the one spelling of the slot; the uniqueness test reads it
//   from here, so the set it measures is the set the resolver looks up.
//
//   A TRUNCATED CITATION IS A `bare-record`. `<stamp>_*_`, `<stamp>_o_`,
//   `<stamp>_d` and `<stamp>_…` each carry a `_` right after the stamp, which
//   nothing but a record citation does; each is read as a prefix and resolves,
//   is ambiguous, or dangles on its own merits. Until 2026-08-29 `BARE_RE`
//   demanded a full marker and a slug, so these fell to `STAMP_RE` as a bare
//   stamp with the tail invisible, and the sweep rewrote the stamp under the
//   tail: `<basename>.md_o_` (issue
//   260829-1333_*_the-citation-sweep-is-not-idempotent-a-truncated-citation-gains-a-marker-tail-on-rewrite.md).
//   For the same reason `STAMP_RE` now stops at a `_`, a `[` or a letter: a
//   stamp followed by one of those is the head of a longer token, never a bare
//   stamp.
//
//   A HEAD FIELD WHOSE WHOLE VALUE IS A BARE STAMP IS NOT A CITATION. A legacy
//   history record's `**Date:** 260801-1355` names the minute the record was
//   written; the sweep read it as a bare stamp, found the record itself by
//   prefix, and rewrote 42 such lines (seven labels, `**Date:**` the most
//   frequent) into self-citations (issue
//   260829-1346_*_the-committed-sweep-rewrote-29-date-head-fields-into-filenames-and-left-181-chained-tails-in-the-tree.md).
//   Such a token is reported `exempt` with the reason `head-field`. The
//   exemption is exactly that narrow: a head field whose value carries a marker
//   or a name (`**Active spec/plan:** <stamp>_*_<slug>.md`) is a citation the
//   orchestrator resolves, and stays one.
//
//   NOT READ, ON PURPOSE: the pre-v4 bracket marker (`260717-1918[o]_slug`).
//   It is retired syntax that `/fusion:migrate` rewrites; a grammar that
//   accepted it would remove the only pressure to rewrite it (issue
//   260812-2136_*_the-citation-grammar-reads-one-ellipsis-and-one-marker-syntax-and-the-workbench-uses-two-of-each.md, the second half).
//   Since the `STAMP_RE` boundary above, a bracket-marked token is no token at
//   all rather than a bare stamp with an invisible tail.
//
// The residual token class, the **bare timestamp** (`stamp-bare`).
// `260722-1943` in running prose carries no store, kind or slug, so the gate
// cannot judge it (`BARE_RE` requires the `_` a record citation carries). A
// measurement must still count
// them, because "how many citations cannot be resolved by any mechanism" is a
// different question from "how many are wrong". Bare timestamps are never
// violations and never counted as resolved.
//
// WHY THIS FILE IS UNDER `hooks/lib/` AND NOT IN THE TEST TREE. It lived at
// `hooks/lib/__tests__/helpers/citation-scan.ts` until 2026-08-29, excluded
// from the `tsc` build and run with `tsx`, and the header said so was on
// purpose. Decision
// `260828-0904_*_does-fusion-ship-a-citation-checker-to-consuming-projects.md`
// needs the grammar in `hooks/dist/`, which the test-scoped file could not
// provide: an install ships no `node_modules`, so `tsx` is not an option there.
// So the grammar compiles here, parameterised by the workbench root it resolves
// against (`createScanner(workbenchRoot)`), and the old path is a shim that
// binds fusion's own roots so no gate import had to change. Nothing about what
// the parser reads or reports moved with it.
//
// This is a measuring instrument, not a fixer (`rules/critical-stance.md` §2):
// it reads and reports, it never rewrites a citation.
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

// --- shared with the gate's other two classes -------------------------------

export interface Violation {
  file: string;
  line: number;
  token: string;
  problem: string;
  fix: string;
}

export function report(violations: Violation[]): string {
  return violations
    .map((v) => `  ${v.file}:${v.line}  '${v.token}'\n    ${v.problem}\n    -> ${v.fix}`)
    .join("\n");
}

/** Placeholder syntax — template tokens are never references. */
export function isPlaceholder(token: string): boolean {
  return /[<>${}\\]/.test(token);
}

// --- the citation grammar ---------------------------------------------------

const STORES =
  "planning|issues|decisions|history|reviews|analyses|investigations|consult|memos|backlog";

/**
 * The words the marker slot may carry besides one letter: the agent names the
 * pre-Circle history files were stamped with. Enumerated from the tree on
 * 2026-08-29 (`find fusion-workbench -name '*.md' | grep -oE
 * '/[0-9]{6}-[0-9]{4}_[a-zA-Z]{2,}_'`), not guessed; a fourth word needs a line
 * here or its file is invisible to the grammar while present in the index.
 */
export const MARKER_WORDS = ["coder", "ontocoder", "planner"] as const;

/** The marker slot, `_x_` or `_<word>_`, as a regex source with no capture. */
export const MARKER_SLOT = `_(?:[a-zA-Z*]|${MARKER_WORDS.join("|")})_`;

// Store-prefixed (optionally Circle-/shared-/workbench-rooted) record citation.
// A DETECTOR since 2026-08-29: every match is reported `store-prefixed`.
const REC_RE = new RegExp(
  "(?:fusion-workbench\\/)?" +
    "(?:(circles\\/[0-9]{6}-[0-9]{4}-[a-z0-9-]+)\\/|(shared)\\/)?" +
    `(${STORES})\\/` +
    `([0-9]{6}-[0-9]{4})((?:${MARKER_SLOT})?[A-Za-z0-9._…*-]*)`, // `.` admits ASCII `...`
  "g",
);

// A Circle's OWN record, `circles/<dir>/_x_circle.md`. It gets its own pattern
// rather than a widening of `REC_RE` because the two basenames have nothing in
// common: a store record is `<stamp>_<marker>_<slug>.md` and `REC_RE`'s tail is
// anchored on that stamp, while a Circle record carries no stamp and no slug at
// all — the stamp is in the DIRECTORY name. So there is no store segment to add
// to `STORES` and no tail to relax; the form is a different shape, and one
// pattern that expressed both would have to make its own anchor optional.
//
// `.md` is optional for the same reason it is everywhere else in this grammar
// (`basenameMatcher` reads a citation not ending in `.md` as a prefix), and the
// trailing lookahead stops the pattern from claiming a longer word.
const CIRCLE_REC_RE = new RegExp(
  "(?:fusion-workbench\\/)?" +
    "circles\\/([0-9]{6}-[0-9]{4}-[a-z0-9-]+)\\/" +
    "(_[a-zA-Z*]_circle(?:\\.md)?)" +
    "(?![A-Za-z0-9_.\\/-])",
  "g",
);

// Bare record citation — the `_` right after the stamp is required, or every
// plain timestamp and Circle-directory name would fire. What follows the `_` is
// a marker slot and a slug when the citation is whole, and any prefix of that
// when it is truncated (`<stamp>_*_`, `<stamp>_d`, `<stamp>_…`);
// `basenameMatcher` reads a token not ending in `.md` as a prefix either way.
const BARE_RE = new RegExp(
  `(?<![\\/0-9A-Za-z_-])([0-9]{6}-[0-9]{4})((?:${MARKER_SLOT}|_)[A-Za-z0-9._…*-]*)`,
  "g",
);

// Bare Circle-directory citation. A trailing `/` is allowed when nothing
// path-like follows (the conventions file's layout tree).
const CIRCLE_RE = /circles\/([0-9]{6}-[0-9]{4}-[a-z0-9-]+)(?:\/(?![A-Za-z0-9_.*<]))?(?![A-Za-z0-9_\/-])/g;

// A record stamp carrying no store prefix. Scanned last, and only where no
// citation token above already covers the position. Two shapes, and they are
// not the same question: `260812-2116-coder-<slug>` carries a name and is
// decidable by prefix (exactly, when it ends in `.md` — that is the storeless
// citation of a markerless artifact), while `260812-2116` alone is the residual.
//
// The trailing boundary is the one `BARE_RE` has in front: a stamp followed by
// `_`, `[` or a letter is the head of a longer token (a truncated citation, a
// pre-v4 bracket marker, a name under a different case), and the last two
// lookaheads refuse the backtracks that would otherwise read
// `<stamp>-<slug>.md_o` as `<stamp>-<slug>`, or as `<stamp>` with the name
// invisible. A stamp followed by `-…` is still a bare stamp: an elided name is
// an illustration, not a longer token.
const STAMP_RE =
  /(?<![\/0-9A-Za-z_-])([0-9]{6}-[0-9]{4})((?:-[a-z0-9]+)*)(\.md)?(?![0-9A-Za-z_\[])(?!-[a-z0-9])(?!\.md)/g;

/**
 * Files whose record citations are fabricated, with the reason. THE PREMISE IS
 * RESOLUTION — a made-up record cannot be found on disk — so the exemption
 * reaches exactly the verdicts a lookup decides and NOT `store-prefixed`, which
 * `SHAPE_DECIDED_KINDS` below settles from the token's shape before anything is
 * looked up. Until 2026-09-05 it silenced every verdict, which made the one file
 * whose job is to teach the citation form the one file where a wrong form could
 * not be detected (issue
 * 260905-1228_*_the-record-example-exemption-silences-a-verdict-that-does-not-depend-on-resolution.md).
 */
export const RECORD_EXAMPLE_FILES: Record<string, string> = {
  "rules/decision-record-examples.md":
    "the worked-example corpus — every record it walks is fabricated by design",
};

/**
 * Files whose SUBJECT is the retired store-prefixed layout, with the reason.
 * A different premise from `RECORD_EXAMPLE_FILES` and therefore a different
 * reach: here the store segment is what the file is about, so the exemption
 * covers `store-prefixed` as well. `skills/migrate/SKILL.md` describes the
 * pre-v4 -> v4 conversion move by move (`codereview/…` becomes
 * `shared/reviews/…`), and a gate telling it to drop the segment would be
 * telling it to stop describing the migration; `CLAUDE.md` states the same
 * licence in prose, calling `/fusion:migrate` the only consumer allowed to name
 * both layouts literally, because it is the transition between them.
 *
 * A SECOND MEMBER NEEDS THAT CLAIM ABOUT ITS CONTENT, not a red gate. The claim
 * is checkable by reading the file: does it convert between the two layouts? If
 * the answer is "no, it merely cites a record", the file belongs in
 * `RECORD_EXAMPLE_FILES` or the citation belongs in the storeless form.
 */
export const RETIRED_LAYOUT_FILES: Record<string, string> = {
  "skills/migrate/SKILL.md":
    "the pre-v4 -> v4 layout conversion, demonstrated move by move on fabricated " +
    "artifacts (260519-0438-coderev-loader-check, 260101-0903-dup, plan-foo)",
};

/**
 * A class-(c) token inside an open backtick span that begins with a
 * resolution-footer keyword is a footer-TEMPLATE illustration (`Append
 * `Answered: <record> — …``) — the conventions teach the footer syntax on a
 * fabricated record. Real footers live in workbench records, which the gate
 * never scans (the corpus scan does, and counts them like any other token).
 */
function inFooterTemplateSpan(before: string): boolean {
  return /`(?:Answered|Implemented|Deferred|Superseded by|Resolved):[^`]*$/.test(before);
}

/**
 * A class-(c) token announced as an illustration by `e.g.`: exempt only while
 * the clause the `e.g.` opened is still running. A `)`, a `;` or a sentence
 * end (`. ` after the `e.g.`) between the `e.g.` and the token closes the
 * announcement — without that bound, ANY earlier `e.g.` on the line exempted
 * every later citation, and a dead citation four words behind an unrelated
 * `(e.g. \`en\`)` passed silently (issue 260806-1031_*_referenz-lint-die-eg-ausnahme-ist-breiter-als-ihr-eigener-kommentar-behauptet.md, the swallow-a-real-defect
 * shape the gate's exemption-design note warns against).
 */
/**
 * A `**<Field>:** <value>` head line whose value is exactly the token: `before`
 * is the label and `after` is blank. Read for `stamp-bare` alone (the caller
 * checks the kind), so a head field carrying a real citation keeps it.
 */
function isHeadFieldValue(before: string, after: string): boolean {
  return /^\*\*[^*\n]+:\*\*\s+$/.test(before) && after.trim() === "";
}

function inAnnouncedIllustration(before: string): boolean {
  const at = before.lastIndexOf("e.g.");
  if (at === -1) return false;
  if (at > 0 && /[A-Za-z0-9_]/.test(before[at - 1])) return false; // word boundary
  const sinceEg = before.slice(at + "e.g.".length);
  return !/[);]|\.\s/.test(sinceEg);
}

// --- fenced code blocks -----------------------------------------------------

/**
 * A code fence. Group 1 is the indentation, group 2 the run of markers, group 3
 * the rest of the line — the info string on an opening fence, and required to
 * be blank on a closing one.
 */
const FENCE_RE = /^( {0,3})(`{3,}|~{3,})(.*)$/;

/**
 * Which of `lines` sit INSIDE a closed fenced code block, as a mask parallel to
 * the input. Indexed rather than keyed by line number so that a caller passing
 * a filtered or repeated line list cannot silently collide two entries.
 *
 * Content only. The opening fence's line carries the info string and the
 * closing fence's line carries nothing; neither is content, so a token on
 * either is judged like any other. That is the difference between exempting a
 * transcript and exempting the sentence that introduces it.
 *
 * WHAT IS IMPLEMENTED, read off CommonMark 0.31.2 §4.5 on 2026-08-20 rather
 * than recalled:
 *   - a fence is at least three consecutive backticks or tildes, and the two
 *     characters may not be mixed;
 *   - either fence may be preceded by up to three spaces of indentation;
 *   - a closing fence uses the SAME character as the opening one, is at least
 *     as long, and "may be followed only by spaces or tabs";
 *   - "if the info string comes after a backtick fence, it may not contain any
 *     backtick characters" — the rule that keeps a one-line inline span such as
 *     ``` ```x``` ``` from opening a block that never ends.
 *
 * WHAT IS DELIBERATELY NOT, each because implementing it would decide something
 * this step is not the place to decide:
 *   - **container blocks.** A fence inside a list item may be indented to that
 *     item's content column, well past three spaces, and CommonMark scopes the
 *     fence to the container. This tracker is flat, so such a fence never opens
 *     — `agents/orchestrator.md:162` carries one at five spaces. The cost is
 *     that its content stays JUDGED, which is the status quo and the safe
 *     direction; dropping the indent bound instead would let any indented run
 *     of three backticks switch the gate off for an arbitrary span.
 *   - **tabs as indentation.** A leading tab advances to column 4 and so cannot
 *     introduce a fence; the pattern asks for spaces and stops there.
 *   - **indented (four-space) code blocks.** Not fences, and out of scope by
 *     instruction. Measured before the exclusion rather than assumed: over the
 *     shipped markdown surface exactly 2 citation tokens sit on a line indented
 *     four spaces or more, and over the whole workbench 179 — and every sample
 *     inspected was a list continuation, not a code block. Four-space
 *     indentation is ambiguous with list continuation, and treating it as code
 *     would exempt those 181 tokens on the strength of a guess.
 *
 * AND ONE DEPARTURE FROM THE SPEC, taken deliberately and in the strict
 * direction. CommonMark: "if the end of the containing block (or document) is
 * reached and no closing code fence has been found, the code block contains all
 * of the lines after the opening code fence until the end". Here an unclosed
 * fence exempts NOTHING — the lines it opened are discarded at the end of the
 * walk rather than added. A gate that one stray backtick line can switch off
 * for the whole remainder of a file is not a gate, and an unbalanced fence is a
 * record to fix rather than a region to stop reading.
 */
export function fencedContentLines(lines: { line: number; text: string }[]): boolean[] {
  const inside = new Array<boolean>(lines.length).fill(false);
  let open: { marker: string; len: number } | null = null;
  let pending: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const text = lines[i].text;
    const m = FENCE_RE.exec(text);

    if (open === null) {
      // A `>` line belongs to a blockquote container, and a fence opened there
      // is that container's rather than the document's. Blockquoted lines carry
      // their own exemption already, so declining to open here loses nothing —
      // and it is what stops a fence marker quoted inside a transcript from
      // swallowing everything printed after the transcript.
      if (/^\s*>/.test(text)) continue;
      if (!m) continue;
      const marker = m[2][0];
      if (marker === "`" && m[3].includes("`")) continue; // the info-string rule
      open = { marker, len: m[2].length };
      pending = [];
      continue;
    }

    // Inside a fence every line is literal content — `>` included, since no
    // blockquote can begin here — until a closing fence of the same kind.
    if (m && m[2][0] === open.marker && m[2].length >= open.len && /^[ \t]*$/.test(m[3])) {
      for (const n of pending) inside[n] = true;
      open = null;
      pending = [];
      continue;
    }
    pending.push(i);
  }
  // Unclosed at end of input: `pending` is dropped, never committed. This is
  // the departure documented above, and it is the whole of it.
  return inside;
}

export interface WorkbenchEntry {
  relDir: string; // directory relative to the workbench root, "/"-joined
  base: string;
}

const pathOf = (e: WorkbenchEntry) => (e.relDir ? `${e.relDir}/${e.base}` : e.base);

/**
 * A basename matcher from a cited basename: `_*_` matches any single-letter
 * marker, `…` or `...` matches any infix, and a citation that does not end in
 * `.md` is a prefix (truncated citations are everyday in the corpus).
 */
function basenameMatcher(cited: string): RegExp {
  const segs = cited.split(/…|\.\.\./).map((s) =>
    s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/_\\\*_/g, "_[a-z]_"),
  );
  const tail = cited.endsWith(".md") ? "$" : "";
  return new RegExp("^" + segs.join(".*") + tail);
}

/**
 * An archive sweep's directory name: `/fusion:archive` creates exactly one
 * level, `archive/<YYMMDD-HHMM>-<slug>/`, and moves whole subtrees beneath it.
 * Read by `circleDirs()` alone, to find the swept `circles/` containers; no
 * resolver reads a path prefix any more.
 */
const SWEEP_DIR_RE = /^[0-9]{6}-[0-9]{4}-[a-z0-9-]+$/;

/** The storeless spelling of a store-prefixed record token's basename. */
function storelessBase(stamp: string, rest: string): string {
  return stamp + rest.replace(/^_[a-z](?:_|$)/, "_*_");
}

// --- the per-token walk -----------------------------------------------------

export type CitationKind =
  /** the five the gate judges; the first, third and fourth carry a store segment and are violations */
  | "record"
  | "bare-record"
  | "circle-record"
  | "circle-dir"
  /** a stamp plus a dashed name, no store prefix — decidable by prefix */
  | "stamp-name"
  /** a stamp alone — the residual, and the only kind the gate does not read */
  | "stamp-bare";

/**
 * The kinds the gate judges. Everything else is measurement-only, and since
 * 2026-08-20 "everything else" is one kind: `stamp-bare`.
 *
 * `stamp-name` joined the list under decision
 * `260819-2016_*_does-the-citation-gate-judge-the-stamp-name-class-which-scanrecordcitations-does-not-read.md`
 * (option 2), so that the repair scope and the gate scope coincide instead of
 * diverging by 33 tokens. A `stamp-name` token is a stamp plus a dashed name
 * (`260812-2116-coder-<slug>`), which this parser's own header calls decidable
 * by prefix. `stamp-bare` stays out and is not a candidate for joining: a bare
 * timestamp carries no store, no kind and no slug, so the question it fails is
 * "which of these is meant", which no mechanism reading the token can answer
 * (`rules/critical-stance.md` §4).
 *
 * BOTH callers share this list — the shipped-text lint in
 * `hooks/lib/__tests__/reference-resolution-lint.test.ts` and the workbench
 * gate in `hooks/lib/__tests__/workbench-citation-lint.test.ts`. Adding a kind
 * here therefore moves the first one's pinned counts, and that re-approval
 * belongs in the same commit as the widening.
 *
 * EXPORTED SO THE NEXT DRIFT IS REPORTED. `reference-resolution-lint.test.ts`
 * walks the shipped surface with a literal restatement of this list, kept
 * literal on purpose so the two views stay independent — and that copy was
 * stale for two steps, green only because the surface carried no token of the
 * kind it had missed. One assertion there now compares the two lists directly,
 * which is a question the corpus cannot answer and this export makes askable.
 */
export const GATE_KINDS: CitationKind[] = [
  "record",
  "bare-record",
  "circle-record",
  "circle-dir",
  "stamp-name",
];

/**
 * The kinds whose verdict is settled by the token's SHAPE. Each of the three
 * carries a store segment, so each is `store-prefixed` unconditionally: their
 * `check()` below reads nothing off disk, and a fabricated record and a real one
 * are indistinguishable to it.
 *
 * WHAT THE LIST IS FOR. An exemption whose premise is "do not look this token
 * up" cannot reach a verdict that needed no lookup, so the two resolution-
 * premised exemptions — `record-example-file` and `fenced-code` — are skipped
 * for these three kinds and the token is judged (issue
 * 260905-1228_*_the-record-example-exemption-silences-a-verdict-that-does-not-depend-on-resolution.md).
 * The exemptions that keep silencing it are the ones saying the token is not
 * this file's own spelling of a citation at all: `glob` (a pattern),
 * `placeholder` (a template slot), `blockquote` (another author's text, which
 * must not be silently respelled) and `retired-layout-file` (the store segment
 * is the subject).
 *
 * THE RESIDUAL, stated rather than left to be found: the same argument reaches
 * `announced-illustration`, `footer-template` and `fabricated-name`, which are
 * announcements about one illustration rather than claims that the token is not
 * a citation. They were measured at zero store-shaped tokens over both gate
 * corpora on 2026-09-05 and left alone — the record that asked for this
 * narrowing names the other two, and each of these three has fixtures of its own
 * that would have to be rewritten to decide it.
 */
export const SHAPE_DECIDED_KINDS: CitationKind[] = ["record", "circle-record", "circle-dir"];

/**
 * The exemptions whose premise is "do not look this token up": a fabricated
 * record cannot be found on disk, and a fenced transcript is quoted rather than
 * followed. Neither says anything about the token's SHAPE, so neither silences
 * `store-prefixed` on the three kinds above.
 *
 * THE REASON SURVIVES THE VERDICT, and that is the half a reader is likeliest
 * to miss. Such a token is reported as `store-prefixed` AND keeps its `reason`,
 * because the two answer different questions: the status says the spelling is
 * one the project retired, the reason says nobody may rewrite it in place. The
 * sweep (`hooks/citation-sweep.ts`) skips every hit carrying a reason, so a
 * verbatim exhibit inside a fence is reported to a human and never edited by a
 * machine — rewriting an exhibit deletes the finding it exists to show. Route 3
 * of issue
 * 260905-1228_*_the-record-example-exemption-silences-a-verdict-that-does-not-depend-on-resolution.md:
 * the store-prefix check runs on a pass no file-level exemption gates, while the
 * exemptions go on governing what may be written.
 *
 * `retired-layout-file` is deliberately absent: its premise IS about shape.
 */
const RESOLUTION_PREMISED_EXEMPTIONS = new Set(["record-example-file", "fenced-code"]);

export type CitationStatus =
  /** resolves to exactly one file (or one Circle directory) */
  | "resolved"
  /** resolves to more than one — the citation does not say which */
  | "ambiguous"
  /** the record exists, under a different marker */
  | "stale-marker"
  /** the citation carries a store segment; never resolved, `fix` spells the storeless form */
  | "store-prefixed"
  /** nothing on disk matches */
  | "dangling"
  /** a parser exemption fired; the token was never resolved */
  | "exempt"
  /** no workbench to resolve against (fresh clone) */
  | "unresolved-no-workbench";

export interface CitationHit {
  file: string;
  line: number;
  /** 0-based column of the token on its line; what a rewriter splices at */
  col: number;
  token: string;
  kind: CitationKind;
  status: CitationStatus;
  /** what the token resolved to, workbench-relative */
  matches: string[];
  problem?: string;
  fix?: string;
  /**
   * Which exemption fired. With `status: "exempt"` it reached every verdict;
   * on any other status it reached only the verdicts a lookup decides, and what
   * it still forbids is REWRITING the token in place
   * (`RESOLUTION_PREMISED_EXEMPTIONS`).
   */
  reason?: string;
}

type Verdict = Pick<CitationHit, "status" | "matches" | "problem" | "fix">;

export type Lines = { line: number; text: string }[];

export interface CorpusScan {
  root: string;
  files: number;
  hits: CitationHit[];
}

/** The grammar bound to one workbench root — what `createScanner()` returns. */
export interface Scanner {
  /** The root every resolution below is taken against. */
  workbenchRoot: string;
  /** Whether `<workbenchRoot>/.fusion-setup` exists; without it nothing resolves. */
  present: boolean;
  workbenchIndex(): WorkbenchEntry[];
  circleDirs(): Map<string, string[]>;
  scanCitationTokens(rel: string, lines: Lines): CitationHit[];
  scanRecordCitations(rel: string, lines: Lines): { violations: Violation[]; resolved: number };
  scanCorpus(root: string): CorpusScan;
}

/**
 * Bind the grammar to a workbench root. The two indexes below are memoised per
 * scanner, and for one reason: both are read once per token and the tree does
 * not move under a run. A caller that needs a fresh read makes a fresh scanner.
 */
export function createScanner(workbenchRoot: string): Scanner {
  const present = existsSync(join(workbenchRoot, ".fusion-setup"));

  let wbIndex: WorkbenchEntry[] | null = null;
  function workbenchIndex(): WorkbenchEntry[] {
    if (wbIndex) return wbIndex;
    wbIndex = !present
      ? []
      : readdirSync(workbenchRoot, { recursive: true, withFileTypes: true })
          .filter((e) => e.isFile())
          .map((e) => ({
            relDir: relative(workbenchRoot, e.parentPath).split(sep).join("/"),
            base: e.name,
          }));
    return wbIndex;
  }

  /**
   * Every Circle directory a citation can name, keyed by directory name and
   * carrying the workbench-relative path(s) that hold it: `circles/<dir>` while
   * the Circle is live, and `archive/<sweep>/circles/<dir>` once a sweep has
   * moved it. The map is the paths rather than a bare name set so that what a
   * citation RESOLVED TO is reported truthfully — an archived Circle that
   * reported `circles/<dir>` would be naming a path that is not on disk, in a
   * file whose header calls itself a measuring instrument. Archive sweeps are
   * indexed because a bare directory name resolves wherever the directory is.
   */
  let circleDirIndex: Map<string, string[]> | null = null;
  function circleDirs(): Map<string, string[]> {
    if (circleDirIndex) return circleDirIndex;
    const dirs = new Map<string, string[]>();
    const add = (relRoot: string) => {
      const abs = join(workbenchRoot, relRoot);
      if (!existsSync(abs)) return;
      for (const e of readdirSync(abs, { withFileTypes: true })) {
        if (!e.isDirectory()) continue;
        const at = dirs.get(e.name);
        if (at) at.push(`${relRoot}/${e.name}`);
        else dirs.set(e.name, [`${relRoot}/${e.name}`]);
      }
    };
    add("circles");
    const archive = join(workbenchRoot, "archive");
    if (existsSync(archive)) {
      for (const sweep of readdirSync(archive, { withFileTypes: true })) {
        if (sweep.isDirectory() && SWEEP_DIR_RE.test(sweep.name)) {
          add(`archive/${sweep.name}/circles`);
        }
      }
    }
    circleDirIndex = dirs;
    return dirs;
  }

  /** Every file whose basename the citation matches, wherever it sits. */
  function findRecord(citedBase: string): WorkbenchEntry[] {
    const re = basenameMatcher(citedBase);
    return workbenchIndex().filter((e) => re.test(e.base));
  }

  /**
   * Every citation token on the given lines, with what it resolves to. The
   * exemptions are the gate's, applied identically — a token they catch is
   * reported as `exempt` with the reason rather than dropped, so a corpus scan
   * can state how much of itself it did not judge.
   *
   * ONE HIT SHAPE CARRIES BOTH: a `store-prefixed` verdict with a `reason` set.
   * It means the token was judged on its shape, which no exemption here bears
   * on, while an exemption still forbids rewriting it in place
   * (`RESOLUTION_PREMISED_EXEMPTIONS`).
   */
  function scanCitationTokens(rel: string, lines: Lines): CitationHit[] {
    const hits: CitationHit[] = [];
    const fileExempt = rel in RECORD_EXAMPLE_FILES;
    const layoutExempt = rel in RETIRED_LAYOUT_FILES;
    const fenced = fencedContentLines(lines);

    for (let li = 0; li < lines.length; li++) {
      const { line, text } = lines[li];
      const blockquoted = /^\s*>/.test(text);
      const covered: [number, number][] = [];
      const consider = (idx: number, token: string, kind: CitationKind, check: () => Verdict) => {
        if (covered.some(([s, e]) => idx >= s && idx < e)) return;
        covered.push([idx, idx + token.length]);
        const before = text.slice(0, idx);
        const reason = layoutExempt
          ? "retired-layout-file"
          : fileExempt
            ? "record-example-file"
            : // ahead of `blockquote`: inside a fence a leading `>` is literal text
              // and not a quotation, so on a line that satisfies both this is the
              // true reason and the other is a coincidence of the first character.
              fenced[li]
            ? "fenced-code"
            : blockquoted
              ? "blockquote"
              : inAnnouncedIllustration(before)
                ? "announced-illustration"
                : inFooterTemplateSpan(before)
                  ? "footer-template"
                  : // a token cut at a `$`, `<` or `{` is the head of a template
                    // (`<stamp>_*_$f.md` in a shell illustration)
                    isPlaceholder(token) || isPlaceholder(text.charAt(idx + token.length))
                    ? "placeholder"
                    : token.includes("foo")
                      ? "fabricated-name"
                      : // a `*` anywhere but the marker position is a glob, not a citation
                        /\*/.test(token.replace(/_\*_/g, ""))
                        ? "glob"
                        : // a bare stamp that is the whole value of a `**Field:**`
                          // head line is the minute the record was written, not a
                          // pointer (the `**Date:**` case in the header)
                          kind === "stamp-bare" && isHeadFieldValue(before, text.slice(idx + token.length))
                          ? "head-field"
                          : null;
        // An exemption whose premise is "do not look this token up" cannot
        // reach a verdict that needed no lookup, so a shape-decided kind under
        // one is JUDGED — and keeps the reason, which is what stops a rewriter
        // from touching it. See `SHAPE_DECIDED_KINDS`.
        const judgedAnyway =
          reason !== null &&
          RESOLUTION_PREMISED_EXEMPTIONS.has(reason) &&
          SHAPE_DECIDED_KINDS.includes(kind);
        if (reason && !judgedAnyway) {
          hits.push({ file: rel, line, col: idx, token, kind, status: "exempt", matches: [], reason });
          return;
        }
        if (!present) {
          hits.push({ file: rel, line, col: idx, token, kind, status: "unresolved-no-workbench", matches: [] });
          return;
        }
        hits.push({ file: rel, line, col: idx, token, kind, ...check(), ...(reason ? { reason } : {}) });
      };

      const found = (m: WorkbenchEntry[]): Verdict => ({
        status: m.length === 1 ? "resolved" : "ambiguous",
        matches: m.map(pathOf),
      });

      const storePrefixed = (segment: string, storeless: string): Verdict => ({
        status: "store-prefixed",
        matches: [],
        problem: `the citation carries the store segment '${segment}', which an archive sweep moves`,
        fix: `cite the storeless form '${storeless}' (decision 260828-0904, the form)`,
      });

      REC_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = REC_RE.exec(text)) !== null) {
        const [full, circleDir, shared, store, stamp, restRaw] = m;
        const rest = restRaw ?? "";
        const idx = m.index;
        const segment = `${circleDir ?? shared ?? ""}${circleDir || shared ? "/" : ""}${store}/`;
        consider(idx, full, "record", () => storePrefixed(segment, storelessBase(stamp, rest)));
      }

      CIRCLE_REC_RE.lastIndex = 0;
      while ((m = CIRCLE_REC_RE.exec(text)) !== null) {
        const [full, dir] = m;
        const idx = m.index;
        consider(idx, full, "circle-record", () => storePrefixed("circles/", dir));
      }

      BARE_RE.lastIndex = 0;
      while ((m = BARE_RE.exec(text)) !== null) {
        const [full, stamp, rest] = m;
        const idx = m.index;
        consider(idx, full, "bare-record", () => {
          const hit = findRecord(stamp + rest);
          if (hit.length > 0) return found(hit);
          // `_o_` on a whole or truncated citation, `_o` on one cut inside the slot
          const markerM = rest.match(/^_([a-z])(?:_|$)/);
          if (markerM) {
            const wild = findRecord(storelessBase(stamp, rest));
            if (wild.length > 0) {
              return {
                status: "stale-marker",
                matches: wild.map(pathOf),
                problem:
                  `stale marker '_${markerM[1]}_': the record now exists as ` +
                  `${wild[0].relDir}/${wild[0].base}`,
                fix: "cite the marker position as '_*_' (decision 260806-0015, wildcard form)",
              };
            }
          }
          return {
            status: "dangling",
            matches: [],
            problem: "no record anywhere in the workbench matches this citation",
            fix:
              "pull the citation's substance into the text and drop the dead path " +
              "(decision 260805-0709), or fix the citation",
          };
        });
      }

      CIRCLE_RE.lastIndex = 0;
      while ((m = CIRCLE_RE.exec(text)) !== null) {
        const [full, dir] = m;
        const idx = m.index;
        consider(idx, full, "circle-dir", () => storePrefixed("circles/", dir));
      }

      // Store-prefixless stamps, last: whatever no citation token above claimed.
      // A `stamp-name` ending in `.md` is the storeless citation of a markerless
      // artifact and matches its basename exactly; every other shape resolves by
      // prefix against the whole index, files and Circle directories alike, which
      // is all the token supports — and the match COUNT is the answer, because a
      // stamp that names five artifacts names none of them.
      STAMP_RE.lastIndex = 0;
      while ((m = STAMP_RE.exec(text)) !== null) {
        const [full, stamp, dashed, md] = m;
        const idx = m.index;
        consider(idx, full, dashed ? "stamp-name" : "stamp-bare", () => {
          const at = dashed && !md ? circleDirs().get(full) : undefined;
          if (at) return { status: at.length === 1 ? "resolved" : "ambiguous", matches: at };
          const named = md
            ? workbenchIndex().filter((e) => e.base === full).map(pathOf)
            : [
                ...workbenchIndex().filter((e) => e.base.startsWith(full)).map(pathOf),
                ...(dashed
                  ? []
                  : [...circleDirs().entries()].filter(([d]) => d.startsWith(full)).flatMap(([, p]) => p)),
              ];
          if (named.length === 0) {
            return {
              status: "dangling",
              matches: [],
              problem: dashed
                ? "no artifact and no Circle directory carries this name"
                : "no artifact in the workbench carries this timestamp",
              fix: "cite the record's storeless basename, or drop the token",
            };
          }
          return {
            status: named.length === 1 ? "resolved" : "ambiguous",
            matches: named,
            problem:
              named.length === 1
                ? undefined
                : `${named.length} artifacts share this stamp; the token names none of them`,
            fix: named.length === 1 ? undefined : "cite the record's storeless basename",
          };
        });
      }
    }
    return hits;
  }

  /**
   * The gate's entry point: violations and a resolved count, derived from the
   * walk above. An ambiguous citation counts as resolved here, exactly as it did
   * when the gate asked `hit.length > 0` — the gate's question is whether the
   * citation finds anything, and widening it to "finds exactly one" is a
   * different gate, not a fix to this one. A bare timestamp is neither: the gate
   * never saw one and still does not.
   */
  function scanRecordCitations(
    rel: string,
    lines: Lines,
  ): { violations: Violation[]; resolved: number } {
    const violations: Violation[] = [];
    let resolved = 0;
    for (const h of scanCitationTokens(rel, lines)) {
      if (!GATE_KINDS.includes(h.kind)) continue;
      if (h.status === "resolved" || h.status === "ambiguous") resolved++;
      else if (h.status === "stale-marker" || h.status === "store-prefixed" || h.status === "dangling") {
        violations.push({
          file: h.file,
          line: h.line,
          token: h.token,
          problem: h.problem!,
          fix: h.fix!,
        });
      }
    }
    return { violations, resolved };
  }

  /** Every `.md` under `root`, each scanned with this scanner's grammar. */
  function scanCorpus(root: string): CorpusScan {
    const files = markdownFilesUnder(root);
    const hits: CitationHit[] = [];
    for (const f of files) {
      const lines = readFileSync(f.abs, "utf-8")
        .split("\n")
        .map((text, i) => ({ line: i + 1, text }));
      hits.push(...scanCitationTokens(f.rel, lines));
    }
    return { root, files: files.length, hits };
  }

  return {
    workbenchRoot,
    present,
    workbenchIndex,
    circleDirs,
    scanCitationTokens,
    scanRecordCitations,
    scanCorpus,
  };
}

// --- the shipped prompt corpus, shared by the prompt-lint gates -------------

/** Every agent's name, read off the prompt directory rather than hard-coded. */
export function agentNames(pluginRoot: string): string[] {
  return readdirSync(join(pluginRoot, "agents"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -3))
    .sort();
}

/**
 * Every agent prompt plus each skill body, as `{ rel, abs }`. `exempt` names
 * skill DIRECTORIES to skip, which is how the marker-format and path-literal
 * gates let `setup` and `migrate` name what those gates otherwise forbid.
 * Four gates each carried a private copy of this walk until 2026-08-22.
 */
export function shippedPrompts(
  pluginRoot: string,
  exempt: Set<string> = new Set(),
): { rel: string; abs: string }[] {
  const files: { rel: string; abs: string }[] = [];
  for (const f of readdirSync(join(pluginRoot, "agents")).sort()) {
    if (f.endsWith(".md")) files.push({ rel: `agents/${f}`, abs: join(pluginRoot, "agents", f) });
  }
  for (const d of readdirSync(join(pluginRoot, "skills")).sort()) {
    if (exempt.has(d)) continue;
    const abs = join(pluginRoot, "skills", d, "SKILL.md");
    if (existsSync(abs)) files.push({ rel: `skills/${d}/SKILL.md`, abs });
  }
  return files;
}

// --- running the parser over an arbitrary corpus ----------------------------

export function markdownFilesUnder(root: string): { rel: string; abs: string }[] {
  if (!existsSync(root)) return [];
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => {
      const abs = join(e.parentPath, e.name);
      return { rel: relative(root, abs).split(sep).join("/"), abs };
    })
    .sort((a, b) => a.rel.localeCompare(b.rel));
}

/**
 * The three lists the baseline is stated in, plus the bucket of tokens that
 * were never judged. Disjoint, and every hit lands in exactly one.
 *
 * A `stamp-bare` token lands in `undecidable` WHATEVER it resolved to, and
 * that is the one placement worth defending. Such a token carries no store, no
 * kind and no slug: when it matches exactly one artifact today, it does so by
 * the accident that one artifact was written in that minute, and it silently
 * becomes ambiguous the moment a second one is. The question it fails is not
 * "does this exist" but "which of these is meant", and no mechanism reading
 * that token can answer it.
 */
export function partition(hits: CitationHit[]) {
  const unjudged = (h: CitationHit) =>
    h.status === "exempt" || h.status === "unresolved-no-workbench";
  const undecidable = (h: CitationHit) =>
    !unjudged(h) && (h.kind === "stamp-bare" || h.status === "ambiguous");
  return {
    resolved: hits.filter((h) => !unjudged(h) && !undecidable(h) && h.status === "resolved"),
    // `store-prefixed` lands here: it is a violation the gate reports, and the
    // baseline's three lists have no fourth. A caller that wants it apart
    // filters on the status.
    dangling: hits.filter(
      (h) =>
        !unjudged(h) &&
        !undecidable(h) &&
        (h.status === "stale-marker" || h.status === "store-prefixed" || h.status === "dangling"),
    ),
    undecidable: hits.filter(undecidable),
    exempt: hits.filter(unjudged),
  };
}
