import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  pluginRoot,
  WORKBENCH_PRESENT,
  isPlaceholder,
  report,
  scanRecordCitations,
  workbenchIndex,
  circleDirs,
  GATE_KINDS,
  RECORD_EXAMPLE_FILES,
  scanCitationTokens,
  markdownFilesUnder,
  partition,
  fencedContentLines,
  type Violation,
  type CitationKind,
} from "./helpers/citation-scan.js";

// ---------------------------------------------------------------------------
// Reference-resolution lint gate (Circle 260805-2005-textschicht-gegen-code-
// nachziehen, plan step 14 — the review's "cheapest structural investment").
//
// The plugin's shipped text surfaces cite four kinds of targets, and all four
// have gone stale in measured numbers. This gate resolves every reference it
// can read mechanically and fails on a dangling one:
//
//   (a) plugin-file paths — `rules/<name>.md`, `agents/<name>.md`,
//       `hooks/lib/<name>.ts`, the bare `lib/<name>.ts` spelling (how the hook
//       modules are imported; resolves against `hooks/`, `resolveToken`),
//       `bin/<name>`, … — checked for existence against the repo tree. A
//       `$VAR/<path>` spelling is checked with the variable stripped PROVIDED
//       the variable is declared in ROOT_VARS as naming the plugin tree; an
//       undeclared variable in front of a plugin-shaped path FAILS rather than
//       being skipped. A `./rules/...` spelling is the CONSUMING project's rule
//       directory by convention and is never checked here. `path:N` in backticks
//       is REFUSED: a line number is not a pointer in living text (issue 260906-0335).
//   (b) section-heading anchors in the adjacent form `` `file.md` `## Section` ``
//       — the cited heading must exist in the cited file (prefix match; heading
//       LEVEL is not compared). A bare `## X` with no file on the line is
//       ambiguous between "see section X" and "write a section named X", so it
//       is out of scope by design. A citation WRAPPED at a line break (file token
//       ending one line, heading opening the next) is read joined (issue 260911-0752).
//   (c) workbench-record citations — `260806-0015_*_<slug>.md` and its
//       store-/Circle-/`shared/`-prefixed forms, plus bare Circle-directory
//       citations. The grammar is decision D1's wildcard form (the `*` at the
//       marker position matches any state marker); a citation carrying an exact
//       marker whose record exists only under a DIFFERENT marker is the stale-
//       marker class, and the failure says to rewrite the position to `_*_`.
//       The parser lives in `./helpers/citation-scan.ts`, because a second
//       caller runs the same grammar over the workbench itself
//       (`workbench-citation-lint.test.ts`); its header carries the grammar.
//   (d) slash commands — `/fusion:<name>` must name `skills/<name>/SKILL.md` or a RETIRED_COMMANDS key (issue 260916-2145); existence only, no count.
//
// THE WORKBENCH BOUND: class (c) resolves against THIS repo's own
// `fusion-workbench/` tree, because the records the shipped texts cite are
// fusion's own development records and a consuming project never runs this
// suite. Absent the workbench, class (c) degrades to syntax-only and a describe
// block below records the degradation instead of passing silently.
//
// Exemptions are by PATTERN first (an allowlist swallows real defects): a token
// carrying placeholder syntax is a template, not a reference; a class-(c)
// token on a blockquote line sits in a worked example; one following `e.g.`
// within the SAME clause is an announced illustration (the clause, not the
// line, is the bound — issue 260806-1031); a slug containing `foo` is
// fabricated; `rules/decision-record-examples.md` is exempt wholesale. What
// remains is the enumerated EXAMPLE_PATHS list for class (a), with a reason per
// entry and a guard test asserting none of them exists in the tree.
//
// This is a guard, not a fixer (rules/critical-stance.md §2): it reads and
// asserts, it never rewrites a text.
// ---------------------------------------------------------------------------

// --- the scanned surface ---------------------------------------------------

interface SurfaceFile {
  rel: string;
  abs: string;
  /** when set, only lines matching it are scanned — bin scripts and install.sh
   *  (`# …`), hooks/lib TS sources (`// …`, `/* …`, `* …`). Absent: all lines. */
  commentRe?: RegExp;
  /** true: only class (c) record citations are scanned. hooks/lib comments are
   *  classifier documentation, dense with fabricated path operands that class
   *  (a) would each need an EXAMPLE_PATHS entry for; record citations are the
   *  class that measurably rots there (issue 260805-1839). */
  recordsOnly?: boolean;
}

const SH_COMMENT_RE = /^\s*#/;
const TS_COMMENT_RE = /^\s*(?:\/\/|\/\*|\*)/;

/** `markdownFilesUnder`, with `rel` re-anchored on the plugin root. */
function mdFilesUnder(dir: string): SurfaceFile[] {
  return markdownFilesUnder(join(pluginRoot, dir)).map((f) => ({ ...f, rel: `${dir}/${f.rel}` }));
}

function surface(): SurfaceFile[] {
  const files: SurfaceFile[] = [
    ...mdFilesUnder("rules"),
    ...mdFilesUnder("agents"),
    ...mdFilesUnder("docs"),
    ...mdFilesUnder("templates"),
  ];
  for (const d of readdirSync(join(pluginRoot, "skills"))) {
    const abs = join(pluginRoot, "skills", d, "SKILL.md");
    if (existsSync(abs)) files.push({ rel: `skills/${d}/SKILL.md`, abs });
  }
  for (const f of readdirSync(pluginRoot)) {
    if (/^README.*\.md$/.test(f) || f === "CLAUDE.md") {
      files.push({ rel: f, abs: join(pluginRoot, f) });
    }
  }
  // bin header comments + install.sh comments — shell scripts only (bin/monitor
  // is a compiled binary; a script is recognised by its shebang).
  for (const f of readdirSync(join(pluginRoot, "bin"))) {
    const abs = join(pluginRoot, "bin", f);
    if (!statSync(abs).isFile()) continue;
    const head = readFileSync(abs).subarray(0, 2).toString("utf-8");
    if (head === "#!") files.push({ rel: `bin/${f}`, abs, commentRe: SH_COMMENT_RE });
  }
  const inst = join(pluginRoot, "install.sh");
  if (existsSync(inst)) files.push({ rel: "install.sh", abs: inst, commentRe: SH_COMMENT_RE });
  // hooks/lib TS sources, comment lines only, class (c) only (see the
  // recordsOnly doc above). The module docstrings cite the decision records
  // that shaped the guard, and those citations rot exactly like the markdown
  // surface's. Code lines stay out of scope: string literals there are
  // classifier inputs and deny-reason text, not references.
  for (const f of readdirSync(join(pluginRoot, "hooks", "lib"))) {
    const abs = join(pluginRoot, "hooks", "lib", f);
    if (!statSync(abs).isFile() || !f.endsWith(".ts")) continue;
    files.push({ rel: `hooks/lib/${f}`, abs, commentRe: TS_COMMENT_RE, recordsOnly: true });
  }
  // The hook and CLI entrypoints one directory up, on the same terms. The
  // reasoning just above applies verbatim here and was not carried across until
  // 2026-08-16: `hooks/review-coverage.ts:52` cited a record that had moved to
  // `_d_` before the session that found it by hand, and the gate was green
  // because `surface()` stopped at `hooks/lib` (issue 260811-1755).
  for (const f of readdirSync(join(pluginRoot, "hooks"))) {
    const abs = join(pluginRoot, "hooks", f);
    if (!statSync(abs).isFile() || !f.endsWith(".ts")) continue;
    files.push({ rel: `hooks/${f}`, abs, commentRe: TS_COMMENT_RE, recordsOnly: true });
  }
  return files;
}

/** The lines of a file this gate reads: all lines, or comment lines only. */
function scannedLines(f: SurfaceFile): { line: number; text: string }[] {
  const out: { line: number; text: string }[] = [];
  readFileSync(f.abs, "utf-8")
    .split("\n")
    .forEach((raw, i) => {
      if (f.commentRe && !f.commentRe.test(raw)) return;
      out.push({ line: i + 1, text: raw });
    });
  return out;
}

// `Violation`, `report()` and `isPlaceholder()` are shared with class (c) and
// are imported from its helper above, so the three classes cannot drift apart
// on what a finding looks like.

// --- class (a): plugin-file paths ------------------------------------------

// The guard documentation's fabricated command operands, plus two documented
// oddities. Every entry carries its reason, and a test below asserts that no
// entry exists in the tree — which is what keeps this list unable to swallow a
// reference to a real file.
// An entry leaves with its last citation, which the "no dead weight" test below
// catches: `rules/x.md`, `rules/old.md`, `rules/retired/old.md` went on 2026-08-12
// with the protected-path half, `rules/relevant-file.md` on 2026-08-16 with the
// decision-governed check whose README-hooks example it was.
const EXAMPLE_PATHS: Record<string, string> = {
  // Renamed at v12.0.0; a pre-v12 upgrade note, which is history, cites each.
  ...Object.fromEntries(["shaper", "planner", "reconciler"].map((n) => [`agents/${n}.md`, "renamed v12.0.0; an upgrade note cites it"])),
  "bin/fu": "removed v3.20.0; CLAUDE.md names it as history, deliberately",
  "bin/fusion-state-drift":
    "removed 2026-08-15 with the counters it measured; the surviving "  +
    "`bin/fusion-staging-drift` row in CLAUDE.md names it as history, "  +
    "deliberately — same shape as `bin/fu` above",
  "rules/context-manifest.yaml":
    "the CONSUMING project's manifest (./rules/context-manifest.yaml); " +
    "fusion-workbench-conventions.md spells it bare in the exit-code table",
  // Deleted hook modules that README-hooks.md names ON PURPOSE, in the sections
  // that exist precisely because the modules do not: a reader of an older tree,
  // an older copy of that file or an existing events.jsonl comes there looking
  // for them. Same shape as `bin/fu` above — history, deliberately — and they
  // became visible only when the `lib/…` spelling entered the gate's scope
  // (issue 260812-1407). Each is DEAD WEIGHT the moment its section is
  // rewritten to stop naming it, which the "still referenced" test below is
  // what catches.
  "lib/bash-mutation-guard.ts":
    "removed 2026-08-07; the shell-write classifier, named in README-hooks' " +
    "account of the protected-path half's first generation",
  "lib/protected-snapshot.ts":
    "removed 2026-08-12 with the protected-path half; named in that section's " +
    "'what went with it, by name' list and in the guard-state-file row",
  "lib/rules-write-exemption.ts":
    "removed 2026-08-12 with the protected-path half; named in the same list",
  "lib/fs-locator.ts":
    "removed 2026-08-12 with the protected-path half; named in the same list",
  "lib/reverted-copy.ts":
    "removed 2026-08-12 with the protected-path half; named in the same list",
  "lib/state-drift.ts":
    "removed 2026-08-15 with the session counters it measured; named in the " +
    "state-file, git and review-coverage rows as where their code came from " +
    "and as the every-tool-call slot nothing occupies now",
  "lib/escalation.ts":
    "removed 2026-08-16 with the halt and the consecutive-block counter; " +
    "named in README-hooks' account of that removal and in its Origin table, " +
    "where the port it came from is still worth naming",
};

// The shape of a path inside the plugin tree, held as a source string because
// it is needed in two forms: with the "not mid-path" lookbehind, to find such
// paths in running prose (PLUGIN_PATH_RE), and anchored, to ask whether the
// remainder of a `$VAR/`-rooted token is one (PLUGIN_SHAPE_RE) — there the
// variable has already supplied the root, so there is nothing to look behind.
// `lib` is in the alternation because prose cites a hook module by its import
// spelling (`lib/config.ts`); `resolveToken` below is what makes that token
// resolve under `hooks/`, and it is the single place the mapping is written, so
// the scanner and the EXAMPLE_PATHS guard cannot disagree about where a token
// lives.
const PLUGIN_PATH_BODY =
  "(?:rules|agents|skills|docs|hooks|bin|templates|stilwerk|lib)\\/" +
  "[A-Za-z0-9<>$*{}…][A-Za-z0-9._<>$*{}…\\/-]*[A-Za-z0-9>}]" +
  "|\\.claude-plugin\\/plugin\\.json|README(?:-[a-z]+)?\\.md|CLAUDE\\.md" +
  "|install\\.sh|settings\\.json";

// A path-shaped token under a plugin directory, not preceded by `./` (the
// consuming-project spelling), `/` (mid-path), or a word character. First and
// last characters must be alphanumeric so `rules/x.md:72` captures the path
// without the line suffix and a bare `rules/` (prose) never matches.
const PLUGIN_PATH_RE = new RegExp("(?<![A-Za-z0-9_.\\/-])(" + PLUGIN_PATH_BODY + ")", "g");

/** The same shape, anchored: is this whole token a path into the plugin tree? */
const PLUGIN_SHAPE_RE = new RegExp("^(?:" + PLUGIN_PATH_BODY + ")$");

/** Where a citation token resolves in the tree. One spelling needs a mapping:
 *  a bare `lib/…` names a hook module, which lives under `hooks/`. Everything
 *  else is already repo-root-relative and passes through unchanged. */
function resolveToken(token: string): string {
  return token.startsWith("lib/") ? "hooks/" + token : token;
}

/**
 * Every `$VAR` that stands in front of a plugin-tree-shaped path anywhere in
 * the scanned surface, and what that variable names:
 *
 *   `true`   — it names the plugin tree. The remainder is a plugin path and is
 *              existence-checked exactly like a bare one.
 *   a string — it names something else, and the string is the reason. The
 *              token is skipped.
 *
 * A `$VAR/` token whose variable appears in NEITHER position, and whose
 * remainder IS plugin-shaped, is a **violation** — not a skip. That is the one
 * behavioural difference from the predecessor of this constant, which was a
 * regex naming two variables and silently skipping every other. When session
 * `260810-1646` introduced a third, `$FUSION_SRC`, eight citations of
 * `agents/orchestrator.md` left the existence check and the suite stayed green
 * from end to end: coverage shrank and nothing turned red. Eight is the
 * measured count (`skills/setup/SKILL.md` five, `skills/next/SKILL.md` three) —
 * the commit and the first record both said seven. A gate that enumerates what
 * it recognises and skips the rest cannot report its own coverage shrinking, so
 * this one fails on the unrecognised name instead, and the failure names both
 * remedies.
 *
 * THE BOUND, stated rather than implied: a token under an unrecognised variable
 * whose remainder is NOT plugin-shaped stays skipped, deliberately — it is not
 * a class-(a) reference at all. Every `bin/fusion-paths` resolver key is that
 * case, and the separation was measured over the whole surface before it was
 * relied on: `$WORKBENCH`, `$WB` and the nine `$OUT_*` keys carry workbench
 * store paths (`$OUT_ISSUE/<stamp>_o_<slug>.md`, `$WORKBENCH/monitor`) and
 * never a `rules/…`, `agents/…` or `bin/…` remainder. So the two classes part
 * on the REMAINDER, and no list of resolver-key names belongs here. What the
 * gate would still miss is a new root variable used ONLY in front of a path
 * that no plugin directory could hold — which is to say, not a plugin citation.
 */
const ROOT_VARS: Record<string, true | string> = {
  FUSION_PLUGIN_ROOT: true,
  CLAUDE_PLUGIN_ROOT: true,
  // the source root the skills resolve once at Setup — the work tree inside
  // this repository, the install everywhere else, and a copy of this same
  // plugin tree either way.
  FUSION_SRC: true,
  // No non-plugin entry stands here today. The last one, STASH_DIR, went with
  // the stash skills on 2026-08-15; the "load-bearing" test below is therefore
  // vacuous until a shadowing variable reappears, and it goes live again with
  // the first one that does. The BEHAVIOUR of the reason-string arm is not
  // vacuous, though — `scanPluginPaths` takes its table as an argument, so the
  // case below drives the arm from a locally-declared entry rather than needing
  // a real inhabitant here (issue 260815-1251).
};

// `$VAR/<path>` for ANY variable. The variable is captured and classified
// against ROOT_VARS rather than being written into the pattern, which is what
// makes an unrecognised name reportable instead of unmatchable.
const ROOT_VAR_RE =
  /\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?\/([A-Za-z0-9][A-Za-z0-9._\/-]*[A-Za-z0-9])/g;

