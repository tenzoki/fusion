import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
  pluginRoot,
  WORKBENCH_PRESENT,
  isPlaceholder,
  report,
  scanRecordCitations,
  workbenchIndex,
  circleDirs,
  RECORD_EXAMPLE_FILES,
  scanCitationTokens,
  partition,
  type Violation,
  type CitationKind,
} from "./helpers/citation-scan.js";

// ---------------------------------------------------------------------------
// Reference-resolution lint gate (Circle 260805-2005-textschicht-gegen-code-
// nachziehen, plan step 14 — the review's "cheapest structural investment").
//
// The plugin's shipped text surfaces cite three kinds of targets, and all three
// kinds have gone stale in measured numbers (16 dead workbench-record
// references in one review pass). This gate resolves every reference it can
// read mechanically and fails on a dangling one:
//
//   (a) plugin-file paths — `rules/<name>.md`, `agents/<name>.md`,
//       `hooks/lib/<name>.ts`, `bin/<name>`, … — checked for existence against
//       the repo tree. The bare `lib/<name>.ts` spelling is the SAME class:
//       it is how this repository's hook modules are cited in prose, because
//       it is how they are imported, and it resolves against `hooks/`
//       (`resolveToken`). It was unrecognised until 2026-08-16, so 34
//       citations written that way were never checked and three dangling ones
//       stood through a removal that expected the gate to name them
//       (issue 260812-1407). A `$VAR/<path>` spelling is checked the same way with
//       the variable stripped, PROVIDED the variable is declared in ROOT_VARS
//       as naming the plugin tree; an undeclared variable in front of a
//       plugin-shaped path FAILS rather than being skipped (see ROOT_VARS for
//       why, and for the one bound that remains). A `./rules/...` spelling is
//       the CONSUMING project's rule directory by convention and is never
//       checked here.
//   (b) section-heading anchors in the adjacent form `` `file.md` `## Section` ``
//       — the cited heading must exist in the cited file (prefix match, so
//       `## Path Resolution` satisfies `## Path Resolution (Pfadauflösung)`;
//       heading LEVEL is not compared). Only the file-then-heading adjacent
//       form is parsed; a bare `## X` with no file on the same line is
//       ambiguous between "see section X" and "write a section named X"
//       (playmaker appends `## Dependency warning` sections to records it does
//       not contain), so it is out of scope by design.
//   (c) workbench-record citations — `260806-0015_*_<slug>.md` and its
//       store-/Circle-/`shared/`-prefixed forms, plus bare Circle-directory
//       citations `circles/<stamp>-<slug>`. The citation grammar is decision
//       D1's wildcard form (`YYMMDD-HHMM_*_<slug>`, the `*` at the marker
//       position matching any state marker —
//       circles/260805-2005-textschicht-gegen-code-nachziehen/decisions/
//       260806-0015_*_zitierform-fuer-workbench-records.md). A citation that
//       still carries an exact marker is resolved exactly; if its record
//       exists only under a DIFFERENT marker, that is the "stale marker"
//       defect class D1 eliminated and the failure message says to rewrite the
//       marker position to `_*_`. An ellipsis (`…`) in a citation is a
//       deliberate truncation and matches any infix.
//
//       Class (c)'s parser lives in `./helpers/citation-scan.ts`, because a
//       second caller needs the same grammar over a corpus this gate does not
//       scan: the workbench itself, where the citations are densest and where
//       nobody had counted the dangling ones (issue 260812-1720, plan
//       `shared/planning/260812-1720_*_circle-first-placement-and-the-backlog-store.md`
//       step 11). The gate's behaviour is unchanged by the move — the helper's
//       `scanRecordCitations` is the same function under the same name, and the
//       cases below are the ones that guarded it before.
//
// THE WORKBENCH BOUND, stated plainly: class (c) resolves against THIS repo's
// own `fusion-workbench/` tree. That is correct, not a shortcut — this lint
// runs only in the plugin's test suite, and the records the shipped texts cite
// are fusion's own development records, which legitimately exist only in this
// repository's workbench. A consuming project never runs this suite. When the
// workbench is absent (fresh clone — `fusion-workbench/` is a runtime artifact
// and gitignored), class (c) degrades to syntax-only per the plan step: the
// citations still parse, existence is not judged, and a describe block below
// records the degradation instead of passing silently.
//
// Exemptions are by PATTERN first (the plan's falsifier warns against an
// allowlist that swallows real defects):
//   - a token carrying a placeholder (`<`, `>`, `$`, `{`, or a glob `*`
//     anywhere but the marker position) is template syntax, not a reference;
//   - a class-(c) token on a blockquote line (`> …`) sits in a worked
//     before/after example (user-facing-output.md's example session reports);
//   - a class-(c) token following `e.g.` within the SAME clause of the line is
//     an announced illustration (playmaker's rationale examples). The bound is
//     the clause, not the line: a `)`, a `;` or a sentence end between the
//     `e.g.` and the token closes the announcement, so a citation in a later
//     clause that merely shares the line with an unrelated `e.g.` is resolved
//     normally;
//   - a class-(c) token whose slug contains `foo` is a fabricated name
//     (`plan-foo` in circle-records.md and migrate);
//   - `rules/decision-record-examples.md` is exempt from class (c) wholesale:
//     the file IS the worked-example corpus and every record it walks is
//     fabricated by design.
// What remains is a small enumerated EXAMPLE_PATHS list for class (a) — the
// guard documentation's fabricated command operands (`rm rules/x.md`) — with a
// reason per entry and a guard test asserting none of them exists in the tree,
// so an entry can never swallow a reference to a real file.
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
   *  classifier documentation, dense with fabricated path operands
   *  (`rules/retired`, `rules/link`, `rules/up/x`, …) that class (a) would each
   *  need an EXAMPLE_PATHS entry for — an ever-growing allowlist of exactly the
   *  kind the exemption-design note above warns against. Record citations are
   *  the class that measurably rots there (issue 260805-1839: five stale `_a_`
   *  markers across three modules), and they carry no fabricated twins in
   *  comments, so class (c) runs at full strength. */
  recordsOnly?: boolean;
}

