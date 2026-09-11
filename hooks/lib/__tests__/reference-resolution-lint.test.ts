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
// Entries 41 to 54 (2026-08-24 to 2026-09-01, 19 lines) rolled the same way on 2026-09-10 into
// `shared/analyses/260910-0512-reference-resolution-pin-re-approval-log-entries-41-to-54.md`.
// The two 2026-08-29 entries that were DROPPED from the line below on 2026-09-04 instead of rolled
// were recovered verbatim the same day into `shared/analyses/260904-2202-reference-resolution-pin-re-approval-log-the-two-dropped-2026-08-29-entries.md`
// (defect `260904-2044_*_two-pin-re-approval-entries-were-dropped-instead-of-rolled-into-the-log-the-header-prescribes.md`). Roll, never drop.
// `records` left the pin on 2026-08-24 (issue 260816-0725): that class resolves
// against the workbench, which the archive step rewrites in the ordinary course
// of a session, so its count moved with housekeeping and not with text. The
// class is still scanned and a dangling record still fails above; the corpus
// itself is `workbench-citation-lint.test.ts`'s to measure.
// Re-approved 2026-09-09 (the v10.26.0 release, not a step of any plan): paths 1721 -> 1728, anchors and stampBare unmoved. Seven tokens, each measured per file with the gate's own PLUGIN_PATH_RE rather than by subtraction, because an existence check makes the files interact. Four are in the new `docs/upgrading-to-v10-26.md`: `bin/fusion-turn-budget` and `rules/bounded-dispatch.md` once each, `bin/fusion-events` twice (the section heading and the prose beside the invocation block). Two are the new `**Upgrading from v10.25?**` block in `README.md`: `bin/fusion-events` and `docs/upgrading-to-v10-26.md`. One is `bin/fusion-events` in the new release paragraph of `skills/help/SKILL.md`'s update topic; that topic's two `$FUSION_SRC/`-rooted doc citations cancel, the v10.26 note arriving as the v10.23 note leaves with the oldest of the three paragraphs.
// Re-approved 2026-09-09 (Circle 260909-1700 step B2, the dispatch gate widens from orchestrator-scoped to project-scoped): paths 1728 -> 1729, anchors and stampBare unmoved. The one new token is `hooks/lib/orchestrator-events.ts`, cited on a comment line of `bin/fusion-commit-lock` where the rewritten `emit_commit_event` header names the module whose `eventRowsAdmitted` the script's own two-armed condition now mirrors. Single-file revert against HEAD is the whole measurement and leaves no residue: with `bin/fusion-commit-lock` alone reverted the gate resolves 1728/253/14 and every case passes, so no share is owed to any other file this step touched. The step's four other changed files cannot reach this pin by construction rather than by arithmetic, which is worth writing down once so the next re-approver does not re-measure them: `hooks/guard.ts`, `hooks/tracker.ts` and `hooks/lib/orchestrator-events.ts` are scanned `recordsOnly`, so the plugin paths their rewritten comments carry are not class (a) at all; `hooks/lib/__tests__/guard-state-shape.test.ts`, `helpers/guard-harness.ts` and `fusion-commit-lock.test.ts` sit under a directory `surface()` never descends into. No anchor moves with the token: a backtick closes it and no heading follows. One growth golden moved and no baseline did: `fixtures/surface-growth.golden` was regenerated in the same edit (hook tests 22 992 -> 23 257 lines, through `guard-state-shape.test.ts` 215 -> 351, `helpers/guard-harness.ts` 970 -> 1070, `fusion-commit-lock.test.ts` 424 -> 452 and this entry's own single line in this file, 1006 -> 1007), which is inside that surface's own 2 500 of head-room; `fixtures/rules-emission.golden` is untouched, no always-on rule file, `agents/` file or skill body being in scope for this step.
const BASELINE = { paths: 1517, anchors: 232, stampBare: 11 }; // Re-approved 2026-09-11 (step D3 of `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md`, the retirement of the universal-core growth bound): paths 1516 -> 1517, anchors and stampBare unmoved. ATTRIBUTED BY SINGLE-FILE RESTORE, the method the entries below use, and then a second time within the file: `README-hooks.md` written back to HEAD against the otherwise finished tree leaves this gate green at 1516, so the one token is that file's and no other edited file moved the number. THE TWO OTHER EDITED SOURCE FILES ARE OUT OF SCOPE BY CONSTRUCTION and it is worth naming, because a reader checking this delta will look there first: `hooks/lib/__tests__/rules-emission-golden.test.ts` lost 76 lines of assertion and header prose here and `hooks/lib/__tests__/helpers/growth-bound.ts` two words of cardinality, but `surface()` reads `hooks/lib/*.ts` without recursing into `__tests__/`, so nothing either file cites has ever been in this pin's scope. THE ONE TOKEN IS `CLAUDE.md`, and a second measurement isolates it rather than leaving it to subtraction: with that single token respelled as plain words and every other byte of the new text standing, the gate passes at 1516. It sits in the new paragraph recording why retiring the always-on rule bound was safe, which has to name the two things that bound could not see — `CLAUDE.md`, and a conditionally emitted rule file — because the per-dispatch-path bound measuring both is the whole of the argument. NET ZERO ON THE OTHER PLUGIN PATH IN THAT SECTION, measured the same way: `hooks/lib/__tests__/rules-emission-golden.test.ts` leaves the surface table with the retired row and re-enters in the retirement paragraph, one for one. ANCHORS UNMOVED IS THE EXPECTED READING: the new prose cites no `## Section` of another file. THIS LINE IS REWRITTEN IN PLACE WITH NO LINE ADDED, following the 2026-09-05 and S8 entries' form, because the hook-test surface is measured by the line and a bookkeeping entry must not spend it.
// PREVIOUS: Re-approved 2026-09-11 (the user's ruling on re-baselining after a cut, written into `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining`, with that section's logs, provenance and structural note moved into `README-hooks.md` to fund the new text on a surface at zero margin): paths 1506 -> 1516, anchors and stampBare unmoved. ATTRIBUTED BY SINGLE-FILE RESTORE, the method the entries below use, and then a second time within the file: `README-hooks.md` written back to HEAD against the otherwise finished tree leaves this gate green at 1506, and so does the same tree with only the re-baselining paragraph's edit kept, so all ten tokens belong to the new `#### When each event was used, and what governs it` section and none to the paragraph above it. Per token: two `hooks/lib/__tests__/surface-growth-bound.test.ts`, three `hooks/lib` (one of them the bare `hooks/lib/` spelling in the structural note), and one each of `hooks/lib/__tests__/rules-emission-golden.test.ts`, `hooks/lib/__tests__/helpers`, `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`, `hooks/tsconfig.json` and `hooks/dist`. The section's `skills/*/SKILL.md` and `agents/*.md` move nothing: each carries a `*` and the scanner skips a wildcard token before the existence check. THE OTHER EDITED FILE IS OUT OF SCOPE BY CONSTRUCTION and it is worth naming, because a reader checking this delta will look there first: `hooks/lib/__tests__/helpers/growth-bound.ts` lost four net lines of header comment here, but `surface()` reads `hooks/lib/*.ts` without recursing into `__tests__/`, so nothing that file cites has ever been in this pin's scope. Previous: Re-approved 2026-09-11 (the S11 follow-up to `260910-2145_*_restore-the-per-work-item-container.md`, which closed the two defects the closing measurement found and moved the head-room raise log out of a bounded surface): paths 1502 -> 1506, anchors and stampBare unmoved. ATTRIBUTED BY SINGLE-FILE RESTORE, the method the entries below use: `README-hooks.md` written back to HEAD against the otherwise finished tree leaves this gate green at 1502, so all four tokens are that file's and no other edited file moved the number. The four are one `hooks/lib/__tests__/fixtures/surface-growth.golden`, one `hooks/lib/__tests__/rules-emission-golden.test.ts` and two of `hooks/lib/__tests__/surface-growth-bound.test.ts`, all inside the new `#### The 2026-09-11 raises, and the reduction read on 2026-10-10` section. That section cites three further plugin paths and they move nothing: each carries a `*` and the scanner skips a wildcard token before the existence check, which is why seven spellings move the count by four. THE OTHER EDITED FILE MOVES NOTHING FOR A DIFFERENT REASON and it is worth naming, because a reader checking this delta will look there first: `hooks/lib/__tests__/surface-growth-bound.test.ts` lost 60 net lines of header comment here, but `surface()` reads `hooks/lib/*.ts` without recursing into `__tests__/`, so nothing that file cites has ever been in this pin's scope.
// PREVIOUS: Re-approved 2026-09-11 (steps S5 AND S6 of `260910-2145_*_restore-the-per-work-item-container.md`, together): paths 1476 -> 1502, anchors 217 -> 232, stampBare unmoved. ONE RE-APPROVAL COVERS TWO STEPS BECAUSE S6 DELIBERATELY DID NOT TAKE ITS OWN. It moved the number and left the gate red for S5 to clear, on the reasoning that one reconciliation over both movements is honest where two consecutive guesses are not — the second re-approver would have been attributing a delta measured against a baseline nobody had checked. THE SPLIT BETWEEN THE TWO STEPS IS MEASURED, NOT APPORTIONED: restoring all six of S5's files to their pre-S5 text against the finished tree leaves exactly S6's landed state, and the gate passes there at 1485/223. So S6 is +9 paths and +6 anchors (the depth-2 globs and the two `**Item:**` parameters), and S5 is +17 paths and +9 anchors. S5'S OWN MOVEMENT IS ATTRIBUTED PER FILE by the same single-file-restore method, and the six deltas sum to the total with no interaction between them: `rules/workbench-path-resolution.md` +6/+4 (the restored second argument and exit 3 now cite `rules/fusion-workbench-conventions.md` `## Path Resolution` and `## Origin Rule (Herkunftsregel)`, the key table's `OUT_BACKLOG` row cites `## Backlog entries — work items`, the roster cite is `README-agents.md` `## Dispatch parameters`, and the paragraph naming `/fusion:setup` as the path-literal gate's second exemption cites that gate and the conventions' own exemption paragraph); `rules/context-manifest.md` +7/+1 (six `bin/` tokens, because the topic paragraph stopped restating the claim scan and now names `bin/fusion-claimed-item`, `bin/fusion-paths` and `bin/fusion-rules` where the criterion and the degradation actually live, plus one conventions cite — the anchor is +1 and not +2 because the deleted restatement carried one); `rules/workbench-tracking.md` +2/+2 and `rules/rule-file-provenance.md` +2/+2, each two conventions cites with their anchors. TWO OF THE SIX FILES MOVED THIS PIN BY ZERO AND ARE RECORDED ANYWAY, because they moved a different gate: `rules/decision-record-examples.md` and `rules/commit-lock.md` each carried one retired Circle noun in a sentence about scope, are emitted rules rather than emitted-to-nobody ones, and their correction moved `fixtures/rules-emission.golden` by +19 and +3 bytes on four of the eleven roles. The golden was regenerated for that and nothing else; the tightest path, `reviewer`, draws neither file and did not move. NO GROWTH BASELINE MOVED AND NO HEAD-ROOM WAS RAISED: `rules-emission-golden` and `surface-growth-bound` are both green as they stand, and the three files S5 was scoped to are emitted to no agent and cost zero dispatch bytes. ONE THING THE MEASUREMENT FOUND THAT IS NOT A COUNT. `ANCHOR_RE` is applied per line, so a file-plus-anchor citation that wraps across a line break resolves in neither class and is silently unchecked. Two citations written in this step wrapped that way; both were reflowed onto one line, which is where +2 of the anchor movement above comes from. A future author should read a smaller-than-expected anchor delta as that, and not as a citation that failed to land. THIS LINE IS REWRITTEN IN PLACE WITH NO LINE ADDED, following the 2026-09-05 and S8 entries' form, because the hook-test growth bound is measured by the line and a bookkeeping entry must not spend it. Previous: Re-approved 2026-09-11 (step S8 of `260910-2145_*_restore-the-per-work-item-container.md`, `/fusion:migrate` stops flattening a container and converts only a live record): paths 1474 -> 1476, anchors 215 -> 217, stampBare unmoved. THE MOVEMENT IS ATTRIBUTED EXACTLY AND PER SITE, measured by restoring the one changed shipped file against the finished tree and re-running this gate: with `skills/migrate/SKILL.md` at its previous text the gate passes at 1474/215, so ALL FOUR TOKENS ARE IN THAT FILE, and they are two adjacent file-plus-anchor citations, each counting once in each class. ONE IS NEW and one is a PROMOTION, and the distinction is the whole reason the move is +2 and not +4. The new one is `rules/fusion-workbench-conventions.md` `## Origin Rule (Herkunftsregel)` in the bullet on where a pre-v4 type folder goes: that bullet said one kind has one store and nothing left for an affiliation to select, which the container's return makes false, and its replacement rests on the Origin Rule's own first corollary, so the rule has to stand beside the claim. The promotion is `## Terminal states are history`: the deleted Step 4b cited it BARE, with no filename on the line, which this gate does not resolve in either class; the paragraph that replaced it, saying why no terminal marker gets a status row at all, spells the file beside the anchor and so enters both counts for the first time. Nothing left scope, and one citation only MOVED: the intro's `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` was deleted with the work-item-replaces-the-Circle paragraph and re-appears in the new Step 4b's renaming paragraph, net zero in both classes, which is why a per-file count of that anchor reads 2 before and 2 after. The file's other five adjacent citations are untouched. THIS LINE IS REWRITTEN IN PLACE WITH NO LINE ADDED, the 2026-09-05 entry's form rather than the `// PREVIOUS:` chain's, because the hook-test growth bound stood at 21 728 of 21 728 when this step ran and a line added here would have reddened it for a bookkeeping entry; no growth baseline moved and none had to. The one bounded surface this step touched is `skills/`, +3 173 bytes through `skills/migrate/SKILL.md` alone (36 874 -> 40 047), inside its remaining head-room, and `fixtures/surface-growth.golden` was regenerated in the same edit. Previous: Re-approved 2026-09-10 (step S7 of `260910-2145_*_restore-the-per-work-item-container.md`, `/fusion:setup` stops refusing a workbench in the container shape): paths 1472 -> 1474, anchors 214 -> 215, stampBare unmoved. THE MOVEMENT IS ATTRIBUTED EXACTLY AND PER SITE, measured by restoring the one changed shipped file against the finished tree and re-running this gate: with `skills/setup/SKILL.md` at its previous text the gate passes at 1472/214, so ALL THREE TOKENS ARE IN THAT FILE. Two of them are one citation: `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` in the new paragraph stating that a `circles/` container is the CURRENT layout and never a finding -- the claim needs the definition beside it, because it inverts what the same probe asserted yesterday. The third is `skills/migrate/SKILL.md` in the bullet bounding the re-cut flat-file probe, naming the Step 2 survey where an unmarked `circles/README.md` is reported as a standing note nothing will ever move: the detector may only look for what that executor removes. The section's other two citations (`rules/fusion-workbench-conventions.md` `## Project language` and `rules/user-facing-output.md` in the refusal message) are unchanged and were counted before.
// PREVIOUS: Re-approved 2026-09-10 (step S4 of `260910-2145_*_restore-the-per-work-item-container.md`, `bin/fusion-rules` reads the claim through the shared helper instead of scanning the store itself): paths 1468 -> 1472, anchors 213 -> 214, stampBare unmoved. THE MOVEMENT IS ATTRIBUTED EXACTLY AND PER SITE, measured by restoring the one changed shipped file against the finished tree and re-running this gate: with `bin/fusion-rules` at its previous text the gate passes at 1468/213, so ALL FIVE TOKENS ARE IN THAT FILE and every one of them is comment prose rather than code. The four paths are `bin/fusion-claimed-item` x2 (the header clause that names who answers the claim, and the block saying the criterion is not decided here), `bin/fusion-paths` x2 (the same two places, naming the sibling that calls the helper from this same Setup step) and `rules/fusion-workbench-conventions.md` x1, against `bin/fusion-identity` -1 -- the call this step deleted, kept once in the past tense as the record of what was removed. THE ONE NEW ANCHOR is `## Path Resolution` in that same conventions citation, which is where the exit table says an exit 3 is read against the helper that returned it: the reason this script does NOT re-raise the helper's 3 as its own. `shared/backlog` left the file with the scan and is no token of this gate's, since a store directory is not a path that resolves. 0 IS `hooks/lib/__tests__/context-manifest.test.ts`, and the zero is this gate's corpus rather than a still file: it reads the shipped text and no hook test.
// PREVIOUS: Re-approved 2026-09-10 (step S3 of `260910-2145_*_restore-the-per-work-item-container.md`, the resolver regains the per-work branch and the second argument): paths 1461 -> 1468, anchors and stampBare unmoved. THE MOVEMENT IS ATTRIBUTED EXACTLY AND PER SITE, measured by reverting each changed file against the finished tree and re-running this gate, and it is +7 with one token removed. +6 IS `bin/fusion-paths`, all of it header and comment prose: `bin/fusion-claimed-item` x3, `bin/fusion-identity` x1 and `bin/fusion-rules` x2, the three helpers the new scope branch reads its answer from or shares its criterion with. The raw regex finds 8 new tokens in that file and the gate resolves 6, the two left out being the `bin/fusion-claimed-item` the script names in its own two stderr messages — the same comment-prose-not-code reading step S2's entry below measured on the helper itself. +1 IS `CLAUDE.md`, AND THE ONE IS THREE MOVEMENTS: the `bin/fusion-paths` row gains `bin/fusion-claimed-item` and one self-citation for the second argument, and the `fusion-workbench/` row loses one `bin/fusion-checkout-name` — that row's sentence about the checkout store was a third copy of what the helper's own Layout row and the conventions' layout tree already carry. 0 IS `hooks/lib/__tests__/fusion-paths.test.ts`, and the zero is this gate's corpus rather than a still edit: it reads the shipped text and no hook test, so the whole scope-branch case block is outside it. ANCHORS UNMOVED IS THE EXPECTED READING: the new prose cites no `## Section` of another file, and the resolver's own contract is cited by name in the conventions rather than the other way round.
// PREVIOUS: Re-approved 2026-09-10 (step S2 of `260910-2145_*_restore-the-per-work-item-container.md`, the one helper that answers which work item this checkout has claimed): paths 1445 -> 1461, anchors and stampBare unmoved. THE MOVEMENT IS ATTRIBUTED EXACTLY AND PER SITE, measured by reverting each of the three changed files against the finished tree and re-running this gate, and it is +16 with nothing removed but one token. +15 IS THE NEW `bin/fusion-claimed-item`'s OWN HEADER, and only its header: this gate reads a bash script's comment prose and not its code, which the measurement shows — the raw regex finds 18 tokens in the file and the gate resolves 15, the three left out being the `bin/fusion-identity` the script names in its own stderr messages. The fifteen are `bin/fusion-paths` x6, `bin/fusion-rules` x4, `bin/fusion-identity` x4 and `rules/fusion-workbench-conventions.md` x1, and they are that dense because the header is the authoritative documentation for a helper whose whole subject is the criterion those three share. +1 IS `CLAUDE.md`: the Layout row the `bin/` roster gate requires for any new helper, citing `bin/fusion-claimed-item` once and naming no other path. 0 IS `rules/fusion-workbench-conventions.md`, AND THE ZERO IS TWO MOVEMENTS: `bin/fusion-claimed-item` enters `## Path Resolution` `### Contract`, which is the forward reference step S1 deliberately left for this step to add, and one `bin/fusion-paths` leaves `## fusion-workbench Layout`, where S1's own re-approval below recorded adding it — the clause said the resolver applies the Origin Rule once per Setup, which `### Two invariants` already says, and cutting the duplicate is what paid the always-on floor for the new name. ANCHORS UNMOVED IS THE EXPECTED READING: the helper's header cites `## Backlog entries — work items` as a bare section name inside another file's prose, which this gate does not count, and its two record citations are wildcarded basenames, which is why stampBare did not move either. NO DANGLING CASE WAS RED WHEN THIS WAS RE-APPROVED: one was, and it was fixed rather than pinned — the header's example output line spelled a container path with a stamped slug, which the gate read as a record citation carrying its store, and the example now uses `<stamp>-<slug>` placeholders. The previous entry follows.
// PREVIOUS: Re-approved 2026-09-10 (step S1 of `260910-2145_*_restore-the-per-work-item-container.md`, the conventions restore the container, the Origin Rule and the claim-based resolution contract): paths 1442 -> 1445, anchors and stampBare unmoved. THE MOVEMENT IS ATTRIBUTED EXACTLY AND PER SITE — three tokens added, none removed, all three in `rules/fusion-workbench-conventions.md`. 1 x `bin/fusion-paths` in `## fusion-workbench Layout`, in the paragraph that used to say there was no placement decision to make and now says the resolver applies the Origin Rule once per Setup. 1 x `bin/fusion-rules` in `## Path Resolution` `### Contract`, in the sentence saying both resolvers call one claim helper rather than each carrying a claim scan. 1 x `bin/fusion-identity` in `#### Exit codes`, naming the helper whose own 3/5-versus-4 split is what makes unknown scope decidable against a project that is not a git work tree. ANCHORS UNMOVED IS THE EXPECTED READING: the step's new cross-references are bare `## Section` names inside the same file, which this gate does not count, and its two record citations are wildcarded basenames, which is why stampBare did not move either. THE HELPER THE CONTRACT DESCRIBES IS DELIBERATELY NOT NAMED BY PATH: `bin/fusion-claimed-item` does not exist until step S2 of that plan, and a forward reference is exactly what the dangling assertion refuses, so S2 adds the name in its own commit. NO DANGLING CASE WAS RED WHEN THIS WAS RE-APPROVED. The previous entry follows.
// PREVIOUS: Re-approved 2026-09-10 (the stale-text pass over the four filed records the working-minimum cut left open, not a step of the plan): paths 1432 -> 1442, anchors 203 -> 213, stampBare unmoved. THE MOVEMENT IS ATTRIBUTED EXACTLY AND PER SITE, and it is one edit repeated ten times. Ten prose references to the removed numbered phases — "Phase 2 Step 3b", "Phase 0b.2", "Phase 3 step 3", "Step 3a step 5" — were rewritten as heading-anchor citations of the sections that actually carry the procedure now, which is the form `rules/fusion-workbench-conventions.md` `## Filename Patterns` mandates for living text. Each rewrite adds one path AND one anchor, which is why the two classes moved by the same ten: 5 x `agents/orchestrator.md` `### Step 4 — commit` (agents/coder.md, agents/ontocoder.md x2, rules/commit-lock.md, CLAUDE.md), 2 x `### Step 3 — read the return` (agents/coder.md, agents/ontocoder.md), 1 x `### Shaping and planning, when the task needs them` (agents/planner.md), 1 x `## Reconciliation, and the one gate it opens` (agents/reconciler.md), 1 x `## Review coverage` (README-hooks.md). Measured with `git diff` over the pass: ten such tokens added, none removed. stampBare unmoved is the expected reading — no record was cited or de-cited by this pass. NO DANGLING CASE WAS RED WHEN THIS WAS RE-APPROVED: the run that produced these numbers passed the dangling assertion, which is the condition this pin exists to protect. The previous entry follows.
// PREVIOUS: Re-approved 2026-09-10 (step C9 of the working-minimum cut, the work item replacing the Circle): paths 1532 -> 1432, anchors 228 -> 203, stampBare 13 -> 11. THE MOVEMENT IS IN TWO PARTS AND NEITHER IS ATTRIBUTED PER FILE. (1) TWO DELETED RULE FILES AND ONE DELETED SKILL CARRIED THEIR OWN CITATIONS OUT OF THE CORPUS: rules/circle-records.md and rules/backlog-entries.md, deleted by the step's first commit, and skills/direct/SKILL.md, deleted by its second. The three were NOT written back and re-measured the way step C8's six were, so their own contribution is not isolated here; that measurement was not performed and the figure is not claimed. (2) THE REWRITES ACROSS THE SURVIVING SURFACES are the rest, and they are a wide spread: about thirty surfaces were edited in one pass to take the Circle out of every agent prompt and skill body and to bring every citation of the three deleted files off a dangling path. What can be said and is: a dangling citation was never counted as resolved, so none of the -100 is the removal of a citation that was already broken; it is citations that DID resolve and were rewritten into prose naming no file — "the Circle-record rule of the day", "the capture section of the day" — because the file or section they named no longer exists to be cited. The two bare stamps that left are the same shape as the paths: each cited a record by a stamp with no marker and stood inside prose that was rewritten. The -25 anchors likewise: `## Closing a Circle`, `## Circle head fields`, `## Four invocation modes` and `## Re-sharpening an anticipated Circle` were each cited from several places and each went with the section. NO DANGLING CASE WAS RED WHEN THIS WAS RE-APPROVED: the run that produced these numbers passed the dangling assertion, which is the condition this pin exists to protect. The previous entry follows.
//
// PREVIOUS: Re-approved 2026-09-10 (step C8 of the working-minimum cut, the roster cut): paths 1656 -> 1532, anchors 259 -> 228, stampBare 14 -> 13. THE MOVEMENT IS IN TWO PARTS AND ONLY THE FIRST IS ATTRIBUTED PER FILE. (1) THE SIX DELETED FILES CARRIED THEIR OWN CITATIONS OUT OF THE CORPUS: -107 paths, -32 anchors, -1 stampBare. That figure is MEASURED, not apportioned — the six were written back from HEAD into the finished tree, the gate re-run, and the files removed again, which isolates their own contribution from every other edit in this pass. The six are agents/bugfixer.md, agents/coderev.md, agents/ontorev.md, agents/playmaker.md, agents/taskplanner.md and skills/next/SKILL.md; the first five are agent prompts deleted because their subjects are gone or merged, and the sixth is the portfolio command, deleted one step early because its whole body dispatched an agent this step removed. (2) THE REWRITES ACROSS THE SURVIVING SURFACES moved paths -17 and anchors +1, and that half is NOT attributed per file. About thirty-five surfaces were edited in one pass to bring every citation of the six off a dangling path, and single-file-revert attribution of a spread that wide was not performed. What can be said and is: a dangling citation was never counted as resolved, so none of the -17 is the removal of a citation that was already broken; it is citations that DID resolve and were rewritten into prose naming no file — "the removed work-queue prompt", "the two review prompts of the day" — because the file they named no longer exists to be cited. The +1 anchor is agents/reviewer.md, which cites `## Two review domains, one agent` in README-agents.md. NO DANGLING CASE WAS RED WHEN THIS WAS RE-APPROVED: the run that produced these numbers passed the dangling assertion, which is the condition this pin exists to protect. The previous entry follows.
//
// PREVIOUS ENTRY: Re-approved 2026-09-10 (the text-repair pass that closed the fifteen dangling references the working-minimum cut left behind): paths 1733 -> 1656, anchors 253 -> 259, stampBare unmoved. THE MOVEMENT IS IN TWO PARTS AND ONLY THE SECOND IS THIS PASS'S. (1) The nine commits 91179f35..069c54ae, which removed the Turn loop, the state file, the history store, four rule files and two bin/ helpers, took the tree to paths 1658 / anchors 254 WITH FIFTEEN DANGLING REFERENCES STANDING; that reading is the first line of this pass's own verification run against 069c54ae and is what the -75 is. No entry was written for it because the gate was red on the dangling case at the same time, and re-approving over a red dangling case is exactly what this pin forbids. (2) This pass moved paths 1658 -> 1656 and anchors 254 -> 259, and every unit of it is ATTRIBUTED BY SINGLE-FILE REVERT — each edited surface written back to HEAD in turn, the gate re-run, the file restored. paths: -1 each for README-agents.md (the observability table lost the dashboard-file and sequence-diagram rows), README.md (the settings row for the retired Turn budget), agents/curator.md (the archive step's cleanup selector became /fusion:archive), bin/fusion-session-domain (the state-file read and the paragraph documenting it) and skills/help/SKILL.md (the crash-recovery step named no file any more); +1 each for bin/fusion-cadence-anchor and bin/fusion-identity (each now cites a helper that exists where it cited one that does not) and rules/fusion-workbench-conventions.md (the .active-circle writer set names /fusion:check). CLAUDE.md is NET ZERO and that is the one number worth reading twice: the three Layout rows it lost cited four files that were already dangling and therefore already uncounted, and the bin/fusion-plan-size row it gained cites four that resolve. anchors: +1 each for CLAUDE.md (two new orchestrator anchors, one lost), agents/reconciler.md, docs/upgrading-to-v10-3.md, rules/fusion-workbench-conventions.md and rules/workbench-tracking.md, each re-aimed at the heading its target moved to. THE REMAINING +2 IS ONE PAIR DOUBLE-COUNTED, NOT A SIXTH AND SEVENTH UNIT: skills/next/SKILL.md renumbered `### 6.5` to `### 6.4` and docs/upgrading-to-v10-6.md re-aimed its citation in the same pass, so reverting EITHER breaks the pair and each measures +1 while the pair's net effect is 0. Single-file revert cannot see a two-file unit, which is stated here rather than silently absorbed. PREVIOUS ENTRY: re-approved 2026-09-10 (step B4): paths 1732 -> 1733, anchors and stampBare unmoved. ATTRIBUTED BY SINGLE-FILE REVERT to `bin/monitor` and to nothing else: reverting each of the step's five edited comment surfaces to HEAD in turn moved the count only for that one. It is the `hooks/lib/orchestrator-events.ts` citation in the new SESSION_START_WRITER comment, which names the module the constant is a second spelling of. The step's other four surfaces cite only paths already in the corpus. PREVIOUS ENTRY: re-approved 2026-09-09 (step B3): paths 1729 -> 1732, anchors and stampBare unmoved. Accounted to the unit: the three are the citations in the single `lib/dispatch-bytes.ts` row added to README-hooks.md's files table, which the enumerations gate requires in the same commit as the module. PREVIOUS ENTRY: re-approved 2026-09-08 (not a step of any plan: the rebase that replayed this checkout's twenty commits onto another checkout's sixteen, after which both generated artefacts were re-derived on the merged tree): paths 1727 -> 1721, anchors 245 -> 253, stampBare unmoved. NOT ATTRIBUTED BY SINGLE-FILE REVERT, and the departure from every entry below is the point: the movement belongs to no edit, it is the difference between two histories that were never measured together, and neither tree the two pinned numbers were approved on still exists — 1727/245 is this checkout's own, from the entry directly below, and 1721/242 its state two commits before that. There is nothing to restore that would reproduce either. WHAT WAS CHECKED INSTEAD, three things. (1) Every other case in this file passes, so each reference in the merged tree resolves and neither direction is a dangling citation: the corpus changed, not its correctness. (2) The other checkout's sixteen commits touch fifteen files, thirteen of them inside this gate's scanned surface — this project's own CLAUDE.md, the agents README, two conceptual docs, one wholly new skill body and eight existing ones. (3) ANCHORS ARE ACCOUNTED FOR TO THE UNIT: re-counting the class-(b) adjacency form across those files between the merge base and the merged tree gives exactly +8, of which the new skill body carries five, the newer of the two docs two, the archive skill two and the project's own CLAUDE.md one, against one each lost by the portfolio skill and the setup skill; that is 245 -> 253, and this checkout's own commits add none to that set. PATHS ARE NOT ACCOUNTED FOR TO THE UNIT, which is stated rather than rounded away: the same recount over the same files reads -5 against the gate's -6, because a grep of the path shape applies neither the fabricated-operand exemption, nor the consuming-project ./ exclusion, nor the root-variable classification, and three of the tokens it counts are this checkout's own from the entry below. The direction is not in doubt — the other checkout cut roughly 7 300 bytes out of eight skill bodies and added one of 7 347 — but no file is claimed here to own a named share of the six. Files are named in prose rather than spelled, following the convention the entries below keep. NO GROWTH BASELINE MOVED AND NONE COULD BE READ AS MOVED: the surface golden was regenerated by its own failing-on-purpose run and its entire diff is the skills block, eight bodies smaller and one added, the total 259 712 -> 259 732; every growth baseline, the release cap and the drift ceiling are byte-identical, and the agents surface stands at 417 145 bytes against 417 843 allowed, which is 698 bytes of head-room and unmoved by the merge. This line is rewritten in place with no line added, which is the unit the hook-test bound measures. Previous: Re-approved 2026-09-08 (step 16 of this Circle's plan, the documentation step: the four surfaces this Circle changed, written up in the project's own CLAUDE.md and in the hooks README): paths 1724 -> 1727, anchors and stampBare unmoved. Attributed by single-file revert against the full tree rather than by reading the diff, and in both directions because exactly two files changed: with CLAUDE.md alone restored to HEAD and the hooks README left as this step wrote it, the gate reads 1724/245/14 and passes; with the hooks README alone restored to HEAD and CLAUDE.md left as this step wrote it, it reads 1727/245/14. So the whole movement is CLAUDE.md's and the hooks README owes none of it. THE HOOKS README'S ZERO IS A PROPERTY OF THE EDIT AND NOT LUCK: its three passages name the new dispatch reading, the new configuration leaf and the stopping time, and every plugin file they name — the events wrapper, the turn-budget wrapper, the configuration file at the project root — was already named in the same row or the same paragraph before this step, so no token entered the corpus that was not already in it. THE THREE PATHS ARE TWO PASSAGES: the new Layout row for the bounded-dispatch rule file names that file and the rules helper that emits it, which is two, and the clause appended to the commit-lock row names the orchestrator prompt as the reader that cites the moved section, which is the third. NOTHING ELSE IN THE STEP COULD MOVE A COUNT, and that was checked rather than assumed: the turn-budget row's rewrite adds a configuration leaf name and a JSON fragment, the events row's new clause adds a subcommand name and three count keys, and the configuration row's third leaf is a dotted key — none of which is a path scanPluginPaths resolves, and each of the file tokens in those three rows stood there at HEAD. ANCHORS COULD NOT MOVE: the new row points at the rule file's last section in prose rather than by heading, and the commit-lock clause cites a prompt step by an unbackticked number, so scanHeadingAnchors has nothing adjacent to resolve in either. STAMPBARE COULD NOT MOVE: the one record citation inside the rewritten rows is the storeless wildcard form, carried over from HEAD unchanged, and no passage adds a stamp-shaped token of any kind. Files are named here in prose rather than spelled, following the convention the entries below keep. NO GROWTH BASELINE MOVED AND NONE COULD: this step edits no agent prompt, no skill body, no rule file and no hook test, so all four collectors read exactly what they read at HEAD and neither golden is reachable from it. This line is rewritten in place with no line added, which is the unit the hook-test bound measures. Previous: Re-approved 2026-09-08 (step 9 of this Circle's plan, the orchestrator's supply side: the dispatch bound resolved at Setup Step 2 and the new Bounded dispatches block placed before Step 3a): paths 1723 -> 1724, anchors 244 -> 245, stampBare unmoved. Attributed by single-file revert against the full tree rather than by reading the diff: with the orchestrator prompt alone restored to HEAD and every other file left as the working tree holds it, the gate reads 1723/244/14 and passes, so the whole movement is this one file's two new passages. ONE PATH AND ONE ANCHOR, AND THEY ARE THE SAME SENTENCE: the on-demand pointer in the new block names the bounded-dispatch rule file and puts that file's continuing-a-bounded-return heading in backticks immediately beside it, which is exactly the adjacency scanHeadingAnchors resolves. NOTHING ELSE IN THE STEP COULD MOVE A COUNT, and that was checked rather than assumed: the Setup-Step-2 paragraph names no file at all, the new block's other backticked tokens are agent names rather than paths, and its one fenced line is excluded by the fence rule, so none of them reaches any of the three classes. STAMPBARE COULD NOT MOVE: neither passage carries a record citation of any form. Files are named here in prose rather than spelled, following the convention the entries below keep. NO GROWTH BASELINE MOVED and the golden did: the surface golden was regenerated by its own failing-on-purpose run and its diff is the orchestrator prompt 151 756 -> 153 349 bytes plus the agents total, which is the 1 593 bytes this step spent against its 1 600-byte budget, inside the agents head-room; AGENT_BASELINE, RULE_BASELINE, RELEASE_CAP and DRIFT_CEILING are byte-identical, and the emission golden is untouched because no rule file changed. This line is rewritten in place with no line added, which is the unit the hook-test bound measures. Previous: Re-approved 2026-09-08 (step 8 of this Circle's plan, the lossless move of the orchestrator's two commit-procedure narratives into the commit-lock rule file): paths 1721 -> 1723, anchors 242 -> 244, stampBare unmoved. Attributed by single-file revert against the full tree rather than by reading the diff: with the orchestrator prompt alone restored to HEAD and the receiving rule file left as this step wrote it, the gate reads 1721/242/14 and passes, so the whole movement is the two pointer lines the step leaves behind at Step 3b steps 3 and 4. EACH POINTER IS ONE PATH AND ONE ANCHOR and that is the entire arithmetic: each names the commit-lock rule file and puts the receiving section's backticked heading immediately next to it, which is exactly the adjacency scanHeadingAnchors resolves. THE MOVED PROSE ITSELF MOVED NOTHING, and that was measured rather than assumed, because the revert above left both copies of the narrative standing at once and the count did not rise: the one record citation the narrative carries is the storeless wildcard form, which scanPluginPaths skips on the asterisk, so it counts as no path in either file and a duplicate of it counts as none either. That is also why stampBare could not move — a skipped wildcard citation is not a bare stamp, and neither pointer line carries a stamp-shaped token of any kind. Files are named here in prose rather than spelled, following the convention the entries below keep; the entry three rungs down measured that a token spelled on a comment line of THIS file reaches none of the three counts, so the convention costs nothing either way. NO GROWTH BASELINE MOVED AND NONE COULD: the step exists to shrink the agents surface and a shrink never trips a bound, while the receiving file is a conditional emission that no always-on floor counts, so neither the agents budget nor the universal core is reachable from this edit. Both goldens were regenerated by their own failing-on-purpose runs and each diff is exactly the one number pair the step predicts: the emission golden moves the commit-lock file's size and the orchestrator block's total, and the surface golden moves the orchestrator prompt's size and the agents total. This line is rewritten in place with no line added, which is the unit the hook-test bound measures. Previous: Re-approved 2026-09-08 (step 5 of this Circle's plan, the one new rule file on bounded dispatches): paths 1713 -> 1721, anchors 237 -> 242, stampBare unmoved. Attributed by single-file revert against the full tree rather than by reading the diff: with the new rule file moved aside the gate resolves 1713/237/14 and passes, and restoring it is the only thing that produces the received numbers, so no share is owed to any other file in a working tree that also carried five changed workbench records. Those records cannot reach either moved class by construction, which is worth writing down once so the next re-approver does not re-measure them: the workbench is not a scanned surface here, and the two classes that moved are plugin paths and the headings adjacent to them. The eight paths are every plugin file the new text names: the rules helper it names as its emitter, its own rooted self-citation on the line telling the orchestrator to read the last section on demand, and the six the unit table reads each bound agent's unit against, which are the coder, ontocoder, bugfixer, reconciler and curator prompts plus the review-contract rule the two reviewer rows share. Named here in prose rather than spelled, because this comment is inside the corpus the gate counts. THE FIVE ANCHORS ARE FIVE OF THOSE SIX TABLE ROWS and not a further class of citation: each puts a backticked heading next to the file it cites, and the bugfixer row is the one that does not, because it points at a span of phases rather than at one heading. The section title the on-demand line spells carries no adjacent file token of its own and so registers as no anchor, the same rule that keeps a heading-only citation out of scope. STAMPBARE DID NOT MOVE AND COULD NOT: the file carries exactly one stamp-shaped token, the Circle directory name in its Provenance head field, and a dashed stamp is a `stamp-name` resolving against the Circle index, while this pin counts the bare kind alone. NO GROWTH BASELINE MOVED AND NONE HAD TO: measured, both bounded-surface gates pass on this same tree. The always-on floor is untouched because the new file is a conditional emission and never part of it, and neither golden carries it at all, because at the tree measured here the rules helper does not yet emit it to anybody. This line is rewritten in place with no line added, which is the unit the hook-test bound measures. The dangling-reference test passes on the same tree, so only the pinned count moved. Previous: Re-approved 2026-09-08 (the v10.25 upgrade note, and the release paragraph the project's own README gained for it): paths 1696 -> 1713, anchors and stampBare unmoved. Attributed by single-file revert against the full tree rather than by reading the diff: with both files absent the gate reads 1696/237/14 green, with only the README paragraph restored it reads 1698, and with the note restored beside it 1713. So the README paragraph carries 2 of the movement and the upgrade note 15, and nothing else in the working tree contributes. Both files are prose that sends a reader to plugin files by name (the forum helper, the two skills carrying each side of the message flow, the turn-budget helper, the configuration module, the page on how the message works, and the two upgrade notes below this one), and every such name is a path this gate resolves. Named here in prose rather than spelled, because this comment is inside the corpus the gate counts. ANCHORS DID NOT MOVE AND THAT WAS A CHOICE: neither file cites a heading beside any file it names, so scanHeadingAnchors has nothing adjacent to resolve. stampBare did not move because the one record either file cites carries the storeless wildcard form, which scanPluginPaths skips on the `*` and which is not a bare stamp at all. NO GROWTH BASELINE MOVED AND NONE HAD TO: neither the documentation directory nor the README is a bounded surface, and this line is rewritten in place with no line added, which is the unit the hook-test bound measures. The dangling-reference test passes on the same tree, so only the pinned count moved. Previous: Re-approved 2026-09-08 (the user-facing documentation of the cross-checkout messaging feature: the new `docs/messages-between-checkouts.md`): paths 1691 -> 1696, anchors and stampBare unmoved. The whole movement is that one file, measured by single-file revert against the full tree rather than attributed by reading the diff: with it moved out of `docs/` and nothing else changed, the gate reads 1691/237/14 green, and the only other entries in the working tree at the time were the machine-written event log and a workbench issue, neither of which `surface()` descends into. The five are the plugin files the doc names in prose: the forum helper it sends the reader to for the mechanism, the reading skill and the cleanup skill that carry the flow on each side, the archive skill that carries the retention rule, and `CLAUDE.md`. Named here in prose rather than spelled, because this comment is inside the corpus the gate counts. ANCHORS DID NOT MOVE AND THAT WAS A CHOICE, not an accident: the doc cites four section-bearing files and no heading beside any of them, so `scanHeadingAnchors` has nothing adjacent to resolve. stampBare did not move for two reasons worth separating, because only the first is a property of the text: the one record the doc cites carries the storeless wildcard form, which `scanPluginPaths` skips on the `*` and which is not a bare stamp at all, and the one stamped basename in the worked example (a session history file) sits inside a fenced block, which the scanner excludes. NO GROWTH BASELINE MOVED AND NONE HAD TO: `docs/` is not a bounded surface, and this line is rewritten in place with no line added, which is the unit the hook-test bound measures. The dangling-reference test passes on the same tree, so only the pinned count moved. Previous: Re-approved 2026-09-08 (MERGE RE-APPROVAL, not an edit: `git merge origin/main` joined this checkout's message-between-checkouts line to a concurrent checkout's bounded-executor-dispatches line, and all three conflicted files were records of a measurement rather than text anybody chose to write): paths 1686 -> 1691, anchors 233 -> 237, stampBare unmoved at 14. NEITHER PARENT'S FIGURE WAS TAKEN, because either would have described a tree that no longer exists. The merged number is what the gate read on the merged tree, obtained by leaving the pin at this checkout's 1686/233 and running the assertion once so that it reported its received counts: 1691/237/14. Both parents' entries stand below this one, unedited and in their own words; neither account was deleted to make room for this one, and the shared chain they both carried below the 2026-09-06 v10.24 entry appears once. This checkout's line moved the merge base `abcaa823` 1646/227 by +40 paths and +6 anchors (the forum store, its helper and the reading skill, step 12 of that Circle, whose account is the second entry below). The concurrent checkout's line moved the same base by +5 paths and +4 anchors (the multi-checkout active-Circle fix for issue `260907-1700_*_no-agent-is-told-that-two-active-circles-in-two-checkouts-are-the-designed-shape-and-the-one-signal-it-has-says-fault.md`: the new section in `rules/circle-records.md` and the two consumers that cite it, `agents/playmaker.md` and `skills/setup/SKILL.md`, whose account is the first entry below). THE MERGED FIGURE HAPPENS TO EQUAL THE SUM OF THE TWO MOVES, AND THAT EQUALITY WAS CHECKED RATHER THAN ASSUMED: 1646 + 40 + 5 = 1691 and 227 + 6 + 4 = 237, which is what the gate measured to the token. It is stated as a corroboration and never as the source, because it could have come out otherwise and nothing here would have noticed: the two lines both edit `skills/setup/SKILL.md`, and a citation added on one side can stop resolving under a file the other side moved, so a sum can agree with a measurement or disagree with it and only the measurement is evidence. The dangling-reference test passes on the same tree, so only the pinned count moved. NO GROWTH BASELINE MOVED AND NONE HAD TO. The merge re-baselining event that `hooks/lib/__tests__/helpers/growth-bound.ts` defines as the third of the three is reached only when a bound is over, and on the merged tree all four measure inside their own head-room, each read with its own collector: the universal core 73 317 bytes against a 77 498 budget, 4 181 free; `agents/*.md` 414 334 against 417 843, 3 509 free; `skills/*/SKILL.md` 259 495 against 260 614, 1 119 free; the hook tests 22 014 lines against 23 266, 1 252 free. The two parent figures the event would have asked for are recorded anyway, because the next merge may need them: this checkout's head measured 413 225 / 259 060 / 22 014 / 73 317 and the concurrent checkout's 414 334 / 247 918 / 21 748 / 73 000, each inside its own bound. Both goldens were regenerated on the merged tree by their own failing-on-purpose runs rather than resolved by hand, and each came out the exact union of the two parents' diffs with no third change: `fixtures/surface-growth.golden` takes `agents/playmaker.md` 41 846 -> 42 955 and `skills/setup/SKILL.md` 51 971 -> 52 406 from the concurrent line and the four skill files and the hook-test lines from this one, and `fixtures/rules-emission.golden` takes `circle-records.md` 24 940 -> 28 124 from the concurrent line and `fusion-workbench-conventions.md` 58 445 -> 58 762 from this one. The non-failing role budget now reports two roles over on `circle-records.md`, playmaker and shaper; that report arrived with the concurrent line and is left standing, since a cut is not a merge resolution's to choose. This line is rewritten in place with no line added, so this file stands at 1 005 lines, exactly as it did at each parent's head. Previous (the concurrent checkout's own entry, carried through the merge unedited): Re-approved 2026-09-07 (the multi-checkout active-Circle fix for issue `260907-1700_*_no-agent-is-told-that-two-active-circles-in-two-checkouts-are-the-designed-shape-and-the-one-signal-it-has-says-fault.md`: the new `rules/circle-records.md` `### How many Circles may be active, and in whose checkout` and the two consumers that read it): paths 1646 -> 1651, anchors 227 -> 231, stampBare unmoved. Attributed by single-file revert against the full tree, never by reading the diff. Reverting `rules/circle-records.md` alone reads 1649/227, `agents/playmaker.md` alone 1649/230, `skills/setup/SKILL.md` alone 1650/230. THE PATH SHARES SUM TO 5 AGAINST A MOVE OF 5 with no overlap (2 + 2 + 1), and the ANCHOR SHARES SUM TO 6 AGAINST A MOVE OF 4, the overlap being two tokens: playmaker and setup each cite the new section by heading, so each un-resolves under a revert of the file that carries the heading as well as under its own. The own shares are therefore 2, 1 and 1. The rule file adds `rules/workbench-tracking.md` `## The four classes` and `agents/playmaker.md` `### Step 1: Inventory`; each consumer adds one citation of the new section. Its bare `### The claim field` and `### How many Circles ...` references carry no path and move nothing. Previous (this checkout's own entry, carried through the merge unedited; the chain below it was shared by both parents and appears once): Re-approved 2026-09-07 (the message-between-checkouts Circle, step 12: the forum store, its helper and the reading skill): paths 1646 -> 1686, anchors 227 -> 233, stampBare unmoved. This step's obligation was to check that the shares the eleven preceding steps each measured by single-file revert AS THEY LANDED still sum to what the gate reads, not to re-derive them, and they do, exactly and with no residue: 12 paths in the new forum helper's own header (step 4), 5 in its Layout row in `CLAUDE.md` and in the new key row of the cadence-anchor helper's header (step 5), 17 paths and 3 anchors in the new reading skill's body (step 8), 3 in the two roster surfaces (step 9), 3 paths and 2 anchors in the message half of the cleanup body (step 10), and 1 anchor from the citation repair in the archive body that resolved a formerly dangling anchor (step 11). Those are 40 and 6 against a measured move of 40 and 6, so no share overlaps another and nothing is owed to `README-agents.md`'s step-numbering repair or to this Circle's own workbench records: the first renumbers prose and rewrites no token, and `surface()` never descends into the workbench. The new files are named in prose rather than spelled, which costs nothing here; the entry below already MEASURED that a token spelled on a comment line of THIS file reaches none of the three counts. The dangling-reference test above passes on the same tree, so only the pinned count moved. No growth baseline moved and none had to. Both goldens were regenerated in this step by their own failing-on-purpose runs: `fixtures/surface-growth.golden` (skills 247 483 -> 259 060 bytes and hook tests 21 748 -> 22 014 lines, `agents/*.md` unmoved) and `fixtures/rules-emission.golden` (`fusion-workbench-conventions.md` 58 445 -> 58 762, that file's line plus the total in every agent block being the whole diff). Every bounded surface measures inside its own head-room, each read with its own collector: skills 259 060 against a 260 614 budget, 1 554 free; hook tests 22 014 against 23 266, 1 252 free; `agents/*.md` 413 225 against 417 843, untouched at 4 618 free; and the universal core 73 317 against its 65 498 floor inside a 12 000 budget, 4 181 free. ONE CORRECTION THE NEXT READER IS OWED, because the plan for this Circle states it and this step is where it was checked: that plan recorded 9 737 bytes of always-on head-room, which no collector produces. It summed the five files `RULE_BASELINE` still labels the universal core, while the hard bound measures the intersection this suite computes off the live emission, and two of those five left the always-on floor at the two gates of 2026-08-27. Measured at `abcaa823` with the bound's own reader the core stood at 73 000 with 4 498 free, not 88 836 with 9 737; the surface was never at risk, but the margin was overstated by 5 239 bytes. This line is rewritten in place with no line added, which is the unit the hook-test bound measures. Previous: Re-approved 2026-09-06 (the v10.24 release texts: the new `docs/upgrading-to-v10-24.md`, the `README.md` upgrade paragraph that points at it, and the version strings in `install.sh` and `.claude-plugin/plugin.json`): paths 1631 -> 1646, anchors 225 -> 227, stampBare unmoved. The whole movement is those two documents and nothing else, measured by single-file revert against the full tree rather than attributed by reading the diff: the tree reads 1646/227/14 green, reverting `README.md` alone reads 1643/227, removing `docs/upgrading-to-v10-24.md` alone reads 1633/225 with the dangling test failing on the pointer at it, and `install.sh` and `.claude-plugin/plugin.json` each still read 1646/227/14 when reverted alone, the second by construction because `surface()` never reaches it. THE TWO SHARES SUM TO 16 AGAINST A MOVE OF 15, and the overlap is one token: the README paragraph's pointer at the note, which resolves only while the note exists and so un-resolves under either revert. It was MEASURED and not reasoned, because reverting those two together reads 1631/225/14 exactly and so does reverting all four, which is also what says no share is owed to any file outside the release. The note's own share is therefore 12 and the paragraph's 3, and the release's two halves confirm that independently: before the paragraph was written the tree stood at 1643/227 and removing the note alone returned it to 1631/225. Both enumerate to the same figures. The note's twelve are the plugin files it names, the hand-run checker three times, the monitor and the hand-run sweep twice each, the conventions file, the git helper module, the hooks README and the two upgrade notes one rung below this one; its two anchors are the hooks README's file-list heading and the conventions file's filename-pattern heading. The paragraph's three are the checker, the monitor and the note itself. Three unrelated files stood modified in the same tree and each was measured rather than argued away: the citation-form module, the citation-grammar module and one hook test each read 1646/227/14 when reverted alone, the first two because `hooks/lib/*.ts` is scanned `recordsOnly` and the third because `surface()` never descends into `hooks/lib/__tests__/`. That last fact was checked in the other direction too, because the entry below rests on its opposite: three plugin paths, one heading anchor and one record citation added to a comment line of THIS file moved none of the three numbers, so a token spelled here is not in the corpus this gate counts. Records are still named in prose rather than spelled, which is what the entry below asks for and what costs nothing, but its stated reason does not hold for this gate. Previous: Re-approved 2026-09-06 (write-time citation-form detection, issue 260906-0115): paths 1625 -> 1631, anchors and stampBare unmoved. The whole movement is the hooks README and nothing else, measured by single-file revert against the full tree rather than attributed by reading the diff: with that one file at HEAD and every other change of this step in place, the gate resolves 1625/225/14 green. Six tokens, all in two table rows the change required — the new hook module's own row, which the enumeration lint in this same suite makes mandatory the moment the module exists, and the amendments to the citation grammar's and the live-record predicate's rows, each of which asserted in prose that no hook called it and now names the one that does. The six are named in prose here rather than spelled, because this comment is inside the corpus the gate counts and spelling them would move the number this entry exists to explain: the new module, the grammar module, the live-record predicate module, the tracker, the hand-run checker and the hand-run sweep. Previous: Re-approved 2026-09-06 (the per-session commit-message path, issue 260905-2213): paths 1624 -> 1625, anchors and stampBare unmoved. The whole movement is one token, the identity helper `agents/orchestrator.md` Step 3b step 3 now names as the fallback discriminator when SessionStart printed no session id. Measured by single-file revert against the full tree rather than attributed by reading the diff: replacing that one path token with the prose "the identity helper" and changing nothing else returns the gate to 1624 green. Named in prose here rather than spelled as a path, because this comment is inside the corpus the gate counts. Previous: Re-approved 2026-09-05 (loop 1 of the reconcile-then-fix session 260905-2008: eight defect repairs, of which three touched shipped text): paths 1622 -> 1624, anchors 224 -> 225, stampBare unmoved. The whole movement is the cadence skill's scope repair and nothing else, measured by single-file revert against the full tree rather than attributed by reading the diff: reverting the agent-setup rule leaves 1624/225, reverting the setup skill leaves 1624/225, and reverting the cadence skill alone returns the gate to 1622/224 green, so those two contribute 0 between them. The two paths and the one anchor are the citations that repair carries — the checkout-name helper it resolves the alias through, and the conventions file's who-filed-it section, which is where the report's Covers line learns to read a writer. Named in prose here rather than spelled as paths, because this comment is inside the corpus the gate counts and spelling them would move the number this entry exists to explain. Previous: Re-approved 2026-09-05 (the v10.23 release texts: `docs/upgrading-to-v10-21.md` renamed to `docs/upgrading-to-v10-23.md` and rewritten for the whole v10.22..v10.23 span, the `README.md` upgrade pointer rewritten with it, and the version strings in `.claude-plugin/plugin.json` and `install.sh`): paths 1619 -> 1622, anchors and stampBare unmoved. Shares measured by single-file revert against the HEAD tree, which reads 1619 green: `README.md` at HEAD with the new note reads 1621, and the new `README.md` with the note reverted to its HEAD name and content reads 1618. Each of those two configurations loses one resolved path for a reason that is not a share — the README pointer names the note by filename, so reverting either half makes the other's citation dangle — and the two reconcile against the full tree at 1622 exactly (1619 - 1 + 3 and 1619 - 1 + 0). So the whole +3 is `docs/upgrading-to-v10-23.md` and `README.md` contributes 0: its one pointer resolved before the rename and resolves after it. The three are the plugin paths the old note did not cite, `bin/fusion-citation-check`, `bin/fusion-citation-sweep` and `docs/upgrading-to-v10-20.md`, which the release note names because this release changes what the checker reports and because 10.21 and 10.22 have no note of their own. `install.sh` and `.claude-plugin/plugin.json` carry version strings only and move nothing.
// Re-approved 2026-09-05 (MEASURED AFTER A MERGE OF THE TWO LINES, not after an edit: `git merge origin/main` joined this checkout's 34 commits to the 25 that shipped v10.21.0, v10.21.1 and v10.22.0 from another checkout, both of which had changed the citation grammar): paths 1552 -> 1619, anchors 216 -> 224, stampBare 11 -> 14. The merge base is `cda72f71` at 1552/216/11; this line measured 1603/224/13 at `ce233d0b` and the other measured 1568/216/12 at `7f9f2f4d`, so the merged delta (+67/+8/+3) is exactly the sum of the two side deltas (+51/+8/+2 and +16/+0/+1) and no citation was lost in a conflict resolution. Shares are NOT taken by single-file revert here: the tree is a merge commit, so a revert of one file reverts it to one side rather than to the base, and the sum against the two measured side totals is the check that fits the situation. Only the pinned count moved; the dangling-reference test above passes on the merged tree.
// Re-approved 2026-09-05 (two edits landed in parallel: history `260905-1635-coder-personal-log-filenames-keyed-by-checkout.md`, the four personal-log filenames rekeyed to the checkout identifier, closing issue `260904-1058_*_four-tracked-workbench-filenames-are-keyed-by-the-os-account-name-the-identity-decision-rejected.md`; and history `260905-1640-coder-the-located-answer-rides-the-record-the-listing-already-opens.md`, a located decision answer riding the record the orchestrator's listing already opens, for issue `260905-1105_*_a-located-answer-reaches-the-user-only-if-somebody-reads-the-reconciliation-log.md`): paths 1591 -> 1603, anchors 219 -> 224, stampBare unmoved. Re-measured independently rather than taken on either coder's own word, since the two ran in parallel and either side's share could have crossed. Shares by single-file revert against HEAD, disjoint and summing exactly to the whole: the checkout-key edit (eight files) is +10 paths/+3 anchors — `rules/fusion-workbench-conventions.md` +3 paths (three new bare `bin/fusion-identity` mentions), `bin/fusion-identity` +2 paths/+1 anchor (two new `bin/fusion-checkout-name` mentions plus the rooted `rules/fusion-workbench-conventions.md` `## Filename Patterns`), `skills/memo/SKILL.md` and `skills/cadence/SKILL.md` +2 paths/+1 anchor apiece (each the same rooted `$FUSION_PLUGIN_ROOT/bin/fusion-identity` call plus the same rooted heading), `skills/log-activity/SKILL.md` +1 path/0 anchors (the call alone — its own `## Filename Patterns` mention is unrooted prose and registers as neither), `README.md`/`README-agents.md`/`docs/fusion-intro.md` 0/0 each; the decision-record edit (two files) is +2 paths/+2 anchors — `agents/reconciler.md` +1 path/+2 anchors (two rooted headings, `rules/fusion-workbench-conventions.md` `### Decision files` and `agents/orchestrator.md` `## Phase 1: Work Queue Construction`, less one path already resolving at HEAD on the same line) and `agents/orchestrator.md` +1 path/0 anchors (`agents/reconciler.md` cited with no adjacent heading) — both figures confirmed against the reconciler coder's own history log, which measured the same shares. With all ten files reverted together the gate resolves 1591/219/13 exactly, so no share is owed to any other file. Both goldens were regenerated in the same pass: `fixtures/rules-emission.golden` (`fusion-workbench-conventions.md` 54973 -> 57146 in every block, no other line moved) and `fixtures/surface-growth.golden` (the `skills` block for the checkout-key edit, total 240433 -> 240410, and the `agents` block for the decision-record edit, total 409834 -> 411809); neither baseline moved. The universal core stands at 71483 against its 65498 floor inside a 12000 budget, 6015 free. This entry extends the BASELINE line in place and rolls the previous trailing comment into the line below via the existing `Previous:` form rather than adding a physical line, so the hook-test surface's 1 free line stands unspent.
// Re-approved 2026-09-05 (the identity helper's reason survives its caller, and Step 0i tiles both exit tables; history `260905-1555-coder-the-identity-helpers-reason-survives-and-step-0i-tiles-both-exit-tables.md`, closing issues `260905-0933_*_fusion-checkout-name-discards-the-identity-helpers-stderr-and-names-a-wrong-cause-on-its-exit-1.md`, `260905-0933_*_setup-step-0i-branches-on-two-of-the-helpers-five-exit-codes-and-the-reachable-fourth-has-no-branch.md` and `260905-0933_*_setup-step-0i-puts-a-bare-hex-placeholder-inside-a-runnable-bash-fence-where-it-is-shell-redirection.md`): paths 1584 -> 1591, anchors 218 -> 219, stampBare unmoved. Shares by single-file revert against HEAD: `bin/fusion-checkout-name` +6 paths and the +1 anchor (with it alone reverted the gate resolves 1585/218), `skills/setup/SKILL.md` +1 path (with it alone reverted the gate resolves 1590/219). With both reverted together the gate resolves 1584/218/13 exactly, so no share is owed to any other file and the two sum with no overlap. The helper's six are its two new header sections, `## Why the identity helper's own reason is what this program reports` and `## Two exit vocabularies, and which number belongs to which`: four more `bin/fusion-identity` mentions and one `bin/fusion-events`, plus `rules/fusion-workbench-conventions.md` `### Who filed it`, a rooted heading registering as the one path and the one anchor at once — the section's seventh `bin/fusion-identity` mention sits on a line that already carried the token at HEAD (`resolve_self`'s own comment), whose edit only extended the trailing clause, so it contributes nothing new. The skill's one is `bin/fusion-identity` newly cited in Step 0i's rewritten branch list, on the line naming the helper's own exit-1 halt; its bare `### Who filed it` on the same line carries no adjacent file and registers as no anchor, the same rule that keeps a heading-only citation out of scope. No growth baseline moved and none had to: `hooks/lib/__tests__/fusion-checkout-name.test.ts` is `recordsOnly` and outside class (a). `skills/` and hook-tests were already spent to 6 free bytes and 2 free lines respectively by the edit itself (`shared/history/260905-1555-…` above); this re-approval's own +1 physical line spends one of the two, leaving 1. Previous: Re-approved 2026-09-05 (the mint-announcement repair, issue `260905-0933_*_the-mint-announcement-is-unreachable-on-every-path-that-actually-mints.md`): paths 1583 -> 1584, anchors and stampBare unmoved. ONE token, and both halves of that are measured rather than reasoned. The share: with `README-hooks.md` alone reverted to HEAD the gate resolves 1583 and passes, so the whole move is that file's and none is owed elsewhere. The token: replacing the single `bin/fusion-identity` spelling in the new `## Files` row with prose reads 1583 as well, so that spelling is the +1. Worth stating so the next re-approver does not expect more from the same edit — the row's other new spellings cost nothing because `PLUGIN_PATH_BODY` requires a plugin-directory prefix, and `identity-notice.ts`, `identity-notice.js` and `.checkout-id` are bare names under none. That is why every sibling row in this table names its module the same bare way and this gate has never counted one.
// Re-approved 2026-09-05 (Circle 260904-1619 step 12, the v10.21 release texts): paths 1572 -> 1583, anchors and stampBare unmoved. With the tree as step 12 leaves it the dangling-reference test above passes, so only the pinned count moved. Shares by single-file revert against HEAD: `docs/upgrading-to-v10-21.md` +9 (removing the note alone reads 1574), `README.md` +2 (1581), `CLAUDE.md` +1 (1582), `README-hooks.md` 0 and `install.sh` 0 (both 1583). With all five reverted together the gate resolves 1572/218/13 and passes, so no share is owed to a file step 12 did not touch. The release's sixth changed file, `.claude-plugin/plugin.json`, is 0 by construction rather than by arithmetic: `surface()` never reaches it. THE SHARES SUM TO 12 AGAINST A MOVE OF 11, and the overlap is worth stating so the next re-approver does not re-derive it: one token is shared, because `README.md`'s pointer at the new note resolves only while the note exists, so reverting the note alone un-resolves that pointer as well, and it is counted once inside the note's 9 and once inside `README.md`'s 2. That revert is also the only one of the six reading two failures, the pointer dangling. The overlap was MEASURED, not reasoned: with the note and `README.md` reverted together the gate reads 1573, so the pair is -10 and the shared token is exactly one. The note's own eight resolved paths follow from that arithmetic and are enumerable to the same 8: `bin/fusion-identity` twice, `bin/fusion-events` twice (both in the `bin/fusion-events presence` form), the `$FUSION_PLUGIN_ROOT`-rooted spellings of `bin/fusion-events` and `bin/fusion-checkout-name`, the bare `bin/fusion-checkout-name`, and `rules/workbench-tracking.md`; the bare `bin/` the note also carries is no path and contributes nothing, which is what makes the enumeration and the arithmetic agree. `README.md`'s two are `bin/fusion-events` in the new v10.20-to-v10.21 upgrade paragraph and that paragraph's pointer at the note. `CLAUDE.md`'s one is `bin/fusion-checkout-name` in the new `checkouts/` sentence of the `fusion-workbench/` Layout row. The two zeros hold by construction too, which is worth writing down once so they are not re-measured: `README-hooks.md` rewrote two rows of its `hooks/lib` table and every plugin path in them already stood there, and `install.sh` is scanned on its `#` lines only, where its one edit is a version string carrying no token. No growth baseline moved and none had to: `docs/` is not a bounded surface, no always-on rule file, `agents/` file or skill body was touched, so neither golden moved either, and this line is rewritten in place with no line added, which is the unit the hook-test bound measures. Previous: Re-approved 2026-09-05 (Circle 260904-1619 steps 10 and 11, the exit-1 halt's reason and the precondition the registry lifts): paths 1571 -> 1572, anchors and stampBare unmoved. The one new token is `bin/fusion-events`, cited by the replaced `**One precondition:**` paragraph of `rules/fusion-workbench-conventions.md` `### Who filed it`, which names `bin/fusion-events presence` as what joins a person's two git identities. Single-file revert against HEAD gives the whole move to that one file: with it alone reverted the gate resolves 1571/218/13 exactly, so no share is owed to any other file either step touched. The two steps' shares WITHIN that file were split by measurement rather than by reading the diff, because a single-file revert cannot separate two edits to one file: with step 11's paragraph alone put back to its HEAD wording and everything else of both steps left standing, the gate reads 1571/218/13, so step 10 contributes 0 and step 11 the whole +1. Step 10's two other files were measured the same way and contribute 0 as well: with `bin/fusion-identity` alone reverted the gate still reads 1572/218/13, and `hooks/lib/__tests__/fusion-identity.test.ts` is under a directory `surface()` never descends into. Two reasons worth writing down once so the next re-approver does not re-derive them: no anchor moves with the new token, because a subcommand word follows it and not a heading; and step 10's added `**What exit 1 rests on:**` paragraph cites a record, which is the class that left this pin on 2026-08-24. No growth baseline moved and none had to. Both goldens were regenerated in the same edit, `fixtures/rules-emission.golden` (`fusion-workbench-conventions.md` 51 897 -> 52 629, that file's line plus the total in every agent block being the whole diff) and `fixtures/surface-growth.golden` (hook tests 20 162 -> 20 182, through `fusion-identity.test.ts` 200 -> 220 alone); each golden's own header states that regenerating it moves no baseline, and the universal core stands at 66 966 against its 65 498 floor inside a 12 000 budget, 10 532 free. Previous: Re-approved 2026-09-04 (Circle 260904-1619 steps 5 to 8, the registry's callers and the header they read from): paths 1567 -> 1571, anchors 217 -> 218, stampBare unmoved. Shares by single-file revert against HEAD, disjoint and summing exactly to the whole: `bin/fusion-checkout-name` +2 paths and the +1 anchor, its new caller-offer section citing `bin/fusion-identity` and its new holder-naming section citing `rules/circle-records.md` `### The claim field`, a rooted heading registering as one path and one anchor at once; `skills/setup/SKILL.md` +1 and `skills/next/SKILL.md` +1, each the single new `$FUSION_PLUGIN_ROOT/bin/fusion-checkout-name` call site the step added. Every other citation those two bodies rewrote is net zero, a token out for the same token in: `rules/fusion-workbench-conventions.md` `## Marker globs` and `$FUSION_SRC/rules/circle-records.md` `### The claim field` both survive the rewrite in place, which is why `skills/next/SKILL.md` moves paths and not anchors. With those three files at HEAD the gate resolves 1567/217/13 exactly, so no share is owed to any other file. Steps 7 and 8 contribute nothing and that was MEASURED, not assumed: with `bin/monitor`, `hooks/hooks.json` and `hooks/lib/__tests__/hooks-wiring.test.ts` each reverted alone the gate still reads 1571/218/13. The reasons hold by construction and are worth writing down once so the next re-approver does not re-measure them: `bin/monitor`'s new citations sit in a Python docstring inside a served heredoc, and a `bin/` file is scanned on its leading `#` lines only; `hooks/hooks.json` is not a scanned surface; `hooks/lib/__tests__/` is a directory `surface()` never descends into, which is also why this file's own added lines cannot move the count. No growth baseline moved and none had to: the golden was regenerated in the same edit (`skills/setup/SKILL.md` 46 639 -> 47 231, `skills/next/SKILL.md` 27 601 -> 27 604, `hooks-wiring.test.ts` 143 -> 187), and `skills/` stands at 240 428 against its 240 439 budget, eleven bytes of head-room left. Previous: Re-approved 2026-09-04 (Circle 260904-1619 step 4, presence canonicalises a person's git identities through the checkout roster): paths 1566 -> 1567, anchors and stampBare unmoved. The one new token is `bin/fusion-checkout-name`, cited once on a comment line of `bin/fusion-events` (line 200, in the new roster section of its header, naming the `roster` subcommand the script now runs). Single-file revert against HEAD is the whole measurement and leaves no residue: with `bin/fusion-events` alone reverted the gate resolves 1566/217/13 exactly, so no share is owed to any other file this step touched. The step's four other changed files cannot reach this pin by construction rather than by arithmetic, which is worth writing down once so the next re-approver does not re-measure them: `hooks/lib/events-query.ts` and `hooks/events-query.ts` are scanned `recordsOnly`, so a plugin path in their comments is not class (a) at all; `hooks/lib/__tests__/fusion-events.test.ts` sits under a directory `surface()` never descends into (its `readdirSync` skips a non-file); `hooks/dist/` is not a scanned surface. The script's two other `fusion-checkout-name` occurrences are shell code and a `bin/` file is scanned on its `#` lines only, so they are out of scope and always were. No anchor moves with the token: a subcommand word follows it, not a heading. No growth baseline moved and none had to: `bin/` is not a bounded surface, and the only bounded one this step touched is hook-tests, through `fusion-events.test.ts` alone (251 -> 322 lines, total 20 044 -> 20 115, inside its 2 500 of head-room), whose golden entry was regenerated in the same edit. Two older entries left this line here, dropped rather than rolled, and were recovered verbatim on 2026-09-04 into the third `shared/analyses/` log named above: the 2026-08-29 re-approval for `bin/fusion-citation-sweep` (paths 1544 -> 1552) and the 2026-08-29 grammar entry (stampBare 12 -> 11). Nothing in the numbers moved with either the drop or the recovery; the chain of counts was continuous through the entries that stayed. Previous: Re-approved 2026-09-04 (Circle 260904-1619 step 3, `shared/checkouts/` enters the layout tree and the four-class partition): paths 1563 -> 1566, anchors and stampBare unmoved. All three new tokens are `bin/fusion-checkout-name`. Single-file revert against HEAD gives disjoint shares that sum exactly, with neither the over-count nor the under-count the two entries below record: `rules/fusion-workbench-conventions.md` +2, its layout-tree row comment and the `shared/`-holds paragraph, and `rules/workbench-tracking.md` +1, the new paragraph under the R1 row, which cites the helper as `bin/fusion-checkout-name register`. With both files at HEAD the gate resolves 1563/217/13 exactly, so the whole move is these two edits'. No anchor moves with them: the tracking paragraph names the R1 row in prose and cites no heading, and neither new `bin/fusion-checkout-name` token is followed by one. `rules/workbench-tracking.md` is emitted to no agent, so its +417 bytes reach no golden; the conventions file's +441 do, and `fixtures/rules-emission.golden` was regenerated in the same edit (`fusion-workbench-conventions.md` 51 456 -> 51 897, and that file's line plus the total in every agent block are the whole diff). No growth baseline moved and none had to: the universal core reads 66 234 against its 65 498 floor inside a 12 000 budget, and `fusion-workbench-conventions.md` at 51 897 still stands below its own 52 027 entry in `RULE_BASELINE`. Previous: Re-approved 2026-09-04 (Circle 260904-1619 step 2, `bin/fusion-checkout-name` ships): paths 1552 -> 1563, anchors 216 -> 217, stampBare 11 -> 13. With the two new files removed from the tree and `CLAUDE.md` reverted to HEAD, the gate resolves 1552/216/11 exactly, so the whole move is this addition's. The helper's own header carries +8 paths, the +1 anchor and both bare stamps, and a `bin/` file with a `#!` is scanned on its comment lines: `CLAUDE.md` in the authoritative-documentation sentence, `bin/monitor`, `bin/fusion-paths`, `hooks/lib/events-query.ts`, `bin/fusion-identity` three times, and `rules/workbench-tracking.md` `## The four classes`, a rooted heading registering as one path and one anchor at once; the two stamps are the `**Registered:**` and `**Refreshed:**` values of the worked entry example, bare because the `head-field` exemption reads a line's own head and a comment line has none. The `CLAUDE.md` Layout row is the remaining +3 paths: `bin/fusion-checkout-name`, `bin/fusion-identity`, `bin/fusion-workbench-root`. One finding the next re-approver should not have to re-derive: single-file revert of that row alone reads +2, because with the helper absent the row's citation of it dangles and is not a resolved path, so the shares sum to 10 by that method and to 11 with the helper present — the under-count is the single-file method and not a citation, the mirror of the over-count the entry below records. `hooks/lib/__tests__/fusion-checkout-name.test.ts` is 0/0/0: `hooks/**.ts` is `recordsOnly` and the file cites no record. The surface-growth golden was regenerated in the same edit (hook tests 19 876 -> 20 044 lines); no growth baseline moved.
// Chain audit 2026-09-05 (issue 260904-2215, whose headline figure of one uncovered gap of 181 paths was corrected to three breaks totalling 35 before this repair began, and the corrected figure is the one that held): the entries from `const BASELINE` down to the 1336 that meets the line above were walked newest-first, requiring each entry's opening figure to equal the next one's closing figure. Three breaks were found, all of them on this line, and all three are closed below by eight entries recovered from git history plus the transition figures restored to the six-times summary entry. Each recovered entry is marked `recovered 2026-09-05` and names the commit it was taken from, whose own re-approval note carries the full share breakdown; the two whose commits wrote no note of their own say so and name what was measured instead. Two properties an auditor needs, both confirmed here and both deliberately preserved rather than tidied: the entries are NOT in chronological order with each other, and the chain uses several connector spellings (`Previous: `, `Earlier: `, `Earlier (`, `Earlier, same day`). A position in this chain is therefore audited and never counted, which is why no entry carries an ordinal and none should be given one. // Re-approved 2026-08-29 (Circle 260828-2342 step 4, the rule text states the storeless form): paths 1517 -> 1520, anchors 213 -> 215. Each share measured by single-file revert against the rest of the dirty tree, disjoint and summing to the whole: `rules/fusion-workbench-conventions.md` +1 path (`hooks/lib/__tests__/workbench-citation-lint.test.ts` named as the uniqueness pin), `rules/circle-records.md` +1 path and +1 anchor at once (the conventions rule `## Filename Patterns`, rooted, in the head-field paragraph), `skills/migrate/SKILL.md` +1 path and +1 anchor at once (the same rooted heading). `rules/orchestrator-resume.md`, `agents/orchestrator.md`, `agents/shaper.md`, `rules/decision-record-examples.md` and `skills/next/SKILL.md` are 0/0. Steps 2 and 3 of the same Circle moved nothing here: the grammar and the sweep script are outside every pinned class. Both goldens regenerated in the same edit; no growth baseline moved. Step 10 re-approves again after the sweep. Earlier: Re-approved 2026-08-29 (Circle 260828-2342 step 1, the citation grammar moves to `hooks/lib/citation-scan.ts`): paths 1514 -> 1517, anchors unmoved. Measured by single-file revert of `README-hooks.md` against the rest of the dirty tree, under which the previous pin resolves exactly, so the whole move is the new `hooks/lib` table row for the module: `lib/citation-scan.ts` in the row cell, `hooks/dist/` and the shim path `hooks/lib/__tests__/helpers/citation-scan.ts`. The new `.ts` source and the shim contribute 0 (`hooks/**.ts` is `recordsOnly`, and every record the moved header cites still resolves). The surface-growth golden was regenerated in the same edit (hook tests 20 313 -> 19 418 lines); no growth baseline moved. Earlier: Re-approved 2026-08-28 (the curator apply pass, run file `260828-0049-curator-run.md` entries L01-L04, four sentences in `CLAUDE.md`): paths 1511 -> 1514, anchors 212 -> 213. Measured by single-file revert of `CLAUDE.md` against the rest of the tree, under which the previous pin resolves exactly, so the whole move is that file's. L01 +1 path (`hooks/hooks.json` named as the hook registration in the hooks row), L03 +1 path (`bin/fusion-rules` named beside the `IS_DECISION_TRANSITION_AGENT` case in the decision-record-examples row), L04 +1 path and +1 anchor at once (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`, rooted, in the workbench row), and L02 0/0 (the `changed-files` subcommand is no path). 1511 + 1 + 1 + 1 = 1514, 212 + 1 = 213, read off the gate over the settled tree before this line moved. No growth baseline moved. Earlier: Re-approved 2026-08-27 (end of Turn 2, the review-finding repairs of `260827-1756_p_repair-the-twenty-open-defect-records.md` and the bookkeeping after them): paths 1506 -> 1511, anchors unmoved. Each share was measured by single-file revert against the rest of the settled tree, and the shares are disjoint and sum to the whole. `rules/orchestrator-rebalance.md` +1 (the critical-stance rule named where every re-entry now opens at Gate 1), `skills/setup/SKILL.md` +1 (the `[ -x ]` guard on `bin/fusion-plugin-cwd` in Step 2, a second rooted token of the same path), `rules/workbench-tracking.md` +1 (`skills/setup/SKILL.md` named beside the leftover probe; that coder's own log read 0/0 because it measured before the sentence gained the path), and `skills/archive/SKILL.md` +2 (`bin/fusion-source-root` twice on the Step 4 corpus block's first line, rooted at `$FUSION_SRC`; the block was written with an undeclared `$SRC`, which this gate reports as unclassified rather than counting, and the rename to the declared root variable is what made the two tokens count). `agents/orchestrator.md`, `agents/playmaker.md`, `rules/circle-records.md` and `rules/review-contract.md` are 0/0: the orchestrator's Rebalance decision citation moved from the Circle-rooted form, which the path-literal gate rejects for the nested `decisions/` segment, to the bare-stamp form, and both are class (c) record tokens outside every pinned class. 1506 + 1 + 1 + 1 + 2 = 1511, read off the gate over the settled tree before this line moved. Both goldens were regenerated in the same edit; no growth baseline moved. Earlier: Re-approved 2026-08-27 (plan step 23, the bookkeeping after the four parallel coders of the twenty-open-defects repair, plan `260827-1756_p_repair-the-twenty-open-defect-records.md`): paths 1504 -> 1506, anchors 210 -> 212. Each coder measured its own share by single-file revert against the rest of the dirty tree, and the shares are disjoint and sum to the whole: `skills/setup/SKILL.md` +4 paths and +2 anchors (abb0238), `skills/archive/SKILL.md` -2 paths and 0 anchors (d1489cc), `agents/orchestrator.md`, `agents/reconciler.md` and `bin/monitor` 0/0 (fe8a23c), and the hook tests 0/0 because `hooks/**.ts` is `recordsOnly`. 1504 + 4 - 2 = 1506, 210 + 2 = 212, read off the gate over the settled tree before this line moved. The golden was regenerated in the same edit. Earlier: Re-approved 2026-08-27 (plan step 22, the one measured cut, analysis `260827-1843-cut-candidates-for-skills-and-the-hook-tests.md` S1-S5 and R1, R4, N1-N8): paths 1513 -> 1504, anchors unmoved. Measured by single-file revert against the rest of the dirty tree, and the two shares are disjoint and sum to the whole. `skills/setup/SKILL.md` is -8: S1 drops four `bin/fusion-events` tokens (twice rooted in the removed bash block, once bare in its else-message, once in the Turn-count prose) and adds `$FUSION_SRC/rules/orchestrator-resume.md`; S3 drops five `bin/fusion-source-root` tokens (two blocks' rooted `[ -x ]` guard and call, and the one prose mention). `skills/archive/SKILL.md` is -1: S2's `hooks/lib/events.ts` in the no-ceiling sentence. The anchor S2 was expected to remove was never counted: the rolled section cited `rules/workbench-tracking.md` bare, and the two heading-less citations it keeps register the same way. The ten hook-test files are `recordsOnly` and contribute 0. Earlier: Re-approved 2026-08-27 (Bundle E steps 6 and 8, records 260825-1250 x2: a terminal Circle's spec is history, and the record kinds that owe `**Filed by:**`): paths 1508 -> 1513, anchors 208 -> 210, of which +3 paths and +1 anchor are these two steps' and the remaining +2/+1 belong to the concurrent step 9 (the Rebalance gate reshape, editing the orchestrator prompt and the rebalance rule while this measurement was taken; not measured here, and the pin is written at what the gate resolves over the shared dirty tree so that whichever task lands second re-approves on the same terms). This share was measured by single-file revert against the rest of the dirty tree, and the three shares are disjoint and sum to the whole: the circle-records rule +1 path (the resolver helper named in the new terminal-stores paragraph; its decision citation is a workbench token and registers in no pinned class), the conventions rule +1 path (the review-contract rule named in the new reach sentence under the who-filed-it heading; the history-logging sentence cites an in-file heading, unrooted, which this gate does not count), the review-contract rule +1 path and +1 anchor at once (the conventions rule's who-filed-it heading, rooted, beside the new third mandated field). This note names no file by path on purpose: a first draft that did moved the pin by +2/+1 on its own. The golden was regenerated in the same edit. Earlier: Re-approved 2026-08-27 (Bundle B step 16, the layout tree's consumer column, issue 260826-1332): paths 1477 -> 1508, anchors 207 -> 208, of which only +7 paths is this step's. The committed pin was already stale at HEAD 3cbb779, which reads 1499/208 (+22/+1 unaccounted on the line, measured by the sibling task); `agents/playmaker.md` at 3cb2cba adds +2; Bundle B's three sibling edits (CLAUDE.md, rules/workbench-tracking.md, this file's own line) add 0. This step's +7 was measured by single-file revert of rules/fusion-workbench-conventions.md against the rest of the dirty tree (1501 -> 1508): the tokens are the consumers added to the tree's column — `bin/fusion-session-domain`, `hooks/lib/orchestrator-events.ts` (twice, both rows), `bin/fusion-events`, `hooks/events-query.ts`, `bin/fusion-commit-lock`, `bin/fusion-cadence-anchor` on the new `.cadence-anchors` row; the reordered parenthetical names no new file. Earlier: Re-approved 2026-08-27 (the UX round, decisions 260827-1310/-1311): paths 1478 -> 1477 — the Coherence rewrite and the cleanup step swap shuffle only step numbers and decision stamps (bare, unpinned); the net -1 is the removed duplicate Human-Gate-Rules pointer in the shortened 3c-bis question block. Earlier (the orchestrator partition, decision 260827-1210): paths 1467 -> 1478, anchors 206 -> 207. Measured by removing the two new files against the dirty tree (1461/205): rules/orchestrator-resume.md and rules/orchestrator-rebalance.md carry +17 paths and +2 anchors between them (their Provenance lines, and the moved text now counted in rules/ scope), while the prompt's excisions and the stub/CLAUDE.md wiring net -6/-1 — the moved procedures' own citations keep resolving from their new home, which is what the dangling-reference case verified before this pin moved. Earlier (the v10.14.0 release texts): paths 1466 -> 1467 — docs/upgrading-to-v10-14.md enters scope at +4 (measured by removing it: 1463), while the README and help update-topic rotations retire the three path citations the dropped v10.4 paragraphs carried. Earlier, recovered 2026-09-05 from commit `265a86fb` (issue 260904-2215; conventions partition round 1, the same commit as the entry below): paths 1464 -> 1466, anchors unmoved at 206. The entry below acknowledged this +2 in its own parenthetical and never wrote it as a transition, which is exactly what left the chain reading 1466 against 1464. The two are the `CLAUDE.md` Layout rows the partition added, one per new rule file, each citing its file by path: `rules/project-language.md` and `rules/backlog-entries.md`. Confirmed by a token-multiset comparison of `CLAUDE.md` alone across that commit, which reads +2 and names exactly those two tokens; every other file the commit touched belongs to the 1460 -> 1464 the entry below measures. Earlier (conventions partition round 1, decision 260827-1056; +2 more when CLAUDE.md gained the two new rule-file Layout rows, each citing its file by path): paths 1460 -> 1464 and anchors 204 -> 206, all of it the partition wiring — the two new rule files' Provenance lines each cite their conventions anchor (the two new anchors), and the conventions core, the header partition table and README-agents cite `rules/project-language.md` and `rules/backlog-entries.md` between them; the fusion-rules header fixes are comment lines outside pinned scope. Earlier (the style diet): paths 1462 -> 1460, anchors unmoved, and the whole move is the condensed rules/user-facing-output.md — verified by single-file revert, under which the previous pin resolves exactly; the four stilwerk profiles sit outside every pinned class. Earlier: re-approved 2026-08-27, six times across one session (the bookkeeping-cost repair, refactor/260827-0335-bookkeeping-cost-repair-plan.md; each step measured its shares by single-file revert, and the per-step notes live in this file's git history at 15847b7..HEAD rather than on this line; that sixth re-approval is commit `9c056b6c` and its own transition, recovered 2026-09-05, is paths 1461 -> 1462, anchors 201 -> 204): v10.8.x machine-written event rows and the SubagentStop completion, Phase 2's cadence anchor and live-scope inventory, Phase 3's critical-stance §5 and the 260827-0830 audience gate, Phase 4's conditional archive gate, and gate 260827-0910 moving user-facing-output.md to the six user-read agents — that last one lands +1 path and +3 anchors, the `rules/agent-setup.md` `## Voice profiles` citations CLAUDE.md, README-agents.md and user-facing-output.md now carry as the non-audience's pointer. Earlier, recovered 2026-09-05 from commit `49a42e23` (issue 260904-2215; Phase 4 — the archive gate goes conditional): paths 1463 -> 1461, anchors unmoved at 201. The whole move is the shortened Step 6 of `skills/archive/SKILL.md`, whose language instruction collapsed onto the conventions' `## Project language` and stopped spelling `CLAUDE.md` and `rules/user-facing-output.md` by path. Earlier, recovered 2026-09-05 from commit `8ac9a533` (Phase 3 — critical-stance §5 and the 260827-0830 audience gate): paths 1461 -> 1463, anchors unmoved at 201. `rules/fusion-workbench-conventions.md` +3, the worked-transitions pointer citing `rules/decision-record-examples.md` and `bin/fusion-rules` and the issue-diet sentence citing `rules/critical-stance.md`, offset -1 by `README-agents.md`, whose always-on roster line lost the examples file when the conditional line gained it. Earlier, recovered 2026-09-05 from commit `ce4175c2` (Phase 2.4/2.5 — the reconciler's live-scope inventory and the incremental activity log): paths 1458 -> 1461, anchors unmoved at 201. `agents/reconciler.md` +2, the Step 1 inventory's guarded `bin/fusion-cadence-anchor` call rooted and bare, and `bin/fusion-cadence-anchor` +1, its default-pathspec comment citing `rules/workbench-tracking.md`; `skills/log-activity/SKILL.md` and `CLAUDE.md` 0. Earlier, recovered 2026-09-05 from commit `15847b73` (decision 260827-0745 realised — the curator's anchored evidence pass): paths 1456 -> 1458, anchors 199 -> 201, and the whole move is `README-agents.md`'s new `**Scope:**` roster row, whose cells cite `skills/curate/SKILL.md` `## Step 2 — Dispatch the curator to survey` and `agents/curator.md` `## Dispatch parameters`/`## Evidence`, two rooted headings, each a path and an anchor at once. Earlier, recovered 2026-09-05 from commit `cc070d92` (v10.8.1 — the SubagentStop completion and the cadence anchor): paths 1447 -> 1456, anchors unmoved at 199. Its single-file-revert shares sum to 13 over a +9 whole, and that commit's note states why the excess is structural rather than an error: reverting a new `bin/` helper both removes its own header's citations and dangles its citers' references to it, so a new helper's share and its citers' shares are not disjoint under one-at-a-time reverts. Earlier, recovered 2026-09-05 from commit `67f7782a` (v10.8.0 — the machine-written event rows, Phase 1 of refactor/260827-0335-bookkeeping-cost-repair-plan.md): paths 1431 -> 1447, anchors 197 -> 199. Nine touched files were each reverted alone and the nine shares sum to the whole, 2+7+1+2+1+1-1+3+0 = 16; `agents/orchestrator.md` is the net -1 in that sum, the deleted per-Turn heartbeat clause carrying the rooted `bin/fusion-session-mark` call away while the machine-written notes brought one path and one anchor back. Earlier: re-approved 2026-08-26 (C4 Turn 3 task Z-2, the count corrections before closure): paths 1430 -> 1431, anchors 196 -> 197. One token counted twice, and the share was measured rather than apportioned: with `rules/workbench-tracking.md` alone reverted to HEAD against the rest of the dirty tree this gate resolves the committed 1430/196 exactly, so the whole move is that file's and every other file the task touched contributes 0. The token is `agents/orchestrator.md` `### 3. Post-Session Sequence Diagram`, added where the paragraph that names the readers of the checkout-scoped log moved from three to four and named the fourth by path; a rooted heading registers as one path and one anchor at once, the same way the `### 2. Structured Event Log` citation four paragraphs above it does. Two zero-contribution findings the next re-approver should not have to re-derive. `CLAUDE.md`'s Layout row and `bin/fusion-events`'s header were both rewritten in the same task, replacing a wrong count with two correct ones, and neither moved this gate: the rewrite added no path or heading token that was not already in the sentence it replaced. And `hooks/dist/` contributes nothing even though `hooks/lib/events-query.ts`'s docstring, from which the two compiled copies are generated, was rewritten in the same edit — `hooks/dist/` is outside the scanned surface altogether, since `surface()`'s two hook loops are non-recursive and `isFile()`-filtered and so no compiled artifact is ever read; separately, the rewritten source docstring moved no path count because the `.ts` sources under `hooks/lib` are `recordsOnly`, and its one record citation was left untouched. Earlier: re-approved 2026-08-26 (C4 Turn 3, the wave of three prompt and doc tasks): paths 1424 -> 1430, anchors unmoved at 196. Each of the three coders measured its own share by reverting its own files against the rest of the dirty tree, so the split below is measured rather than apportioned, and the three sum to the whole: 1 + 3 + 2 = 6, which is the 1430 this gate reports here. R-10 (`skills/setup/SKILL.md`) is one path, the unrooted `agents/orchestrator.md` added at Step 0i beside the `bin/fusion-identity` call; it cites a numbered Setup step and not a heading, so it is a path and no anchor. R-12 (`agents/reconciler.md`) is three: `bin/fusion-events` twice, bare in the `turns` call and rooted at `$FUSION_PLUGIN_ROOT` in its `[ -x ]` guard, plus one more `agents/orchestrator.md`. The `fusion-workbench/orchestrator-events.jsonl` the sentence it replaced carried is a workbench token and registers in no pinned class, which is why a step that rewrites a whole clause still only counts additions. R-7 (`CLAUDE.md` and `README-hooks.md`) is two, `hooks/session-id.ts` in the `CLAUDE.md` Layout row and `${CLAUDE_PLUGIN_ROOT}/hooks/dist/session-id.js` in the README wiring snippet. Two findings from this wave that the next re-approver needs and cannot re-derive from the number. First, a `$VAR`-rooted plugin path inside a JSON code fence does contribute: `scanPluginPaths` has no fence exemption of any kind, which R-7's measurement established against that wiring snippet, and it is the same property the C4 step 6 entry below reports for a top-level bash fence. Second, R-14's edits to `agents/orchestrator.md` contribute 0, so the `agents/` surface moved on this wave for two independent reasons and only one of them touched this gate. Earlier: re-approved 2026-08-26 (C4 step 6, presence at the two activation surfaces): paths 1421 -> 1424, anchors 195 -> 196. The share was measured by reverting the two edited files against the rest of the dirty tree, and then one of them against the other: with both reverted the gate resolves the committed pin exactly, so none of this is a sibling's. `skills/setup/SKILL.md` is one path, `bin/fusion-events` rooted at `$FUSION_PLUGIN_ROOT` on the first line of Step 0c's presence call. That line sits inside a top-level fence and counts anyway: `scanPluginPaths` has no fence exemption of any kind, so a plugin path in a code block resolves like one in prose — which is why the second line of the same block, calling through the `$E` it just set, contributes nothing. `skills/next/SKILL.md` is the other two paths and the anchor: the bare `bin/fusion-events` in the briefing's presence line, and `$FUSION_SRC/skills/setup/SKILL.md` `## Step 0c`, a rooted heading that registers as one path and one anchor at once. Earlier: re-approved 2026-08-26 (C4 step 5, one Turn count over four sites): paths 1411 -> 1421, anchors unmoved. All ten are `bin/fusion-events`, and the share was measured by reverting one of the two edited files at a time against the other: `agents/orchestrator.md` is six — twice rooted at `$FUSION_PLUGIN_ROOT` inside Setup Step 1's guarded call, once bare in that call's else-branch message, then once each in the prose beside it, in Phase 2 step 3 where the definition is stated, and in the `progress.turn` row of the Persistent-State derivation table. `skills/setup/SKILL.md` is four, the same call and its prose in Step 1. Nothing left scope: the `fusion-workbench/…` log paths the removed `grep -c` lines carried are workbench tokens and register in no pinned class, which is why a step that deletes two commands still only counts additions. Earlier: re-approved 2026-08-26 (C4 Turn 2 first wave, measured whole once all four tasks had settled): paths 1409 -> 1411, anchors unmoved. This supersedes the mid-wave reading below rather than contradicting it: that one was written by the step-4 task over a tree two siblings were still writing to, so it recorded what the gate resolved at that moment and not what the wave came to. The four shares are disjoint and each was taken by reverting one file at a time against the rest of the dirty tree. Step 4 (`skills/setup/SKILL.md`) is one path and one anchor at once, the rooted `### 2. Structured Event Log` heading; step 9 (`rules/workbench-tracking.md`) is four paths and one anchor; step 7 (`bin/monitor`) is nothing, its comment lines scanned with this gate's own pattern before and after at 7 tokens either way; and the two counted here are `bin/fusion-identity` and `hooks/events-query.ts`, both entering `bin/fusion-events`'s header where it now states the single translation point for the identity helper's exit vocabulary. 1404 + 1 + 4 + 2 = 1411, and 193 + 1 + 1 = 195. Earlier: re-approved 2026-08-26 (C4 steps 4 and 9, measured together because they were in flight together): paths 1404 -> 1409, anchors 193 -> 195. The five paths and two anchors split cleanly and the split is derived from the two diffs rather than apportioned. Step 4's share is one token counted twice, the orchestrator prompt's `### 2. Structured Event Log` heading rooted at its file, cited once by the setup skill body's Step 5 where the field contract is read rather than restated; a rooted heading registers as a path and an anchor at once, the way step 12's single token did. Step 9's share is the remaining four paths and one anchor, all in `rules/workbench-tracking.md`: that same rooted heading again, plus `bin/fusion-events` twice and `bin/monitor` once where the three readers of the scoped log are named. The two were measured over each other because the wave commits together; a later step that moves this number again re-approves on the same terms. Earlier: re-approved 2026-08-25 (C4 step 2, the presence reading becomes its own program): paths 1380 -> 1404, anchors unmoved. Twenty-two of the 24 are the program itself: thirteen are `bin/fusion-events`'s own header, which enters this gate's surface whole because a `bin/` file with a `#!` is scanned on its comment lines; five are the `CLAUDE.md` Layout row for it and four the `README-hooks.md` `hooks/lib` row for `lib/events-query.ts`. The two new `.ts` sources move nothing: `hooks/**.ts` is scanned for class (c) record citations only, and neither module cites a record. The remaining 2 are this same edit's second half, the `events-query.ts` row added to `README-hooks.md`'s entry-point table, which cites `bin/fusion-events` and `lib/events-query.ts` once each; no gate holds that table, which is why the row was missing and why its own cost is counted here rather than separately. This step's share and step 3's are disjoint (1380 + 24 = 1404), though they were measured over each other's uncommitted edits. Earlier: re-approved 2026-08-25 (C4 step 3, every emitted event line names the person and checkout that wrote it): paths 1376 -> 1380, anchors 192 -> 193. All five are `agents/orchestrator.md`: `bin/fusion-identity` in the `### 2. Structured Event Log` contract, the same path rooted at `$FUSION_PLUGIN_ROOT` twice inside Setup step 2's guarded call — that fence is indented into a list item, which this gate's flat fence tracker never opens, so it is read as prose — and `rules/fusion-workbench-conventions.md` `### Who filed it` beside the call, one path and one anchor at once. Earlier, recovered 2026-09-05 from commit `e4f789ed` (issue 260904-2215; the curator apply pass of 2026-08-25, three Tier-1 `CLAUDE.md` corrections approved at the cleanup gate): paths 1374 -> 1376, anchors unmoved at 192. This is the one break whose commit wrote no entry at all: it re-approved the number while its trailing comment still opened at 1357 -> 1374, which is where the chain lost the move. Its commit message states the transition and the unmoved anchors in prose, and a token-multiset comparison of `CLAUDE.md` across the commit confirms both and names the two paths, each a second occurrence of a token already in the file: `skills/archive/SKILL.md` in the `bin/fusion-source-root` Layout row, which stopped listing four skill bodies by name and now names the command that enumerates them, and `skills/help/SKILL.md` in the `docs/` row, which stopped claiming one migration note per release. Earlier: re-approved 2026-08-25 (the v10.7.0 release edits): paths 1357 -> 1374, anchors 190 -> 192. All of it is `docs/upgrading-to-v10-7.md` entering scope with its citations of the reconciler, orchestrator, the two helpers, `hooks/lib/config.ts` and the two previous notes, plus `README.md` and `skills/help/SKILL.md` each pointing at the new note; the help topic dropped the v10.3 paragraph in the same edit. Earlier: re-approved 2026-08-24 (this Circle's step 15, the Turn 1 review closures): paths 1353 -> 1357, anchors 189 -> 190. The anchor and one path are `bin/fusion-session-domain`'s header citing `agents/orchestrator.md` `## Persistent State File` for the one block that carries a two-space `domain:` (issue 260824-2056, the header's scope claim); the other three paths are `hooks/lib/config.ts` entering `CLAUDE.md`'s migration row and `docs/upgrading-to-v10.md` as the home of `RETIRED_TOP_LEVEL_KEYS` (issue 260824-2056, the fourth retired key), and `rules/commit-lock.md` entering the orchestrator's held-commit step (issue 260824-2056, the unheld index comparison). The two new hook tests are outside this gate's surface, and the 92 log lines this step rolled into `shared/analyses/260824-2121-…` moved no count. Earlier, same day (step 13, `rules/`): paths 1350 -> 1353, anchors unmoved. The three are `rules/review-contract.md` citing `bin/fusion-review-coverage` beside the per-topic pattern it now shares with the consolidated review (issue 260816-0719), and `rules/commit-lock.md` citing `bin/fusion-workbench-root` and `bin/fusion-commit-lock` for the `cd` the `with` form performs (issue 260810-2025); the anchors this step added are all in-file and unrooted, which this gate does not count. Earlier re-approval, same day (this Circle's steps 10 and 12, `skills/` and `agents/orchestrator.md`; measured over a tree that also held a concurrent step's uncommitted `CLAUDE.md` edits): paths 1336 -> 1350, anchors 190 -> 189. Step 10's share is three skill bodies citing `bin/fusion-session-domain` in place of an inline `agentstate.yaml` read (issue 260810-2110), two `## fusion-workbench Layout` anchors leaving with the old blocks; the two steps measured over each other's in-flight edits, so the split between them is not exact. Step 12's own token is one path and one anchor at once, `rules/fusion-workbench-conventions.md` `### Who filed it`, cited by the `**Claim:**` row of `## Circle head fields` when its bare `bin/fusion-identity` took the rooted, guarded form (issue 260824-1622); its other citations are workbench records and register in no pinned class. The remainder is `CLAUDE.md`'s and `skills/`'s, in flight beside this step. Written on this line rather than its own because the hook-test line budget was at its bound.

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
    all.push(...a.violations, ...b.violations, ...c.violations);
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
