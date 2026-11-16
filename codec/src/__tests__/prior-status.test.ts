// ---------------------------------------------------------------------------
// The drift test between `fixtures/prior/STATUS.md` and the request files.
//
// Decision `261115-2310-how-does-the-prior-request-log-stop-growing-once-
// request-82-is-answered.md`, question 7, ruled 2026-11-16: each STATUS.md row
// is checked against the heading that settles it. From request 83 on that is
// the newest `Prior's answer to` heading in the request's own file under
// `requests/`; for rows 1 to 82 it is the cited heading in the frozen
// `REQUESTS.md`, checked wherever that can be done mechanically.
//
// What is checked, in order:
//   1. STATUS.md has exactly one table, with the seven ruled columns, request
//      numbers from 1 with no gap and no duplicate, and every State one term
//      of the vocabulary the head lists (parsed from it, plus `asked`).
//   2. Rows 1 to 82: the cited heading occurs exactly once in REQUESTS.md as
//      a whole line. Where it is an answer heading, also (a) it names the
//      row's number, (b) its `at <hex>` is cited by the row, in the Prior
//      commit cell or the Note, and (c) no later answer heading names the
//      same number.
//
// What (b) means, ruled by the user on 2026-11-16: the Prior commit cell
// names the commit at which the request's state was reached, and a heading's
// `at <hex>` names the commit of the answer document. Both are facts and may
// differ (72 and 73: work at `01cf2fd` and `d372bc0`, answered at `3c29dcf`;
// 81: answered at `bd3c1bf`, question 1's pin at `bf6bb42`). So (b) does not
// ask them to be equal; it asks that the heading's commit appear in the row,
// as a whole token in the Prior commit cell or the Note.
//   3. Rows 83 on: `checkRequestFileRows`, exercised on in-memory fixtures and
//      then on the real tree, where the number of rows it checked is in the
//      test's title so a zero is visible.
//   4. A follow-up file `requests/082-*.md`, if one exists, is named by row
//      82 (decision `261116-1234-where-does-priors-hook-replay-follow-up-on-
//      request-82-go-now-that-the-log-is-frozen.md`).
//
// Neither file is written here: STATUS.md is maintained by hand, REQUESTS.md
// is frozen. A red here names the row and the heading; the fix is in the cell.
// ---------------------------------------------------------------------------

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const PRIOR_DIR = fileURLToPath(new URL("../../fixtures/prior/", import.meta.url));
const REQUESTS_DIR = join(PRIOR_DIR, "requests");
const COLUMNS = ["Request", "State", "Prior commit", "Bundle", "File", "Heading", "Note"];
const FROZEN_FILE = "REQUESTS.md";
const LAST_FROZEN_REQUEST = 82;
const ANSWER_HEADING = /^#{2,4} Prior's answer to /;
const REQUEST_FILE = /^requests\/(\d{3})-[^/]+\.md$/;

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

interface StatusRow {
  request: number;
  state: string;
  priorCommit: string;
  bundle: string;
  file: string;
  /** The Heading cell unwrapped from its code span; the raw cell if it is none. */
  heading: string;
  headingIsCodeSpan: boolean;
  note: string;
}

function lines(text: string): string[] {
  return text.split("\n").map((l) => l.replace(/\r$/, ""));
}

/** Split a table line into cells on `|`, never inside a code span. */
function splitCells(line: string): string[] {
  const inner = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let cell = "";
  let i = 0;
  while (i < inner.length) {
    const ch = inner[i]!;
    if (ch === "`") {
      let run = 0;
      while (inner[i + run] === "`") run++;
      const fence = "`".repeat(run);
      let close = inner.indexOf(fence, i + run);
      // A closing run must be exactly as long as the opening one.
      while (close !== -1 && inner[close + run] === "`") close = inner.indexOf(fence, close + run + 1);
      if (close === -1) {
        cell += fence;
        i += run;
        continue;
      }
      cell += inner.slice(i, close + run);
      i = close + run;
      continue;
    }
    if (ch === "|") {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += ch;
    }
    i++;
  }
  cells.push(cell.trim());
  return cells;
}

