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
// THE GRAMMAR:
//   `260806-0015_*_<slug>.md` and its store-, Circle- and `shared/`-prefixed
//   forms, plus bare Circle-directory citations `circles/<stamp>-<slug>`, plus
//   a Circle's own record `circles/<stamp>-<slug>/_x_circle.md`. The wildcard
//   `_*_` at the marker position matches any state marker; a citation carrying
//   an exact marker resolves exactly, and one whose record exists only under a
//   DIFFERENT marker is the stale-marker class. An ellipsis, `…` or ASCII
//   `...`, is a deliberate truncation and matches any infix. A citation not
//   ending in `.md` is a prefix.
//
//   NOT READ, ON PURPOSE: the pre-v4 bracket marker (`260717-1918[o]_slug`).
//   It is retired syntax that `/fusion:migrate` rewrites; a grammar that
//   accepted it would remove the only pressure to rewrite it. With a store
//   prefix it tokenises up to the `[` and prefix-matches the file, so a stale
//   bracket marker is never found (issue 260812-2136, the second half).
//
//   The Circle-record form arrived last, on 2026-08-19; until it tokenised the
//   gate was silent over every citation in that form (issue 260819-2321).
//
// WHAT THIS FILE ADDS: a fourth token class, the **bare timestamp**.
// `260722-1943` in running prose carries no store, kind or slug, so the gate
// cannot judge it (`BARE_RE` requires a marker). A measurement must still count
// them, because "how many citations cannot be resolved by any mechanism" is a
// different question from "how many are wrong". Bare timestamps are never
// violations and never counted as resolved.
//
// This file is test-scoped on purpose. It is excluded from the `tsc` build
// (tsconfig excludes `lib/__tests__`), so it adds nothing to `hooks/dist/` and
// nothing to what an install ships. Run it directly with `tsx`:
//
//     cd hooks && npx tsx lib/__tests__/helpers/citation-scan.ts [<root>] [list…]
//
// This is a measuring instrument, not a fixer (`rules/critical-stance.md` §2):
// it reads and reports, it never rewrites a citation.
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, relative, sep } from "node:path";

export const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
export const workbenchRoot = join(pluginRoot, "fusion-workbench");
export const WORKBENCH_PRESENT = existsSync(join(workbenchRoot, ".fusion-setup"));

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