const SH_COMMENT_RE = /^\s*#/;
const TS_COMMENT_RE = /^\s*(?:\/\/|\/\*|\*)/;

function mdFilesUnder(dir: string): SurfaceFile[] {
  const root = join(pluginRoot, dir);
  if (!existsSync(root)) return [];
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => {
      const abs = join(e.parentPath, e.name);
      return { rel: relative(pluginRoot, abs).split(sep).join("/"), abs };
    });
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

const ANCHOR_RE = /`([A-Za-z0-9._\/-]+\.md)`\s*(?:→\s*)?`(#{1,6}) ([^`]+)`/g;

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
      const [, fileTok, , headingText] = m;
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
// Approved 2026-08-16, the run that put the pin in. paths 1095 → 1122 is the 27
// resolving `lib/…` citations entering scope (the other 7 of that spelling's 34
// are the dangling ones now carried in EXAMPLE_PATHS); records 87 → 95 is the
// top-level `hooks/*.ts` entering scope.
// Re-approved 2026-08-16, Circle 260816-1741-guard-becomes-observation-only step
// 2. records 95 → 94: `hooks/guard.ts` held exactly one class-(c) citation, of
// the stand-down's own decision record, and the branch citing it is deleted.
// The count had already fallen to 94 before the deletion — the record moved to
// `_a_` after the pin was approved, which turned that citation from a resolved
// reference into a stale-marker violation — so this re-approval records the
// citation LEAVING, and the violation it had become is gone with it.
// Re-approved 2026-08-17, same Circle, step 11 — the step the plan makes
// responsible for this gate's green. paths 1122 → 1103, and the movement is two
// opposed halves rather than one: steps 2 to 7b deleted the modules and files
// that 29 of the pinned citations named, which had already taken the count to
// 1093 with no step re-approving it in between, and step 11's own rewrite of the
// shipped text puts 10 back by citing what survived — `templates/fusion.json`,
// `hooks/lib/config.ts`, the three `bin/` helpers behind the work-tree
// preference, `hooks/session-start.ts`. anchors and records did not move.
// Re-approved 2026-08-17, same Circle, step 12 — the migration note for consuming
// projects. paths 1103 -> 1112, all nine of them citations of `docs/upgrading-to-v10.md`
// and of what that note points a reader at: four inside the new note itself
// (`hooks/lib/paths.ts`, `README-hooks.md`, `templates/fusion.json`,
// `docs/upgrading-to-v9.md`), two each from `README.md` and `skills/help/SKILL.md`
// naming the new note, and one from `docs/upgrading-to-v9.md`, whose forward
// pointer to it became a path now that the file exists. The note names the modules
// this Circle deleted WITHOUT a directory prefix, the spelling README-hooks.md
// already uses for `clear-halt.ts`, so a citation of something removed stays out of
// class (a) rather than earning an EXAMPLE_PATHS entry. anchors and records did not
// move.
const BASELINE = { paths: 1112, anchors: 139, records: 94 };

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

  it("resolved exactly the pinned number of references in each class", () => {
    const pinned = { paths: BASELINE.paths, anchors: BASELINE.anchors, records: BASELINE.records };
    const actual = {
      paths: counts.paths,
      anchors: counts.anchors,
      records: WORKBENCH_PRESENT ? counts.records : BASELINE.records,
    };
    expect(actual, BASELINE_MESSAGE).toEqual(pinned);
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
  const stampSlug = sample!.base; // e.g. 260806-0015_a_zitierform-….md
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
    const anyCircle = [...circleDirs()][0];
    const ok = scanRecordCitations("fixture.md", L(`Provenance: circles/${anyCircle}`));
    expect(ok.violations).toEqual([]);
    expect(ok.resolved).toBe(1);
    const bad = scanRecordCitations("fixture.md", L("Provenance: circles/990101-0101-no-such-circle"));
    expect(bad.violations.length).toBe(1);
    expect(bad.violations[0].problem).toContain("no such Circle directory");
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
  // two cases below pin the boundary from each side.

  it("a store-prefixless stamp is a scan token and is invisible to the gate", () => {
    const line = L("the 260812-1720 plan, and the 990101-0101 stamp that names nothing");
    expect(scanRecordCitations("fixture.md", line)).toEqual({ violations: [], resolved: 0 });
    const hits = scanCitationTokens("fixture.md", line);
    expect(hits.map((h) => h.kind)).toEqual(["stamp-bare", "stamp-bare"]);
    // the first names a real minute — how many artifacts share it is what the
    // corpus decides, and the point here is only that the gate never sees it
    expect(hits[1].status).toBe("dangling");
  });

  it("a stamp carrying a name resolves in the scan and still never reaches the gate", () => {
    const anyCircle = [...circleDirs()][0];
    const line = L(`the ${anyCircle} Circle answered it`);
    expect(scanCitationTokens("fixture.md", line).map((h) => [h.kind, h.status])).toEqual([
      ["stamp-name", "resolved"],
    ]);
    expect(scanRecordCitations("fixture.md", line)).toEqual({ violations: [], resolved: 0 });
  });

  it("over the whole shipped surface, the gate's verdict is the scan's, token for token", () => {
    const GATE: CitationKind[] = ["record", "bare-record", "circle-dir"];
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