function scanPluginPaths(
  rel: string,
  lines: { line: number; text: string }[],
  /** The root-variable table. A parameter, not a closed-over constant, so a
   *  test can exercise an arm the shipped table has no inhabitant for. */
  rootVars: Record<string, true | string> = ROOT_VARS,
): { violations: Violation[]; resolved: number } {
  const violations: Violation[] = [];
  let resolved = 0;
  for (const { line, text } of lines) {
    // `unknownRoot` set = the token was found behind a variable ROOT_VARS does
    // not classify, and is reported as that rather than resolved.
    const candidates: { token: string; unknownRoot?: string; lineRef?: boolean }[] = [];
    PLUGIN_PATH_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = PLUGIN_PATH_RE.exec(text)) !== null) candidates.push({ token: m[1], lineRef: text[m.index - 1] === "`" && /^:\d+(?:-\d+)?`/.test(text.slice(m.index + m[0].length)) });
    ROOT_VAR_RE.lastIndex = 0;
    while ((m = ROOT_VAR_RE.exec(text)) !== null) {
      const [, rootVar, rest] = m;
      const names = rootVars[rootVar];
      if (typeof names === "string") continue; // declared as naming something else
      if (names === true) candidates.push({ token: rest }); // the plugin tree: resolve
      else if (PLUGIN_SHAPE_RE.test(rest)) candidates.push({ token: rest, unknownRoot: rootVar });
    }
    for (const { token, unknownRoot, lineRef } of candidates) {
      if (isPlaceholder(token) || token.includes("*") || token.includes("…")) continue;
      if (lineRef) {
        violations.push({ file: rel, line, token: `${token}:N`, problem: "cites a line number, which every edit above that line moves silently", fix: "cite a heading anchor or name the symbol; a line number is not a pointer in living text" });
        continue;
      }
      if (unknownRoot) {
        violations.push({
          file: rel,
          line,
          token: `$${unknownRoot}/${token}`,
          problem:
            `'$${unknownRoot}' is not a root variable this gate classifies, so the ` +
            `plugin path behind it was never checked to exist — coverage shrinks here ` +
            `silently, which is the defect this branch exists to prevent`,
          fix:
            `declare ${unknownRoot} in ROOT_VARS: 'true' if it names the plugin tree ` +
            `(the path is then existence-checked like any other), or a reason string if ` +
            `it names something else (the citation is then skipped, and the string says why)`,
        });
        continue;
      }
      if (token in EXAMPLE_PATHS) continue;
      if (existsSync(join(pluginRoot, resolveToken(token)))) {
        resolved++;
        continue;
      }
      violations.push({
        file: rel,
        line,
        token,
        problem: "names a plugin file that does not exist in the tree",
        fix:
          "fix the path (or, for a consuming-project file, spell it ./rules/…; " +
          "for a deliberate fabricated example, add it to EXAMPLE_PATHS with a reason)",
      });
    }
  }
  return { violations, resolved };
}

// --- class (b): section-heading anchors -------------------------------------

// The file token may carry a `$VAR/` root; it is classified against ROOT_VARS
// exactly as `scanPluginPaths` classifies one, so the two scanners agree on the
// shape (issue 260824-1506: four `$FUSION_SRC/`-rooted anchors went unchecked).
const ANCHOR_RE =
  /`(?:\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?\/)?([A-Za-z0-9._\/-]+\.md)`\s*(?:→\s*)?`(#{1,6}) ([^`]+)`/g;

/** All shipped .md files, for unique-basename resolution of a bare `file.md`. */
function shippedMd(): Map<string, string[]> {
  const byBase = new Map<string, string[]>();
  for (const f of surface()) {
    if (f.commentRe) continue;
    const base = f.rel.split("/").pop()!;
    byBase.set(base, [...(byBase.get(base) ?? []), f.rel]);
  }
  return byBase;
}

function headingsOf(relPath: string): string[] {
  return readFileSync(join(pluginRoot, relPath), "utf-8")
    .split("\n")
    .map((l) => l.match(/^#{1,6}\s+(.*?)\s*$/)?.[1])
    .filter((h): h is string => h !== undefined);
}

function scanHeadingAnchors(
  rel: string,
  lines: { line: number; text: string }[],
  byBase: Map<string, string[]>,
): { violations: Violation[]; resolved: number } {
  const violations: Violation[] = [];
  let resolved = 0;
  for (const [i, { line, text }] of lines.entries()) {
    // A citation wrapped at the line break (issue 260911-0752) is read joined; only the match spanning the seam counts, so nothing is counted twice.
    const next = lines[i + 1]?.text.replace(/^\s*(?:#|\/\/|\*)?\s*/, "") ?? "";
    const wrapped = /\.md`\s*(?:→\s*)?$/.test(text) && /^(?:→\s*)?`#{1,6} /.test(next);
    for (const [t, seam] of wrapped ? ([[text, 0], [`${text} ${next}`, text.length]] as const) : ([[text, 0]] as const)) {
    ANCHOR_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = ANCHOR_RE.exec(t)) !== null) {
      if (seam > 0 && (m.index >= seam || m.index + m[0].length <= seam)) continue;
      const [, rootVar, fileTok, , headingText] = m;
      if (rootVar !== undefined && ROOT_VARS[rootVar] !== true) continue; // not the plugin tree
      if (isPlaceholder(fileTok) || isPlaceholder(headingText)) continue;
      // Resolve the file: as a path from the repo root, else as a unique
      // basename among the shipped .md surface. A basename that resolves to
      // neither is a runtime/workbench artifact (orchestrator-live.md, a plan
      // document) whose headings are not shipped — out of scope by design.
      let target: string | null = null;
      if (fileTok.includes("/") || existsSync(join(pluginRoot, fileTok))) {
        target = existsSync(join(pluginRoot, fileTok)) ? fileTok : null;
        if (target === null) continue; // dangling path: class (a) already reports it
      } else {
        const hits = byBase.get(fileTok) ?? [];
        if (hits.length !== 1) continue;
        target = hits[0];
      }
      const ok = headingsOf(target).some((h) => h === headingText || h.startsWith(headingText));
      if (ok) {
        resolved++;
      } else {
        violations.push({
          file: rel,
          line,
          token: `\`${fileTok}\` \`## ${headingText}\``,
          problem: `no heading in ${target} equals or starts with '${headingText}'`,
          fix: "update the cited heading (prefix match is enough) or the target file",
        });
      }
    }
    }
  }
  return { violations, resolved };
}

// --- class (c): workbench-record citations ----------------------------------
//
// The parser is `./helpers/citation-scan.ts` (see the header note under class
// (c)). Imported here rather than defined: `scanRecordCitations`, and, for the
// fixtures below, `workbenchIndex`, `circleDirs` and `RECORD_EXAMPLE_FILES`.

// --- class (d): slash-command tokens ----------------------------------------
// `/fusion:<name>` must name `skills/<name>/SKILL.md` or a key here: a retired name a shipped text still mentions, with what
// removed it. Guarded twice below like EXAMPLE_PATHS, so a fresh pointer to a retired name stays red unless a mention already keeps
// its key. No resolved figure by design (existence, not a count); the name opens on a letter, so the placeholder never matches (issue 260916-2145).
const RETIRED_COMMANDS: Record<string, string> = {
  direct: "deleted 07961552 (v11); agents/requirements-designer.md names it as removed",
  "migrate-workbench-v2": "retired at v2.6.0 (40ca86db); the conventions name it as retired",
};
const COMMAND_RE = /(?<![A-Za-z0-9_])\/fusion:([a-z][a-z0-9-]*)/g;
function scanCommands(rel: string, lines: { line: number; text: string }[]): Violation[] {
  return lines.flatMap(({ line, text }) => [...text.matchAll(COMMAND_RE)]
    .filter((m) => !(m[1] in RETIRED_COMMANDS) && !existsSync(join(pluginRoot, "skills", m[1], "SKILL.md")))
    .map((m) => ({ file: rel, line, token: m[0], problem: "names a slash command with no skills/<name>/SKILL.md", fix: "name a command that exists, or add the name to RETIRED_COMMANDS with what removed it" })));
}

// --- the gate ---------------------------------------------------------------

// How many references each class resolved, pinned to a committed number rather
// than floored. A floor can only notice coverage ARRIVING: when eight citations
// of `agents/orchestrator.md` left the existence check behind an unclassified
// `$FUSION_SRC`, and again when 34 `lib/…` citations turned out never to have
// been in scope at all, the floor stayed green through both, and no floor placed
// anywhere would have caught them — high enough to see a departure is brittle
// against every legitimate edit, low enough to be robust is blind (issue
// 260810-2149; the mechanism is decision 260810-2032's baseline pin applied to a
// number instead of to prose).
// EVERY MOVE IS STILL ATTRIBUTED HERE, above the constant — but the log stopped accumulating in a
// file the growth bound measures BY THE LINE, so the older entries roll verbatim into this
// workbench's `shared/analyses/` and are read there; roll the older ones again when these grow long
// (decision `260822-1229`, option 2), and ROLL, NEVER DROP — the two 2026-08-29 entries dropped on
// 2026-09-04 were recovered verbatim the same day into `shared/analyses/260904-2202-reference-resolution-pin-re-approval-log-the-two-dropped-2026-08-29-entries.md`
// (defect `260904-2044_*_two-pin-re-approval-entries-were-dropped-instead-of-rolled-into-the-log-the-header-prescribes.md`).
// Entries 1 to 25 (2026-08-16 to 2026-08-22, 418 lines) `shared/analyses/260822-1318-reference-resolution-pin-re-approval-log-entries-1-to-25.md`; 26 to 40 (2026-08-22 to 2026-08-23, 92 lines) `shared/analyses/260824-2121-reference-resolution-pin-re-approval-log-entries-26-to-40.md`; 41 to 54 (2026-08-24 to 2026-09-01, 19 lines) `shared/analyses/260910-0512-reference-resolution-pin-re-approval-log-entries-41-to-54.md`; 55 to 72 (2026-09-05 to 2026-09-13, 18 lines, rolled 2026-09-15 to pay for the commit-lock defect cases on a surface at zero margin) `shared/analyses/260915-1930-reference-resolution-pin-re-approval-log-entries-55-to-72.md`; the two 2026-09-09 entries (the v10.26.0 release and Circle 260909-1700 step B2, 2 lines, rolled 2026-09-15 to pay for the `**Active spec/plan:**` entry on the same zero margin) `shared/analyses/260915-2006-reference-resolution-pin-re-approval-log-the-two-2026-09-09-entries.md`; the five 2026-09-08 entries dropped whole at b3649305 (1692 to 1707, recovered 2026-09-22 with a corrected entry for 22d6f839, whose own opened at a figure the pin never held) `260922-1040-reference-resolution-pin-re-approval-log-the-2026-09-08-entries-dropped-at-b3649305.md`.
// `records` left the pin on 2026-08-24 (issue 260816-0725): that class resolves
// against the workbench, which the archive step rewrites in the ordinary course
// of a session, so its count moved with housekeeping and not with text. The
// class is still scanned and a dangling record still fails above; the corpus
// itself is `workbench-citation-lint.test.ts`'s to measure.
// Re-approved 2026-09-15 (the settling commit: `/fusion:cleanup` Step 2 and `/fusion:commit` step 6 now commit the event log alone after their splits, and Step 3's push condition stops naming a clean tree): paths 1535 -> 1538, anchors 235 -> 237, stampBare unmoved. FIVE ADDED TOKENS, NO REMOVAL, AND MEASURED BY SWAPPING THE TWO EDITED FILES BACK TO HEAD IN PLACE RATHER THAN BY SUBTRACTION. With HEAD's copies of `skills/cleanup/SKILL.md` and `skills/commit/SKILL.md` and every other working-tree change left standing, the gate resolves 1535/235/11 exactly — so the other modified files account for nothing and the whole delta is these two. The added tokens are `rules/commit-lock.md` with its `### The lock writes the commit event` anchor in each body (+2 paths, +2 anchors) and `rules/workbench-tracking.md` in the cleanup push step (+1 path), which is what the new text cites to say why a clean tree is not the precondition. The cuts that funded the bytes — the two worked commit-message examples, the cleanup Notes section, two dead Safety bullets — carried no citation, so nothing cancels.
const BASELINE = { paths: 1713, anchors: 312, stampBare: 11 }; // Re-approved 2026-09-23 (step 8 of `260922-1114_*_plan-prior-nomenclature-plugin-source.md`: the seven agent renames): paths 1718 -> 1713, anchors 315 -> 312, stampBare unmoved. Attributed token by token: the seven citations of a pre-v12 agent path in the upgrade notes (`agents/shaper.md` twice, `agents/planner.md` three times, `agents/reconciler.md` twice) are history and now skip through `EXAMPLE_PATHS` rather than resolve (-7 paths), and three of them carried the heading anchor that went with them (`agents/planner.md` `## Where this work stops`, `agents/reconciler.md` `### Step 2.5` twice; -3 anchors); `bin/fusion-paths`' header gains `bin/fusion-rules` and `hooks/lib/events-query.ts` and loses the bare `agents/coder.md` its slug-guard comment spelled, and `bin/fusion-rules` gains `bin/fusion-paths` (+2 net). Every other `agents/<old>.md` citation now reads the new name and nets zero. NO GROWTH BASELINE MOVED. Previous: Re-approved 2026-09-23 (step 7 of `260922-1114_*_plan-prior-nomenclature-plugin-source.md`: `/fusion:setup` scaffolds the v12 store names and reports a v11 store without refusing): paths 1717 -> 1718, anchors 314 -> 315, stampBare unmoved. Attributed token by token: `skills/setup/SKILL.md`'s new paragraph cites `rules/fusion-workbench-conventions.md` `### Transition window (v12.0.0 to v13.0.0)` (the one path and the one anchor), measured after step A alone; step 5 of `260922-1129_*_plan-prior-nomenclature-consumer-migration.md`, landed beside it, rewords two rule passages and adds or removes no citation (the figures are unchanged with or without it). NO GROWTH BASELINE MOVED. Previous: Re-approved 2026-09-23 (step 6 of `260922-1114_*_plan-prior-nomenclature-plugin-source.md`: `bin/fusion-claimed-package` and `bin/fusion-paths` read both container roots and write one): paths 1710 -> 1717, anchors 313 -> 314, stampBare unmoved. Attributed token by token: `bin/fusion-claimed-package`'s header cites `bin/fusion-stores` three times (output shape, exit 3, where the store is read from); `bin/fusion-paths`' header cites `bin/fusion-stores` twice (the store names, exit 4) and `rules/fusion-workbench-conventions.md` once (the window rule); `rules/workbench-path-resolution.md` cites `rules/fusion-workbench-conventions.md` `### Transition window (v12.0.0 to v13.0.0)` (the one path and the one anchor). The rename itself nets zero: every `bin/fusion-claimed-item` citation now reads `bin/fusion-claimed-package`, and the roster row names the old helper in prose rather than as a path. NO GROWTH BASELINE MOVED. Previous: Re-approved 2026-09-23 (step 5 of `260922-1114_*_plan-prior-nomenclature-plugin-source.md`: the new `bin/fusion-stores`): paths 1702 -> 1710, anchors and stampBare unmoved. Attributed by restoring each edited file alone from HEAD: the helper's own header cites `rules/fusion-workbench-conventions.md`, `hooks/lib/stores.ts`, `hooks/lib/__tests__/fusion-stores.test.ts` and `bin/fusion-paths` (four), its roster row in `README-hooks.md` cites `bin/fusion-stores`, `bin/fusion-paths` and `hooks/lib/stores.ts` (three), and the conventions' window subsection names `bin/fusion-stores` where it said one bash helper (one). NO GROWTH BASELINE MOVED. Previous: Re-approved 2026-09-23 (steps 1 to 4 of the consumer-migration plan `260922-1129_*_plan-prior-nomenclature-consumer-migration.md`: `/fusion:migrate` becomes the store-name pass and `/fusion:setup` loses its four pre-v4 probes): paths 1716 -> 1702, anchors 320 -> 313, stampBare unmoved. Attributed token by token, measured by restoring each edited file alone from HEAD and re-running this gate. `skills/migrate/SKILL.md` is paths -8 and anchors -6: the cut passes cited `rules/fusion-workbench-conventions.md` with `## Backlog entries — work items` three times, with `## Origin Rule (Herkunftsregel)` once, and with `## fusion-workbench Layout` and `## Terminal states are history` once more each than the new body does (six paths, six anchors), and `CLAUDE.md` twice more (two paths). `skills/setup/SKILL.md` is paths -6 and anchors -1: the removed probe bullets and refusal cited `skills/migrate/SKILL.md` twice and `bin/fusion-claimed-item`, `CLAUDE.md`, `rules/user-facing-output.md` and `rules/fusion-workbench-conventions.md` with `## Project language` once each. `hooks/lib/citation-scan.ts` nets zero. EVERY TOKEN IS A DELETED CITATION, NONE A SPELLING THAT LEFT SCOPE, AND NO GROWTH BASELINE MOVED. Previous: Re-approved 2026-09-22 (the tracking rule restates its retired-entry paragraph over four entries, and the claude-md weight rule's heading-level-0 clause gains the under-threshold case): paths 1715 -> 1716, anchors 319 -> 320, stampBare unmoved. Attributed token by token to the two rule edits this re-approval accompanies. `rules/workbench-tracking.md` rewrites `**Two entries left this class**` as four and cites `agents/orchestrator.md` `## Setup` for the prohibition that neither `agentstate.yaml` nor `orchestrator-live.md` is written or re-created under another name: that is the one new plugin path and the one new anchor, and they are the whole of the delta. Every other citation in the rewritten paragraph and in the R1 row stands in the removed text as well and nets zero (`rules/fusion-workbench-conventions.md` with `## fusion-workbench Layout` and with `## Path Resolution`, and `/fusion:migrate`), and the `shared/backlog/` the R1 row gains is a workbench path, which this gate's shape does not read. `rules/context-lean-claude-md.md` names `bin/fusion-claude-md-weight` once before its edit and once after, so it neither funds nor costs a path. NO GROWTH BASELINE MOVED AND NONE MAY: the two rule edits are the approved result of a separate pass, and every other gate stayed green in the run that produced these received numbers. Previous: Re-approved 2026-09-22 (step 7 of the bracket-citation package: `/fusion:migrate` gains the citation sweep as its closing step): paths 1713 -> 1715, anchors and stampBare unmoved. Attributed token by token: the new Step 6 in `skills/migrate/SKILL.md` names `bin/fusion-citation-sweep` twice, once for the dry run it reports and once for the write it asks about, and the bracket-reformat bullet it is funded from carried no plugin path at all — its `shared/` and `circles/*/` are workbench paths, which this gate's shape does not read. NO GROWTH BASELINE MOVED AND NONE MAY: `skills/` FELL 39 701 -> 39 688 bytes on that one file, and the surface golden was regenerated by its own failing-on-purpose run. Previous: Re-approved 2026-09-22 (step 1 of the bracket-citation package: `## Terminal states are history` gains the state-not-spelling clause, funded by cutting prose the header table already authors elsewhere): paths 1717 -> 1713, anchors and stampBare unmoved. Attributed token by token out of the three cuts, all in `rules/fusion-workbench-conventions.md`: the tracked-workbench section, the path-resolution section and `## Commit lock` each drop a restatement of the header table's own emission column, which spends `bin/fusion-rules` three times and `bin/fusion-paths` once. The clause itself cites a record, not a path, so it adds none. NO GROWTH BASELINE MOVED AND NONE MAY: the always-on rule file NETS -3 BYTES, which is what the eleven dispatch rows at slack 0 required, and the emission golden was regenerated by its own failing-on-purpose run. Previous: Re-approved 2026-09-22 (step 8 of the seven-rulings package: all four sites say which route writes a `**Depends-on:**` entry without a per-entry ruling): paths 1708 -> 1711, anchors 317 -> 320, stampBare unmoved. Attributed by restoring the four edited files to HEAD together, where the gate reads 1708 and 317, and per file by the diff: each of the three normative sites gains exactly one anchor citation of the authority it now names, `rules/fusion-workbench-conventions.md` and `agents/curator.md` citing `agents/orchestrator.md` `## Human Gate Rules`, and `agents/orchestrator.md` citing `rules/fusion-workbench-conventions.md` `## Backlog entries — work items`, so three paths and three anchors. `docs/working-model.md` carries the same change in prose and cites nothing, which is why the count moves by three and not four. NO GROWTH BASELINE MOVED AND NONE MAY: `agents/` grew 321 524 -> 322 295 bytes against a ceiling of 328 567, and both goldens were regenerated by their own failing-on-purpose runs. Previous: Re-approved 2026-09-22 (step 6 of the seven-rulings package: `## Filename Patterns` says how a record's heading anchor into shipped text reads, on the user's ruling of 260922-1225): paths 1705 -> 1708, anchors and stampBare unmoved. Attributed by single-file restore: with `rules/fusion-workbench-conventions.md` alone restored to HEAD the gate reads paths 1705, and the three new spellings in it are the two gates the clause names as resolving nothing across that boundary, `hooks/lib/__tests__/reference-resolution-lint.test.ts` and `hooks/lib/__tests__/workbench-citation-lint.test.ts`, and `bin/fusion-citation-check` beside the second. No anchor moved: the clause cites no heading. NO GROWTH BASELINE MOVED AND NONE MAY: the always-on rule file grew again on the same eleven rows and its emission golden was regenerated by the failing-on-purpose run. Previous: Re-approved 2026-09-22 (step 5 of the seven-rulings package: the two `shared/backlog/` entries are archived by hand and the layout names that store as a third frozen legacy store, on the user's ruling of 260922-1223): paths 1703 -> 1705, anchors and stampBare unmoved. Attributed by single-file restore: with `rules/fusion-workbench-conventions.md` alone restored to HEAD the gate reads paths 1703, and the two new spellings in it are `hooks/lib/staging-drift.ts` and `hooks/lib/citation-scan.ts`, named where the paragraph says the `backlog` segment stays in their store lists so a citation of an archived entry is still read as store-prefixed. The two skill bodies and the two other frozen stores were already spelled there. NO GROWTH BASELINE MOVED AND NONE MAY: the always-on rule file grew 67 402 -> 68 050 bytes, charged to all eleven dispatch-path rows against a minimum slack of 43 536, and the emission golden was regenerated by its own failing-on-purpose run. Previous: Re-approved 2026-09-22 (step 4 of the seven-rulings package: Step 3 of the context-lean rule softens, a pointer staying where its passage stood when the section around it survives with content of its own, on the user's ruling of 260922-1221): paths 1702 -> 1703, anchors and stampBare unmoved. Attributed by single-file restore: with `rules/context-lean-claude-md.md` alone restored to HEAD the gate reads paths 1702, and the one new spelling in it is `CLAUDE.md`, in the sentence naming fusion's own file as the case the condition is written for. The Step 1 division is named in prose rather than cited by anchor, so no anchor moved. NO GROWTH BASELINE MOVED AND NONE MAY: the step edits `rules/`, which carries no failing bound, and the eleven dispatch-path rows stand far under their arming figures. Previous: Re-approved 2026-09-22 (step 3 of the seven-rulings package: the `FUSION_ALIAS` export, its wiring assertions and the v10.23 note's claim are struck on the user's ruling of 260922-1218): paths 1701 -> 1702, anchors and stampBare unmoved. Attributed by single-file restore: with `docs/upgrading-to-v10-23.md` alone restored to HEAD the gate reads paths 1701, and the one new spelling in it is `bin/fusion-checkout-name`, named in the dated clause that says its `resolve` subcommand is untouched and every other renderer still reads the name through it. The removed wiring block moved nothing here: test files are not this gate's surface. NO GROWTH BASELINE MOVED AND NONE MAY: the hook-test surface FELL 22 243 -> 22 199 lines and its golden was regenerated by the failing-on-purpose run, which records the shrink and grants nothing. Previous: Re-approved 2026-09-22 (step 2 of the seven-rulings package: the 11.11.0 help paragraph says what the release changes, paid for by two cuts in the same skill body): paths 1702 -> 1701, anchors and stampBare unmoved. Attributed directly: the rewritten paragraph adds three slash-command tokens, which the lint reads as a class of their own and not as paths, while one of the two cuts was the duplicate working-model pointer at the end of topic 2, whose spelling of that doc is the one path token that left. The same doc is still spelled at `:41`, so the reference resolves and only the count falls. NO GROWTH BASELINE MOVED AND NONE MAY: the skill-body surface rose 18 bytes against 72 of head-room and its golden was regenerated by the failing-on-purpose run, which records growth and grants none. Previous: Re-approved 2026-09-22 (step 1 of the seven-rulings package: `docs/working-model.md` `## 3. The gates` is brought to the gate set `57e2b7eb` left): paths 1701 -> 1702, anchors and stampBare unmoved. Attributed by single-file restore: with `docs/working-model.md` alone restored to HEAD the gate reads paths 1701, so the one new spelling is the link this step adds to the orchestrator prompt, which the paragraph now names as the authority for which gate rows the field answers. The heading anchor beside it moved nothing, that spelling already resolving elsewhere in the corpus. NO GROWTH BASELINE MOVED AND NONE MAY: the step edits `docs/`, which no growth bound covers. Previous: Re-approved 2026-09-22 (step 36 of the 51-issue package: the help body's update topic rotates to 11.11.0, its new paragraph naming the four helpers whose output the package changed, and the dropped 11.8.0 paragraph named none): paths 1697 -> 1701, anchors and stampBare unmoved. Attributed directly: the help body is the one shipped text this step edits, and the four new spellings are the forum, work-order, events and checkout-name helpers under `bin/`, one path each; the dropped paragraph's only token was a slash command, which is a class of its own and not a path. NO GROWTH BASELINE MOVED AND NONE MAY: the skill-body surface shrank by the rotation and the inventory fixture was regenerated by its own failing-on-purpose run. Previous: Re-approved 2026-09-22 (step 29 of the 51-issue package: `bin/fusion-forum new` admits only a message-shaped basename, prints `writer=` and `skipped=`, and the news body reads the writer off the helper and never marks an unrendered entry seen): paths 1699 -> 1697, anchors 316 -> 317, stampBare unmoved. Attributed by single-file restore against the full tree: with the news body alone restored to HEAD the gate reads paths 1700 and anchors 317, with the forum helper alone restored it reads paths 1696 and anchors 316. So the helper's new header paragraph carries +1 path and +1 anchor (the conventions rule file and its filename-patterns heading, cited where the entry shape is now enforced), and the news body carries -3 paths: the block that resolved a source root this body never read a file through was cut as the step's funding, and its three spellings of the source-root helper went with it. NO GROWTH BASELINE MOVED AND NONE MAY: the hook-test and skill-body surfaces were edited and the inventory fixture regenerated by its own failing-on-purpose run, which records growth and grants none. Named in prose rather than spelled, because this comment sits beside the corpus the gate counts. Previous: Re-approved 2026-09-22 (step 24 of the 51-issue package: the store names move into one module, `hooks/lib/stores.ts`, read by the staging classifier, the citation grammar and the path-literal lint): paths 1697 -> 1699, anchors and stampBare unmoved. Attributed by single-file revert against the full tree: with the hooks README alone restored to HEAD the gate reads 1697 and every case passes, with the cleanup body alone restored it reads 1699, so the README's new `hooks/lib` table row carries the whole movement and the cleanup body, which lost a store-directory literal the widened lint now catches, moves nothing. THE ROW'S TWO ARE THE MODULE IN THE ROW CELL AND THE CONVENTIONS RULE FILE IT NAMES AS THE TREE THE LINT PARSES, measured by removing that one mention and reading 1698; the lint file the row names is spelled by basename alone, which this gate does not read as a path. The new module, the two library files that import it and the test that composes its set are `hooks/**.ts`, which is `recordsOnly`, and the two records the module's header cites resolve, so those four contribute nothing. NO GROWTH BASELINE MOVED AND NONE MAY: the hook-test and skill-body surfaces were edited and the inventory fixture regenerated by its own failing-on-purpose run, which records growth and grants none. Named in prose rather than spelled, because this comment sits beside the corpus the gate counts. Previous: Re-approved 2026-09-22 A FORTY-FOURTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES — defect `260921-2049_*_the-memo-bodys-checkout-halt-fires-before-the-target-is-chosen-so-an-idea-halts-where-the-conventions-say-file.md` closed: the checkout-halt bullet of `skills/memo/SKILL.md` is scoped to the two keyed targets and sends an idea on under `rules/fusion-workbench-conventions.md` `### Who filed it`: paths 1696 -> 1697, anchors 315 -> 316, stampBare unmoved. ONE ADDED PATH AND ONE ADDED ANCHOR, NO REMOVAL, MEASURED BY RESTORING THE SKILL FILE TO HEAD IN PLACE: the edited bullet is the one hunk that adds a token, a backticked plugin path with the heading token after it; the three sentences cut to pay for it carried none. // Re-approved 2026-09-22 A FORTY-THIRD TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES — defect `260921-1855_*_readme-hooks-says-the-two-re-baselines-are-logged-in-full-in-the-growth-bound-test-header-after-the-log-rolled-out.md` closed: the two `README-hooks.md` sentences that sent a reader to the growth-bound test header for a log that had rolled out now name the two rolled records, and the armings sentence names `hooks/lib/__tests__/rules-emission-golden.test.ts` a second time as where the third arming's text still stands: paths 1695 -> 1696, anchors and stampBare unmoved. ONE ADDED PATH, NO REMOVAL, MEASURED BY RESTORING THE README TO HEAD IN PLACE: the two edited sentences are the only hunk, and between them they add exactly one backticked plugin path; the record basenames they add are not a pinned class. // Re-approved 2026-09-22 A FORTY-SECOND TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES — defect `260916-2210_*_step-1s-two-branches-leave-a-file-with-no-headings-undivided-while-the-helper-answers-heading-level-0.md` closed: `rules/context-lean-claude-md.md` Step 1 gains a fourth item naming the no-heading case, and that item cites `bin/fusion-claude-md-weight`: paths 1694 -> 1695, anchors and stampBare unmoved. ONE ADDED PATH, NO REMOVAL, MEASURED BY RESTORING THE RULE FILE TO HEAD IN PLACE: the two added lines are the only hunk and carry exactly one backticked plugin path. // Re-approved 2026-09-22 A FORTY-FIRST TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES — defect `260916-2209_*_the-division-rule-says-what-applies-it-restates-none-of-it-and-the-curator-restates-three-of-its-clauses.md` closed: the placement-classification bullet of `agents/curator.md` drops its three restated clauses and cites `rules/context-lean-claude-md.md` `### Step 1 — divide the file by heading, before judging anything` instead: paths 1693 -> 1694, anchors 314 -> 315, stampBare unmoved. ONE ADDED PATH AND ONE ADDED ANCHOR, NO REMOVAL, MEASURED BY RESTORING THE AGENT FILE TO HEAD IN PLACE: the one edited sentence is the only hunk, and it carries exactly one backticked plugin path and the one heading token that follows it. // Re-approved 2026-09-22 A FORTIETH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES — defect `260908-1612_*_the-migrate-carve-outs-authoring-home-has-no-heading-a-citation-can-address.md` closed: `rules/workbench-path-resolution.md` gains `### The one consumer that names the layout literally` above the carve-out paragraph and `skills/migrate/SKILL.md` cites it by that anchor in place of its prose pointer: anchors 313 -> 314, paths and stampBare unmoved. ONE ADDED ANCHOR, NO REMOVAL, MEASURED BY RESTORING THE SKILL FILE TO HEAD IN PLACE: the one edited skill line is the only hunk carrying a backticked heading token, and the rule file is emitted to no agent. // Re-approved 2026-09-22 A THIRTY-NINTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES — the ask-before-planning step added to `agents/orchestrator.md` under the ruling in `260918-0804_*_what-stops-two-checkouts-from-working-one-job-when-the-work-hangs-on-no-item.md`: paths 1692 -> 1693, anchors and stampBare unmoved. ONE ADDED PATH, NO REMOVAL, MEASURED OVER THE DIFF: the added step is the only hunk carrying a backticked plugin path, `bin/fusion-paths`, which the orchestrator runs again so the plan lands in the new item's container; the five removed lines carried no token of any pinned class. // Re-approved 2026-09-21 A THIRTY-EIGHTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) — defects `260911-0752_*_a-citation-wrapped-across-a-line-break-is-checked-by-neither-class-and-fails-silently.md` and `260906-0335_*_nine-of-twelve-line-number-citations-in-shipped-text-name-the-wrong-line-and-no-gate-resolves-one.md` (lint half) closed: `scanHeadingAnchors` reads a citation wrapped at a line break (file token ending one line, a backticked heading opening the next, a shell or TS comment prefix stripped) joined and attributed to the first line, and `scanPluginPaths` refuses a resolved plugin path followed by `:N` inside its backticks: paths and stampBare unmoved, anchors 310 -> 313. THE THREE ARE THE WRAPPED CITATIONS THE SHIPPED CORPUS HELD AT THIS COMMIT, enumerated before the scanner changed by an awk over every surface file pairing a line ending in a backticked `.md` token with a next line opening on a backticked heading: `rules/agent-setup.md:42` (`## Path Resolution`), `rules/agent-setup.md:67` (`## Project language`) and `bin/fusion-claimed-item:54` (`## Backlog entries — work items`), all three resolving, so no shipped file was repaired; with this test file restored to HEAD the gate resolves 310, so the whole delta is the scanner's reading and no shipped text moved. THE REFUSAL FOUND NO TOKEN: the two line-number citations step 3 of the plan rewrote were the last on this surface, and the acceptance grep over `agents skills rules README*.md CLAUDE.md docs bin install.sh` prints nothing; the two `path:N` mentions left in `hooks/lib/` comments sit on a records-only surface the path class never scanned. Both refusals were made to fail on a probe line appended to `docs/philosophy.md` (a `:12` token and a wrapped anchor to a heading that does not exist, both reported at that line) and the file restored. // Re-approved 2026-09-21 A THIRTY-SEVENTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) — defect `260915-2145_*_the-v11-upgrade-note-is-maintained-as-live-in-one-commit-of-this-range-and-frozen-in-the-other.md` closed: the note declares itself live under its title and `README-agents.md` `## Releasing` step 0 gains the obligation that a release changing what `docs/upgrading-to-v11.md` describes edits it in the same commit: paths 1691 -> 1692, anchors and stampBare unmoved. ONE ADDED PATH, MEASURED BY WRITING HEAD'S `README-agents.md` OVER THE WORKING FILE AND RUNNING THE GATE ONCE MORE RATHER THAN BY SUBTRACTION — with that one file restored and the note's own edits left standing the gate resolves 1691/310/11, so the whole delta is the step 0 sentence's `docs/upgrading-to-v11.md` token; the decision citation beside it is class (c) and off the pin, and the three edits inside the note add no token of any pinned class. // Re-approved 2026-09-21 A THIRTY-SIXTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) — defect `260913-1108_*_the-gate-determination-is-delegated-to-an-analyst-that-holds-no-more-of-the-gate-list-than-the-caller.md` closed: the nested-dispatch gate mechanic in `rules/fusion-workbench-conventions.md` `## Dispatching another agent` now has the dispatching agent read the gate rows itself through `$FUSION_PLUGIN_ROOT` and return the question when one applies, the analyst sentence gone, and the two `README-agents.md` clauses restating it (`## The agents`, `## Invariants`) say the same: paths 1690 -> 1691, anchors 309 -> 310, stampBare unmoved. ONE ADDED PATH AND ONE ADDED ANCHOR, MEASURED BY WRITING HEAD'S `README-agents.md` OVER THE WORKING FILE AND RUNNING THE GATE ONCE MORE RATHER THAN BY SUBTRACTION — with that one file restored and the conventions edit left standing the gate resolves 1690/309/11, so the whole delta is the `## The agents` clause, which now cites `agents/orchestrator.md` with its `## Human Gate Rules` anchor; the conventions paragraph names that section as "that section" beside the anchor it already carried and adds no token of any pinned class. // Re-approved 2026-09-21 A THIRTY-FIFTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) — defect `260916-2144_*_the-holder-naming-section-documents-a-command-a-consumer-and-a-field-shape-that-are-all-gone.md` closed: `bin/fusion-checkout-name` `## Naming a holder, and why the name never enters a comparison` dropped its `/fusion:next` worked case for the general rule, which cites the claim template at `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` and names the four `resolve` callers that do ship, `skills/cadence/SKILL.md`, `skills/check/SKILL.md`, `hooks/hooks.json` and `skills/news/SKILL.md`: paths 1685 -> 1690, anchors 308 -> 309, stampBare unmoved. FIVE ADDED PATHS AND ONE ADDED ANCHOR IN ONE FILE, MEASURED BY WRITING HEAD'S `bin/fusion-checkout-name` OVER THE WORKING FILE AND RUNNING THE GATE ONCE MORE RATHER THAN BY SUBTRACTION — with that one file restored the gate resolves 1685/308/11, so the whole delta is that section's rewrite; the removed `/fusion:next` token was of no pinned class and moved nothing. // Re-approved 2026-09-21 A THIRTY-FOURTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) — defect `260906-0335_*_nine-of-twelve-line-number-citations-in-shipped-text-name-the-wrong-line-and-no-gate-resolves-one.md`, text half: the two `path:line` tokens left in shipped text were rewritten as prose; in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` the two `skills/setup/SKILL.md:49` tokens became one path token naming the Probe 3 bullet and the words "that same bullet", and in `describeReach()` (`hooks/lib/domain-cascade.ts`, rendered into `README-hooks.md`) `docs/philosophy.md:19` became "a line in `docs/philosophy.md`": paths 1686 -> 1685, anchors and stampBare unmoved. ONE REMOVED PATH IN ONE FILE, MEASURED BY WRITING HEAD'S `rules/fusion-workbench-conventions.md` OVER THE WORKING FILE AND RUNNING THE GATE ONCE MORE RATHER THAN BY SUBTRACTION — with that one file restored the gate resolves 1686/308/11, so the whole delta is the second token's collapse into prose; the `docs/philosophy.md` path token survives its own rewrite and moved no count. // Re-approved 2026-09-21 A THIRTY-THIRD TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) — release 11.9.1: `skills/help/SKILL.md` `### 4. Update` gained its 11.9.0 paragraph and dropped the 11.6.0 one, which was the paragraph citing `bin/fusion-work-order`; the new paragraph cites nothing: paths 1687 -> 1686, anchors and stampBare unmoved. ONE REMOVED PATH IN ONE FILE, MEASURED BY WRITING HEAD'S `skills/help/SKILL.md` OVER THE WORKING FILE AND RUNNING THE GATE ONCE MORE RATHER THAN BY SUBTRACTION — with that one file restored the gate resolves 1687/308/11, so the whole delta is that dropped paragraph. // Re-approved 2026-09-21 A THIRTY-SECOND TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) — defect `260921-1349_*_the-session-end-row-is-written-after-the-last-commit-and-no-ending-step-commits-it.md`: `agents/orchestrator.md` `## Ending the session` gained the bullet that commits the `session_end` row alone under the lock, citing `rules/commit-lock.md` `### The lock writes the commit event` and the defect record: paths 1685 -> 1687, anchors 307 -> 308, stampBare unmoved. TWO ADDED PATHS AND ONE ADDED ANCHOR IN ONE FILE, MEASURED BY WRITING HEAD'S `agents/orchestrator.md` OVER THE WORKING FILE AND RUNNING THE GATE ONCE MORE RATHER THAN BY SUBTRACTION — with that one file restored the gate resolves 1685/307/11, so the whole delta is that bullet. // Re-approved 2026-09-21 A THIRTY-FIRST TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) — defect `260921-0807_*_the-class-l-case-pins-rule-into-list-and-nothing-pins-list-into-rule.md`, second observation: the layout tree in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` names `hooks/lib/staging-drift.ts` beside `.checkout-id` and `.cadence-anchors`, the two root entries the classifier holds rows for: paths 1683 -> 1685, anchors and stampBare unmoved. TWO ADDED PATHS IN ONE FILE, MEASURED BY WRITING HEAD'S `rules/fusion-workbench-conventions.md` OVER THE WORKING FILE AND RUNNING THE GATE ONCE MORE RATHER THAN BY SUBTRACTION — with that one file restored the gate resolves 1683/307/11, so the same commit's edits to `agents/orchestrator.md` `## Work items` (a File row), `docs/working-model.md` and `docs/upgrading-to-v11.md` moved no count. // Re-approved 2026-09-21 A THIRTIETH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) — defect `260921-0657_*_no-shipped-text-lets-a-directive-pre-answer-the-solution-gates-so-an-autonomous-package-stops-three-times-before-its-first-fix.md` closed under decision `260921-0842_*_how-does-a-work-item-tell-the-orchestrator-to-work-it-without-asking.md`: the work item gained `**Mode:** autonomous`, whose paragraph in `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` cites `agents/orchestrator.md` `## Human Gate Rules`, and whose clause under that heading in `agents/orchestrator.md` cites `rules/fusion-workbench-conventions.md` `## Backlog entries — work items`: paths 1681 -> 1683, anchors 305 -> 307, stampBare unmoved. ONE ADDED PATH AND ONE ADDED ANCHOR PER FILE, MEASURED BY WRITING HEAD'S COPY OF EACH FILE IN TURN OVER THE WORKING FILE AND RUNNING THE GATE ONCE MORE RATHER THAN BY SUBTRACTION — with `rules/fusion-workbench-conventions.md` alone restored the gate resolves 1682/306/11, with `agents/orchestrator.md` alone restored it resolves 1682/306/11, so each file carries exactly one new path and one new anchor and nothing else in the working tree moved a count. // Re-approved 2026-09-21 A TWENTY-NINTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) — defect `260918-1234_*_the-archive-body-reads-a-rule-through-the-source-root-with-no-unresolved-branch-and-no-do-not-improvise-rule.md` closed: `skills/archive/SKILL.md` Step 1 gained an `UNRESOLVED` branch, a guarded read and a sentence citing `bin/fusion-source-root`'s header for the do-not-improvise rule: paths 1680 -> 1681, anchors and stampBare unmoved. ONE ADDED PATH, MEASURED BY WRITING HEAD'S `skills/archive/SKILL.md` OVER THE WORKING FILE AND RUNNING THE GATE ONCE MORE RATHER THAN BY SUBTRACTION — with that one file restored the gate resolves 1680/305/11 exactly, so the whole delta is this one file's new `bin/fusion-source-root` citation. // Re-approved 2026-09-21 A TWENTY-EIGHTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) — defect `260918-1410_*_the-dispatch-parameters-section-describes-three-retired-parameters-as-live-and-five-of-its-line-citations-are-stale.md` closed: `README-agents.md` `## Dispatch parameters` no longer describes the retired `**Draft:**`, `**Answers:**` and `**Initiated by:**` as live in its intro, and its line citations became heading anchors: paths 1681 -> 1680, anchors 294 -> 305, stampBare unmoved. ONE REMOVED PATH AND ELEVEN ADDED ANCHORS, MEASURED BY WRITING HEAD'S `README-agents.md` OVER THE WORKING FILE AND RUNNING THE GATE ONCE MORE RATHER THAN BY SUBTRACTION — with that one file restored and every other working-tree change left standing the gate resolves 1681/294/11 exactly, so the whole delta is this one file. The replaced text carried twelve `agents/<name>.md:<line>` tokens (the `agents/shaper.md:70` citation in the intro, and eleven in the reconciler, planner, editor and Audience cells); the new text carries eleven file tokens each followed by a heading its file has (`### Parameter parsing`, `### Shaping and planning, when the task needs them`, `## Parameter parsing`, `## Agent Routing Table`, `## Deliverable language — named in the dispatch, or you halt`, and `## Setup` six times), which is -1 path and +11 anchors. The per-token split is an inference from the diff; the figures are the run's. // Re-approved 2026-09-21 A TWENTY-SEVENTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) — step 5 of `README-agents.md` `## Adding a new agent` rewritten to name the six count-gated surfaces as they stand, each by a heading its file has: paths 1680 -> 1681, anchors 290 -> 294, stampBare unmoved. ONE ADDED PATH AND FOUR ADDED ANCHORS, MEASURED BY WRITING HEAD'S `README-agents.md` OVER THE WORKING FILE AND RUNNING THE GATE ONCE MORE RATHER THAN BY SUBTRACTION — with that one file restored and every other working-tree change left standing the gate resolves 1680/290/11 exactly, so the whole delta is this one file. The replaced text cited `CLAUDE.md` three times with its two headings written before the file token (`## What this is` in `CLAUDE.md`), a form the anchor count does not read; the new text cites `README-agents.md` `## The agents`, `README-agents.md` `## Plugin structure`, `CLAUDE.md` `## Layout` and `README.md` `# fusion` in the file-then-heading form (+4 anchors), and its file tokens are `README-agents.md` twice, `CLAUDE.md` once, `README.md` once and the derivable-enumerations lint once against the old text's `CLAUDE.md` three times and the same lint once (+1 path). The per-token split is an inference from the diff; the figures are the run's. // Re-approved 2026-09-18 A TWENTY-SIXTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) — the fifth curator outcome value `not-offered` and the suppression read moving into `bin/fusion-edge-answers`: paths 1663 -> 1678, anchors 285 -> 290, stampBare unmoved. FIFTEEN ADDED PATHS AND FIVE ADDED ANCHORS, NO REMOVAL, MEASURED BY RESTORING EACH EDITED FILE TO HEAD IN PLACE (and the new helper moved aside) RATHER THAN BY SUBTRACTION — with all four restored the gate resolves 1663/285/11, and each file put back alone, over a tree that keeps the new helper so its citations do not dangle, gives: `bin/fusion-edge-answers` +3/+2 (`agents/curator.md` twice, each followed by a heading, plus the unbackticked `hooks/dist/edge-answers.js` the wrapper execs); `README-hooks.md` +7/+2 (the `bin/` roster row, the `edge-answers.ts` entrypoint row and the `lib/edge-answers.ts` module row, plus the two head-room-log lines the +190 raise moved, which re-cite `hooks/lib/__tests__/surface-growth-bound.test.ts`); `agents/curator.md` +4/+0 (`bin/fusion-edge-answers` twice in prose and twice inside the guarded call, no heading citation added or lost, the `## The run file` and `## Evidence tiers` references there carrying no file token); `skills/curate/SKILL.md` +1/+1 (the outcome vocabulary cut to a pointer at `agents/curator.md` `## The run file`, its own enumeration deleted). 3+7+4+1 = 15 and 2+2+0+1 = 5, with no residual. THE RECORD CITATIONS ADDED ALONGSIDE ARE CLASS (c) AND LEFT THE PIN ON 2026-08-24, so none of them is in either figure. // Re-approved 2026-09-18 A TWENTY-FIFTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) — the seven pre-tag review findings on `/fusion:curate --edges`, six of them in `agents/curator.md` and the seventh in `skills/curate/SKILL.md`: paths 1659 -> 1663, anchors and stampBare unmoved. FOUR ADDED PATHS AND NO REMOVAL, MEASURED BY RESTORING EACH EDITED FILE TO HEAD IN PLACE RATHER THAN BY SUBTRACTION — with HEAD's copy of `agents/curator.md` and every other working-tree change left standing, including the `skills/curate/SKILL.md` edit, the gate resolves 1659/285/11 and passes 38/38, so the skill body owes nothing and the whole delta is the agent prompt. THE FOUR ARE: `hooks/lib/work-graph.ts` TWICE, once in the corrected legacy-status sentence naming where the Circle record's missing `**Status:**` field is stated as design and once in the post-write compare's new uniqueness count, naming `headField()` as what hides a duplicated field line; `bin/fusion-work-order` ONCE beside it, naming what the hidden duplicate loses the confirmed edge out of; and `skills/curate/SKILL.md` ONCE in `### Pass 2 — apply`, in the clause forbidding either file from claiming the whole-line comparison on an edge entry's behalf. Counted per occurrence, so the two `hooks/lib/work-graph.ts` tokens owe one each, and 1659 +4 -0 = 1663 with no residual. NO ANCHOR MOVES IN EITHER DIRECTION: none of the four is followed by a backticked heading, and the section references the same edits add (`### Pass 2 — apply`, `### The suppression read, and the candidate row first`) follow no path token and are not of that class. // Re-approved 2026-09-18 A TWENTY-FOURTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) — the v11.7.0 release surfaces, whose only text move is the update topic in `skills/help/SKILL.md` gaining its 11.7.0 paragraph and dropping its oldest of three: paths 1660 -> 1659, anchors and stampBare unmoved. ONE ADDED PATH AND TWO REMOVED, MEASURED BY RESTORING THE EDITED FILE TO HEAD IN PLACE RATHER THAN BY SUBTRACTION — with HEAD's copy of `skills/help/SKILL.md` and every other working-tree change left standing the gate resolves 1660/285/11 and passes 38/38, so the whole delta is that one body and none of `.claude-plugin/plugin.json`, `install.sh`, `README.md` or `hooks/lib/__tests__/fixtures/surface-growth.golden` owes anything — the version surfaces move a version string and a description clause, neither a token of any pinned class, and the golden is not scanned at all. THE ADDED ONE IS `bin/fusion-work-order`, in the new paragraph's clause naming what has computed order, depth, blocked counts, readiness and cycles over edges only a hand-written entry could supply; blanking that paragraph alone against the rest of the edit resolves 1658, which confirms it owes exactly one AND that the two swaps do not interact. The two removed are `CLAUDE.md` and `$FUSION_SRC/rules/context-lean-claude-md.md`, both in the 11.5.0-labelled paragraph this edit drops, and 1660 +1 -2 = 1659 with no residual. NO ANCHOR MOVES IN EITHER DIRECTION: no backticked heading follows any of the three. // Re-approved 2026-09-18 A TWENTY-THIRD TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) — the five repairs the ADVERSARIAL READ of the first edge run asked for (`260918-0827-adversarial-read-of-the-first-edge-run.md`), every one of them in `agents/curator.md` and in no other scanned file: paths 1657 -> 1660, anchors 284 -> 285, stampBare unmoved. THREE ADDED PATHS AND ONE ADDED ANCHOR, NO REMOVAL, MEASURED THE SAME WAY THE ENTRY BELOW MEASURED ITS OWN — with `agents/curator.md` restored to HEAD in place and every other working-tree change left standing the gate resolves 1657/284 and passes 38/38, so the whole delta is that one prompt. The three paths: `rules/critical-stance.md` §4, cited where the near endpoint's identification is stated to be undecidable from the inputs the pass has; `rules/fusion-workbench-conventions.md` carrying `## Backlog entries — work items`, cited where the absent-field write derives its insertion point from the record template's field order — that pair is the one added anchor; and `bin/fusion-paths` bare, naming the helper that prints `WORKBENCH` as a `KEY=value` line and exports it into no shell, which is why the revert path on an edge entry did not run. Nothing cancels them: the sentences these edits replaced carried no citation of either class, and the record citations the same edits add — six issue records, one analysis and one new open decision — are of the `records` class, which left this pin on 2026-08-24. // Re-approved 2026-09-18 A TWENTY-SECOND TIME, ON THIS LINE FOR THE REASON THE ENTRY BELOW GIVES (an entry is an attribution, not a line) — the repairs the FIRST RUN of the work-item edge subject found in its own text (`260918-0738-curator-run.md` `## 6`), every one of them in `agents/curator.md` and in no other scanned file: paths 1654 -> 1657, anchors 282 -> 284, stampBare unmoved. THREE ADDED PATHS AND TWO ADDED ANCHORS, NO REMOVAL, MEASURED BY RESTORING THE ONE EDITED SCANNED FILE TO HEAD IN PLACE RATHER THAN BY SUBTRACTION — with `agents/curator.md` at HEAD and every other working-tree change left standing the gate resolves 1654/282 and passes, so the whole delta is that one prompt. The three paths: `rules/fusion-workbench-conventions.md` twice, carrying `## Backlog entries — work items` where the legacy status vocabulary is excluded by rule and `## Filename Patterns` where the ledger's `**File:**` line is bound to a storeless basename — those two are the two added anchors — and `bin/fusion-work-order` bare in the suppression sentence widened to the target's status. Nothing cancels them: the sentences those edits replaced carried no citation of either class, and the two record citations the same edits add are of the `records` class, which left this pin on 2026-08-24. // Re-approved 2026-09-18 A TWENTY-FIRST TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) AND BECAUSE THE hook-tests LINE SURFACE STANDS AT 26 LINES OF MARGIN THAT A NEW LINE WOULD SPEND ONE OF — steps 1 to 4 of `260918-0712_*_implementation-depends-on-edges-proposed-and-confirmed.md`, which give the curator a fourth SUBJECT and not a fourth surface, the work-item edge: paths 1641 -> 1654, anchors 272 -> 282, stampBare unmoved. THIRTEEN ADDED PATHS AND TEN ADDED ANCHORS, NO REMOVAL, MEASURED BY RESTORING EACH EDITED SCANNED FILE TO HEAD IN PLACE RATHER THAN BY SUBTRACTION. Four scanned files are edited and the two regenerated goldens are not scanned at all. With `agents/curator.md` at HEAD the gate resolves 1647/277, with `skills/curate/SKILL.md` at HEAD 1651/279, with `README-agents.md` at HEAD 1652/280, and with `rules/fusion-workbench-conventions.md` at HEAD 1653/281 — so the four owe 7, 3, 2 and 1 paths, and 7 + 3 + 2 + 1 = 13 WITH NO RESIDUE. THE ANCHORS INTERACT EXACTLY ONCE AND THE ONE IS NAMED: 5 + 3 + 2 + 1 = 11 against a delta of 10, because the rule file's new citation of `agents/curator.md` `## The fourth subject — work-item edges` DANGLES rather than resolving while that prompt stands at HEAD without the section it names, and is counted as a violation instead of an anchor — with BOTH files restored together the gate resolves 1646/277, so the prompt owes 4 anchors of its own and not 5, and 4 + 3 + 2 + 1 = 10. The prompt's seven paths: `skills/curate/SKILL.md` and `README-agents.md` bare in the authoring-home paragraph, `rules/fusion-workbench-conventions.md` three times — twice carrying `## Backlog entries — work items` and once `## Filename Patterns`, which are three of its four anchors — `rules/critical-stance.md` with a bare section reference and no backticked heading beside it, and `skills/curate/SKILL.md` a second time carrying `## Step 2 — Dispatch the curator to survey`, the fourth. The skill body's three are all `agents/curator.md`: twice with `### The gate`, where a duplicated consequence-group enumeration was replaced by a pointer to its authoring home, and once with `## Dispatch parameters` on the new `--edges` passthrough. The README row's two are `skills/curate/SKILL.md` with `## Step 2 — Dispatch the curator to survey` and `agents/curator.md` with `## Dispatch parameters`; ITS TRAILING SECOND HEADING COUNTS FOR NOTHING, this gate reading one anchor per path token. The rule file's one pair is the citation named above. NOTHING CANCELS THEM: the two dropped enumerations carried no token of any pinned class, and the "unruled" clause the rule file replaces cited only a workbench record basename, which is of no class this gate reads. | Re-approved 2026-09-17 A TWENTIETH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) AND BECAUSE THE hook-tests LINE SURFACE STANDS AT 26 LINES OF MARGIN THAT A NEW LINE WOULD SPEND ONE OF — the v11.6.0 release surfaces, whose rebuilt help topic is the whole of the move: paths 1644 -> 1641, anchors and stampBare unmoved. THREE REMOVED PATHS AND NOTHING ADDED, MEASURED BY RESTORING THE EDITED FILE TO HEAD IN PLACE RATHER THAN BY SUBTRACTION. Three of the five working-tree changes are scanned at all — `skills/help/SKILL.md`, `README.md` and `install.sh` — and with HEAD's copy of the help body standing beside the other two the gate resolves 1644 and PASSES, so the two version-string edits owe nothing and the whole of the -3 is that one body's update topic, which was a release behind: the 11.4.0- and 11.3.0-labelled paragraphs came out, 11.5.1- and 11.5.0-labelled ones went in, net -170 bytes. THE THREE ARE ATTRIBUTED ONE BY ONE, each by blanking THAT PARAGRAPH ALONE out of HEAD's copy and leaving the rest of HEAD standing: without the 11.4.0-labelled one the gate resolves 1642, so it owed TWO — `$FUSION_SRC/docs/working-model.md` and `$FUSION_PLUGIN_ROOT/bin/fusion-work-order`; without the 11.3.0-labelled one it resolves 1643, so it owed ONE, `$FUSION_SRC/docs/upgrading-to-v11-4.md`; without both it resolves 1641, which is the working tree's own figure. 2 + 1 = 3 WITH NO RESIDUE, and THE TWO NEW PARAGRAPHS ADD NO TOKEN OF ANY PINNED CLASS, which is why that last measurement lands on the working tree's number rather than above it. No anchor moves with the three: none of them carried a backticked heading. WHAT WAS NOT DONE, NAMED SO IT STAYS NOT DONE — three citations were not added back into the help body to make 1644 fit. Padding a text to satisfy a count is the drift this pin exists to catch, and the assertion's own message names re-approval as the intended response. | Re-approved 2026-09-17 A NINETEENTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) AND BECAUSE THE hook-tests LINE SURFACE HAS EXACTLY 22 LINES A CUT JUST BOUGHT AND AN ENTRY WOULD SPEND ONE OF THEM — commit B of `260917-1124_*_implementation-fusion-discuss-a-two-agent-discussion-loop.md`, which adds `/fusion:discuss`: paths 1625 -> 1644, anchors 268 -> 272, stampBare unmoved. NINETEEN ADDED PATHS AND FOUR ADDED ANCHORS, NO REMOVAL, MEASURED BY RESTORING EACH EDITED SCANNED FILE TO HEAD IN PLACE RATHER THAN BY SUBTRACTION. Three scanned files are edited and the other three working-tree changes are not scanned at all. `skills/discuss/SKILL.md` (step B8) owes TEN PATHS AND ALL FOUR ANCHORS; `README-agents.md` (step B9) owes ONE PATH; `README-hooks.md` (step B12) owes EIGHT PATHS AND NO ANCHOR, and 1625 +10 +1 +8 = 1644 with no residual. THE TWO SWAPS THAT INTERACT ARE NAMED: with the new body moved aside alone the gate resolves 1625, which is ELEVEN down rather than ten, because `README-agents.md`'s new roster row CITES that body and the token DANGLES instead of resolving once the target is gone — with the body standing and `README-agents.md` restored it resolves 1635, so the row owes exactly one and the body ten; and with `README-hooks.md` restored, both others standing, it resolves 1636, so the whole of the rest is that one file. The body's ten are four `rules/fusion-workbench-conventions.md`, each carrying a backticked heading — `## Path Resolution`, `## Filename Patterns`, `## Timestamps`, `## Project language` — WHICH ARE ALSO THE WHOLE OF THE ANCHOR MOVE, and six `$FUSION_PLUGIN_ROOT/`-rooted helper tokens: `bin/fusion-identity` twice, `bin/fusion-session-domain` twice, `bin/fusion-paths` once and `bin/fusion-workbench-root` once. The README-agents row's one is `skills/discuss/SKILL.md`; the `/fusion:discuss` tokens added in the same commit to that file's roster bullet are command tokens of no pinned class, which is why the row moves `paths` alone. The README-hooks eight are the two head-room log entries' citations of what the raise bought and what the cut took: `bin/fusion-paths` twice, and `hooks/lib/__tests__/fusion-paths.test.ts`, `hooks/lib/__tests__/rules-emission-golden.test.ts`, `hooks/lib/__tests__/fixtures/dispatch-path.baseline`, `hooks/lib/__tests__/helpers/growth-bound.ts`, `skills/discuss/SKILL.md` and `rules/fusion-workbench-conventions.md` once each. NOTHING CANCELS THEM: the three tokens standing on lines that entry rewrites — `skills/*/SKILL.md` twice and `hooks/lib/__tests__/surface-growth-bound.test.ts` once, in the bound table's head-room row and the running-total sentences — appear identically on both sides of the diff. NO ANCHOR MOVES WITH THE README: its one added backticked heading, `## Re-baselining`, rides a `.ts` path, and `ANCHOR_RE` reads an anchor only where a backticked `.md` path is followed by one. THE TWO EDITED TEST FILES OWE NOTHING AND COULD NOT: `surface()` enumerates `hooks/lib/*.ts` non-recursively, so the 45-line cut in `fusion-paths.test.ts` and the `SKILL_HEAD_ROOM` raise in `surface-growth-bound.test.ts` move no count here, and the tokens in this comment are not counted either. | Re-approved 2026-09-17 AN EIGHTEENTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line): paths 1624 -> 1625, anchors and stampBare unmoved. The `**Depends-on:**` paragraph in `rules/fusion-workbench-conventions.md` said as a PROPERTY OF THE FIELD what is a RULE ABOUT WHO MAY WRITE IT — "it carries only edges the user has confirmed", a sentence `260911-1528_*_spec-prerequisites-confirmed-once-order-computed.md` had already measured false of the only entry then in the store — and it phrased the computed order as advisory ("that report is a report") where the binding record it cites answered option 3, under which the computed order stands unless the user overrides it. Both are corrected, the helper that computes the order is named, and the paragraph now states in one clause that WHETHER AN AGENT MAY PROPOSE AN ENTRY FOR THE USER TO CONFIRM IS UNRULED, citing the open issue that would own such a pass. ONE ADDED PATH AND NO ANCHOR, MEASURED BY RESTORING THE EDITED FILE TO HEAD IN PLACE RATHER THAN BY SUBTRACTION — with HEAD's copy of that rule file the gate resolves 1624 and passes, and it is the only scanned file this commit edits, the emission golden regenerated beside it not being scanned at all. The token is a SECOND occurrence of `bin/fusion-work-order`, in the clause naming what computes the order; the paragraph's other new citation, `260909-1020_*_three-source-aspects-unnamed-and-the-proposal-pass-has-no-agent-or-surface.md`, is a workbench basename of no class this gate reads — blanking it alone against the rest of the edit still resolves 1625, which confirms it costs nothing. Nothing cancels the +1: the clause it replaces cited no path. | Re-approved 2026-09-16 A SEVENTEENTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) AND BECAUSE THE HOOK-TEST LINE SURFACE IS AT ZERO MARGIN AGAIN AFTER THE FOURTH `TEST_LINE_HEAD_ROOM` RAISE: paths 1619 -> 1624, anchors and stampBare unmoved. `/fusion:news` named a message's writer out of the working tree while reading the body out of a fetched ref, so a checkout that had registered in a commit the reader had fetched and not pulled was rendered as one that never registered (`260916-2105_*_the-news-skill-reads-an-entry-from-a-fetched-ref-and-names-its-writer-from-the-working-tree.md`); the fix is `resolve --at <commit>` in `bin/fusion-checkout-name`, and the skill body now passes `$HEAD` to both of its Step 4 calls. FIVE ADDED PATHS AND NO ANCHOR, MEASURED BY RESTORING EACH EDITED FILE TO HEAD IN PLACE RATHER THAN BY SUBTRACTION — with only `README-hooks.md` restored the gate resolves 1621, with only `bin/fusion-checkout-name` restored 1622, and with only `skills/news/SKILL.md` restored 1624, so the delta is 3 + 2 + 0 and nothing else modified owes anything. The two in the helper are `rules/workbench-tracking.md` and `bin/fusion-forum`, cited by the new header section for the store's travel class and for the sibling that derives the same git coordinate; the three in the README are `hooks/lib/__tests__/fusion-checkout-name.test.ts`, `bin/fusion-checkout-name` and `skills/news/SKILL.md`, named by the raise entry that logs what the raise bought. The skill body added none: its edit is net -17 bytes and cites nothing it did not already cite. | Re-approved 2026-09-16 A SIXTEENTH TIME, ON THIS LINE FOR THE REASON EVERY ENTRY BELOW GIVES (an entry is an attribution, not a line) AND BECAUSE THE HOOK-TEST LINE SURFACE IS STILL AT ZERO MARGIN: paths 1618 -> 1619, anchors and stampBare unmoved. The first worked classification in `rules/context-lean-claude-md.md` `### Two worked classifications` judged two lines — this repository's language declarations — where that section's own Step 1 makes the passage the unit and puts those lines inside `CLAUDE.md`'s preamble; the example now classifies the preamble, with the declarations as the measured reason it stays, and Step 2 gained the property that makes that a classification rather than a special case (a passage is judged whole and stays when any part of it is needed). ONE ADDED PATH AND NO ANCHOR, MEASURED BY RESTORING THE EDITED FILE TO HEAD IN PLACE RATHER THAN BY SUBTRACTION — with HEAD's copy of that rule file and every other working-tree change left standing, the gate resolves 1618/268/11 and passes, so the whole delta is that one file and nothing else modified owes anything. The added token is `CLAUDE.md`, naming the file whose preamble the example now classifies; the example previously named that file only in prose. | Re-approved 2026-09-16 A FIFTEENTH TIME, ON THIS LINE FOR THE REASON THE ENTRIES BELOW GIVE (an entry is an attribution, not a line) AND BECAUSE THE HOOK-TEST LINE SURFACE STANDS AT ZERO MARGIN AGAIN: paths 1616 -> 1618, anchors 267 -> 268, stampBare unmoved. The second worked classification in `rules/context-lean-claude-md.md` `### Two worked classifications` predicted in the present tense that this repository's release procedure would leave `CLAUDE.md`; it left, so the example now records the move instead of forecasting it and cites the commit that made it. TWO ADDED PATHS AND ONE ANCHOR, NO REMOVAL, MEASURED BY RESTORING THE EDITED FILE TO HEAD IN PLACE RATHER THAN BY SUBTRACTION — with HEAD's copy of that rule file and every other working-tree change left standing, the gate resolves 1616/267/11 and passes, so the whole delta is that one file and nothing else modified owes anything. The three tokens are `README-agents.md` and its `## Releasing` anchor, naming where the passage landed, and `CLAUDE.md`, naming the file whose heading kept the pointer; the commit hash the same sentence carries is no citation class this gate reads and is counted as nothing. | Re-approved 2026-09-16 A FOURTEENTH TIME, ON THIS LINE AGAIN AND FOR A SHARPER REASON THAN THE ENTRIES BELOW GIVE: an entry is an attribution and not a line, AND A NEW LINE HERE WOULD SPEND FROM THE HEAD-ROOM RAISE THE SAME EDIT JUST TOOK — the third `TEST_LINE_HEAD_ROOM` raise, 2 693 -> 2 821, accounted for in `README-hooks.md` `#### The head-room raises, and the reduction read on 2026-10-10` and nowhere else: paths 1608 -> 1616, anchors and stampBare unmoved. EIGHT ADDED PATHS AND NO ANCHOR, MEASURED BY RESTORING THE EDITED FILE TO HEAD IN PLACE RATHER THAN BY SUBTRACTION — with HEAD's copy of `README-hooks.md` and every other working-tree change left standing, the head-room constant's own edit included, the gate resolves 1608/267/11 and passes, so the whole delta is that one README and the constant owes nothing. That run also derives what this file's own surface is: the constant's edit added a backticked `README-hooks.md` inside `hooks/lib/__tests__/surface-growth-bound.test.ts` and the count did not move, so a `.ts` file under this directory is not scanned and the tokens in this comment are not counted either. The eight are the new raise entry's citations of what it funds and of what it leaves unmoved, each once: `hooks/lib/__tests__/fixtures/dispatch-path.baseline`, `hooks/lib/__tests__/claude-md-weight.test.ts`, `bin/fusion-claude-md-weight`, `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`, `README-agents.md`, `CLAUDE.md`, `skills/setup/SKILL.md` and `skills/check/SKILL.md`. A ninth spelling in the same entry resolves to nothing and is counted as nothing, which is why the figure is 8 and not 9: replacing a dangling `hooks/lib/__tests__/` with the glob form already standing elsewhere in that file emptied the dangling list and left paths at 1616 both times. | Re-approved 2026-09-16 A THIRTEENTH TIME, ON THIS LINE FOR THE REASON THE ENTRIES BELOW GIVE (an entry is an attribution, not a line) AND BECAUSE THE hook-tests LINE SURFACE STANDS AT ZERO LINES OF MARGIN — clearing `260916-1316_*_three-surfaces-state-the-heading-division-rule-and-two-of-them-answer-differently-on-fusions-own-claude-md.md`, which makes `rules/context-lean-claude-md.md` `### Step 1 — divide the file by heading, before judging anything` the single authoring home of the heading division and leaves the helper and the curator citing it: paths 1605 -> 1608, anchors and stampBare unmoved. THREE ADDED PATHS AND NO ANCHOR, MEASURED BY SWAPPING EACH EDITED FILE BACK TO HEAD IN PLACE RATHER THAN BY SUBTRACTION — with HEAD's copy of `rules/context-lean-claude-md.md` and every other working-tree change left standing the gate resolves 1605/267/11 and passes, so the whole delta is that one rule file; with HEAD's copy of `bin/fusion-claude-md-weight` it resolves 1608 and with HEAD's copy of `agents/curator.md` it resolves 1608, so neither of those owes anything. THE HELPER'S HEADER LOSES A NORMATIVE RESTATEMENT AND GAINS AN IMPLEMENTATION NOTE, keeping its one `rules/context-lean-claude-md.md` token with the `### Step 1 …` anchor riding it, which is why neither count moves there; the curator's two edits name the unit in prose and extend the citation that prompt already carried, adding no backticked path and no heading beside one. The rule file's three are `bin/fusion-claude-md-weight` and `agents/curator.md`, in the closing paragraph naming what applies the division without restating it, and `CLAUDE.md` in the clause saying fusion's own file is the lone-`#` case the counting rule passes over. EACH IS CONFIRMED ALONE: blanking any one of the three against the rest of the edit resolves 1607, so 1605 +1 +1 +1 = 1608 with no residual AND THE THREE DO NOT INTERACT. NONE CARRIES AN ANCHOR — no backticked heading follows any of them — which is why `anchors` stands. Nothing cancels them: the two-branch wording this edit replaces cited no path at all, and the workbench spec amended in the same pass is not scanned by this gate. // Re-approved 2026-09-16 A TWELFTH TIME, ON THIS LINE FOR THE REASON THE ENTRIES BELOW GIVE (an entry is an attribution, not a line) AND BECAUSE THE hook-tests LINE SURFACE STANDS AT ZERO LINES OF MARGIN — clearing `260916-1320_*_readme-hooks-promises-the-fourth-bound-a-section-of-its-own-and-the-file-has-none.md`, the sentence that sent a reader "below" to a section `README-hooks.md` has never had: paths 1603 -> 1605, anchors and stampBare unmoved. TWO ADDED PATHS AND NO ANCHOR, MEASURED BY SWAPPING THE EDITED FILE BACK TO HEAD IN PLACE RATHER THAN BY SUBTRACTION — with HEAD's copy of `README-hooks.md` and every other working-tree change left standing the gate resolves 1603/267/11 and passes, so the whole delta is that one file and neither `hooks/lib/citation-corpus.ts` nor `hooks/lib/__tests__/config.test.ts`, each edited in the same pass, owes anything: `hooks/lib` is scanned records-only and the class-(a) paths in both are read by nothing here. THE FIX IS A POINTER AND NOT A NEW SECTION, which is what the two tokens are — the promise now names where the per-dispatch-path bound is authored instead of promising to restate it: `hooks/lib/__tests__/rules-emission-golden.test.ts` for the banner comment and the head-room constant under it, and `hooks/lib/__tests__/fixtures/dispatch-path.baseline` for the eleven rows and the arming provenance. EACH IS CONFIRMED ALONE: blanking the first against the rest of the edit resolves 1604 and blanking the second resolves 1604, so 1603 +1 +1 = 1605 with no residual and THE TWO SWAPS DO NOT INTERACT. NEITHER CARRIES AN ANCHOR, and neither could — a banner comment in a TypeScript file is not a Markdown heading, and `ANCHOR_RE` above reads an anchor only where a backticked `.md` path is followed by a backticked heading — which is why `anchors` does not move with them. Nothing cancels them: the other three corrections of this pass rewrite figures and a stale tense on lines whose tokens stand unchanged on both sides of the diff (84 to 81 and 51 to 48 in the head-room raise log, the `PORTFOLIO` comment, and the two `PROJECT_SET_KEYS` comments), and the bare word "below" dropped from the sentence about the always-on row is a token of no pinned class. // Re-approved 2026-09-16 AN ELEVENTH TIME, ON THIS LINE FOR THE REASON THE ENTRIES BELOW GIVE (an entry is an attribution, not a line) AND BECAUSE THE hook-tests LINE SURFACE STANDS AT ZERO LINES OF MARGIN — step 8 of `260916-1126_*_implementation-human-facing-docs-leave-claude-md.md`, the relocation that takes the human-directed documentation out of `CLAUDE.md` into the two READMEs: paths 1570 -> 1603, anchors 242 -> 267, stampBare unmoved. THIRTY-THREE ADDED PATHS AND TWENTY-FIVE ADDED ANCHORS ON A CUT OF 54 391 BYTES, MEASURED BY SWAPPING EACH EDITED FILE BACK TO HEAD IN PLACE RATHER THAN BY SUBTRACTION, every other working-tree change left standing. THE COUNT GOES UP WHILE THE TEXT GOES DOWN, and that is the shape of this move rather than a fault in it: the pointer lines `CLAUDE.md` keeps in place of each departed passage name a file AND a section, so a citation that stood once now stands twice — once where the passage landed and once where it left. With HEAD's copies of `CLAUDE.md`, `README-agents.md` and `README-hooks.md` all standing the gate resolves 1570/242/11 and passes, so nothing else in the tree owes anything. Per file, each swapped alone: `CLAUDE.md` resolves 1478/248, so the cut owes -92 paths and +6 anchors; `README-agents.md` resolves 1648/256, so it owes +78 and +14; `README-hooks.md` resolves 1615/244, so it owes +45 and +2. THE PATHS ARE ADDITIVE WITH NO RESIDUAL: -92 +78 +45 = +31 exactly. THE ANCHORS INTERACT BY EXACTLY +3 AND THE THREE ARE NAMED: 6 + 14 + 2 = 22, and the missing three are the pointer anchors at `CLAUDE.md:28` and `CLAUDE.md:58` (`README-agents.md` `## Releasing`) and at `CLAUDE.md:66` (`README-hooks.md` `## Where to look when something breaks`), which DANGLE rather than resolve while the destination stands at HEAD without the section that moved into it, and are counted as violations instead of anchors — with both destinations in place all three resolve, and 22 + 3 = 25. THE REMAINING +2 IS NOT THE RELOCATION'S but this step's own: the `domain-cascade` reach block in `README-hooks.md`, regenerated from `hooks/lib/domain-cascade.ts` because the `REACH.excluded` entry for `CLAUDE.md` was re-measured from `fires` to `clean` when the one line that fired left for `README-agents.md`. Both added tokens are that file name, one in the re-measured note and one as the new entry's own glob; each was confirmed alone at 1602 and the two do not interact. NO ANCHOR MOVES WITH THEM, neither being followed by a backticked heading. THE TWO EDITED TEST FILES OWE NOTHING: with the regenerated block swapped back to the relocation's copy the gate resolves 1601, which is the relocation's own figure, so the file names the retarget comments in `derivable-enumerations-lint.test.ts` carry are read by nothing here — `hooks/lib` is scanned records-only. // Re-approved 2026-09-16 A TENTH TIME, ON THIS LINE FOR THE REASON THE ENTRIES BELOW GIVE (an entry is an attribution, not a line) AND BECAUSE THE hook-tests LINE SURFACE STANDS AT ZERO LINES OF MARGIN — the curator is told where the placement criterion is authored, closing `260916-1157_*_nothing-tells-the-curator-where-the-placement-criterion-is-authored.md`: paths 1568 -> 1570, anchors 241 -> 242, stampBare unmoved. TWO ADDED PATHS AND ONE ADDED ANCHOR, ALL IN ONE ADDED SENTENCE, MEASURED BY SWAPPING THE EDITED FILE BACK TO HEAD IN PLACE RATHER THAN BY SUBTRACTION — with HEAD's copy of `agents/curator.md` and every other working-tree change left standing the gate resolves 1568/241/11 and passes, so the whole delta is that one prompt and `hooks/lib/__tests__/fixtures/surface-growth.golden`, regenerated in the same edit, owes nothing because it is not scanned at all. The sentence's two paths are `$FUSION_PLUGIN_ROOT/rules/context-lean-claude-md.md`, the criterion's authoring home, and `bin/fusion-rules`, named to say that helper emits it to no agent; its one anchor is `## How to tell "always-on" from "on-demand"` riding the first of them. THE ANCHOR IS CONFIRMED ALONE: deleting that one backticked heading against the rest of the edit resolves 1570/241, which moves `anchors` back and leaves `paths` where the two tokens put it. Nothing cancels them: the sentence is an addition and no line was removed from any scanned file. // Re-approved 2026-09-16 A NINTH TIME, ON THIS LINE FOR THE REASON THE ENTRIES BELOW GIVE (an entry is an attribution, not a line) AND BECAUSE THE hook-tests LINE SURFACE STANDS AT ZERO LINES OF MARGIN — the 11.5.0 release surfaces, whose only text move is the update topic in `skills/help/SKILL.md` gaining its 11.5.0 paragraph and dropping its oldest of three: paths 1567 -> 1568, anchors and stampBare unmoved. ONE ADDED PATH ON A NET OF TWO ADDED AND ONE REMOVED, MEASURED BY SWAPPING EACH EDITED FILE BACK TO HEAD IN PLACE RATHER THAN BY SUBTRACTION, every other working-tree change left standing. With HEAD's copy of `skills/help/SKILL.md` the gate resolves 1567/241/11 and passes, so the whole delta is that one body and none of `.claude-plugin/plugin.json`, `install.sh`, `README.md` or `hooks/lib/__tests__/fixtures/surface-growth.golden` owes anything — the three version surfaces move a version string, which is a token of no pinned class, and the golden is not scanned at all. The new paragraph's two are `CLAUDE.md`, in the clause saying what the eleventh check reports on, and `$FUSION_SRC/rules/context-lean-claude-md.md`, in the clause naming the test a reader can apply to one heading; blanking either alone against the rest of the edit resolves 1567, which confirms each. NEITHER CARRIES AN ANCHOR, which is why `anchors` does not move with them. The removal is the 11.2.0 paragraph this edit drops, which cited `$FUSION_PLUGIN_ROOT/bin/fusion-work-order` once: re-inserting that paragraph verbatim against the rest of the edit resolves 1569, so it owes exactly the -1, and 1567 +2 -1 = 1568 with no residual. THE REWRITTEN TAIL OF THE 11.4.1 PARAGRAPH CANCELS NOTHING, which is what that residual-free arithmetic also shows: it re-points a cross-reference at the paragraph just dropped and keeps both of its own tokens, `$FUSION_PLUGIN_ROOT/bin/fusion-work-order` and `$FUSION_SRC/docs/working-model.md`. // Re-approved 2026-09-16 AN EIGHTH TIME, ON THIS LINE FOR THE REASON THE ENTRIES BELOW GIVE (an entry is an attribution, not a line) AND BECAUSE THE hook-tests LINE SURFACE STANDS AT ZERO LINES OF MARGIN — the relocation defect pass over `agents/curator.md` and the eleventh selector reaching Setup's due list, clearing `260916-1310` to `260916-1313`: paths 1565 -> 1567, anchors 239 -> 241, stampBare unmoved. TWO ADDED PATHS AND TWO ADDED ANCHORS, MEASURED BY SWAPPING EACH EDITED FILE BACK TO HEAD IN PLACE RATHER THAN BY SUBTRACTION, every other working-tree change left standing. With HEAD's copy of `agents/curator.md` the gate resolves 1566/240, so that prompt owes one of each; with HEAD's copy of `README-agents.md` it resolves 1566/240, so the roster row owes the other; THE TWO SWAPS DO NOT INTERACT — 1 + 1 = 2 in both classes, neither file citing the other's addition. Swapping back `skills/setup/SKILL.md` or `hooks/lib/__tests__/fixtures/surface-growth.golden` moves nothing, so neither owes anything: the skill body's edit adds one string to a JavaScript array literal and drops three words from a sentence, neither of which is a token of any pinned class, and the golden is not scanned at all. The prompt's pair is `skills/curate/SKILL.md` with its `## Step 2 — Dispatch the curator to survey` anchor, cited once in the new placement-is-opt-in paragraph at the clause naming what that command passes on its two dispatches; blanking that one parenthesis against the rest of the edit resolves 1566/240, which confirms it alone. The roster row's pair is `agents/curator.md` with its `## Dispatch parameters` anchor, in the last cell of the new `**Placement:**` row; blanking that cell alone resolves 1566/240 likewise. THE SECOND BACKTICKED HEADING IN EACH PAIR COUNTS FOR NOTHING, which is what both confirmations also show: `## Step 6 — Dispatch the curator to apply` and `## Remit` each follow an anchor rather than a path, and this gate reads one anchor per path token. Nothing cancels them: every other citation the curator edit adds is a bare same-document heading, which carries no path and is of no pinned class, and the sentence the edit lifted out of `## Reporting work you may not do` into the apply pass carried no token of either class in either place. // Re-approved 2026-09-16 A SEVENTH TIME, ON THIS LINE FOR THE REASON THE ENTRIES BELOW GIVE (an entry is an attribution, not a line) AND BECAUSE THE hook-tests LINE SURFACE NOW STANDS AT ZERO LINES OF MARGIN — step 5 of `260916-1126_*_implementation-human-facing-docs-leave-claude-md.md`, which adds `hooks/lib/__tests__/claude-md-weight.test.ts` and logs the head-room raise that paid for it in `README-hooks.md`: paths 1560 -> 1565, anchors and stampBare unmoved. FIVE ADDED PATHS AND NO ANCHOR, MEASURED BY SWAPPING EACH EDITED FILE BACK TO HEAD IN PLACE RATHER THAN BY SUBTRACTION, every other working-tree change left standing. ALL FIVE ARE `README-hooks.md`: with HEAD's copy of it the gate resolves 1560/239/11 and passes, and swapping back `hooks/lib/__tests__/surface-growth-bound.test.ts` or `hooks/lib/__tests__/fixtures/surface-growth.golden` moves nothing, so neither owes anything — the constant's raise to 2 693 is a line-neutral edit to a doc comment, and the golden is not scanned at all. THE NEW TEST FILE OWES NOTHING OF ITS OWN AND THE MEASUREMENT LOOKS AS IF IT DOES, which is the one interaction here: moved aside with the new `README-hooks.md` standing, the gate resolves 1564, but that missing 1 is the README's CITATION of the file dangling rather than the file's own contribution — `hooks/lib` is scanned records-only, so the test's own citations of `bin/fusion-claude-md-weight` and of the two rules it names are read by nothing here, and swapping README and the test file back TOGETHER resolves 1560, not 1559. The README's five: `bin/fusion-claude-md-weight` twice (the helper the test reads, and the alternative the user was shown of landing it untested), `hooks/lib/__tests__/claude-md-weight.test.ts` once, `CLAUDE.md` once (in the clause naming the stated zero the helper prints where a root has none) and `hooks/lib/__tests__/fixtures/surface-growth.golden` once, in the paragraph that sends a later reader there for what the surface measures today instead of restating a figure in the present tense. NO ANCHOR MOVES: the golden citation names the block `[hook-tests lines]`, which is a fixture block name and not a heading, and `/fusion:curate` is a command token of no pinned class, as the fifth entry below already found. Nothing cancels them: the six count corrections the same edit makes elsewhere in that section — two raises to five, once to twice, +95 to +193, 2 595 to 2 693, and the sentence summing the hook-test raises — rewrite lines whose tokens stand unchanged on both sides of the diff. // Re-approved 2026-09-16 A SIXTH TIME, ON THIS LINE FOR THE REASON THE ENTRIES BELOW GIVE (an entry is an attribution, not a line) AND BECAUSE THE hook-tests LINE SURFACE STANDS AT 9 LINES OF MARGIN — step 4 of `260916-1126_*_implementation-human-facing-docs-leave-claude-md.md`, which adds the `claude-md` selector to `skills/check/SKILL.md` and the eleventh item to the `/fusion:check` row in `README-agents.md`: paths 1556 -> 1560, anchors and stampBare unmoved. FOUR ADDED PATHS AND NO ANCHOR, MEASURED BY SWAPPING EACH EDITED FILE BACK TO HEAD IN PLACE RATHER THAN BY SUBTRACTION, every other working-tree change left standing. With HEAD's copy of `skills/check/SKILL.md` the gate resolves 1557, so that body owes +3; with HEAD's copy of `README-agents.md` it resolves 1559, so that row owes +1; THE TWO SWAPS DO NOT INTERACT — 3 + 1 = 4 exactly, neither file citing the other's addition. The skill body's three: `$FUSION_PLUGIN_ROOT/bin/fusion-claude-md-weight`, cited once in the guarded call and confirmed alone by blanking that one line against the rest of the edit, which resolves 1559; and `CLAUDE.md` twice, in the new selector-table row and the new section heading. The README's one is `CLAUDE.md`, in the eleventh item its enumeration gains. NO ANCHOR MOVES: neither addition spells a heading beside a backticked file name, and `/fusion:curate`, which the reporting rule names as what acts on a finding, is a command token of no pinned class. Nothing cancels them: both edits are additions and no line was removed from any scanned file. // Re-approved 2026-09-16 A FIFTH TIME, ON THIS LINE FOR THE REASON THE ENTRIES BELOW GIVE (an entry is an attribution, not a line) AND BECAUSE THE hook-tests LINE SURFACE STANDS AT 9 LINES OF MARGIN — step 3 of `260916-1126_*_implementation-human-facing-docs-leave-claude-md.md`, which adds `bin/fusion-claude-md-weight` and its row in the `bin/` roster: paths 1542 -> 1556, anchors 237 -> 239, stampBare unmoved. FOURTEEN ADDED PATHS AND TWO ADDED ANCHORS, MEASURED BY SWAPPING EACH EDITED FILE BACK TO HEAD IN PLACE RATHER THAN BY SUBTRACTION. With the new helper moved aside AND HEAD's copy of `README-hooks.md` restored, every other working-tree change left standing, the gate resolves 1542/237/11 exactly, so nothing else in the tree owes anything. With the helper alone moved aside it resolves 1546, and with `README-hooks.md` alone restored it resolves 1551 — 4 + 9 rather than 14, and THE TWO SWAPS INTERACT EXACTLY ONCE: the roster row cites the helper itself, so with the helper gone that token DANGLES instead of resolving and the row is measured one short of its own contribution, which is 5. The helper's nine are on its header comment lines, the only lines of a `bin/` file this gate scans: `CLAUDE.md` five times (the file it measures, named in the purpose line, the threshold reasoning and the root paragraph), `rules/context-lean-claude-md.md` twice, `bin/fusion-plan-size` once (the chosen-value precedent its threshold follows) and `bin/fusion-review-coverage` once (the stdout-verdict precedent its exit table follows). Its two anchors ride the two `rules/context-lean-claude-md.md` tokens already counted above and add no path of their own — `## How to tell "always-on" from "on-demand"`, the criterion the helper defers to, and `### Step 1 — divide the file by heading, before judging anything`, the unit it divides by; both were written with the path BARE at first, which is a spelling this gate does not read as an anchor at all, and backticking it is what brought them into scope. The roster row's five: `bin/fusion-claude-md-weight`, `CLAUDE.md` twice, `rules/context-lean-claude-md.md` and `bin/fusion-plan-size`, with NO anchor, which is why the row moves `paths` alone. Nothing cancels either side: both edits are additions, and no line was removed from any scanned file. // Re-approved 2026-09-16 A FOURTH TIME, ON THIS LINE FOR THE REASON THE ENTRIES BELOW GIVE (an entry is an attribution, not a line) AND BECAUSE THE hook-tests LINE SURFACE STANDS AT 9 LINES OF MARGIN — the 11.4.1 release surfaces, whose only text move is the update topic in `skills/help/SKILL.md` gaining its 11.4.1 paragraph and dropping its oldest of three: paths 1540 -> 1542, anchors and stampBare unmoved. TWO ADDED PATHS, MEASURED BY SWAPPING THE EDITED FILE BACK TO HEAD IN PLACE RATHER THAN BY SUBTRACTION — with HEAD's copy of `skills/help/SKILL.md` and every other working-tree change left standing the gate resolves 1540/237/11 and passes, so the whole delta is that one body and none of `docs/working-model.md`, `.claude-plugin/plugin.json`, `install.sh`, `README.md` or `hooks/lib/__tests__/fixtures/surface-growth.golden` owes anything — which is also what settles the two work-order prefix fixes this release carries: prefixing a token that already resolved moves no count in either direction. The tokens are `$FUSION_PLUGIN_ROOT/bin/fusion-work-order` and `$FUSION_SRC/docs/working-model.md`, cited once each in the new paragraph's closing clause naming what the two corrected sentences now read; NEITHER CARRIES AN ANCHOR, which is why `anchors` does not move with them. Nothing cancels them: the 11.1.0 paragraph the same edit drops carried no token of any pinned class, so the +2 is a gross and a net at once. // Re-approved 2026-09-16 A THIRD TIME, ON THIS LINE FOR THE REASON THE ENTRIES BELOW GIVE (an entry is an attribution, not a line) — clearing the seven findings of the pre-tag review `260916-0740-reviewer-pre-tag-pass-over-the-log-activity-cadence-merge.md`: paths 1538 -> 1540, anchors and stampBare unmoved. TWO ADDED PATHS, MEASURED BY SWAPPING EACH EDITED FILE BACK TO HEAD IN PLACE RATHER THAN BY SUBTRACTION, every other working-tree change left standing. `rules/fusion-workbench-conventions.md` resolves 1539, so it owes +1 — `bin/fusion-identity`, cited in the new `## Filename Patterns` sentence that states what a writer of a checkout-keyed file does when no `CHECKOUT=` line is printed; it carries NO anchor, which is why `anchors` does not move with it. `README-hooks.md` resolves 1539, so it owes +1 — a second occurrence of `hooks/lib/__tests__/fixtures/surface-growth.golden`, in the corrected "What is left of it" paragraph, which now names the commit its figure was taken at and sends a later reader to the golden for what the surface measures today, instead of stating a mid-landing total in the present tense. NO TWO SWAPS INTERACT HERE, so 1538 +1 +1 = 1540 exactly. Swapping back `skills/cleanup/SKILL.md`, `skills/cadence/SKILL.md`, `skills/archive/SKILL.md`, `skills/help/SKILL.md`, `rules/workbench-path-resolution.md`, `README.md`, `docs/fusion-intro.md` or `docs/upgrading-to-v11-4.md` moves nothing, so none of the eight owes anything: the resolver rule's worked call changes `fusion-paths log-activity` to `fusion-paths cadence`, a bare word in neither spelling; the `**Covers:**` corrections in the three release surfaces, the restored guardrail clause in the archive body, the empty-`$CO` bullet and the `## Total commits` create-template section add prose and no token of any pinned class. // Re-approved 2026-09-16 A SECOND TIME, ON THIS LINE FOR THE REASON THE ENTRY BELOW GIVES (an entry is an attribution, not a line), AND IT IS THE OTHER HALF OF THE LANDING THAT ENTRY SAID IT COVERED ONLY HALF OF — steps S5 to S7 of `260915-2309_*_merge-log-activity-into-cadence.md`, which re-point the two dangling tokens, take the departed command out of the prose surfaces, and ship the release note: paths 1533 -> 1538, anchors and stampBare unmoved. FIVE ADDED PATHS ON A NET, MEASURED BY SWAPPING EACH EDITED FILE BACK TO HEAD IN PLACE RATHER THAN BY SUBTRACTION, every other working-tree change left standing. `rules/fusion-workbench-conventions.md` resolves 1537, so it owes +1 — S5's rename of the frozen-store consumer onto `skills/cadence/SKILL.md`, which is exactly the token the entry below predicted would come back. `README.md` resolves 1537, so it owes +1, its new `**Upgrading from v11.0, v11.1, v11.2 or v11.3?**` paragraph citing `docs/upgrading-to-v11-4.md`. `skills/help/SKILL.md` resolves 1540, so it owes -2 on a net: the update topic drops its oldest of three paragraphs, which cited `agents/orchestrator.md` and `bin/fusion-work-order`, and the new one adds `$FUSION_SRC/docs/upgrading-to-v11-4.md`. Deleting the new `docs/upgrading-to-v11-4.md` resolves 1532, which is -6 and NOT that file's own contribution: five are its own citations (`fusion.json`, `skills/cadence/SKILL.md`, `README.md`, `README-agents.md`, `docs/upgrading-to-v11.md`) and the sixth is the help body's citation OF it, which dangles once the target is gone — the one place in this measurement where two swaps interact, and it is why 1533 +1 +1 -2 +5 = 1538 rather than +6. Swapping back `README-agents.md`, `CLAUDE.md`, `docs/fusion-intro.md`, `docs/upgrading-to-v11.md` or `skills/cleanup/SKILL.md` moves nothing, so none of the five owes anything: the `README-agents.md` row S6 deletes carried `skills/log-activity/SKILL.md`, which DANGLED rather than resolved, so removing it settles a violation and no count; and the restatements of the departed command as a bare name in the other four are not tokens of any pinned class in either spelling. // Re-approved 2026-09-16, ON THIS LINE FOR THE REASON THE SECOND AND THIRD ENTRIES GIVE (an entry is an attribution, not a line), AND THE FIRST MOVE THAT GOES DOWN (`/fusion:log-activity` merges into `/fusion:cadence` and its body is deleted): paths 1541 -> 1533, anchors 239 -> 237, stampBare unmoved. EIGHT REMOVED PATHS AND TWO REMOVED ANCHORS, MEASURED BY SWAPPING EACH EDITED FILE BACK TO HEAD IN PLACE RATHER THAN BY SUBTRACTION. With HEAD's copy of `skills/log-activity/SKILL.md` restored and every other working-tree change left standing the gate resolves 1540/238/11, so that one deletion is seven of the eight paths and one of the two anchors; with HEAD's copy of `skills/cadence/SKILL.md` standing instead it resolves 1533/238/11, so the merged body is the other anchor and no path; with HEAD's copy of `skills/help/SKILL.md` standing it resolves 1534/237/11, so that body is the eighth path. Swapping back `skills/archive/SKILL.md`, `skills/migrate/SKILL.md`, `README-hooks.md`, `hooks/lib/citation-corpus.ts` or any of the three edited test files moves nothing, so none of them owes anything — `hooks/lib` is scanned records-only, which is why re-homing the `FROZEN_PREFIXES` precedent onto `skills/cadence/SKILL.md` `### 3. Scan git and the workbench tree — once` costs this pin nothing in either direction. The deleted body's seven: five it cited itself (`$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root`, `$FUSION_PLUGIN_ROOT/bin/fusion-paths`, `$FUSION_PLUGIN_ROOT/bin/fusion-identity`, `CLAUDE.md`, and `rules/fusion-workbench-conventions.md` carrying the `## Path Resolution` anchor that is this move's first), each confirmed by blanking its line against the restored body; and two that cited IT and now dangle instead of resolving, at `rules/fusion-workbench-conventions.md:66` and `README-agents.md:225`. The merged body's anchor is a net of five: it drops two `## Path Resolution` and one `### Who filed it` and adds one `## Filename Patterns` and one `## fusion-workbench Layout`. The help body's is one `bin/fusion-rules`, dropped at its line 122. THIS PIN COVERS HALF OF ONE LANDING AND SAYS SO: steps S5 and S6 of `260915-2309_*_merge-log-activity-into-cadence.md` are not in the tree yet, and they own the two dangling tokens above — S5 renames the conventions one onto `skills/cadence/SKILL.md`, which resolves and brings `paths` back to 1534, and S6 deletes the `README-agents.md` row outright. Whoever lands them re-approves again, on this line. // Re-approved 2026-09-15 A THIRD TIME, ON THIS LINE FOR THE SAME REASON THE SECOND WAS (`**Status:**` gains its fifth value `paused`, and the conventions name the mechanism the new value is decidable by): paths 1540 -> 1541, anchors and stampBare unmoved. ONE ADDED TOKEN, MEASURED BY SWAPPING THE EDITED FILE BACK TO HEAD IN PLACE RATHER THAN BY SUBTRACTION — with HEAD's copy of `rules/fusion-workbench-conventions.md` and the two `hooks/` edits of the same step left standing the gate resolves 1540/239/11 and passes, so the whole delta is that one file and neither `hooks/lib/work-graph.ts` nor `hooks/order.ts` owes anything. The token is `bin/fusion-work-order`, cited once in the `**Depends-on:**` paragraph at the clause saying a `paused` target leaves the entry live; it carries NO anchor, which is why `anchors` does not move with it. Nothing cancels it: the sentence the clause was appended to carried no citation of either class, and the file's other new paragraphs cite only `**Depends-on:**` and `**Claim:**` field names, which are not tokens of any pinned class. // Re-approved 2026-09-15 (the work item gains `**Active spec/plan:**` and `/fusion:migrate` carries it into the item head instead of dropping it): paths 1538 -> 1539, anchors 237 -> 238, stampBare unmoved. ONE ADDED TOKEN PAIR, MEASURED BY SWAPPING EACH EDITED FILE BACK TO HEAD IN PLACE RATHER THAN BY SUBTRACTION. With HEAD's copy of `skills/migrate/SKILL.md` and every other working-tree change left standing the gate resolves 1538/237/11 and passes, while swapping any one of `rules/fusion-workbench-conventions.md`, `skills/memo/SKILL.md`, `docs/working-model.md` or `docs/upgrading-to-v11.md` back leaves the delta exactly where it was — so the whole of it is that one body and the other four owe nothing. The token is `rules/fusion-workbench-conventions.md` with its `## Backlog entries — work items` anchor, cited by the reworked Step 4b at the point where the field is copied across. Nothing cancels it: the prose-carry block that edit replaced never existed at HEAD, and the conventions file's own new paragraph cites only a bare `## Filename Patterns` and one record citation, neither of which is in this pin's classes — which is why that file swaps out with no movement. AND RE-APPROVED AGAIN THE SAME DAY, ON THIS LINE RATHER THAN A NEW ONE, BECAUSE THE hook-tests LINE SURFACE STOOD AT ONE LINE OF MARGIN AND AN ENTRY IS AN ATTRIBUTION, NOT A LINE (`agents/orchestrator.md` wires the field up: the closure step resolves the plan in scope from it and the shaper/planner returns write it): paths 1539 -> 1540, anchors 238 -> 239, stampBare unmoved. ONE ADDED TOKEN PAIR, MEASURED THE SAME WAY — with HEAD's copy of `agents/orchestrator.md` and every other working-tree change left standing the gate resolves 1539/238/11 and passes, so the whole delta is that one body. The token is `rules/fusion-workbench-conventions.md` with its `## Backlog entries — work items` anchor, cited once in the new ride-the-act paragraph under `### Shaping and planning`. Nothing cancels it: the two sentences the edit replaced carried no citation of either class. AND RE-APPROVED A TWENTY-SEVENTH TIME ON 2026-09-18, ON THIS LINE RATHER THAN A NEW ONE FOR THE REASON EVERY ENTRY ABOVE GIVES — the v11.8.0 release prep, which rewrote the update topic in `skills/help/SKILL.md`: paths 1678 -> 1679, anchors unmoved, stampBare unmoved. ONE ADDED PATH TOKEN, MEASURED BY RESTORING THAT ONE FILE TO HEAD IN PLACE: with HEAD's copy of `skills/help/SKILL.md` and every other working-tree change of the prep left standing the gate resolves 1678/290/11 and passes, so the whole delta is that body. The token is `bin/fusion-edge-answers`, cited once in the new 11.8.0 paragraph. Nothing cancels it: the dropped 11.5.1 paragraph carried no token of any pinned class — its only reference was the bare command `/fusion:news`. AND RE-APPROVED A TWENTY-EIGHTH TIME ON 2026-09-18, ON THIS LINE RATHER THAN A NEW ONE FOR THE REASON EVERY ENTRY ABOVE GIVES — `README-agents.md:80` digest bullet reduced to its two unique sentences and `:57`/`:76` corrected: paths 1679 -> 1676, anchors 290 -> 288, stampBare unmoved. THREE REMOVED PATHS AND TWO REMOVED ANCHORS, NO ADDITION, MEASURED BY RUNNING THE GATE WITH THE EDIT APPLIED: with the three edits to `README-agents.md` in place and every other working-tree change left standing the gate resolves 1676/288/11, so the whole delta is that one body. The five removed tokens are duplicates of `:47` (the `README-agents.md` path with its `## Dispatch parameters` anchor), `:78` (the `agents/planner.md` path) and `:76` (the `rules/fusion-workbench-conventions.md` path with its `## Project language` anchor); each survives in the line named, so nothing left scope. Nothing is added: the `:57` and `:76` corrections introduce no token of any pinned class. AND RE-APPROVED A TWENTY-NINTH TIME ON 2026-09-18, ON THIS LINE RATHER THAN A NEW ONE FOR THE REASON EVERY ENTRY ABOVE GIVES — the two README edits for the per-line read convention (`260909-2215_*_four-truncated-lines-make-a-streaming-jq-read-of-the-event-log-stop-at-forty-percent.md`): paths 1676 -> 1679, anchors 288 -> 289, stampBare unmoved. THREE ADDED PATHS AND ONE ADDED ANCHOR, NO REMOVAL, MEASURED BY RUNNING THE GATE WITH THE EDITS APPLIED: with the event-log row of `README-agents.md` and `### Viewing the event log` of `README-hooks.md` rewritten and every other working-tree change left standing the gate resolves 1679/289/11, so the whole delta is those two bodies. The added tokens are `bin/fusion-events` in the `README-agents.md` event-log row, and `hooks/lib/events.ts` and `README-agents.md` with its `### Orchestrator observability` anchor in the new `README-hooks.md` paragraph. Nothing is removed: the replaced `jq .` commands carried no token of any pinned class. AND RE-APPROVED A THIRTIETH TIME ON 2026-09-20, ON THIS LINE RATHER THAN A NEW ONE FOR THE REASON EVERY ENTRY ABOVE GIVES — the no-agent-originates bound narrowed to the agent's own initiative (`260920-2157_*_may-the-orchestrator-file-a-work-item-when-the-user-instructs-it.md`): paths 1679 -> 1680, anchors 289 -> 290, stampBare unmoved. ONE ADDED PATH AND ONE ADDED ANCHOR, NO REMOVAL, MEASURED BY RESTORING THE ONE FILE TO HEAD IN PLACE: with `README-agents.md` put back and every other edit left standing the gate resolves 1679/289/11, so the whole delta is its `## Invariants` bullet, which now cites `rules/fusion-workbench-conventions.md` with its `## Backlog entries — work items` anchor. The decision citation added to `rules/fusion-workbench-conventions.md` beside it is class (c) and off the pin since 2026-08-24; the four other edited files added no token of any pinned class. Re-approved 2026-09-22 (step 9 of the same package: `docs/messages-between-checkouts.md` says an untracked workbench is named `workbench-untracked` at exit 5 rather than answering `new=0` permanently): paths 1711 -> 1712, anchors and stampBare unmoved. ONE ADDED TOKEN, MEASURED BY RESTORING THE ONE EDITED FILE TO HEAD IN PLACE: with HEAD's copy of that file and every other working-tree change left standing the gate reads 1711 exactly, so the whole delta is the new `bin/fusion-forum` spelling the paragraph needs to name the helper that returns the state. The closed issue record is in the workbench, which this gate excludes. Re-approved 2026-09-22 (step 11 of the same package: the post draft dotfile is cleared before its write and removed at Step 3's stop): paths unmoved at 1712, anchors 320 -> 319, stampBare unmoved. MEASURED BY RESTORING `skills/post/SKILL.md` TO HEAD IN PLACE, where the gate reads 1712/320 with every other working-tree change standing, so the whole delta is that one file. Two tokens cancel on paths: the cut cross-reference to `skills/archive/SKILL.md` goes and `bin/fusion-staging-drift` arrives, the classifier the new clause names as what reports a leftover; the anchor falls because only the cut token carried one. Re-approved 2026-09-22 (step 15 of the same package: the eleven dispatch-path rows are re-armed at the measurement and `README-hooks.md` carries the log the ruling requires): paths 1712 -> 1717, anchors and stampBare unmoved. MEASURED BY RESTORING `README-hooks.md` TO HEAD IN PLACE, where the gate reads 1712/319 with the re-armed fixture and the edited `rules-emission-golden.test.ts` still standing, so both of those added nothing pinned and the whole delta is the README log: three `CLAUDE.md` spellings in the new subsection, plus `hooks/lib/__tests__/fixtures/dispatch-path.baseline` and `hooks/lib/__tests__/helpers/growth-bound.ts`. The record citations in all three files are class (c) and off the pin since 2026-08-24.

// Stated on the assertion, not left to be inferred: a gate that punishes a
// legitimate edit without saying what to do gets routed around, which is the
// whole risk of pinning (issue 260810-2149).
const BASELINE_MESSAGE =
  "the number of references this gate resolved has moved away from the committed " +
  "baseline in BASELINE.\n" +
  "UP: citations were added, or a spelling entered scope. DOWN: citations were " +
  "removed, or — the case the pin exists for — a spelling left scope and stopped " +
  "being checked while the gate stayed green.\n" +
  "If the change is legitimate, RE-APPROVING THE BASELINE IS THE EXPECTED " +
  "RESPONSE: check the received numbers against the edit you made, then write them " +
  "into BASELINE in this file and commit that with the edit. Re-approval is part of " +
  "the change, not a way around the gate — what is not expected is to widen the " +
  "assertion back into a floor.";

function runAll() {
  const byBase = shippedMd();
  const all: Violation[] = [];
  const counts = { paths: 0, anchors: 0, records: 0, stampBare: 0 };
  const none = { violations: [], resolved: 0 };
  for (const f of surface()) {
    const lines = scannedLines(f);
    const a = f.recordsOnly ? none : scanPluginPaths(f.rel, lines);
    const b = f.recordsOnly ? none : scanHeadingAnchors(f.rel, lines, byBase);
    const c = scanRecordCitations(f.rel, lines);
    all.push(...a.violations, ...b.violations, ...c.violations, ...(f.recordsOnly ? [] : scanCommands(f.rel, lines)));
    counts.paths += a.resolved;
    counts.anchors += b.resolved;
    counts.records += c.resolved;
    // the residual of the storeless form: a bare stamp names nothing the scanner can judge
    counts.stampBare += scanCitationTokens(f.rel, lines).filter((h) => h.kind === "stamp-bare" && h.status !== "exempt").length;
  }
  return { all, counts };
}

describe("reference-resolution lint: every reference in the shipped text resolves", () => {
  const { all, counts } = runAll();

  it("passes on the whole surface — no dangling reference of any class", () => {
    expect(
      all,
      `dangling references in shipped text:\n${report(all)}`,
    ).toEqual([]);
  });

  it("resolved exactly the pinned number of references in each plugin class", () => {
    expect({ paths: counts.paths, anchors: counts.anchors, stampBare: counts.stampBare }, BASELINE_MESSAGE).toEqual(BASELINE);
  });

  it("degrades loudly, not silently, when the workbench is absent", () => {
    // In THIS repo the workbench must exist — the class-(c) half of the gate
    // is only meaningful against it, and a missing workbench here means setup
    // was never run, not that there is nothing to check.
    expect(
      WORKBENCH_PRESENT,
      "fusion-workbench/.fusion-setup not found — run /fusion:setup; class (c) ran syntax-only",
    ).toBe(true);
  });

  it("no shipped line places a record under a $SCAN_* key: it is fusion's own, not the consumer's", () => {
    // A stamp and a `$SCAN_` key on one prose line tells a consuming agent to
    // open, in ITS workbench, a record that exists only in fusion's (decision
    // `260828-0904_*_are-shipped-record-citations-provenance-or-pointers-for-a-consuming-agent.md`).
    const found: string[] = [];
    for (const f of surface()) {
      const lines = scannedLines(f);
      const fenced = fencedContentLines(lines);
      lines.forEach((l, i) => {
        if (fenced[i] || !l.text.includes("$SCAN_")) return;
        const m = l.text.match(/[0-9]{6}-[0-9]{4}(?:_[a-z*]_[^`\s]*)?/);
        if (!m) return;
        const storeless = m[0].replace(/^([0-9]{6}-[0-9]{4})_[a-z]_/, "$1_*_");
        found.push(`${f.rel}:${l.line}  write "fusion's own record \`${storeless}\`" and drop the $SCAN_ key`);
      });
    }
    expect(found, "a record stamp shares a line with a $SCAN_ key:\n" + found.join("\n")).toEqual([]);
  });

  it("every RETIRED_COMMANDS entry is retired: none names a skills/ directory", () => {
    const live = Object.keys(RETIRED_COMMANDS).filter((n) => existsSync(join(pluginRoot, "skills", n, "SKILL.md")));
    expect(live, `${live.join(", ")} exists under skills/, so its entry would swallow a live pointer; drop it`).toEqual([]);
  });

  it("every RETIRED_COMMANDS entry is still cited as /fusion:<name> on this class's lines — no dead weight", () => {
    const dead = Object.keys(RETIRED_COMMANDS).filter((n) => !surface().some((f) => !f.recordsOnly && scannedLines(f).some(({ text }) => [...text.matchAll(COMMAND_RE)].some((m) => m[1] === n))));
    expect(dead, `${dead.join(", ")} is exempted but no longer cited anywhere — drop the entry`).toEqual([]);
  });
});

describe("reference-resolution lint: class (a) behaviour", () => {
  const L = (text: string) => [{ line: 1, text }];

  it("catches a dangling rule-file path with an actionable message", () => {
    const { violations } = scanPluginPaths("fixture.md", L("see `rules/does-not-exist.md` for details"));
    expect(violations.length).toBe(1);
    expect(violations[0].token).toBe("rules/does-not-exist.md");
    expect(report(violations)).toContain("fixture.md:1");
    expect(report(violations)).toContain("does not exist");
  });

  it("resolves an existing path, a $FUSION_PLUGIN_ROOT-rooted path, and skips placeholders", () => {
    const { violations, resolved } = scanPluginPaths(
      "fixture.md",
      L('read `rules/user-facing-output.md`, run "$FUSION_PLUGIN_ROOT/bin/fusion-rules", see skills/<name>/SKILL.md and agents/*.md'),
    );
    expect(violations).toEqual([]);
    expect(resolved).toBe(2);
  });

  it("catches a dangling $FUSION_PLUGIN_ROOT-rooted path", () => {
    const { violations } = scanPluginPaths("fixture.md", L('"$FUSION_PLUGIN_ROOT/bin/no-such-helper"'));
    expect(violations.length).toBe(1);
    expect(violations[0].token).toBe("bin/no-such-helper");
  });

  it("reads the bare lib/… import spelling as a hook module, both ways", () => {
    // Issue 260812-1407: this spelling resolved nothing and reported nothing.
    const ok = scanPluginPaths("fixture.md", L("the loader is `lib/config.ts`"));
    expect(ok.violations).toEqual([]);
    expect(ok.resolved).toBe(1);
    const bad = scanPluginPaths("fixture.md", L("the loader is `lib/no-such-module.ts`"));
    expect(bad.violations.length).toBe(1);
    expect(bad.violations[0].token).toBe("lib/no-such-module.ts");
  });

  it("resolves a $FUSION_SRC-rooted path and catches a dangling one", () => {
    // The eight sites of issue 260810-2029 are spelled this way. Before
    // FUSION_SRC was classified, both halves of this test scored zero.
    const ok = scanPluginPaths("fixture.md", L('read "$FUSION_SRC/agents/orchestrator.md" first'));
    expect(ok.violations).toEqual([]);
    expect(ok.resolved).toBe(1);
    const bad = scanPluginPaths("fixture.md", L('read "$FUSION_SRC/agents/no-such-agent.md"'));
    expect(bad.violations.length).toBe(1);
    expect(bad.violations[0].token).toBe("agents/no-such-agent.md");
  });

  it("fails on a plugin path behind an unrecognised root variable, instead of skipping it", () => {
    // The shrinkage shape itself: a citation whose target does NOT exist, which
    // the two-name predecessor accepted in silence because it could not match
    // the variable at all.
    const { violations, resolved } = scanPluginPaths(
      "fixture.md",
      L('read "$SOME_NEW_ROOT/bin/no-such-helper" at Setup'),
    );
    expect(resolved).toBe(0);
    expect(violations.length).toBe(1);
    expect(violations[0].token).toBe("$SOME_NEW_ROOT/bin/no-such-helper");
    expect(violations[0].problem).toContain("not a root variable this gate classifies");
    // both remedies, so the fix is never guessed
    expect(violations[0].fix).toContain("ROOT_VARS");
    expect(violations[0].fix).toContain("true");
    expect(violations[0].fix).toContain("reason string");
  });

  it("fails on an unrecognised root even when its target does exist", () => {
    const { violations } = scanPluginPaths("fixture.md", L('"$SOME_NEW_ROOT/agents/orchestrator.md"'));
    expect(violations.length).toBe(1);
    expect(violations[0].token).toBe("$SOME_NEW_ROOT/agents/orchestrator.md");
  });

  it("leaves a fusion-paths resolver key alone: its remainder is a workbench path, not a plugin one", () => {
    const { violations, resolved } = scanPluginPaths(
      "fixture.md",
      L("file it at `$OUT_ISSUE/260810-2029_o_slug.md`, serve `$WORKBENCH/monitor`, scan `$SCAN_PLANS/`"),
    );
    expect(violations).toEqual([]);
    expect(resolved).toBe(0);
  });

  it("skips a variable declared as naming something other than the plugin tree", () => {
    // The reason-string arm of ROOT_VARS. The shipped table has no inhabitant
    // for it since STASH_DIR left, so the entry is declared here — the fixture
    // line was always synthetic, and the table now is too (issue 260815-1251).
    // Without the skip, `$STASH_DIR/rules/x.md` would be read as a plugin path
    // and reported as dangling.
    const rootVars = { ...ROOT_VARS, STASH_DIR: "the workbench's stash store, not the plugin tree" };
    const { violations, resolved } = scanPluginPaths(
      "fixture.md",
      L("restore from `$STASH_DIR/rules/does-not-exist.md`"),
      rootVars,
    );
    expect(violations).toEqual([]);
    expect(resolved).toBe(0);
    // and the same token under an UNdeclared variable is still a violation, so
    // the skip is the declaration's doing and not the shape's
    const undeclared = scanPluginPaths("fixture.md", L("restore from `$STASH_DIR/rules/does-not-exist.md`"));
    expect(undeclared.violations.length).toBe(1);
  });

  it("every non-plugin ROOT_VARS entry is load-bearing: each still shadows a plugin-shaped path", () => {
    // The falsifier for the skip half, mirroring the EXAMPLE_PATHS guards: an
    // entry that no longer shadows anything is an exemption that can only
    // swallow a future reference, so it must be dropped rather than kept.
    const declared = Object.entries(ROOT_VARS)
      .filter(([, v]) => typeof v === "string")
      .map(([k]) => k);
    const dead = declared.filter((v) => {
      const re = new RegExp("\\$\\{?" + v + "\\}?\\/([A-Za-z0-9][A-Za-z0-9._\\/-]*[A-Za-z0-9])", "g");
      return !surface().some(
        (f) =>
          !f.recordsOnly &&
          scannedLines(f).some(({ text }) => {
            re.lastIndex = 0;
            let m: RegExpExecArray | null;
            while ((m = re.exec(text)) !== null) if (PLUGIN_SHAPE_RE.test(m[1])) return true;
            return false;
          }),
      );
    });
    expect(
      dead,
      `${dead.join(", ")} is declared in ROOT_VARS as naming something other than the ` +
        `plugin tree, but no plugin-shaped path sits behind it anywhere in the surface — ` +
        `the entry shadows nothing and can only swallow a future citation; drop it`,
    ).toEqual([]);
  });

  it("does not read a ./rules/ spelling as a plugin path", () => {
    const { violations, resolved } = scanPluginPaths(
      "fixture.md",
      L("the project ships `./rules/my-coding-style.md` and `./rules/context-manifest.yaml`"),
    );
    expect(violations).toEqual([]);
    expect(resolved).toBe(0);
  });

  it("every EXAMPLE_PATHS entry is fabricated: none exists in the tree", () => {
    const real = Object.keys(EXAMPLE_PATHS).filter((p) =>
      existsSync(join(pluginRoot, resolveToken(p))),
    );
    expect(
      real,
      `${real.join(", ")} exists in the tree, so its exemption would swallow a real ` +
        `reference — remove the entry (and rename the real file's fabricated twin in the docs)`,
    ).toEqual([]);
  });

  it("every EXAMPLE_PATHS entry is still referenced somewhere — no dead weight", () => {
    const corpus = surface()
      .map((f) => readFileSync(f.abs, "utf-8"))
      .join("\n");
    const dead = Object.keys(EXAMPLE_PATHS).filter((p) => !corpus.includes(p));
    expect(
      dead,
      `${dead.join(", ")} is exempted but no longer cited anywhere — drop the entry`,
    ).toEqual([]);
  });
});

describe("reference-resolution lint: class (b) behaviour", () => {
  const byBase = shippedMd();
  const L = (text: string) => [{ line: 1, text }];

  it("resolves an exact heading and a prefix-cited heading", () => {
    const { violations, resolved } = scanHeadingAnchors(
      "fixture.md",
      L(
        "see `rules/user-facing-output.md` `## Effort estimates` and " +
          "`rules/fusion-workbench-conventions.md` `## Path Resolution`",
      ),
      byBase,
    );
    expect(violations).toEqual([]);
    expect(resolved).toBe(2); // the second is a prefix of '## Path Resolution (Pfadauflösung)'
  });

  it("resolves a bare unique basename against the shipped surface", () => {
    const { violations, resolved } = scanHeadingAnchors(
      "fixture.md",
      L("(full table in `fusion-workbench-conventions.md` `## Path Resolution` → Exit codes)"),
      byBase,
    );
    expect(violations).toEqual([]);
    expect(resolved).toBe(1);
  });

  it("catches a heading that does not exist in the cited file", () => {
    const { violations } = scanHeadingAnchors(
      "fixture.md",
      L("see `rules/user-facing-output.md` `## No Such Section`"),
      byBase,
    );
    expect(violations.length).toBe(1);
    expect(violations[0].problem).toContain("No Such Section");
    expect(report(violations)).toContain("prefix match");
  });

  it("skips a runtime artifact whose headings are not shipped", () => {
    const { violations, resolved } = scanHeadingAnchors(
      "fixture.md",
      L("update `orchestrator-live.md` `## Current` in place"),
      byBase,
    );
    expect(violations).toEqual([]);
    expect(resolved).toBe(0);
  });
});

describe.runIf(WORKBENCH_PRESENT)("reference-resolution lint: class (c) behaviour", () => {
  const L = (text: string) => [{ line: 1, text }];

  // A real record with a marker, picked from the live workbench so the
  // fixtures cannot rot when records move: whatever exists now is cited.
  const sample = workbenchIndex().find((e) => /^[0-9]{6}-[0-9]{4}_[a-z]_.+\.md$/.test(e.base));
  const stampSlug = sample!.base; // e.g. 260806-0015_*_zitierform-….md
  const marker = stampSlug.match(/_([a-z])_/)![1];
  const otherMarker = marker === "z" ? "y" : String.fromCharCode(marker.charCodeAt(0) + 1);
  const wildcard = stampSlug.replace(/_[a-z]_/, "_*_");
  const staleCited = stampSlug.replace(/_[a-z]_/, `_${otherMarker}_`);

  it("resolves the wildcard form against any current marker", () => {
    const { violations, resolved } = scanRecordCitations("fixture.md", L(`see \`${wildcard}\``));
    expect(violations).toEqual([]);
    expect(resolved).toBe(1);
  });

  it("flags an exact-marker citation whose record moved on, naming the wildcard fix", () => {
    const { violations } = scanRecordCitations("fixture.md", L(`see \`${staleCited}\``));
    expect(violations.length).toBe(1);
    expect(violations[0].problem).toContain("stale marker");
    expect(violations[0].fix).toContain("_*_");
    expect(violations[0].fix).not.toMatch(/\d{6}-\d{4}/); // reaches a consuming session; see CitationHit.fix
  });

  it("flags a citation matching no record at all, pointing at the 260805-0709 rule", () => {
    const { violations } = scanRecordCitations(
      "fixture.md",
      L("see decision `990101-0101_a_never-existed.md`"),
    );
    expect(violations.length).toBe(1);
    expect(violations[0].fix).toContain("260805-0709");
  });

  it("resolves a truncated (ellipsis) citation by prefix", () => {
    const truncated = stampSlug.slice(0, 20) + "…";
    const { violations, resolved } = scanRecordCitations("fixture.md", L(`(\`${truncated}\`)`));
    expect(violations).toEqual([]);
    expect(resolved).toBe(1);
  });

  it("reports a store-prefixed token in each of its three shapes, spelling the storeless fix", () => {
    const anyCircle = [...circleDirs().keys()][0];
    const { violations } = scanRecordCitations("fixture.md", [
      { line: 1, text: `see \`shared/issues/${stampSlug}\`` },
      { line: 2, text: `the circles/${anyCircle}/_t_circle.md record` },
      { line: 3, text: `Provenance: circles/${anyCircle}` },
    ]);
    expect(violations.map((v) => [v.line, v.problem.includes("store segment"), v.fix])).toEqual([
      [1, true, `cite the storeless form '${wildcard}'`],
      [2, true, `cite the storeless form '${anyCircle}'`],
      [3, true, `cite the storeless form '${anyCircle}'`],
    ]);
  });

  it("resolves a bare-record whose only copy sits under archive/ with no path arithmetic", () => {
    const archived = workbenchIndex().find(
      (e) => e.relDir.startsWith("archive/") && /^[0-9]{6}-[0-9]{4}_[a-z]_.+\.md$/.test(e.base),
    );
    if (!archived) return; // a workbench whose sweeps were all cleaned has nothing to assert on
    const hits = scanCitationTokens("fixture.md", L(`see \`${archived.base.replace(/_[a-z]_/, "_*_")}\``));
    expect(hits.map((h) => [h.kind, h.status, h.matches])).toEqual([
      ["bare-record", "resolved", [`${archived.relDir}/${archived.base}`]],
    ]);
  });

  it("a stamp-name ending in .md matches the basename exactly; without it, by prefix", () => {
    const plain = workbenchIndex().find((e) => /^[0-9]{6}-[0-9]{4}-[a-z0-9]+-[a-z0-9-]+\.md$/.test(e.base))!;
    const exact = scanCitationTokens("fixture.md", L(`the ${plain.base} log`));
    expect(exact.map((h) => [h.kind, h.status, h.matches])).toEqual([
      ["stamp-name", "resolved", [`${plain.relDir}/${plain.base}`]],
    ]);
    const short = plain.base.slice(0, -3).split("-").slice(0, 3).join("-"); // stamp plus one slug word
    expect(scanCitationTokens("fixture.md", L(`the ${short}.md log`))[0].status).toBe("dangling");
    expect(scanCitationTokens("fixture.md", L(`the ${short} log`))[0].status).not.toBe("dangling");
  });

  it("the e.g. exemption is clause-bounded: a dead citation after the e.g.'s clause closed still fires", () => {
    // The false-negative shape of issue 260806-1031: the `e.g.` opens and
    // closes an unrelated parenthesis; the dead citation sits in a later
    // clause of the same line and must be resolved, not exempted.
    const { violations } = scanRecordCitations(
      "fixture.md",
      L("the default (e.g. `en`) is set per decision `990101-0101_o_never-existed.md`"),
    );
    expect(violations.length).toBe(1);
    expect(violations[0].token).toContain("990101-0101");
  });

  it("skips announced illustrations, blockquotes, and fabricated names", () => {
    const { violations, resolved } = scanRecordCitations("fixture.md", [
      { line: 1, text: "cite paths (e.g. decision `990101-0101_o_token-format.md`)" },
      { line: 2, text: "> Full log: `fusion-workbench/history/990101-0101-orchestrator-session.md`" },
      { line: 3, text: "the plan lands at `circles/990101-0101-umbau/planning/990101-0101_p_plan-foo.md`" },
    ]);
    expect(violations).toEqual([]);
    expect(resolved).toBe(0);
  });

  it("every RECORD_EXAMPLE_FILES exemption is load-bearing: each file still carries fabricated citations", () => {
    for (const rel of Object.keys(RECORD_EXAMPLE_FILES)) {
      const lines = readFileSync(join(pluginRoot, rel), "utf-8")
        .split("\n")
        .map((text, i) => ({ line: i + 1, text }));
      // Scanned WITHOUT the file-level exemption, the worked examples would fire.
      const wouldFire = scanRecordCitations("not-the-exempt-name.md", lines);
      expect(
        wouldFire.violations.length,
        `${rel} is exempt because it cites fabricated records; it no longer carries any, ` +
          `so the exemption is dead weight — drop it from RECORD_EXAMPLE_FILES`,
      ).toBeGreaterThan(0);
      // And WITH its real name, the exemption silences them.
      expect(scanRecordCitations(rel, lines).violations).toEqual([]);
    }
  });

  it("a footer-template illustration does not fire, while the same citation in plain prose does", () => {
    const cited = "Append `Answered: circles/990101-0101-shape/analyses/990101-0102-D04-arch.md §4.3 — Shape C`.";
    expect(scanRecordCitations("fixture.md", L(cited)).violations).toEqual([]);
    const prose = "see circles/990101-0101-shape/analyses/990101-0102-D04-arch.md for the answer";
    expect(scanRecordCitations("fixture.md", L(prose)).violations.length).toBeGreaterThan(0);
  });
});

describe.runIf(WORKBENCH_PRESENT)("citation scan: the measuring view and the gate view are one parser", () => {
  const L = (text: string) => [{ line: 1, text }];

  // The extraction gave the class-(c) parser a second caller, and the risk it
  // introduces is one-directional: a token class added for the MEASUREMENT
  // reaching the GATE would fail the suite on prose the gate never judged. The
  // cases below pin the boundary from each side.
  //
  // The boundary MOVED on 2026-08-20. `stamp-name` used to sit on the
  // measurement side and now sits on the gate's, under decision
  // `circles/260819-1645-four-constraints-on-deep-change/decisions/260819-2016_*_does-the-citation-gate-judge-the-stamp-name-class-which-scanrecordcitations-does-not-read.md`
  // (option 2). `stamp-bare` is what is left on the measurement side, and it is
  // the residual by argument rather than by accident: the question it fails is
  // "which of these is meant", not "does this exist".

  it("a store-prefixless bare stamp is a scan token and is invisible to the gate", () => {
    const line = L("the 260812-1720 plan, and the 990101-0101 stamp that names nothing");
    expect(scanRecordCitations("fixture.md", line)).toEqual({ violations: [], resolved: 0 });
    const hits = scanCitationTokens("fixture.md", line);
    expect(hits.map((h) => h.kind)).toEqual(["stamp-bare", "stamp-bare"]);
    // the first names a real minute — how many artifacts share it is what the
    // corpus decides, and the point here is only that the gate never sees it
    expect(hits[1].status).toBe("dangling");
  });

  it("a stamp carrying a name resolves in the scan and now reaches the gate too", () => {
    const anyCircle = [...circleDirs().keys()][0];
    const line = L(`the ${anyCircle} Circle answered it`);
    expect(scanCitationTokens("fixture.md", line).map((h) => [h.kind, h.status])).toEqual([
      ["stamp-name", "resolved"],
    ]);
    expect(scanRecordCitations("fixture.md", line)).toEqual({ violations: [], resolved: 1 });
  });

  it("a stamp carrying a name that names nothing is a violation, not a measurement", () => {
    const line = L("the 990101-0101-no-such-thing log said so");
    const { violations } = scanRecordCitations("fixture.md", line);
    expect(violations.map((v) => v.token)).toEqual(["990101-0101-no-such-thing"]);
  });

  // Deliberately a literal restatement of the helper's own GATE_KINDS rather
  // than an import: the point of the token-for-token case below is that the two
  // views agree about WHICH kinds the gate reads, and walking with the imported
  // constant would make them agree by construction. Five since the `stamp-name`
  // widening; `stamp-bare` is the one kind outside.
  const GATE: CitationKind[] = [
    "record",
    "bare-record",
    "package-record",
    "package-dir",
    "stamp-name",
  ];

  it("the literal the case below walks with is still the gate's own GATE_KINDS", () => {
    // The copy above is independent, not unchecked. It was stale for two steps
    // — it had never learned `circle-record` — and passed anyway, because the
    // shipped surface carries no token of that kind outside one exempt file, so
    // the corpus cannot report a kind it never meets (issue
    // `circles/260819-1645-four-constraints-on-deep-change/issues/260820-0805_*_the-token-for-token-case-restates-gate-kinds-as-a-literal-and-nothing-catches-the-next-drift.md`).
    // This is the one question the corpus cannot answer and only the two lists
    // can: they still name the same kinds. The walk stays literal.
    expect(
      [...GATE].sort(),
      "the gate's kind list moved and this file's copy did not (or the reverse). " +
        "Bring the literal above into line with GATE_KINDS in " +
        "hooks/lib/__tests__/helpers/citation-scan.ts, and re-approve the pinned counts " +
        "in this file if the gate's scope widened.",
    ).toEqual([...GATE_KINDS].sort());
  });

  it("over the whole shipped surface, the gate's verdict is the scan's, token for token", () => {
    let gateResolved = 0;
    let gateViolations = 0;
    let scanResolved = 0;
    let scanFailed = 0;
    for (const f of surface()) {
      const lines = scannedLines(f);
      const g = scanRecordCitations(f.rel, lines);
      gateResolved += g.resolved;
      gateViolations += g.violations.length;
      for (const h of scanCitationTokens(f.rel, lines)) {
        if (!GATE.includes(h.kind)) continue;
        if (h.status === "resolved" || h.status === "ambiguous") scanResolved++;
        else if (h.status !== "exempt" && h.status !== "unresolved-no-workbench") scanFailed++;
      }
    }
    expect([scanResolved, scanFailed]).toEqual([gateResolved, gateViolations]);
    expect(gateResolved, "not vacuous — the surface still carries record citations").toBeGreaterThan(10);
  });

  it("the three baseline lists and the unjudged bucket cover every token exactly once", () => {
    // What the baseline is stated in must be MECE over the tokens
    // (rules/critical-stance.md §4), or a count moves between lists unnoticed.
    const hits = surface().flatMap((f) => scanCitationTokens(f.rel, scannedLines(f)));
    const p = partition(hits);
    const all = [...p.resolved, ...p.dangling, ...p.undecidable, ...p.exempt];
    expect(all.length).toBe(hits.length);
    expect(new Set(all).size).toBe(hits.length);
  });
});