// Store-prefixed (optionally Circle-/shared-/workbench-rooted) record citation.
const REC_RE = new RegExp(
  "(?:fusion-workbench\\/)?" +
    "(?:(circles\\/[0-9]{6}-[0-9]{4}-[a-z0-9-]+)\\/|(shared)\\/)?" +
    `(${STORES})\\/` +
    "([0-9]{6}-[0-9]{4})((?:_[a-zA-Z*]_)?[A-Za-z0-9._…*-]*)",  // `.` admits ASCII `...`
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

// Bare record citation — a marker is required, or every plain timestamp and
// Circle-directory name would fire.
const BARE_RE = /(?<![\/0-9A-Za-z_-])([0-9]{6}-[0-9]{4})((?:_[a-zA-Z*]_)[A-Za-z0-9._…*-]+)/g;

// Bare Circle-directory citation. A trailing `/` is allowed when nothing
// path-like follows (the conventions file's layout tree).
const CIRCLE_RE = /circles\/([0-9]{6}-[0-9]{4}-[a-z0-9-]+)(?:\/(?![A-Za-z0-9_.*<]))?(?![A-Za-z0-9_\/-])/g;

// A record stamp carrying no store prefix. Scanned last, and only where no
// citation token above already covers the position. Two shapes, and they are
// not the same question: `260812-2116-coder-<slug>` carries a name and is
// decidable by prefix, while `260812-2116` alone is the residual.
const STAMP_RE = /(?<![\/0-9A-Za-z_-])([0-9]{6}-[0-9]{4})((?:-[a-z0-9]+)*)(?![0-9])/g;

/** Files exempt from class (c) wholesale, with the reason. */
export const RECORD_EXAMPLE_FILES: Record<string, string> = {
  "rules/decision-record-examples.md":
    "the worked-example corpus — every record it walks is fabricated by design",
  "skills/migrate/SKILL.md":
    "demonstrates the pre-v4 -> v4 layout conversion on fabricated artifacts " +
    "(260519-0438-coderev-loader-check, 260101-0903-dup, plan-foo)",
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
 * `(e.g. \`en\`)` passed silently (issue 260806-1031, the swallow-a-real-defect
 * shape the gate's exemption-design note warns against).
 */
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

let wbIndex: WorkbenchEntry[] | null = null;
export function workbenchIndex(): WorkbenchEntry[] {
  if (wbIndex) return wbIndex;
  wbIndex = !WORKBENCH_PRESENT
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
 * file whose header calls itself a measuring instrument.
 *
 * THE ARCHIVE HALF IS NOT A NEW ANSWER. It is the shape the user chose for
 * `findRecord()` on 2026-08-19 (fix shape 1: one sweep, prefix-tolerant, the
 * loss of exactness stated rather than discovered), applied to the sibling
 * function that was left out of it — see `anchoredUnder` below, which states
 * the choice and the alternative in full, and
 * `circles/260819-1645-four-constraints-on-deep-change/issues/260819-2300_*_circledirs-did-not-learn-the-archive-prefix-that-findrecord-did-so-an-archived-circle-directory-stays-unexpressible.md`,
 * which is the record of the asymmetry this closes.
 *
 * THE COST IS THE SAME COST, paid here. Resolution becomes prefix-tolerant: a
 * line citing `circles/<dir>` and a line citing `archive/<sweep>/circles/<dir>`
 * produce the same token (`CIRCLE_RE` begins its match at `circles/`), so the
 * scanner cannot say which of the two was meant. Where both copies exist the
 * verdict is `ambiguous` and both paths are reported, exactly as the Circle-
 * RECORD form already does — one shape, not two. As there, that collision needs
 * a Circle re-created under an archived name, which the stable-directory-name
 * convention exists to prevent.
 *
 * The bound is `ARCHIVE_SWEEP_RE`'s: exactly one sweep level, never a general
 * prefix tolerance. The reason is written out at that pattern and holds here
 * unchanged — a resolver that cannot fail turns the gate built on it into one
 * that cannot go red.
 *
 * Memoised like `workbenchIndex()`, and for the same reason: both are read once
 * per token and the tree does not move under a run.
 */
let circleDirIndex: Map<string, string[]> | null = null;
export function circleDirs(): Map<string, string[]> {
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
      // `ARCHIVE_SWEEP_RE` is the same bound `anchoredUnder` holds, asked of a
      // directory name instead of a `relDir`: a sweep is `<YYMMDD-HHMM>-<slug>`
      // and anything else under `archive/` is not one.
      if (sweep.isDirectory() && ARCHIVE_SWEEP_RE.test(`archive/${sweep.name}/`)) {
        add(`archive/${sweep.name}/circles`);
      }
    }
  }
  circleDirIndex = dirs;
  return dirs;
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
 * One archive sweep directory, and the bound is the whole point of writing the
 * pattern out. `/fusion:archive` creates exactly one level — `mkdir -p
 * "$WORKBENCH/archive/<YYMMDD-HHMM>-<slug>/"` (`skills/archive/SKILL.md`) — and
 * moves whole subtrees beneath it with the store layout preserved. So a record
 * that has been archived once sits at `archive/<sweep>/shared/<store>/…`, at a
 * depth of exactly one sweep, never two. A looser pattern (`archive/.*\/`, or
 * any leading-prefix tolerance) would let an anchored citation match a file
 * ANYWHERE under the workbench, which does not make the resolver lenient about
 * archiving — it makes it a resolver that cannot fail, and turns the gate built
 * on it into one that cannot go red.
 */
const ARCHIVE_SWEEP_RE = /^archive\/[0-9]{6}-[0-9]{4}-[a-z0-9-]+\//;

/**
 * Does `relDir` sit at `prefix`, either at the workbench root or under one
 * archive sweep?
 *
 * THE COST, stated here because it is paid here. Resolution of the two anchored
 * branches becomes prefix-TOLERANT rather than exact: a citation whose line
 * spells the full `archive/<sweep>/shared/issues/…` path and a citation that
 * spells only `shared/issues/…` produce the same token (`REC_RE` begins its
 * match at the store prefix either way) and now reach the same record. The
 * scanner therefore cannot distinguish a citation OF an archived copy from a
 * citation of a live record that happens to share its basename, and it will
 * report the archived copy as the resolution of both.
 *
 * The alternative that was available and not taken is fix shape 2: teach
 * `REC_RE` an optional leading `archive/<sweep>/` segment, so the archive
 * prefix becomes part of the token and the resolution stays exact. That shape
 * can tell the two apart; it also invalidates every citation already written in
 * the archive-tolerant form. The user chose shape 1 at a gate on 2026-08-19,
 * with the loss of exactness stated rather than discovered later — see
 * `circles/260819-1645-four-constraints-on-deep-change/issues/260819-2213_*_the-citation-grammar-cannot-express-a-record-inside-archive-so-a-corrected-archive-path-still-scans-as-wrong-store.md`,
 * `## Where the fix belongs` and the answer appended at its foot.
 *
 * What this choice does NOT answer, and the record says so too: whether an
 * archived record should be a citation target at all. Tolerating the prefix
 * settles "can the grammar express it", not "should archiving end a record's
 * life as a target" — `skills/archive/SKILL.md` still neither says nor checks.
 *
 * THE SAME COST, ON THE CIRCLE-RECORD FORM (`anchoredAt`, added 2026-08-19).
 * `circles/<dir>/_c_circle.md` and `archive/<sweep>/circles/<dir>/_c_circle.md`
 * produce the identical token, so the scanner cannot say which of the two a
 * line meant, and a Circle present both live and archived under one directory
 * name resolves `ambiguous` rather than to either copy. That collision is
 * hypothetical today and not by luck: a sweep MOVES the directory, so the two
 * copies cannot coexist unless a Circle is later re-created under an archived
 * name — which the stable-directory-name convention exists to prevent.
 *
 * THE ASYMMETRY THIS CARRIED IS CLOSED. Until 2026-08-20 the Circle-record form
 * resolved under a sweep while a citation of the archived Circle DIRECTORY
 * still read `dangling`, because `circleDirs()` had not learned the prefix —
 * `circles/260819-1645-four-constraints-on-deep-change/issues/260819-2300_*_circledirs-did-not-learn-the-archive-prefix-that-findrecord-did-so-an-archived-circle-directory-stays-unexpressible.md`.
 * `circleDirs()` now applies this same choice, with this same cost, and states
 * both at its own definition.
 */
function anchoredUnder(relDir: string, prefix: string): boolean {
  return relDir.startsWith(prefix) || unsweep(relDir).startsWith(prefix);
}

/** `relDir` with one archive sweep taken off the front, if it carries one. */
function unsweep(relDir: string): string {
  const sweep = ARCHIVE_SWEEP_RE.exec(relDir);
  return sweep === null ? relDir : relDir.slice(sweep[0].length);
}

/**
 * The same one-sweep bound, asked as an EQUALITY rather than a prefix. A Circle
 * record sits directly in the Circle directory and in no store below it, so
 * `circles/<dir>` is the whole of its `relDir` — asking `startsWith` here would
 * also accept every record in every store inside that Circle, and would accept
 * a sibling Circle whose directory name merely begins with this one's.
 */
function anchoredAt(relDir: string, dir: string): boolean {
  return relDir === dir || unsweep(relDir) === dir;
}

function findRecord(opts: {
  circleDir?: string;
  shared?: boolean;
  store?: string;
  citedBase: string;
}): WorkbenchEntry[] {
  const re = basenameMatcher(opts.citedBase);
  return workbenchIndex().filter((e) => {
    if (!re.test(e.base)) return false;
    // A Circle citation with a store is a record inside the Circle; without
    // one it is the Circle's own record, which lives at the directory itself.
    if (opts.circleDir) {
      return opts.store
        ? anchoredUnder(e.relDir, `circles/${opts.circleDir}/${opts.store}`)
        : anchoredAt(e.relDir, `circles/${opts.circleDir}`);
    }
    if (opts.shared) return anchoredUnder(e.relDir, `shared/${opts.store}`);
    if (opts.store) return e.relDir.split("/").includes(opts.store);
    return true;
  });
}

// --- the per-token walk -----------------------------------------------------

export type CitationKind =
  /** the five the gate resolves */
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
 * `circles/260819-1645-four-constraints-on-deep-change/decisions/260819-2016_*_does-the-citation-gate-judge-the-stamp-name-class-which-scanrecordcitations-does-not-read.md`
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

export type CitationStatus =
  /** resolves to exactly one file (or one Circle directory) */
  | "resolved"
  /** resolves to more than one — the citation does not say which */
  | "ambiguous"
  /** the record exists, under a different marker */
  | "stale-marker"
  /** the record exists, in another store */
  | "wrong-store"
  /** nothing on disk matches */
  | "dangling"
  /** a parser exemption fired; the token was never resolved */
  | "exempt"
  /** no workbench to resolve against (fresh clone) */
  | "unresolved-no-workbench";

export interface CitationHit {
  file: string;
  line: number;
  token: string;
  kind: CitationKind;
  status: CitationStatus;
  /** what the token resolved to, workbench-relative */
  matches: string[];
  problem?: string;
  fix?: string;
  /** which exemption fired, when the status is `exempt` */
  reason?: string;
}

type Verdict = Pick<CitationHit, "status" | "matches" | "problem" | "fix">;

/**
 * Every citation token on the given lines, with what it resolves to. The
 * exemptions are the gate's, applied identically — a token they catch is
 * reported as `exempt` with the reason rather than dropped, so a corpus scan
 * can state how much of itself it did not judge.
 */
export function scanCitationTokens(
  rel: string,
  lines: { line: number; text: string }[],
): CitationHit[] {
  const hits: CitationHit[] = [];
  const fileExempt = rel in RECORD_EXAMPLE_FILES;
  const fenced = fencedContentLines(lines);

  for (let li = 0; li < lines.length; li++) {
    const { line, text } = lines[li];
    const blockquoted = /^\s*>/.test(text);
    const covered: [number, number][] = [];
    const consider = (idx: number, token: string, kind: CitationKind, check: () => Verdict) => {
      if (covered.some(([s, e]) => idx >= s && idx < e)) return;
      covered.push([idx, idx + token.length]);
      const before = text.slice(0, idx);
      const reason = fileExempt
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
                : isPlaceholder(token)
                  ? "placeholder"
                  : token.includes("foo")
                    ? "fabricated-name"
                    : // a `*` anywhere but the marker position is a glob, not a citation
                      /\*/.test(token.replace(/_\*_/g, ""))
                      ? "glob"
                      : null;
      if (reason) {
        hits.push({ file: rel, line, token, kind, status: "exempt", matches: [], reason });
        return;
      }
      if (!WORKBENCH_PRESENT) {
        hits.push({ file: rel, line, token, kind, status: "unresolved-no-workbench", matches: [] });
        return;
      }
      hits.push({ file: rel, line, token, kind, ...check() });
    };

    const found = (m: WorkbenchEntry[]): Verdict => ({
      status: m.length === 1 ? "resolved" : "ambiguous",
      matches: m.map(pathOf),
    });

    REC_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = REC_RE.exec(text)) !== null) {
      const [full, circleDir, shared, store, stamp, restRaw] = m;
      const rest = restRaw ?? "";
      const idx = m.index;
      const citedBase = stamp + rest;
      const circle = circleDir?.replace(/^circles\//, "");
      consider(idx, full, "record", () => {
        const hit = findRecord({ circleDir: circle, shared: shared === "shared", store, citedBase });
        if (hit.length > 0) return found(hit);
        // exact marker that resolves only under another marker = stale marker
        const markerM = rest.match(/^_([a-z])_/);
        if (markerM) {
          const wild = findRecord({
            circleDir: circle,
            shared: shared === "shared",
            store,
            citedBase: stamp + rest.replace(/^_[a-z]_/, "_*_"),
          });
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
        const anywhere = findRecord({ citedBase });
        if (anywhere.length > 0) {
          return {
            status: "wrong-store",
            matches: anywhere.map(pathOf),
            problem: `wrong store path: the record lives at ${anywhere[0].relDir}/${anywhere[0].base}`,
            fix: "correct the cited path to where the record actually is",
          };
        }
        return {
          status: "dangling",
          matches: [],
          problem: "no record in the workbench matches this citation",
          fix:
            "pull the citation's substance into the text and drop the dead path " +
            "(decision 260805-0709), or fix the citation",
        };
      });
    }

    // A Circle's own record. Three statuses, not four: there is no
    // `wrong-store` retry, because `_x_circle.md` carries no stamp and no slug,
    // so an unanchored lookup matches EVERY Circle's record and would report a
    // dozen "the record lives at" candidates for a directory name that is
    // simply wrong. "Which store is it in" is not a question this form can ask
    // — a Circle record is in no store — so the split is the anchored hit, the
    // stale marker, and nothing found.
    CIRCLE_REC_RE.lastIndex = 0;
    while ((m = CIRCLE_REC_RE.exec(text)) !== null) {
      const [full, dir, citedBase] = m;
      const idx = m.index;
      consider(idx, full, "circle-record", () => {
        const hit = findRecord({ circleDir: dir, citedBase });
        if (hit.length > 0) return found(hit);
        const markerM = citedBase.match(/^_([a-z])_/);
        if (markerM) {
          const wild = findRecord({
            circleDir: dir,
            citedBase: citedBase.replace(/^_[a-z]_/, "_*_"),
          });
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
          problem: "no Circle record in the workbench matches this citation",
          fix:
            "fix the Circle-directory name (it is stable for a Circle's whole life), " +
            "or cite the record at its archive path if the Circle was swept",
        };
      });
    }

    BARE_RE.lastIndex = 0;
    while ((m = BARE_RE.exec(text)) !== null) {
      const [full, stamp, rest] = m;
      const idx = m.index;
      consider(idx, full, "bare-record", () => {
        const hit = findRecord({ citedBase: stamp + rest });
        if (hit.length > 0) return found(hit);
        const markerM = rest.match(/^_([a-z])_/);
        if (markerM) {
          const wild = findRecord({ citedBase: stamp + rest.replace(/^_[a-z]_/, "_*_") });
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
      consider(idx, full, "circle-dir", () => {
        const at = circleDirs().get(dir);
        if (at) return { status: at.length === 1 ? "resolved" : "ambiguous", matches: at };
        return {
          status: "dangling",
          matches: [],
          problem:
            "no such Circle directory under fusion-workbench/circles/, " +
            "nor under an archive sweep",
          fix: "fix the Circle-directory name (the directory name is stable for a Circle's whole life)",
        };
      });
    }

    // Store-prefixless stamps, last: whatever no citation token above claimed.
    // Both shapes resolve by prefix against the whole index, which is all the
    // token supports — and the match COUNT is the answer, because a stamp that
    // names five artifacts names none of them.
    STAMP_RE.lastIndex = 0;
    while ((m = STAMP_RE.exec(text)) !== null) {
      const [full, stamp, dashed] = m;
      const idx = m.index;
      consider(idx, full, dashed ? "stamp-name" : "stamp-bare", () => {
        const at = dashed ? circleDirs().get(full) : undefined;
        if (at) return { status: at.length === 1 ? "resolved" : "ambiguous", matches: at };
        const named = workbenchIndex().filter((e) => e.base.startsWith(full));
        if (named.length === 0) {
          return {
            status: "dangling",
            matches: [],
            problem: dashed
              ? "no artifact and no Circle directory carries this name"
              : "no artifact in the workbench carries this timestamp",
            fix: "cite the record's full path, or drop the token",
          };
        }
        return {
          status: named.length === 1 ? "resolved" : "ambiguous",
          matches: named.map(pathOf),
          problem:
            named.length === 1
              ? undefined
              : `${named.length} artifacts share this stamp; the token names none of them`,
          fix: named.length === 1 ? undefined : "cite the record's full path",
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
export function scanRecordCitations(
  rel: string,
  lines: { line: number; text: string }[],
): { violations: Violation[]; resolved: number } {
  const violations: Violation[] = [];
  let resolved = 0;
  for (const h of scanCitationTokens(rel, lines)) {
    if (!GATE_KINDS.includes(h.kind)) continue;
    if (h.status === "resolved" || h.status === "ambiguous") resolved++;
    else if (h.status === "stale-marker" || h.status === "wrong-store" || h.status === "dangling") {
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

// --- the shipped prompt corpus, shared by the prompt-lint gates -------------

/** Every agent's name, read off the prompt directory rather than hard-coded. */
export function agentNames(): string[] {
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
export function shippedPrompts(exempt: Set<string> = new Set()): { rel: string; abs: string }[] {
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

export interface CorpusScan {
  root: string;
  files: number;
  hits: CitationHit[];
}

export function scanCorpus(root: string): CorpusScan {
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
    dangling: hits.filter(
      (h) =>
        !unjudged(h) &&
        !undecidable(h) &&
        (h.status === "stale-marker" || h.status === "wrong-store" || h.status === "dangling"),
    ),
    undecidable: hits.filter(undecidable),
    exempt: hits.filter(unjudged),
  };
}

// --- CLI --------------------------------------------------------------------

function tally<T extends string>(values: T[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function main(argv: string[]): void {
  const wanted = new Set(argv.filter((a) => a.startsWith("--")).map((a) => a.slice(2)));
  const root = resolve(argv.find((a) => !a.startsWith("--")) ?? workbenchRoot);

  const scan = scanCorpus(root);
  const p = partition(scan.hits);
  const judged = p.resolved.length + p.dangling.length + p.undecidable.length;

  console.log(`corpus=${root}`);
  console.log(`files=${scan.files} tokens=${scan.hits.length} judged=${judged}`);
  console.log(
    `resolved=${p.resolved.length} dangling=${p.dangling.length} ` +
      `undecidable=${p.undecidable.length} exempt=${p.exempt.length}`,
  );
  for (const [k, n] of tally(p.dangling.map((h) => `${h.kind}/${h.status}`))) {
    console.log(`dangling ${k}=${n}`);
  }
  for (const [k, n] of tally(p.undecidable.map((h) => `${h.kind}/${h.status}`))) {
    console.log(`undecidable ${k}=${n}`);
  }
  for (const [k, n] of tally(p.exempt.map((h) => h.reason ?? h.status))) {
    console.log(`exempt ${k}=${n}`);
  }
  if (wanted.has("by-area")) {
    const area = (h: CitationHit) => h.file.split("/").slice(0, 2).join("/");
    for (const [k, n] of tally(p.dangling.map(area))) console.log(`area ${k}=${n}`);
  }
  for (const list of ["resolved", "dangling", "undecidable", "exempt"] as const) {
    if (!wanted.has(list)) continue;
    console.log(`--- ${list}`);
    for (const h of p[list]) {
      const tail = h.status === "exempt" ? h.reason : h.matches.join(" ") || h.problem;
      console.log(`${h.file}:${h.line}\t${h.kind}\t${h.status}\t${h.token}\t${tail ?? ""}`);
    }
  }
}

const entry = process.argv[1] ? resolve(process.argv[1]) : "";
if (entry === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
