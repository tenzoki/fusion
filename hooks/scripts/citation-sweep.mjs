#!/usr/bin/env node
// ---------------------------------------------------------------------------
// citation-sweep — rewrite store-prefixed citations to the storeless form.
//
// One-shot rewriter, driven by the compiled grammar in `dist/lib/citation-scan.js`
// so the fixer and the checker share one tokeniser and no second detector
// exists (Circle `260828-2342-citation-form-drops-store-segment`, plan step 3).
//
// Usage:
//   node hooks/scripts/citation-sweep.mjs [--root <workbench-root>] [--write | --dry-run] [<path>...]
//
//   --root <dir>   the workbench to index and sweep; default: walk up from cwd
//                  to the directory holding `fusion-workbench/.fusion-setup`
//   --dry-run      the default: print the census and write nothing
//   --write        apply the rewrites
//   <path>...      files or directories to sweep BEYOND the workbench (the
//                  shipped text); a directory is walked for `*.md`, a file is
//                  taken as named whatever its extension
//
// What is rewritten, per token kind, and only where the scanner's status is
// not `exempt` (fenced code, blockquote lines, footer templates, announced
// illustrations, placeholders, fabricated names, globs, the example files):
//   record          -> `<stamp>_*_<slug>…`   the store segment is dropped and a
//                                            literal marker becomes `_*_`; a
//                                            token with no marker keeps its tail
//   circle-record   -> `<stamp>-<slug>`      the bare Circle-directory name
//   circle-dir      -> `<stamp>-<slug>`      the same
//   bare-record     -> `_*_` at the marker   only when the marker is literal
//   stamp-bare      -> the basename of the one artifact or directory it matches,
//                      only on a match count of exactly one; else left and listed
// Tokens are spliced right to left within a line, so earlier columns stay
// valid; nothing but the token span is touched. `.ts` files under
// `hooks/lib/__tests__` are never rewritten: their store-prefixed strings are
// fixtures the tests assert on.
//
// Output: one `<file>  rewrites=<n>` line per touched file, then the residual
// (ambiguous and unmatched bare stamps, `<file>:<line>  '<token>'  <status>`),
// then one summary line, `files=<n> rewrites=<n> residual=<n> record=<n>
// circle-record=<n> circle-dir=<n> bare-record=<n> stamp-bare=<n> mode=<dry-run|write>`,
// the per-kind figures being what the commit message that lands a sweep names.
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
  process.stderr.write(`citation-sweep: ${msg}\nusage: citation-sweep [--root <dir>] [--write|--dry-run] [<path>...]\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
let root = null;
let write = false;
const extra = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--root") {
    root = args[++i];
    if (root === undefined) usage("--root needs a directory");
  } else if (a === "--write") write = true;
  else if (a === "--dry-run") write = false;
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
const { createScanner, markdownFilesUnder } = await import(pathToFileURL(grammarPath).href);
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
    case "stamp-bare": {
      if (hit.matches.length !== 1) return null;
      const base = hit.matches[0].slice(hit.matches[0].lastIndexOf("/") + 1);
      return base.replace(/^([0-9]{6}-[0-9]{4})_[a-z]_/, "$1_*_");
    }
    default:
      return null;
  }
}

let touched = 0;
let rewrites = 0;
const byKind = { record: 0, "circle-record": 0, "circle-dir": 0, "bare-record": 0, "stamp-bare": 0 };
const residual = [];
const cwd = realpathSync(process.cwd());
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
      if (h.kind === "stamp-bare") residual.push(`${rel}:${h.line}  '${h.token}'  ${h.status}`);
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
for (const r of residual) process.stdout.write(`${r}\n`);
const kinds = Object.entries(byKind).map(([k, v]) => `${k}=${v}`).join(" ");
process.stdout.write(`files=${touched} rewrites=${rewrites} residual=${residual.length} ${kinds} mode=${write ? "write" : "dry-run"}\n`);
