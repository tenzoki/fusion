#!/usr/bin/env node
// ---------------------------------------------------------------------------
// citation-sweep — rewrite store-prefixed citations to the storeless form.
//
// One-shot rewriter, driven by the compiled grammar in `dist/lib/citation-scan.js`
// so the fixer and the checker share one tokeniser and no second detector
// exists (Circle `260828-2342-citation-form-drops-store-segment`, plan step 3).
//
// Usage:
//   node hooks/scripts/citation-sweep.mjs [--root <workbench-root>] [--write | --dry-run] [--repair] [<path>...]
//
//   --root <dir>   the workbench to index and sweep; default: walk up from cwd
//                  to the directory holding `fusion-workbench/.fusion-setup`
//   --dry-run      the default: print the census and write nothing
//   --write        apply the rewrites
//   --repair       the repair pass (below) instead of the sweep; combines with
//                  `--write` / `--dry-run` the same way
//   <path>...      files or directories to sweep BEYOND the workbench (the
//                  shipped text); a directory is walked for `*.md`, a file is
//                  taken as named whatever its extension
//
// What is rewritten, per token kind, and only where the scanner's status is
// not `exempt` (fenced code, blockquote lines, footer templates, announced
// illustrations, placeholders, fabricated names, globs, head fields, the
// example files):
//   record          -> `<stamp>_*_<slug>…`   the store segment is dropped and a
//                                            literal marker becomes `_*_`; a
//                                            token with no marker keeps its tail
//   circle-record   -> `<stamp>-<slug>`      the bare Circle-directory name
//   circle-dir      -> `<stamp>-<slug>`      the same
//   bare-record     -> `_*_` at the marker   only when the marker is literal; a
//                                            truncated citation (`<stamp>_o_`,
//                                            `<stamp>_d`) is one token and is
//                                            rewritten whole or left whole
//   stamp-bare      -> never rewritten; listed with its status
// A bare stamp WAS rewritten until 2026-08-29, into the basename of the one
// artifact it matched. That rule acted on the class the scanner's own
// `partition()` refuses to judge (a unique match is an accident of the
// minute), and it produced every corrupted token the v10.20.0 sweep left in
// this repository's workbench: 38 head fields (`**Date:**`, `**Datum:**`,
// `**Started:**`, `**Stamp:**`, `**Run:**`, `**Session:**`, `**Timestamp:**`)
// turned into self-citations, and every chained tail after `.md` the repair
// pass below counts (issues 260829-1346, 260829-1347, 260829-1333). The
// grammar now refuses the shapes that fed it (`STAMP_RE`'s trailing boundary,
// the `head-field` exemption, the truncated `bare-record`), and the rule is
// gone rather than bounded: with it, `--dry-run` over a swept tree could not
// reach `rewrites=0` while a terminal record kept a bare stamp on purpose.
// Tokens are spliced right to left within a line, so earlier columns stay
// valid; nothing but the token span is touched. `.ts` files under
// `hooks/lib/__tests__` are never rewritten: their store-prefixed strings are
// fixtures the tests assert on.
//
// Output: one `<file>  rewrites=<n>` line per touched file, then the residual
// (every bare stamp the scanner judged, in file order, `<file>:<line>
// '<token>'  <status>`; an exempt one is not listed), then one summary
// line, `files=<n> rewrites=<n> residual=<n> record=<n> circle-record=<n>
// circle-dir=<n> bare-record=<n> stamp-bare=<n> mode=<dry-run|write>`, the
// per-kind figures being what the commit message that lands a sweep names.
// `stamp-bare=` is always 0 since the rule went and is kept so the line's
// shape is stable.
//
// THE REPAIR PASS (`--repair`) undoes what the retired rule did, token by
// token and nothing else, over every file the sweep would read (`archive/`
// and terminal records included, because the damage reached them). Three
// classes, each keyed on the workbench index rather than on a diff, so the
// pass is runnable in any workbench the v10.20.0 sweep touched:
//   date-field   `**<Field>:** <basename>` where the basename names the record
//                itself (`<stamp>-<slug>.md` or `<stamp>_coder_<slug>.md`, the
//                two legacy history shapes) -> `**<Field>:** <stamp>`. A
//                self-naming date is the one thing that line can have been.
//   chained-tail `<basename>.md<tail>` where `<basename>.md` (with `_*_` read
//                as any letter) is in the index and `<tail>` is `_<x>`, `_<x>_`,
//                `_…<anything>`, `_<word>_<anything>`, `[<x>]-<slug>` or a
//                second `.md` -> `<basename>.md`. A line-anchor `:<n>` after
//                the tail survives. One shape is deliberately excluded: a tail
//                that is itself a complete filename with an extension other
//                than `.md` (`260811-0826_observations.txt`, once) was a
//                different file's name before the sweep and is restored to it.
//   doubled      the `_<word>_` case of `chained-tail`, counted apart so the
//                figure reconciles with the issue that named 6.
// Fenced and blockquoted lines are left alone (an exhibit of the fault is not
// an instance of it). Output: `<file>:<line>  '<from>' -> '<to>'  <class>` per
// token, then `files=<n> repairs=<n> date-field=<n> chained-tail=<n>
// doubled=<n> mode=<dry-run|write>`.
//
// Exit: 0 ran, 1 usage, 2 no workbench (no `.fusion-setup` at the root),
// 3 the compiled grammar is missing (run `npm run build` in hooks/).
// ---------------------------------------------------------------------------

import { existsSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HOOKS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// `FUSION_TEST_DIST` is the test run's private build (`scripts/run-tests.mjs`);
// outside a test run the shipped `dist/` is the only build there is.
const DIST = process.env.FUSION_TEST_DIST ? resolve(process.env.FUSION_TEST_DIST) : join(HOOKS_DIR, "dist");

function usage(msg) {
  process.stderr.write(`citation-sweep: ${msg}\nusage: citation-sweep [--root <dir>] [--write|--dry-run] [--repair] [<path>...]\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
let root = null;
let write = false;
let repair = false;
const extra = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--root") {
    root = args[++i];
    if (root === undefined) usage("--root needs a directory");
  } else if (a === "--write") write = true;
  else if (a === "--dry-run") write = false;
  else if (a === "--repair") repair = true;
  else if (a.startsWith("--")) usage(`unknown option ${a}`);
  else extra.push(a);
}

if (root === null) {
  let dir = process.cwd();
  for (;;) {
    if (existsSync(join(dir, "fusion-workbench", ".fusion-setup"))) {
      root = join(dir, "fusion-workbench");
      break;
    }
    const up = dirname(dir);
    if (up === dir) break;
    dir = up;
  }
}
if (root === null || !existsSync(join(root, ".fusion-setup"))) {
  process.stderr.write("citation-sweep: no workbench (no fusion-workbench/.fusion-setup above cwd; pass --root)\n");
  process.exit(2);
}
root = resolve(root);

const grammarPath = join(DIST, "lib", "citation-scan.js");
if (!existsSync(grammarPath)) {
  process.stderr.write(`citation-sweep: ${grammarPath} missing — run \`npm run build\` in hooks/\n`);
  process.exit(3);
}
const { createScanner, markdownFilesUnder, fencedContentLines, MARKER_SLOT } = await import(pathToFileURL(grammarPath).href);
const scanner = createScanner(root);

/** The files to sweep: every `.md` under the workbench, plus what was named. */
const files = markdownFilesUnder(root).map((f) => f.abs);
for (const p of extra) {
  const abs = resolve(p);
  if (!existsSync(abs)) usage(`${p} does not exist`);
  if (statSync(abs).isDirectory()) files.push(...markdownFilesUnder(abs).map((f) => f.abs));
  else files.push(abs);
}
const isTestFixture = (abs) => abs.endsWith(".ts") && abs.split(sep).join("/").includes("/lib/__tests__/");

/** The storeless spelling of one hit, or null when it is left as it stands. */
function rewriteOf(hit) {
  if (hit.status === "exempt" || hit.status === "unresolved-no-workbench") return null;
  const t = hit.token;
  switch (hit.kind) {
    case "record": {
      const m = /([0-9]{6}-[0-9]{4})((?:_[a-zA-Z*]_)?[^]*)$/.exec(t.slice(t.lastIndexOf("/") + 1));
      return m[1] + m[2].replace(/^_[a-z]_/, "_*_");
    }
    case "circle-record":
    case "circle-dir":
      return /circles\/([0-9]{6}-[0-9]{4}-[a-z0-9-]+)/.exec(t)[1];
    case "bare-record":
      return /^[0-9]{6}-[0-9]{4}_[a-z]_/.test(t) ? t.replace(/_[a-z]_/, "_*_") : null;
    default:
      return null;
  }
}

// --- the repair pass ---------------------------------------------------------

const STAMP = "[0-9]{6}-[0-9]{4}";
// `<basename>.md` then a tail; the basename's slug is the shortest run that
// lets a `.md` follow, so a doubled `<b>.md_coder_<b>.md` splits at the first.
const CHAINED_RE = new RegExp(
  `(?<![\\/0-9A-Za-z_-])(${STAMP}(?:${MARKER_SLOT})[A-Za-z0-9…-]*?\\.md)` +
    `(_[a-z*]_?(?![A-Za-z0-9])|_(?:[a-z]+_|…)[A-Za-z0-9._…-]*|_[a-z0-9-]+\\.[a-z]{2,4}|\\[[a-z]\\](?:-[a-z0-9-]+)?|\\.md)(?![A-Za-z0-9])`,
  "g",
);
// the two legacy history shapes, `<stamp>-<slug>.md` and `<stamp>_coder_<slug>.md`
const HEAD_FIELD_RE = new RegExp(`^(\\*\\*[^*\\n]+:\\*\\*\\s+)(${STAMP})((?:${MARKER_SLOT}|-)[a-z0-9-]+\\.md)\\s*$`);

/** The index entries whose basename the repaired citation names. */
function indexed(base) {
  const re = new RegExp("^" + base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/_\\\*_/g, "_[a-z]_") + "$");
  return scanner.workbenchIndex().filter((e) => re.test(e.base));
}

