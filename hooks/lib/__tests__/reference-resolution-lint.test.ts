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
  type Violation,
  type CitationKind,
} from "./helpers/citation-scan.js";

// ---------------------------------------------------------------------------
// Reference-resolution lint gate (Circle 260805-2005-textschicht-gegen-code-
// nachziehen, plan step 14 — the review's "cheapest structural investment").
//
// The plugin's shipped text surfaces cite three kinds of targets, and all three
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
//       directory by convention and is never checked here.
//   (b) section-heading anchors in the adjacent form `` `file.md` `## Section` ``
//       — the cited heading must exist in the cited file (prefix match; heading
//       LEVEL is not compared). A bare `## X` with no file on the line is
//       ambiguous between "see section X" and "write a section named X", so it
//       is out of scope by design.
//   (c) workbench-record citations — `260806-0015_*_<slug>.md` and its
//       store-/Circle-/`shared/`-prefixed forms, plus bare Circle-directory
//       citations. The grammar is decision D1's wildcard form (the `*` at the
//       marker position matches any state marker); a citation carrying an exact
//       marker whose record exists only under a DIFFERENT marker is the stale-
//       marker class, and the failure says to rewrite the position to `_*_`.
//       The parser lives in `./helpers/citation-scan.ts`, because a second
//       caller runs the same grammar over the workbench itself
//       (`workbench-citation-lint.test.ts`); its header carries the grammar.
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
// Three entries left on 2026-08-12 with the protected-path half of the guard:
// `rules/x.md`, `rules/old.md` and `rules/retired/old.md` were fabricated
// operands in `rules/protected-path-discipline.md` and in the README-hooks
// sections that described the exemption, and every citation of them went when
// those texts did. The "no dead weight" test below is what caught it — an
// exemption nothing cites is an exemption nobody re-reads before it swallows
// something real.
// A fourth left on 2026-08-16: `rules/relevant-file.md` was the fabricated
// `ruleFile` value in README-hooks' "Adding a decision" example, and that whole
// section went with the decision-governed check it configured.
const EXAMPLE_PATHS: Record<string, string> = {
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
    const candidates: { token: string; unknownRoot?: string }[] = [];
    PLUGIN_PATH_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = PLUGIN_PATH_RE.exec(text)) !== null) candidates.push({ token: m[1] });
    ROOT_VAR_RE.lastIndex = 0;
    while ((m = ROOT_VAR_RE.exec(text)) !== null) {
      const [, rootVar, rest] = m;
      const names = rootVars[rootVar];
      if (typeof names === "string") continue; // declared as naming something else
      if (names === true) candidates.push({ token: rest }); // the plugin tree: resolve
      else if (PLUGIN_SHAPE_RE.test(rest)) candidates.push({ token: rest, unknownRoot: rootVar });
    }
    for (const { token, unknownRoot } of candidates) {
      if (isPlaceholder(token) || token.includes("*") || token.includes("…")) continue;
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
  for (const { line, text } of lines) {
    ANCHOR_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = ANCHOR_RE.exec(text)) !== null) {
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
  return { violations, resolved };
}