/**
 * Unwrap a cell that is one code span. Single backticks hold the text as is.
 * Double backticks are used where the heading itself carries a backtick, and
 * there one padding space is dropped on each side independently: STATUS.md
 * writes ``### Prior's answer at `7758bfa` `` with a space before the closing
 * fence only, which strict CommonMark would keep as a trailing space the
 * heading in REQUESTS.md does not have.
 */
function unwrapCodeSpan(cell: string): string | undefined {
  const m = /^(`+)([\s\S]*?)\1$/.exec(cell);
  if (!m) return undefined;
  const fence = m[1]!;
  let body = m[2]!;
  if (fence.length === 1) return body.includes("`") ? undefined : body;
  if (body.startsWith(" ")) body = body.slice(1);
  if (body.endsWith(" ")) body = body.slice(0, -1);
  return body;
}

function stripTicks(cell: string): string {
  return unwrapCodeSpan(cell) ?? cell;
}

/** Every block of consecutive `|` lines, as arrays of lines. */
function tableBlocks(text: string): string[][] {
  const blocks: string[][] = [];
  let current: string[] | undefined;
  for (const l of lines(text)) {
    if (l.trimStart().startsWith("|")) {
      if (!current) blocks.push((current = []));
      current.push(l);
    } else {
      current = undefined;
    }
  }
  return blocks;
}

function parseRows(table: string[]): StatusRow[] {
  return table.slice(2).map((line) => {
    const c = splitCells(line);
    if (c.length !== COLUMNS.length) throw new Error(`STATUS.md row "${line.slice(0, 60)}…" has ${c.length} cells, not ${COLUMNS.length}`);
    const unwrapped = unwrapCodeSpan(c[5]!);
    return {
      request: Number(c[0]),
      state: c[1]!,
      priorCommit: stripTicks(c[2]!),
      bundle: stripTicks(c[3]!),
      file: stripTicks(c[4]!),
      heading: unwrapped ?? c[5]!,
      headingIsCodeSpan: unwrapped !== undefined,
      note: c[6]!,
    };
  });
}

/** The state terms the head's `**State vocabulary**` paragraph lists, plus `asked`. */
function parseVocabulary(text: string): string[] {
  const para = lines(text).find((l) => l.startsWith("**State vocabulary**"));
  if (para === undefined) throw new Error("STATUS.md has no **State vocabulary** paragraph");
  // The list runs from the first ": " to the end of that sentence; the
  // paragraph's other code spans (`REQUESTS.md`, `asked`) sit outside it.
  const afterColon = para.slice(para.indexOf(": ") + 2);
  const list = afterColon.slice(0, afterColon.search(/\.(\s|$)/));
  const terms = [...list.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
  return [...terms, "asked"];
}

/** The request numbers an answer heading names: `63 and 64`, `75(b)`, `question 1 of 81`. */
function namedRequests(heading: string): number[] {
  let subject = heading.replace(ANSWER_HEADING, "").replace(/question \d+ of /g, "");
  const cut = subject.search(/,| at /);
  if (cut !== -1) subject = subject.slice(0, cut);
  return [...subject.matchAll(/\d+/g)].map((m) => Number(m[0]));
}

/** The Prior commit an answer heading carries as `at <hex>`, if any. */
function headingCommit(heading: string): string | undefined {
  return /(?:^|\s)at `?([0-9a-f]{7,40})`?(?=$|[\s,;:)])/.exec(heading)?.[1];
}

/**
 * Check (b): the row cites the heading's commit, backticked or bare, as a whole
 * token in its Prior commit cell or its Note — never as part of a longer hex.
 */
function rowCitesCommit(row: StatusRow, hex: string): boolean {
  const token = new RegExp(`(?<![0-9A-Za-z])${hex}(?![0-9A-Za-z])`);
  return token.test(row.priorCommit) || token.test(row.note);
}

function commitFailure(row: StatusRow, hex: string): string {
  return `${rowLabel(row)}: (b) the heading is at ${hex}, which neither the Prior commit cell (${row.priorCommit}) nor the Note names`;
}

function countWholeLine(fileLines: string[], heading: string): number {
  return fileLines.filter((l) => l === heading).length;
}

function rowLabel(row: StatusRow): string {
  return `row ${row.request}, heading \`${row.heading}\``;
}

// ---------------------------------------------------------------------------
// Rows from 83 on, against their request files
// ---------------------------------------------------------------------------

interface RequestFiles {
  /** File names directly under `requests/`. */
  names: string[];
  read(name: string): string;
}

/**
 * Check every row from 83 on against its file under `requests/`. Returns the
 * failures, each naming the row and its heading, and how many rows it checked.
 */
function checkRequestFileRows(rows: StatusRow[], files: RequestFiles): { checked: number; failures: string[] } {
  const failures: string[] = [];
  let checked = 0;
  for (const row of rows) {
    if (row.request <= LAST_FROZEN_REQUEST) continue;
    checked++;
    const label = rowLabel(row);
    const m = REQUEST_FILE.exec(row.file);
    if (!m) {
      failures.push(`${label}: File \`${row.file}\` is not requests/NNN-<slug>.md`);
      continue;
    }
    const expected = String(row.request).padStart(3, "0");
    if (m[1] !== expected) failures.push(`${label}: File \`${row.file}\` is numbered ${m[1]}, not ${expected}`);
    const name = row.file.slice("requests/".length);
    if (!files.names.includes(name)) {
      failures.push(`${label}: File \`${row.file}\` does not exist`);
      continue;
    }
    const fileLines = lines(files.read(name));
    const count = countWholeLine(fileLines, row.heading);
    if (count !== 1) failures.push(`${label}: occurs ${count} times as a whole line in ${row.file}, not once`);
    const answers = fileLines.filter((l) => ANSWER_HEADING.test(l));
    const newest = answers[answers.length - 1];
    if (row.state === "asked") {
      if (newest !== undefined) failures.push(`${label}: state is asked but ${row.file} already has \`${newest}\`; the row is stale`);
      continue;
    }
    if (newest === undefined) {
      failures.push(`${label}: state is ${row.state} but ${row.file} has no answer heading`);
      continue;
    }
    if (row.heading !== newest) failures.push(`${label}: not the newest answer heading in ${row.file}, which is \`${newest}\``);
    if (!namedRequests(row.heading).includes(row.request)) failures.push(`${label}: the heading does not name request ${row.request}`);
    const hex = headingCommit(row.heading);
    if (hex !== undefined && !rowCitesCommit(row, hex)) failures.push(commitFailure(row, hex));
  }
  return { checked, failures };
}

// ---------------------------------------------------------------------------
// The real tree, read once
// ---------------------------------------------------------------------------

const statusText = readFileSync(join(PRIOR_DIR, "STATUS.md"), "utf8");
const frozenLines = lines(readFileSync(join(PRIOR_DIR, FROZEN_FILE), "utf8"));
const tables = tableBlocks(statusText);
const rows = tables.length === 1 ? parseRows(tables[0]!) : [];
const frozenRows = rows.filter((r) => r.request <= LAST_FROZEN_REQUEST);
const answerRows = frozenRows.filter((r) => ANSWER_HEADING.test(r.heading));
const existsOnlyRows = frozenRows.filter((r) => !ANSWER_HEADING.test(r.heading));
const laterRows = rows.filter((r) => r.request > LAST_FROZEN_REQUEST);
const requestFileNames = existsSync(REQUESTS_DIR) ? readdirSync(REQUESTS_DIR) : [];
const realFiles: RequestFiles = {
  names: requestFileNames,
  read: (name) => readFileSync(join(REQUESTS_DIR, name), "utf8"),
};

describe("STATUS.md table shape", () => {
  it("has exactly one table, with the ruled columns", () => {
    expect(tables.length, "number of tables in STATUS.md").toBe(1);
    expect(splitCells(tables[0]![0]!)).toEqual(COLUMNS);
  });

  it("numbers its requests from 1 with no gap and no duplicate", () => {
    const numbers = rows.map((r) => r.request);
    expect(numbers.length).toBeGreaterThan(0);
    expect(numbers, "request numbers in table order").toEqual(numbers.map((_, i) => i + 1));
  });

  it("gives every row a State from the head's vocabulary", () => {
    const vocabulary = parseVocabulary(statusText);
    expect(vocabulary.length).toBeGreaterThan(1);
    const failures = rows.filter((r) => !vocabulary.includes(r.state)).map((r) => `${rowLabel(r)}: state "${r.state}" is not in the vocabulary`);
    expect(failures).toEqual([]);
  });
});

describe("rows 1 to 82 against the frozen REQUESTS.md", () => {
  it("gives each row File = REQUESTS.md and a Heading in a code span", () => {
    const failures = frozenRows.flatMap((r) => [
      ...(r.file === FROZEN_FILE ? [] : [`${rowLabel(r)}: File is \`${r.file}\`, not ${FROZEN_FILE}`]),
      ...(r.headingIsCodeSpan ? [] : [`${rowLabel(r)}: the Heading cell is not a code span`]),
    ]);
    expect(failures).toEqual([]);
  });

  // The measured limit (decision 261115-2310, question 7, at 535fefe5): the
  // frozen log has a uniform answer heading only from request 62 on. For a row
  // citing any other heading — rows 1 to 61, 66 and 78 — the heading settles a
  // request without naming it or a Prior commit, so only its exact-once
  // existence is checkable, not that the state matches it.
  it(`${existsOnlyRows.length} rows: the cited heading occurs exactly once as a whole line`, () => {
    const failures = frozenRows
      .map((r) => [r, countWholeLine(frozenLines, r.heading)] as const)
      .filter(([, n]) => n !== 1)
      .map(([r, n]) => `${rowLabel(r)}: occurs ${n} times as a whole line in ${FROZEN_FILE}, not once`);
    expect(failures).toEqual([]);
  });

  it(`${answerRows.length} answer-heading rows: (a) the heading names the row, (b) the row cites its commit, (c) no later answer names the row`, () => {
    const failures: string[] = [];
    for (const r of answerRows) {
      const label = rowLabel(r);
      if (!namedRequests(r.heading).includes(r.request)) failures.push(`${label}: (a) the heading does not name request ${r.request}`);
      const hex = headingCommit(r.heading);
      if (hex !== undefined && !rowCitesCommit(r, hex)) failures.push(commitFailure(r, hex));
      const at = frozenLines.indexOf(r.heading);
      if (at === -1) continue; // reported by the exact-once check
      const later = frozenLines.slice(at + 1).filter((l) => ANSWER_HEADING.test(l) && namedRequests(l).includes(r.request));
      for (const l of later) failures.push(`${label}: (c) a later answer heading names request ${r.request}: \`${l}\``);
    }
    expect(failures).toEqual([]);
  });
});

describe("rows from 83 on against requests/NNN-<slug>.md", () => {
  const row = (request: number, state: string, priorCommit: string, file: string, heading: string, note = ""): StatusRow => ({
    request,
    state,
    priorCommit,
    bundle: "—",
    file,
    heading,
    headingIsCodeSpan: true,
    note,
  });
  const memory = (files: Record<string, string>): RequestFiles => ({
    names: Object.keys(files),
    read: (name) => files[name]!,
  });
  const FILE = "requests/083-example.md";
  const TOP = "# Request 83: an example";
  const OLDER = "### Prior's answer to 83 at abc1234";
  const NEWER = "### Prior's answer to 83 at def5678";

  it("passes an answered row citing the newest answer heading at its commit", () => {
    const files = memory({ "083-example.md": [TOP, "", "text", OLDER, "", "text"].join("\n") });
    expect(checkRequestFileRows([row(83, "answered", "abc1234", FILE, OLDER)], files)).toEqual({ checked: 1, failures: [] });
  });

  it("fails an answered row citing an older answer heading", () => {
    const files = memory({ "083-example.md": [TOP, OLDER, NEWER].join("\n") });
    const { failures } = checkRequestFileRows([row(83, "corrected", "abc1234", FILE, OLDER)], files);
    expect(failures).toEqual([`row 83, heading \`${OLDER}\`: not the newest answer heading in ${FILE}, which is \`${NEWER}\``]);
  });

  it("fails an asked row whose file already has an answer heading", () => {
    const files = memory({ "083-example.md": [TOP, OLDER].join("\n") });
    const { failures } = checkRequestFileRows([row(83, "asked", "—", FILE, TOP)], files);
    expect(failures).toEqual([`row 83, heading \`${TOP}\`: state is asked but ${FILE} already has \`${OLDER}\`; the row is stale`]);
  });

  it("passes an asked row citing its top heading with no answer yet", () => {
    const files = memory({ "083-example.md": [TOP, "", "the request"].join("\n") });
    expect(checkRequestFileRows([row(83, "asked", "—", FILE, TOP)], files)).toEqual({ checked: 1, failures: [] });
  });

  it("fails an answered row that names the heading's commit in neither its Prior commit cell nor its Note", () => {
    const files = memory({ "083-example.md": [TOP, NEWER].join("\n") });
    // `def5678a` is a longer hex, not the token `def5678`.
    const { failures } = checkRequestFileRows([row(83, "answered", "abc1234", FILE, NEWER, "pinned at `def5678a`")], files);
    expect(failures).toEqual([`row 83, heading \`${NEWER}\`: (b) the heading is at def5678, which neither the Prior commit cell (abc1234) nor the Note names`]);
  });

  it("passes an answered row that names the heading's commit only in its Note", () => {
    const files = memory({ "083-example.md": [TOP, NEWER].join("\n") });
    const result = checkRequestFileRows([row(83, "answered", "abc1234", FILE, NEWER, "work at `abc1234`, answered at `def5678`")], files);
    expect(result).toEqual({ checked: 1, failures: [] });
  });

  it("fails a row whose file is missing or misnumbered", () => {
    const files = memory({ "084-other.md": TOP });
    const { failures } = checkRequestFileRows([row(83, "asked", "—", "requests/084-other.md", TOP), row(85, "asked", "—", FILE, TOP)], files);
    expect(failures).toEqual([
      `row 83, heading \`${TOP}\`: File \`requests/084-other.md\` is numbered 084, not 083`,
      `row 85, heading \`${TOP}\`: File \`${FILE}\` is numbered 083, not 085`,
      `row 85, heading \`${TOP}\`: File \`${FILE}\` does not exist`,
    ]);
  });

  it(`checks ${laterRows.length} rows of the real STATUS.md from 83 on`, () => {
    const result = checkRequestFileRows(rows, realFiles);
    expect(result.failures).toEqual([]);
    expect(result.checked, "rows from 83 on checked against requests/").toBe(laterRows.length);
  });
});

describe("the follow-up file for request 82", () => {
  const followUps = requestFileNames.filter((n) => n.startsWith("082-") && n.endsWith(".md"));

  it(`row 82 names each of the ${followUps.length} requests/082-*.md files`, () => {
    const row82 = rows.find((r) => r.request === LAST_FROZEN_REQUEST);
    expect(row82, "row 82 in STATUS.md").toBeDefined();
    const failures = followUps
      .filter((n) => !`${row82!.note} ${row82!.heading}`.includes(`requests/${n}`))
      .map((n) => `${rowLabel(row82!)}: neither Note nor Heading names requests/${n}`);
    expect(failures).toEqual([]);
  });
});