/** Every repair on one line: `[from, to, cls, col]`, right to left. */
function repairsOn(lineText, ownBase) {
  const out = [];
  const hf = HEAD_FIELD_RE.exec(lineText);
  if (hf && hf[2] + hf[3] === ownBase) {
    out.push([hf[2] + hf[3], hf[2], "date-field", hf[1].length]);
    return out;
  }
  CHAINED_RE.lastIndex = 0;
  let m;
  while ((m = CHAINED_RE.exec(lineText)) !== null) {
    const [full, base, tail] = m;
    if (indexed(base).length === 0) continue;
    // a tail that is a whole filename with its own extension names another file
    const ext = /^_([a-z0-9-]+\.[a-z]{2,4})$/.exec(tail);
    if (ext && ext[1].split(".").pop() !== "md") {
      out.push([full, base.slice(0, 11) + "_" + ext[1], "chained-tail", m.index]);
      continue;
    }
    out.push([full, base, /^_[a-z]{2,}_/.test(tail) ? "doubled" : "chained-tail", m.index]);
  }
  return out.reverse();
}

let touched = 0;
let rewrites = 0;
const byKind = { record: 0, "circle-record": 0, "circle-dir": 0, "bare-record": 0, "stamp-bare": 0 };
const residual = [];
const cwd = realpathSync(process.cwd());

if (repair) {
  const byClass = { "date-field": 0, "chained-tail": 0, doubled: 0 };
  let repairs = 0;
  for (const abs of files) {
    if (isTestFixture(abs)) continue;
    const rel = relative(cwd, realpathSync(abs)).split(sep).join("/");
    const ownBase = abs.slice(abs.lastIndexOf(sep) + 1);
    const lines = readFileSync(abs, "utf-8").split("\n").map((t, i) => ({ line: i + 1, text: t }));
    const fenced = fencedContentLines(lines);
    let n = 0;
    for (const l of lines) {
      if (fenced[l.line - 1] || /^\s*>/.test(l.text)) continue;
      for (const [from, to, cls, col] of repairsOn(l.text, ownBase)) {
        l.text = l.text.slice(0, col) + to + l.text.slice(col + from.length);
        process.stdout.write(`${rel}:${l.line}  '${from}' -> '${to}'  ${cls}\n`);
        byClass[cls]++;
        n++;
      }
    }
    if (n === 0) continue;
    touched++;
    repairs += n;
    if (write) writeFileSync(abs, lines.map((l) => l.text).join("\n"));
  }
  const classes = Object.entries(byClass).map(([k, v]) => `${k}=${v}`).join(" ");
  process.stdout.write(`files=${touched} repairs=${repairs} ${classes} mode=${write ? "write" : "dry-run"}\n`);
  process.exit(0);
}

for (const abs of files) {
  if (isTestFixture(abs)) continue;
  const rel = relative(cwd, realpathSync(abs)).split(sep).join("/");
  const text = readFileSync(abs, "utf-8");
  const lines = text.split("\n").map((t, i) => ({ line: i + 1, text: t }));
  const hits = scanner.scanCitationTokens(rel, lines);
  let n = 0;
  // right to left within a line, so each splice leaves the earlier columns valid
  for (const h of [...hits].sort((a, b) => b.line - a.line || b.col - a.col)) {
    const to = rewriteOf(h);
    if (to === null) {
      if (h.kind === "stamp-bare" && h.status !== "exempt") residual.push([h.line, h.col, `${rel}:${h.line}  '${h.token}'  ${h.status}`]);
      continue;
    }
    if (to === h.token) continue;
    const l = lines[h.line - 1];
    l.text = l.text.slice(0, h.col) + to + l.text.slice(h.col + h.token.length);
    n++;
    byKind[h.kind]++;
  }
  if (n === 0) continue;
  touched++;
  rewrites += n;
  process.stdout.write(`${rel}  rewrites=${n}\n`);
  if (write) writeFileSync(abs, lines.map((l) => l.text).join("\n"));
}
for (const [, , r] of residual.sort((a, b) => a[0] - b[0] || a[1] - b[1])) process.stdout.write(`${r}\n`);
const kinds = Object.entries(byKind).map(([k, v]) => `${k}=${v}`).join(" ");
process.stdout.write(`files=${touched} rewrites=${rewrites} residual=${residual.length} ${kinds} mode=${write ? "write" : "dry-run"}\n`);