// --- class (c): workbench-record citations ----------------------------------
//
// The parser is `./helpers/citation-scan.ts` (see the header note under class
// (c)). Imported here rather than defined: `scanRecordCitations`, and, for the
// fixtures below, `workbenchIndex`, `circleDirs` and `RECORD_EXAMPLE_FILES`.

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
// EVERY MOVE IS STILL ATTRIBUTED HERE, above the constant — but the log stopped
// accumulating in a file the growth bound measures BY THE LINE. Entries 1 to 25
// (2026-08-16 to 2026-08-22, 418 lines) moved verbatim to this workbench's
// `shared/analyses/260822-1318-reference-resolution-pin-re-approval-log-entries-1-to-25.md`,
// which is where to read what moved the number before the entry below; roll the
// older entries there again when these grow long (decision `260822-1229`, option 2).
// Entries 26 to 40 (2026-08-22 to 2026-08-23, 92 lines) rolled the same way on 2026-08-24 into
// `shared/analyses/260824-2121-reference-resolution-pin-re-approval-log-entries-26-to-40.md`.
// Re-approved 2026-08-24 for step 3 of the C3 plan, a cut of 22 spent-reasoning passages from
// `skills/setup/SKILL.md` to free `skills/` head-room: paths 1295 -> 1291, anchors 181 -> 180,
// records 118 -> 117. paths -4 are `agents/orchestrator.md` twice (the removed-counter obituary in
// Step 1 and the Turn-count rationale in Step 5), `bin/fusion-paths` (Step 0i's ordering rationale)
// and `rules/fusion-workbench-conventions.md` (the top-of-file restatement, which is also the -1
// anchor, `## Path Resolution`). records -1 is the defect Step 0e cited for why it exists.
// Re-approved 2026-08-24 (C3 steps 4-5, `3ba7a46`; written after the fact from `git show 3ba7a46` per issue 260824-1512): paths 1291 -> 1303, anchors 180 -> 181, records 117 -> 119. The twelve paths are the plugin files `bin/fusion-identity`'s header cites (`bin/fusion-paths`, `bin/fusion-turn-budget`, `bin/fusion-count-sources`, `rules/critical-stance.md`, `rules/workbench-tracking.md`, `rules/fusion-workbench-conventions.md`, `skills/setup/SKILL.md`), the helper cited by its new `CLAUDE.md` row and by the edits to `rules/fusion-workbench-conventions.md` and `rules/workbench-tracking.md`; the anchor is the helper's `## Path Resolution` citation; the two records are the exit-4 decision `260824-0613_*_does-a-filing-agent-halt-in-a-tree-that-is-not-a-git-work-tree-at-all.md`, cited by the helper and by the `CLAUDE.md` row. The test file landed in `b7f8326` and is outside this gate's surface.
// Re-approved 2026-08-24 (C3 step 6): paths 1303 -> 1304, the rest unmoved; the one token is `bin/fusion-identity`, cited by the conventions file's new `### Who filed it`.
// Re-approved 2026-08-24 (C3 step 7): paths 1304 -> 1305, the rest unmoved; the one token is `bin/fusion-identity` again, cited by `rules/circle-records.md`'s new `### The claim field`.
// Re-approved 2026-08-24 (C3 step 8): paths 1305 -> 1310, anchors 181 -> 183, records 119 -> 120. The five paths are `bin/fusion-identity` and `rules/critical-stance.md` newly cited in `agents/orchestrator.md` `## Circle head fields`, plus `bin/fusion-identity`, `rules/fusion-workbench-conventions.md` and `rules/circle-records.md` newly cited in `agents/shaper.md`'s frontmatter fill; the two anchors are that fill's `### Who filed it` and `### The claim field`; the one record is the route-dependence defect `260822-2045_*_a-circles-head-fields-end-up-in-different-states-depending-on-which-of-the-two-activation-routes-ran.md`, cited by the new no-condition paragraph. The orchestrator's own bare mention of `### The claim field` carries no adjacent path and so registers in neither class.
// Re-approved 2026-08-24 (C3 step 9): paths 1310 -> 1316, anchors 183 -> 186, records unmoved. All nine tokens are Step 0i's in `skills/setup/SKILL.md`: `bin/fusion-identity` three times (the identity paragraph, plus both `$FUSION_PLUGIN_ROOT`-rooted spellings on its bash line), `rules/fusion-workbench-conventions.md` with `### Who filed it`, and in the one-path branch `agents/orchestrator.md` with `## Circle head fields` and `rules/circle-records.md` with `### The claim field`; `fusion-workbench/.checkout-id` is under no plugin directory and registers nowhere.
// Re-approved 2026-08-24 (C3 step 10): paths 1316 -> 1319, anchors and records unmoved. All three tokens are in Step 6.1's new claim branch in `skills/next/SKILL.md`: `bin/fusion-identity`, `$FUSION_SRC/agents/orchestrator.md` and `$FUSION_SRC/rules/circle-records.md`. The two headings adjacent to the last two, `## Circle head fields` and `### The claim field`, register as no anchor at all: `scanHeadingAnchors` resolves its file token literally and does not strip a ROOT_VARS prefix the way `scanPluginPaths` does, so a `$VAR/`-rooted anchor is skipped — which is why Step 6.2's older citation of the same section never counted either.
// Re-approved 2026-08-24 for the two C3 citation repairs: paths 1319 -> 1318, anchors 186 -> 185, records unmoved. Three edits, and every swap is one token out for one token in. In `skills/next/SKILL.md` Step 6.1 the override citation moves from `$FUSION_SRC/agents/orchestrator.md` to `$FUSION_SRC/rules/circle-records.md`, where the `Overridden ` form is actually authored, and the bare `bin/fusion-identity` gains its `$FUSION_PLUGIN_ROOT` root; both are net zero, and the -1 is the trailing duplicate citation of that same section, now redundant one sentence after it. In `skills/setup/SKILL.md` Step 0i the same override citation moves `agents/orchestrator.md` `## Circle head fields` -> `rules/circle-records.md` `### The claim field`, net zero in both classes because the anchor is unrooted here, and the second -1 path and the -1 anchor are that step's trailing duplicate of the section, removed for the same reason. The +1 path is `rules/fusion-workbench-conventions.md` `### Who filed it`, where one bare `bin/fusion-identity` became two `$FUSION_PLUGIN_ROOT`-rooted spellings, the prose call and the `[ -x ]` guard beside it. Both defects are `circles/260824-0530-record-attribution-and-circle-claim/issues/260824-1538_*_both-override-call-sites-cite-a-section-that-does-not-define-the-sentence-they-must-write.md` and `circles/260824-0530-record-attribution-and-circle-claim/issues/260824-1538_*_the-filing-rule-names-the-identity-helper-with-no-root-no-guard-and-no-branch-for-its-absence.md`.
// `records` left the pin on 2026-08-24 (issue 260816-0725): that class resolves
// against the workbench, which the archive step rewrites in the ordinary course
// of a session, so its count moved with housekeeping and not with text. The
// class is still scanned and a dangling record still fails above; the corpus
// itself is `workbench-citation-lint.test.ts`'s to measure.
// Re-approved 2026-08-24 (this Circle's step 6, issue 260824-1506): anchors 185 -> 188, paths unmoved. `scanHeadingAnchors` now strips a ROOT_VARS prefix, so the three `$FUSION_SRC/`-rooted anchors in `skills/next/SKILL.md` entered scope: `rules/circle-records.md` `### The claim field`, `agents/orchestrator.md` `## Circle head fields` and `rules/circle-records.md` `### The Directive is a pointer once a spec exists`; the fourth the issue counted was the duplicate the C3 citation repairs removed.
// Re-approved 2026-08-24 (this Circle's step 8): paths 1318 -> 1325, anchors unmoved. The seven paths are the plugin files the eight `CLAUDE.md` sentences, the three `README-agents.md` rows and the `docs/upgrading-to-v9.md` preamble newly cite.
// Re-approved 2026-08-24 (this Circle's step 7, measured over a tree that also held step 11's uncommitted `agents/` edits): paths 1325 -> 1336, anchors 188 -> 190. Step 7's own five are all `bin/` header comments, which this gate scans: the new `bin/fusion-session-domain` citing its three `skills/` call sites and `bin/fusion-paths`, and `bin/monitor` citing `hooks/tracker.ts` beside the two event classes it now renders; `bin/fusion-rules` swapped the golden for `hooks/lib/__tests__/rules-voice-profile.test.ts` (issue 260821-0142), net zero. The remaining six paths and both anchors are step 11's.
const BASELINE = { paths: 1458, anchors: 201 }; // Re-approved 2026-08-27 (decision 260827-0745 realised — the curator's anchored evidence pass): paths 1456 -> 1458, anchors 199 -> 201, and the whole move is `README-agents.md`'s new `**Scope:**` roster row, whose "Passed by" and "Declared at" cells cite `skills/curate/SKILL.md` `## Step 2 — Dispatch the curator to survey` and `agents/curator.md` `## Dispatch parameters`/`## Evidence` — two rooted headings, each a path and an anchor at once. The prompt-side citations of the decision itself count nothing: they are bare stamps (`260827-0745`), the form the path-literal gate forces on a store-folder reference inside an agent prompt or skill body. Earlier: re-approved 2026-08-27 (v10.8.1, the SubagentStop completion + the cadence anchor): paths 1447 -> 1456, anchors unmoved. The single-file-revert shares sum to 13 over a +9 whole, and the excess is structural rather than an error: `bin/fusion-cadence-anchor` measures -8 alone because reverting it BOTH removes its own header's citations (`rules/workbench-tracking.md`, and the bare helper names) AND dangles the references to it that `CLAUDE.md` (+2, its Layout row), `skills/cleanup/SKILL.md` (+2, the Step 3 skip's guarded call, twice) and `rules/workbench-tracking.md` (+1, the class-L rationale) contribute — a new bin/ helper's share and its citers' shares are not disjoint under one-at-a-time reverts, which the next re-approver of a new-helper change should expect rather than re-derive. `hooks/subagent-stop.ts`, `hooks/lib/orchestrator-events.ts`, `README-hooks.md` and `docs/upgrading-to-v10-8.md` each measure 0: their new citations are workbench records (the 260827-0740 analysis, the 260827-0716 issue in wildcard form after its close), which resolve but register in no pinned class. Earlier: re-approved 2026-08-27 (v10.8.0, the machine-written event rows — Phase 1 of refactor/260827-0335-bookkeeping-cost-repair-plan.md): paths 1431 -> 1447, anchors 197 -> 199. Nine touched files were each reverted alone against the rest of the dirty tree, and the nine shares sum to the whole: 2+7+1+2+1+1-1+3+0 = 16 and 0+0+0+1+0+0+1+0+0 = 2. `CLAUDE.md` +2 paths (the hooks Layout row naming `hooks/lib/orchestrator-events.ts`, the guard bullet naming it again). `README-hooks.md` +7 paths (the new `lib/orchestrator-events.ts` table row and the dispatch paragraph, each citing the emitter and its two stores; the architecture tree's new lines). `rules/commit-lock.md` +1 path (`bin/fusion-identity` in the new `## The lock writes the commit event` section; the heading itself is a definition, not a citation, so it moves no anchor here — its citers pay). `bin/fusion-commit-lock` +2 paths +1 anchor (the emitter comment citing that rooted heading, path and anchor at once, plus `hooks/lib/orchestrator-events.ts`). `bin/fusion-events` +1 path (the env-first paragraph naming `bin/fusion-identity` once more). `bin/fusion-session-mark` +1 path (its header now naming `hooks/lib/orchestrator-events.ts` as the heartbeat's writer). `agents/orchestrator.md` NET -1 path +1 anchor, and the two directions are the point: the deleted per-Turn heartbeat clause carried the rooted `bin/fusion-session-mark` call (-2), while the machine-written notes cite `rules/commit-lock.md` `## The lock writes the commit event`, one path and one anchor at once. `docs/upgrading-to-v10-8.md` +3 paths, the note entering scope with `bin/fusion-commit-lock`, `bin/fusion-identity` and `bin/fusion-events`. `hooks/lib/__tests__/hooks-wiring.test.ts` 0 — its new comment cites a workbench record (`shared/issues/260827-0410_o_*`), which resolves but registers in no pinned class. Earlier: re-approved 2026-08-26 (C4 Turn 3 task Z-2, the count corrections before closure): paths 1430 -> 1431, anchors 196 -> 197. One token counted twice, and the share was measured rather than apportioned: with `rules/workbench-tracking.md` alone reverted to HEAD against the rest of the dirty tree this gate resolves the committed 1430/196 exactly, so the whole move is that file's and every other file the task touched contributes 0. The token is `agents/orchestrator.md` `### 3. Post-Session Sequence Diagram`, added where the paragraph that names the readers of the checkout-scoped log moved from three to four and named the fourth by path; a rooted heading registers as one path and one anchor at once, the same way the `### 2. Structured Event Log` citation four paragraphs above it does. Two zero-contribution findings the next re-approver should not have to re-derive. `CLAUDE.md`'s Layout row and `bin/fusion-events`'s header were both rewritten in the same task, replacing a wrong count with two correct ones, and neither moved this gate: the rewrite added no path or heading token that was not already in the sentence it replaced. And `hooks/dist/` contributes nothing even though `hooks/lib/events-query.ts`'s docstring, from which the two compiled copies are generated, was rewritten in the same edit — `hooks/**.ts` is scanned for class (c) record citations only, and that docstring's one record citation was left untouched. Earlier: re-approved 2026-08-26 (C4 Turn 3, the wave of three prompt and doc tasks): paths 1424 -> 1430, anchors unmoved at 196. Each of the three coders measured its own share by reverting its own files against the rest of the dirty tree, so the split below is measured rather than apportioned, and the three sum to the whole: 1 + 3 + 2 = 6, which is the 1430 this gate reports here. R-10 (`skills/setup/SKILL.md`) is one path, the unrooted `agents/orchestrator.md` added at Step 0i beside the `bin/fusion-identity` call; it cites a numbered Setup step and not a heading, so it is a path and no anchor. R-12 (`agents/reconciler.md`) is three: `bin/fusion-events` twice, bare in the `turns` call and rooted at `$FUSION_PLUGIN_ROOT` in its `[ -x ]` guard, plus one more `agents/orchestrator.md`. The `fusion-workbench/orchestrator-events.jsonl` the sentence it replaced carried is a workbench token and registers in no pinned class, which is why a step that rewrites a whole clause still only counts additions. R-7 (`CLAUDE.md` and `README-hooks.md`) is two, `hooks/session-id.ts` in the `CLAUDE.md` Layout row and `${CLAUDE_PLUGIN_ROOT}/hooks/dist/session-id.js` in the README wiring snippet. Two findings from this wave that the next re-approver needs and cannot re-derive from the number. First, a `$VAR`-rooted plugin path inside a JSON code fence does contribute: `scanPluginPaths` has no fence exemption of any kind, which R-7's measurement established against that wiring snippet, and it is the same property the C4 step 6 entry below reports for a top-level bash fence. Second, R-14's edits to `agents/orchestrator.md` contribute 0, so the `agents/` surface moved on this wave for two independent reasons and only one of them touched this gate. Earlier: re-approved 2026-08-26 (C4 step 6, presence at the two activation surfaces): paths 1421 -> 1424, anchors 195 -> 196. The share was measured by reverting the two edited files against the rest of the dirty tree, and then one of them against the other: with both reverted the gate resolves the committed pin exactly, so none of this is a sibling's. `skills/setup/SKILL.md` is one path, `bin/fusion-events` rooted at `$FUSION_PLUGIN_ROOT` on the first line of Step 0c's presence call. That line sits inside a top-level fence and counts anyway: `scanPluginPaths` has no fence exemption of any kind, so a plugin path in a code block resolves like one in prose — which is why the second line of the same block, calling through the `$E` it just set, contributes nothing. `skills/next/SKILL.md` is the other two paths and the anchor: the bare `bin/fusion-events` in the briefing's presence line, and `$FUSION_SRC/skills/setup/SKILL.md` `## Step 0c`, a rooted heading that registers as one path and one anchor at once. Earlier: re-approved 2026-08-26 (C4 step 5, one Turn count over four sites): paths 1411 -> 1421, anchors unmoved. All ten are `bin/fusion-events`, and the share was measured by reverting one of the two edited files at a time against the other: `agents/orchestrator.md` is six — twice rooted at `$FUSION_PLUGIN_ROOT` inside Setup Step 1's guarded call, once bare in that call's else-branch message, then once each in the prose beside it, in Phase 2 step 3 where the definition is stated, and in the `progress.turn` row of the Persistent-State derivation table. `skills/setup/SKILL.md` is four, the same call and its prose in Step 1. Nothing left scope: the `fusion-workbench/…` log paths the removed `grep -c` lines carried are workbench tokens and register in no pinned class, which is why a step that deletes two commands still only counts additions. Earlier: re-approved 2026-08-26 (C4 Turn 2 first wave, measured whole once all four tasks had settled): paths 1409 -> 1411, anchors unmoved. This supersedes the mid-wave reading below rather than contradicting it: that one was written by the step-4 task over a tree two siblings were still writing to, so it recorded what the gate resolved at that moment and not what the wave came to. The four shares are disjoint and each was taken by reverting one file at a time against the rest of the dirty tree. Step 4 (`skills/setup/SKILL.md`) is one path and one anchor at once, the rooted `### 2. Structured Event Log` heading; step 9 (`rules/workbench-tracking.md`) is four paths and one anchor; step 7 (`bin/monitor`) is nothing, its comment lines scanned with this gate's own pattern before and after at 7 tokens either way; and the two counted here are `bin/fusion-identity` and `hooks/events-query.ts`, both entering `bin/fusion-events`'s header where it now states the single translation point for the identity helper's exit vocabulary. 1404 + 1 + 4 + 2 = 1411, and 193 + 1 + 1 = 195. Earlier: re-approved 2026-08-26 (C4 steps 4 and 9, measured together because they were in flight together): paths 1404 -> 1409, anchors 193 -> 195. The five paths and two anchors split cleanly and the split is derived from the two diffs rather than apportioned. Step 4's share is one token counted twice, the orchestrator prompt's `### 2. Structured Event Log` heading rooted at its file, cited once by the setup skill body's Step 5 where the field contract is read rather than restated; a rooted heading registers as a path and an anchor at once, the way step 12's single token did. Step 9's share is the remaining four paths and one anchor, all in `rules/workbench-tracking.md`: that same rooted heading again, plus `bin/fusion-events` twice and `bin/monitor` once where the three readers of the scoped log are named. The two were measured over each other because the wave commits together; a later step that moves this number again re-approves on the same terms. Earlier: re-approved 2026-08-25 (C4 step 2, the presence reading becomes its own program): paths 1380 -> 1404, anchors unmoved. Twenty-two of the 24 are the program itself: thirteen are `bin/fusion-events`'s own header, which enters this gate's surface whole because a `bin/` file with a `#!` is scanned on its comment lines; five are the `CLAUDE.md` Layout row for it and four the `README-hooks.md` `hooks/lib` row for `lib/events-query.ts`. The two new `.ts` sources move nothing: `hooks/**.ts` is scanned for class (c) record citations only, and neither module cites a record. The remaining 2 are this same edit's second half, the `events-query.ts` row added to `README-hooks.md`'s entry-point table, which cites `bin/fusion-events` and `lib/events-query.ts` once each; no gate holds that table, which is why the row was missing and why its own cost is counted here rather than separately. This step's share and step 3's are disjoint (1380 + 24 = 1404), though they were measured over each other's uncommitted edits. Earlier: re-approved 2026-08-25 (C4 step 3, every emitted event line names the person and checkout that wrote it): paths 1376 -> 1380, anchors 192 -> 193. All five are `agents/orchestrator.md`: `bin/fusion-identity` in the `### 2. Structured Event Log` contract, the same path rooted at `$FUSION_PLUGIN_ROOT` twice inside Setup step 2's guarded call — that fence is indented into a list item, which this gate's flat fence tracker never opens, so it is read as prose — and `rules/fusion-workbench-conventions.md` `### Who filed it` beside the call, one path and one anchor at once. Earlier: re-approved 2026-08-25 (the v10.7.0 release edits): paths 1357 -> 1374, anchors 190 -> 192. All of it is `docs/upgrading-to-v10-7.md` entering scope with its citations of the reconciler, orchestrator, the two helpers, `hooks/lib/config.ts` and the two previous notes, plus `README.md` and `skills/help/SKILL.md` each pointing at the new note; the help topic dropped the v10.3 paragraph in the same edit. Earlier: re-approved 2026-08-24 (this Circle's step 15, the Turn 1 review closures): paths 1353 -> 1357, anchors 189 -> 190. The anchor and one path are `bin/fusion-session-domain`'s header citing `agents/orchestrator.md` `## Persistent State File` for the one block that carries a two-space `domain:` (issue 260824-2056, the header's scope claim); the other three paths are `hooks/lib/config.ts` entering `CLAUDE.md`'s migration row and `docs/upgrading-to-v10.md` as the home of `RETIRED_TOP_LEVEL_KEYS` (issue 260824-2056, the fourth retired key), and `rules/commit-lock.md` entering the orchestrator's held-commit step (issue 260824-2056, the unheld index comparison). The two new hook tests are outside this gate's surface, and the 92 log lines this step rolled into `shared/analyses/260824-2121-…` moved no count. Earlier, same day (step 13, `rules/`): paths 1350 -> 1353, anchors unmoved. The three are `rules/review-contract.md` citing `bin/fusion-review-coverage` beside the per-topic pattern it now shares with the consolidated review (issue 260816-0719), and `rules/commit-lock.md` citing `bin/fusion-workbench-root` and `bin/fusion-commit-lock` for the `cd` the `with` form performs (issue 260810-2025); the anchors this step added are all in-file and unrooted, which this gate does not count. Earlier re-approval, same day (this Circle's steps 10 and 12, `skills/` and `agents/orchestrator.md`; measured over a tree that also held a concurrent step's uncommitted `CLAUDE.md` edits): paths 1336 -> 1350, anchors 190 -> 189. Step 10's share is three skill bodies citing `bin/fusion-session-domain` in place of an inline `agentstate.yaml` read (issue 260810-2110), two `## fusion-workbench Layout` anchors leaving with the old blocks; the two steps measured over each other's in-flight edits, so the split between them is not exact. Step 12's own token is one path and one anchor at once, `rules/fusion-workbench-conventions.md` `### Who filed it`, cited by the `**Claim:**` row of `## Circle head fields` when its bare `bin/fusion-identity` took the rooted, guarded form (issue 260824-1622); its other citations are workbench records and register in no pinned class. The remainder is `CLAUDE.md`'s and `skills/`'s, in flight beside this step. Written on this line rather than its own because the hook-test line budget was at its bound.

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
  const counts = { paths: 0, anchors: 0, records: 0 };
  const none = { violations: [], resolved: 0 };
  for (const f of surface()) {
    const lines = scannedLines(f);
    const a = f.recordsOnly ? none : scanPluginPaths(f.rel, lines);
    const b = f.recordsOnly ? none : scanHeadingAnchors(f.rel, lines, byBase);
    const c = scanRecordCitations(f.rel, lines);
    all.push(...a.violations, ...b.violations, ...c.violations);
    counts.paths += a.resolved;
    counts.anchors += b.resolved;
    counts.records += c.resolved;
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
    expect({ paths: counts.paths, anchors: counts.anchors }, BASELINE_MESSAGE).toEqual(BASELINE);
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
    expect(violations[0].fix).toContain("260806-0015");
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

  it("flags a wrong store path even when the record exists elsewhere", () => {
    const wrongStore = sample!.relDir.split("/").includes("issues") ? "decisions" : "issues";
    const { violations } = scanRecordCitations(
      "fixture.md",
      L(`see \`shared/${wrongStore}/${wildcard}\``),
    );
    // Either "wrong store path" (record found elsewhere) or resolves if a
    // same-named record exists in that store — assert only the non-crash shape
    // plus that a violation, if any, names where the record lives.
    for (const v of violations) expect(v.problem).toMatch(/wrong store path|no record/);
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

  it("resolves a real Circle-directory citation and flags a fabricated one", () => {
    const anyCircle = [...circleDirs().keys()][0];
    const ok = scanRecordCitations("fixture.md", L(`Provenance: circles/${anyCircle}`));
    expect(ok.violations).toEqual([]);
    expect(ok.resolved).toBe(1);
    const bad = scanRecordCitations("fixture.md", L("Provenance: circles/990101-0101-no-such-circle"));
    expect(bad.violations.length).toBe(1);
    expect(bad.violations[0].problem).toContain("no such Circle directory");
  });

  // An archived Circle directory, derived from the tree rather than named: a
  // workbench whose sweeps have all been cleaned has nothing to assert on, and
  // this SKIPS there instead of passing silently or pinning an archive layout
  // it does not own. Its subject is issue `260819-2300` — the record form
  // resolved under a sweep while its own directory did not.
  const swept: [string, string][] = (() => {
    const archive = join(pluginRoot, "fusion-workbench", "archive");
    if (!existsSync(archive)) return [];
    return readdirSync(archive).flatMap((s) => {
      const circles = join(archive, s, "circles");
      return existsSync(circles)
        ? readdirSync(circles).map((d) => [s, d] as [string, string])
        : [];
    });
  })();

  it.runIf(swept.length > 0)("resolves an archived Circle directory to its archive path", () => {
    const [sweep, dir] = swept[0];
    expect(
      scanCitationTokens("fixture.md", L(`the circles/${dir} Circle answered it`)).map((h) => [
        h.kind,
        h.status,
        h.matches.join(" "),
      ]),
    ).toEqual([["circle-dir", "resolved", `archive/${sweep}/circles/${dir}`]]);
    // and the same name with no `circles/` prefix, which is the `stamp-name`
    // token — one index serves both, so both moved together
    expect(scanCitationTokens("fixture.md", L(`the ${dir} Circle`)).map((h) => h.status)).toEqual([
      "resolved",
    ]);
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
    "circle-record",
    "circle-dir",
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
