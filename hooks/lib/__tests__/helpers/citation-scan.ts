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
// THE GRAMMAR (unchanged from the gate that carried it):
//   `260806-0015_*_<slug>.md` and its store-, Circle- and `shared/`-prefixed
//   forms, plus bare Circle-directory citations `circles/<stamp>-<slug>`. The
//   wildcard `_*_` at the marker position matches any state marker; a citation
//   carrying an exact marker resolves exactly, and one whose record exists only
//   under a DIFFERENT marker is the stale-marker class. An ellipsis (`…`) is a
//   deliberate truncation and matches any infix. A citation not ending in `.md`
//   is a prefix.
//
// WHAT THIS FILE ADDS, and why it is here rather than in the gate: a fourth
// token class, the **bare timestamp**. `260722-1943` in running prose carries
// no store, no kind and no slug, so nothing on disk disambiguates it from the
// other artifacts written in that minute. The gate cannot judge it and does not
// try — `BARE_RE` requires a marker precisely so a plain stamp never fires. A
// measurement must still count them, because "how many citations in this
// corpus cannot be resolved by any mechanism" is a different question from
// "how many are wrong", and the residual belongs in the answer rather than in
// the silence around it. Bare timestamps are never violations and are never
// counted as resolved, so their presence changes nothing the gate sees.
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
    "([0-9]{6}-[0-9]{4})((?:_[a-zA-Z*]_)?[A-Za-z0-9._…*-]*)",
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

export function circleDirs(): Set<string> {
  const dirs = new Set<string>();
  const root = join(workbenchRoot, "circles");
  if (!existsSync(root)) return dirs;
  for (const e of readdirSync(root, { withFileTypes: true })) {
    if (e.isDirectory()) dirs.add(e.name);
  }
  return dirs;
}

const pathOf = (e: WorkbenchEntry) => (e.relDir ? `${e.relDir}/${e.base}` : e.base);

/**
 * A basename matcher from a cited basename: `_*_` matches any single-letter
 * marker, `…` matches any infix, and a citation that does not end in `.md` is
 * a prefix (truncated citations are everyday in the corpus).
 */
function basenameMatcher(cited: string): RegExp {
  const segs = cited.split("…").map((s) =>
    s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/_\\\*_/g, "_[a-z]_"),
  );
  const tail = cited.endsWith(".md") ? "$" : "";
  return new RegExp("^" + segs.join(".*") + tail);
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
    if (opts.circleDir) return e.relDir.startsWith(`circles/${opts.circleDir}/${opts.store}`);
    if (opts.shared) return e.relDir.startsWith(`shared/${opts.store}`);
    if (opts.store) return e.relDir.split("/").includes(opts.store);
    return true;
  });
}

// --- the per-token walk -----------------------------------------------------

export type CitationKind =
  /** the three the gate resolves */
  | "record"
  | "bare-record"
  | "circle-dir"
  /** a stamp plus a dashed name, no store prefix — decidable, gate does not read it */
  | "stamp-name"
  /** a stamp alone — the residual */
  | "stamp-bare";

/** The kinds the gate judges. Everything else is measurement-only. */
const GATE_KINDS: CitationKind[] = ["record", "bare-record", "circle-dir"];

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

  for (const { line, text } of lines) {
    const blockquoted = /^\s*>/.test(text);
    const covered: [number, number][] = [];
    const consider = (idx: number, token: string, kind: CitationKind, check: () => Verdict) => {
      if (covered.some(([s, e]) => idx >= s && idx < e)) return;
      covered.push([idx, idx + token.length]);
      const before = text.slice(0, idx);
      const reason = fileExempt
        ? "record-example-file"
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
        if (circleDirs().has(dir)) return { status: "resolved", matches: [`circles/${dir}`] };
        return {
          status: "dangling",
          matches: [],
          problem: "no such Circle directory under fusion-workbench/circles/",
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
        if (dashed && circleDirs().has(full)) {
          return { status: "resolved", matches: [`circles/${full}`] };
        }
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
