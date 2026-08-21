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
  GATE_KINDS,
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
// Re-approved 2026-08-17, same Circle, step 16 — the curator's pass over
// `CLAUDE.md` and `rules/fusion-workbench-conventions.md` (run log
// `circles/260816-1741-guard-becomes-observation-only/history/260817-0845-curator-run.md`).
// paths 1112 -> 1120, measured per file by rerunning this gate against each file
// reverted in turn: `CLAUDE.md` moves +7 and the conventions file +1. The nine
// citations the curator's replacement text adds are `bin/fusion-plugin-cwd`,
// `bin/fusion-source-root`, `docs/upgrading-to-v10.md`, `hooks/guard.ts` twice,
// `hooks/lib/config.ts`, `install.sh` and `templates/fusion.json` in `CLAUDE.md`,
// and `hooks/lib/guard-state-file.ts` in the conventions file (ledger entry L16);
// the one it drops is a second `hooks/lib/self-detect.ts` in `CLAUDE.md`, leaving
// +8. Ledger entries L17 and L18 add and remove no citation at all, and neither
// does the `hooks/session-start.ts` half that lands in the same commit as them:
// that edit was measured on its own by reverting it, and the count stood at 1120
// either way. anchors and records did not move.
// Re-approved 2026-08-17 — the curator's next pass, run log
// `shared/history/260817-1925-curator-run.md`, whose three applied ledger entries
// (L01 `rules/circle-records.md`, L02 `rules/fusion-workbench-conventions.md`,
// L03 `CLAUDE.md`) replace one false claim: that `rules/circle-records.md`'s
// emission audience is *derived* from which prompts name a Circle-scoped resolver
// key. paths 1120 -> 1124, measured per file by reverting each of the three in turn
// and rerunning this gate: `CLAUDE.md` +2, the conventions file +2, and L01 zero.
// The four are one `bin/fusion-rules` and one `rules/circle-records.md` in each of
// the first two files. L01 is the entry worth reading the pin for: at +450 bytes it
// is the largest of the three and moves the count by nothing, because its
// replacement text re-spends the citations it inherited rather than adding any.
// anchors and records did not move.
// Re-approved 2026-08-18 — the exempt-surface split in
// `rules/fusion-workbench-conventions.md` `## Project language` (issue
// `shared/issues/260807-2153_*_the-exempt-surface-list-is-plugin-repo-shaped-but-ships-to-every-consumer.md`).
// paths 1124 -> 1125 and records 94 -> 95, both in that one file and measured by
// reverting it and rerunning this gate. The path is a second `README.md`: the
// replacement states the criterion twice, once for a project that ships nothing
// onward and once for this repository, and names README on both sides. The record
// is the citation of `shared/decisions/260807-1515_*_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md`,
// whose third constraint the new closing paragraph satisfies. anchors did not move.
// Re-approved 2026-08-18 — the Circle record's `## Directive` becomes a pointer
// once `**Active spec/plan:**` cites a file, and gains a writer for the case where
// it does not (`shared/planning/260818-1512_*_the-circle-records-directive-becomes-a-pointer-and-gains-a-writer.md`,
// all seven steps). paths 1125 -> 1133 and anchors 139 -> 145, measured per file by
// reverting each of the five in turn and rerunning this gate. paths: +2 in
// `rules/circle-records.md` (the new subsection names `agents/orchestrator.md` and
// `agents/shaper.md` as the two prompts that carry the writer obligations), +2 in
// `agents/shaper.md` and +1 net in `agents/orchestrator.md` and +1 in
// `skills/next/SKILL.md` (each cites the new subsection; the orchestrator's two
// additions are offset by the deleted `**Status:**` paragraph), +2 in
// `README-agents.md` (the new `**Scope:**` row cites the two prompts that declare
// and pass it). anchors: +1 for the subsection's own
// `agents/orchestrator.md` `## Circle head fields`, +4 for the citations of
// `### The Directive is a pointer once a spec exists` that class (b) can see, and
// +1 that is not a new citation at all — `rules/circle-records.md`
// `## Circle record template` in `agents/orchestrator.md` was always there and was
// invisible to this gate because a line break fell between the two backtick spans,
// which the rewrite closed. Two more citations of the new subsection exist and are
// deliberately NOT in this count: `skills/next/SKILL.md` spells its paths
// `$FUSION_SRC/...`, which ANCHOR_RE's character class does not admit, the same
// way that file's pre-existing `## Circle head fields` citation has never been
// counted. records 95 -> 97, one in each of the two files that names the record
// this change realises: `shared/decisions/260818-1504_*_...` in
// `rules/circle-records.md` as the subsection's binding decision, and
// `shared/decisions/260818-1512_*_...` in `agents/orchestrator.md`, which is where
// the mode's name is recorded as kept and its residual named.
// Re-approved 2026-08-18 — the v10.2 release material: the version-surface bumps and
// `docs/upgrading-to-v10-2.md`, the migration note for consuming projects, written to the
// shape of `docs/upgrading-to-v10.md`. paths 1133 -> 1142 and anchors 145 -> 148,
// measured per file by reverting each of the five edited files in turn and rerunning this
// gate. Seven of the nine paths and all three anchors are inside the note itself:
// `rules/circle-records.md` three times, `README.md` once, and `agents/shaper.md`,
// `README-agents.md` and `docs/upgrading-to-v10.md` once each; the anchors sit on two of
// the three `rules/circle-records.md` citations and on `README-agents.md`
// `## Dispatch parameters`. The remaining two paths are the note being NAMED, once from
// `README.md` and once from `skills/help/SKILL.md`. `install.sh` and
// `.claude-plugin/plugin.json` carry version-pin bumps only and move nothing.
// Two things a later reader would otherwise have to re-derive. The five per-file figures
// sum to 11 against a total of 9, and the excess is interaction rather than error:
// reverting the note alone also dangles the two citations OF it, so that one revert
// measures its own seven plus those two leaving scope. And the note carries EIGHT
// path-shaped spellings for seven resolved — the bare `rules/` on its exempt-surface
// bullet is a directory, not a file, and is no class-(a) token.
// One of the three anchors was won rather than written. The note first spelled its
// `### The Directive is a pointer once a spec exists` citation with a line break between
// the two backtick spans, and this gate scans line by line, so the citation was invisible
// — the same defect the Directive-pointer re-approval directly above found standing in
// `agents/orchestrator.md`. It was reflowed onto one line before this count was taken,
// which is the whole of the difference between anchors 147 and 148.
// records did not move.
// Re-approved 2026-08-19 — the move of `### Which of them a tracked workbench tracks` out of
// `rules/fusion-workbench-conventions.md` into the new `rules/workbench-tracking.md`,
// realising decisions `shared/decisions/260816-0711_*_...` (the move) and
// `shared/decisions/260816-1707_*_...` (the emission target it was blocked on).
// paths 1142 -> 1152 and records 97 -> 101; anchors did not move. Measured per file by
// reverting each of the five changed files in turn, in a detached worktree at HEAD `52b1d95`
// holding only their working-tree versions with `agents/*.md` left at HEAD, so none of the
// movement is attributable to the concurrent `agents/*.md` work, which moves nothing here.
// Contributions as paths / anchors / records: `rules/workbench-tracking.md` +11 / +1 / +3,
// `CLAUDE.md` +3 / +1 / +2, `rules/fusion-workbench-conventions.md` +1 / 0 / -1,
// `skills/archive/SKILL.md` +1 / -2 / 0, `hooks/lib/staging-drift.ts` 0 / 0 / 0.
// Three things a later reader would otherwise re-derive. First, the per-file paths figures
// sum to +16 against an actual +10, and the excess is interaction rather than error — the
// same effect the v10.2 block above names: reverting a file also dangles the citations OF it,
// so a single revert measures its own tokens plus whatever leaves scope with it, and three of
// the other four files cite the new rule in a class this gate reads there. anchors and
// records sum exactly, 0 and +4, which is coincidence and not a second rule.
// Second, two contributions are NEGATIVE, which is that same interaction seen from the other
// side and not a mistake. Reverting `rules/fusion-workbench-conventions.md` restores the old
// subsection, whose body carries the `260811-1534_*_...` decision citation that the pointer
// replacing it does not, so records reads 102 against the control's 101; and reverting
// `skills/archive/SKILL.md` restores two citations of the old conventions anchor, so anchors
// reads 150. Third, `hooks/lib/staging-drift.ts` moves nothing and could not have: its two
// changed comments repoint from that same anchor to a bare `rules/workbench-tracking.md`, and
// `hooks/lib/*.ts` is scanned recordsOnly, so classes (a) and (b) are not read there at all.
// Re-approved 2026-08-19 — the `**Status:**` field leaves the decision-record template,
// realising decision `shared/decisions/260818-2212_*_should-the-decision-records-status-field-exist-at-all-now-that-the-circle-records-has-been-removed.md`
// (option 1: the filename marker is the only source of a decision record's state). anchors
// 148 -> 149 and records 101 -> 102; paths did not move. Measured per file by reverting each
// of the two changed rule files in turn and rerunning this gate; the two contributions are
// disjoint and sum exactly, with no interaction, because neither file's added text cites the
// other's. The anchor is `rules/decision-record-examples.md` citing
// `## Decision Record Template`, the pointer that keeps the removal's reasoning in one place
// instead of two. The record is the binding-decision citation in
// `rules/fusion-workbench-conventions.md`.
// Two absences a later reader would otherwise read as an error. The examples file also names
// the record above in prose and contributes ZERO to records: it is exempt from class (c)
// wholesale as a `RECORD_EXAMPLE_FILES` entry, because every record it walks is fabricated.
// And its `fusion-workbench-conventions.md` citation is a bare basename, which is no
// class-(a) token — that class reads `rules/<name>.md` — so paths stayed at 1152 while a
// file was named. The anchor still resolves, because class (b) matches on basename.
// Re-approved 2026-08-19 — one re-approval for THREE tasks that ran concurrently on
// disjoint file sets, each of which measured its own contribution and none of which wrote
// this constant: three writers of one number leave the last writer's figure wrong, so the
// tasks reported and a consolidation pass measured the settled tree once and wrote it here.
// paths 1152 -> 1156; anchors and records did not move. Measured per file by copying each
// changed file in turn into a detached worktree at HEAD `5ec26b2` and rerunning this gate.
// Contributions as paths / anchors / records, by task:
//   U1 — `skills/archive/SKILL.md` +3 / 0 / 0, `CLAUDE.md` 0 / 0 / 0,
//        `README-agents.md` 0 / 0 / 0, `.gitignore` 0 / 0 / 0 (not a `surface()` file at all).
//   U2 — `agents/planner.md` 0 / 0 / 0, `agents/orchestrator.md` 0 / 0 / 0,
//        `hooks/lib/staging-drift.ts` 0 / 0 / 0 (scanned recordsOnly, so a comment reflow
//        there cannot move paths or anchors even in principle).
//   U3 — `rules/fusion-workbench-conventions.md` +1 / 0 / 0 (the new
//        `rules/workbench-tracking.md` citation in the layout tree's discipline sentence),
//        `rules/workbench-tracking.md` 0 / 0 / 0.
// The eight per-file figures sum to +4 against an actual +4: exactly, with no interaction,
// because no file's added text cites another's. That is the arithmetic the two blocks above
// warn does NOT generally hold; it holds here and is not a new rule.
// Why U1's figure is +3 and not the +2 measured while the tasks were still in flight.
// `skills/archive/SKILL.md` introduced a root variable named `SRC`, which ROOT_VARS does not
// classify, so its `$SRC/rules/workbench-tracking.md` citation was a VIOLATION and never a
// resolved path — the dangling-reference test above was red, and the count read 1154. The
// consolidation renamed the variable to `FUSION_SRC`, the name already declared in ROOT_VARS
// and already used for this same value in `skills/setup/SKILL.md`, rather than admitting a
// second name for one thing. The token is now resolved and counted, which is the whole of
// the difference between 1155 and 1154 in that file.
// Re-approved 2026-08-19 — the v10.3 release material: `docs/upgrading-to-v10-3.md`, the
// migration note for consuming projects, written to the shape of `docs/upgrading-to-v10-2.md`,
// plus the two surfaces that point at each note (`README.md` `## Install` and the update topic
// of `skills/help/SKILL.md`) and the dated clause added to the v10.2 note where its statement
// of the `**Status:**` position kept a qualifier the rule dropped after v10.2.0 shipped
// (`shared/issues/260819-0756_o_*`, option 1). paths 1156 -> 1178 and anchors 149 -> 155;
// records did not move, because the note cites fusion's own workbench in prose and names no
// record path — a consuming project's reader cannot open one.
// Measured per file by copying each changed file in turn into a detached worktree at HEAD
// `6b54551` and rerunning this gate. Contributions as paths / anchors / records:
//   `docs/upgrading-to-v10-3.md`  +17 / +5 / 0 — the note itself. The 17 are
//        `rules/fusion-workbench-conventions.md` four times, `agents/orchestrator.md` three,
//        `rules/decision-record-examples.md`, `agents/planner.md` and
//        `rules/workbench-tracking.md` twice each, `docs/upgrading-to-v10-2.md` twice, and
//        `bin/fusion-rules` and `docs/upgrading-to-v10.md` once each. The 5 anchors sit on the
//        three `## Decision Record Template` citations, on `agents/planner.md`
//        `## Where this Circle stops`, and on `agents/orchestrator.md` `### Phase 4`.
//   `docs/upgrading-to-v10-2.md`   +3 / +1 / 0 — the dated clause, naming the two files that
//        carry the unqualified position and the new note.
//   `README.md`                    +1 / 0 / 0 — the new "Upgrading from v10.2?" paragraph.
//   `skills/help/SKILL.md`         +1 / 0 / 0 — the new "Coming from a v10.2 install"
//        paragraph, under the already-classified `$FUSION_SRC`.
//   `install.sh`                    0 / 0 / 0 — the `FUSION_REF=tags/v10.3.0` example is a
//        version pin, not a path into the tree.
// The five per-file figures sum to +22 / +6 against an actual +22 / +6: exactly, with no
// interaction, because the only file any of the others cites is the new note, and it cites
// none of them back. That arithmetic does NOT generally hold, per the blocks above; it holds
// here and is not a new rule.
// Re-approved 2026-08-19 — one re-approval for FIVE tasks that ran concurrently on disjoint
// file sets. Each measured its own contribution and none wrote this constant, by instruction:
// three writers of one number leave the last writer's figure standing, so the tasks reported
// and a consolidation pass measured the settled tree once and wrote it here. The two reports
// that named a starting point disagreed about it — one said 1178, the other 1168 — which is
// why the figure below was measured against `git show HEAD:` rather than carried forward from
// either. The committed value was 1178.
// paths 1178 -> 1179 and records 102 -> 104; anchors did not move.
// Measured per file by copying each changed file in turn into a detached worktree at HEAD
// `b6869aa` and rerunning this gate. Contributions as paths / anchors / records:
//   `rules/circle-records.md`  +1 / 0 / +2 — the whole of the movement, from the new section
//        on deleting a Circle. Three of its tokens are ones this gate reads: `bin/fusion-rules`
//        in the paragraph naming who the file is emitted to (class (a)), and two class-(c)
//        record citations — `shared/history/260819-1400-reconciliation-circles.md`, cited for
//        the archive sweep that broke six citations, and the binding decision `260805-1548` on
//        the closing line. `/fusion:archive` and `/fusion:circle-delete` are skill tokens and
//        no class reads them; `$PORTFOLIO` is a resolver key, not a path.
//   `agents/orchestrator.md`   0 / 0 / 0 — measured, not assumed.
//   the modified workbench     0 / 0 / 0 — measured by copying the whole of the changed
//        `fusion-workbench/` across on its own, including four history files this tree adds.
//        `surface()` names no workbench path, so a workbench-only task cannot move any count
//        in principle; the workbench is read only as the index class (c) resolves AGAINST, and
//        a task that renames a record there would move the count without appearing here.
//   `hooks/lib/__tests__/*.ts`, `hooks/package.json`  0 / 0 / 0 — not `surface()` files at all.
//        The two `hooks` walks read files directly in `hooks/` and `hooks/lib/`, so the
//        `__tests__` subdirectory is never entered, and `package.json` matches no walk.
// The figures sum to +1 / 0 / +2 against an actual +1 / 0 / +2. That arithmetic does NOT
// generally hold, per the blocks above; it holds here because only one file moved at all.
// Re-approved 2026-08-20 — the `stamp-name` class enters `GATE_KINDS`, realising decision
// `circles/260819-1645-four-constraints-on-deep-change/decisions/260819-2016_*_does-the-citation-gate-judge-the-stamp-name-class-which-scanrecordcitations-does-not-read.md`
// (option 2). This is a widening of WHAT the gate reads, not an edit to the surface it reads:
// no shipped file gained a citation, and the movement is entirely tokens that were already
// resolving in the measuring view and were filtered out of the gate's count on their way past.
// records 104 -> 107; paths and anchors did not move.
// Measured by enumerating every `stamp-name` hit over `surface()` after the widening, rather
// than by reverting files, because the cause is one constant and no file is attributable:
//   `docs/upgrading-to-v10.md:41`      `260816-1741-guard-becomes-observation-only`
//   `docs/upgrading-to-v9.md:31`       `260815-0007-remove-eight-mechanisms-and-cap-growth`
//   `skills/cadence/SKILL.md:136`      `260731-2208-orchestrator-session`
// Eight further `stamp-name` tokens on the surface are `exempt` and so contribute nothing:
// seven announced illustrations and one inside a fence. That ratio — three real citations
// against eight illustrations — is why the widening cost a two-token repair rather than the
// unbounded one the decision's own recommendation feared.
// The two it did cost were both dangling and both illustrations that a real stamp made look
// like pointers. `rules/context-manifest.md:110` named a Circle `260718-1924-ontology-refactor`
// that has never existed, spelled with the real stamp of `260718-1924-v5x-overhaul`; it now
// reads `YYMMDD-HHMM-ontology-refactor`, which the surrounding paragraph already uses and
// which produces no token at all. `skills/log-activity/SKILL.md:86` illustrates stamp parsing
// with `260408-1523-topic.md`, where the digits ARE the illustration, so it gained the `e.g.`
// the announced-illustration exemption reads. Neither repair moved any count: both tokens were
// violations, and a violation was never in the resolved figure.
// SECOND CAUSE, same commit — the convention line the same plan step adds to
// `rules/fusion-workbench-conventions.md`: a record that states something ABOUT a citation
// names file and line, or fences the verbatim form. It is the third leg of the recurrence
// answer at the foot of
// `circles/260819-1645-four-constraints-on-deep-change/issues/260820-0530_*_twenty-six-citations-in-the-corpus-are-statements-rather-than-pointers-and-no-exemption-expresses-that.md`
// — the gate catches, the failure message teaches, the convention reaches whoever reads first.
// paths 1179 -> 1180, anchors 155 -> 156, records 107 -> 109, all of it that one paragraph:
// one class-(a) path (`rules/circle-records.md`), one anchor into it
// (`### Citation form in the portfolio`), and two class-(c) records — the issue above, and the
// `260812-1720` lint-scope defect used as the worked example of naming a citing line.
// The two causes are disjoint and sum exactly (+1 / +1 / +5 against an actual +1 / +1 / +5),
// because the widening touches no file's text and the convention line adds no `stamp-name`
// token. That arithmetic does NOT generally hold; it holds here for that reason.
// WHAT DID NOT MOVE, measured rather than assumed: the new gate itself,
// `hooks/lib/__tests__/workbench-citation-lint.test.ts`, contributes zero. `surface()` walks
// `hooks/` and `hooks/lib/` file by file and never enters `__tests__`, so the dozen record
// citations in that file's header are read by no class here — which is also why the second
// caller cannot pin its own corpus through this baseline.
// Re-approved 2026-08-20 — the three blocking gates get named on the two surfaces a reader
// reaches before a red run, closing
// `circles/260819-1645-four-constraints-on-deep-change/issues/260820-0805_*_neither-new-blocking-gate-is-named-on-any-shipped-surface.md`.
// The record was filed against two gates; a third, `plan-stopping-section-lint.test.ts`, was
// armed in the same Turn and is named alongside them.
// paths 1180 -> 1194, anchors 156 -> 157, records 109 -> 111. Every token is an addition to
// shipped PROSE — no scanner, no exemption and no class changed — so the movement is
// attributable file by file, and it was measured by reverting the three files to HEAD, running
// this gate green at the old numbers, and restoring them:
//   README-hooks.md    `### Three gates that can fail the suite over text nobody compiled`,
//                      a new section between `### Running tests` and the growth bounds, plus a
//                      clause in `### Rebuilding after TS changes` naming the dist gate.
//                      7 paths, 1 record.
//   CLAUDE.md          one row in `## Where to look when something breaks`, whose symptom is a
//                      red run over a citation, a plan or a compiled file the reader did not
//                      edit. 6 paths, 1 anchor, 1 record.
//   agents/planner.md  the stopping-section paragraph, which said "nothing reads it
//                      mechanically" and was made false by the new gate. 1 path.
// The 14 paths are `hooks/dist/` x3, `committed-dist.test.ts` x3,
// `plan-stopping-section-lint.test.ts` x3, `workbench-citation-lint.test.ts` x2,
// `hooks/package.json` x2 and `README-hooks.md` x1; the anchor is CLAUDE.md's pointer into that
// new README section; the two records are the corpus decision, cited once on each surface.
// WHAT DID NOT MOVE, and it is the same fact the note above records: this Turn also edited
// `hooks/lib/__tests__/workbench-citation-lint.test.ts`, `committed-dist.test.ts`,
// `helpers/citation-scan.ts` and this file, and `surface()` enters none of them, so none of the
// four contributes a token here.
// Re-approved 2026-08-20 — `analyst` gained a `PATTERNS` arm in `bin/fusion-rules`, realising
// `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-1845_*_does-analyst-get-a-project-local-rule-pattern-now-that-the-investigator-fold-orphaned-one.md`
// (option 3, answered by the user 2026-08-20).
// paths 1194 -> 1195, records 111 -> 112, anchors unchanged. Both tokens are additions to shipped
// PROSE — the comment block above the new `analyst)` arm — and no scanner, exemption or class
// changed. Attributed by the same method the note above used: each of the seven files this Turn
// edited was reverted to HEAD in turn and the gate re-run. Reverting `bin/fusion-rules` ALONE
// returned it to 1194/157/111, so the whole movement is that one file:
//   bin/fusion-rules   the arm's comment, which states why the pattern is the bare token
//                      `analyst` and not also `analysis`, and where the orphaned investigator
//                      layout is handled instead. 1 path (`docs/upgrading-to-v9.md`), 1 record
//                      (the decision above).
// WHAT DID NOT MOVE, and it is worth recording because it looks like it should have: the same
// Turn added `./rules/analyst-capture-layout.md` to `README-agents.md`'s pattern table and
// rewrote `docs/upgrading-to-v9.md` §4 and `skills/help/SKILL.md` §5 around it. A `./rules/`
// path is project-side and enters no class here — exactly as the `./rules/coding-guidelines.md`
// entries already in that table do not — so six prose edits across those three files and
// `agents/shaper.md`, `agents/orchestrator.md` and `rules/fusion-workbench-conventions.md`
// contribute nothing, and each was confirmed individually by the revert measurement.
// Re-approved 2026-08-20 — the v10.4.0 release material: `docs/upgrading-to-v10-4.md` is new, and
// the two per-version "coming from" pointers gained a v10.4 paragraph each.
// paths 1195 -> 1223, anchors 157 -> 160, records unchanged. Every token is an addition to shipped
// PROSE — no scanner, exemption or class changed — and the movement was attributed by reverting
// each edited file in turn and re-running this gate. The three contributions DO NOT sum to the
// total in isolation, because two of them cite the third: reverting the new doc alone gives
// 1198/157, not 1195/157, since README.md's and skills/help/SKILL.md's pointers at it then dangle
// and stop being resolved. Solving the three measurements gives:
//   docs/upgrading-to-v10-4.md   the note itself. 23 paths, 3 anchors. The paths are `install.sh`
//                                x3, `hooks/dist/` x2, `rules/fusion-workbench-conventions.md` x2,
//                                `rules/circle-records.md` x2, and one each of
//                                `helpers/citation-scan.ts`, `hooks/node_modules`,
//                                `hooks/package.json`, `agents/planner.md`, `agents/shaper.md`,
//                                `README-hooks.md`, `README-agents.md`, the three new gate files,
//                                and the four earlier upgrade notes. The anchors are
//                                `README-hooks.md` `### Three gates that can fail the suite…`,
//                                `README-agents.md` `## Dispatch parameters`, and
//                                `rules/circle-records.md` `### Deletion is outside the vocabulary`.
//   README.md                    the `**Upgrading from v10.3?**` paragraph. 2 paths (`hooks/dist/`
//                                and the new note).
//   skills/help/SKILL.md         the `**Coming from a v10.3 install:**` paragraph. 3 paths
//                                (`hooks/dist/`, `install.sh`, and the new note).
// WHAT DID NOT MOVE: `records` stays at 112. The note cites no workbench record — deliberately, as
// the release material is read from an install that has none. The same Turn also bumped
// `.claude-plugin/plugin.json` and the `FUSION_REF` example in `install.sh`; neither is a scanned
// surface for class (a), and the version strings carry no path.
// Re-approved 2026-08-20 — `bin/fusion-prose-metric` is new and CLAUDE.md's Layout table gained its
// row (step 1 of `circles/260820-2051-style-rules-arrive-and-get-measured`). paths 1223 -> 1235,
// records 112 -> 113, anchors unchanged. Every token is an addition to shipped PROSE, the helper's
// header and the row, and no scanner, exemption or class changed. Attributed by removing each of the
// two in turn and re-running: the header carries 7 paths (`bin/fusion-staging-drift`,
// `bin/fusion-review-coverage`, `rules/user-facing-output.md`,
// `hooks/lib/__tests__/helpers/citation-scan.ts`, `hooks/dist/`, `__tests__/helpers/`, `bin/`), the
// row those same four cited files plus its own `bin/…` key, and 1 record, the ceiling decision.
// Re-approved 2026-08-21 — `/fusion:setup` gained Step 0e, the copied-asset comparison, and Step 0d
// gained the stamp it reads (step 3 of `circles/260820-2051-style-rules-arrive-and-get-measured`).
// paths 1235 -> 1244, anchors 160 -> 161, records 113 -> 115. Every token is an addition to shipped
// PROSE or to a shipped shell block, and no scanner, exemption or class changed. Attributed by
// restoring each of the four edited files to HEAD in turn and re-running this gate; the four
// contributions are independent and sum exactly, and `rules/fusion-workbench-conventions.md` and
// `rules/workbench-tracking.md` each contribute ZERO in every class, which is why they are named
// here rather than left out:
//   skills/setup/SKILL.md   +8 paths, +1 anchor, +1 record. Four of the paths are the bare
//                           `stilwerk/<profile>.yaml` operands of Step 0e's classification loop;
//                           Step 0d's own loop supplies four more of the same spelling and gives
//                           four back, because the four `$FUSION_PLUGIN_ROOT/stilwerk/…` operands
//                           it used to carry became `$FUSION_PLUGIN_ROOT/$rel` and stop resolving —
//                           a net wash there, and the reason the loop's contribution is +4 and not
//                           +8. The other four paths are Step 0e's prose: `bin/fusion-source-root`,
//                           `install.sh`, `rules/user-facing-output.md` and
//                           `rules/fusion-workbench-conventions.md`, the last carrying the anchor
//                           `## Project language`. The record is the distribution defect the step
//                           closes, `shared/issues/260807-2154_*_corrected-sibling-wording…`.
//   CLAUDE.md               +1 path, +1 record. The `bin/fusion-source-root` row now states why the
//                           comparison reads the work tree — `install.sh` reads a GitHub tarball —
//                           and cites the decision that scoped the exception to that comparison.
// WHAT DID NOT MOVE: the two rule files. `rules/fusion-workbench-conventions.md` gained the
// `.asset-provenance` tree line and a paragraph, and `rules/workbench-tracking.md` gained the same
// entry on the record side of its split; neither text names a plugin path, a heading or a record,
// and `fusion-workbench/…` is not a plugin-tree spelling. Confirmed individually by the same revert.
// Re-approved 2026-08-21 — `emit_voice_profile` in `bin/fusion-rules` gained the comment that carries
// its new stderr fallback notice (step 4 of the same Circle). paths 1244 -> 1247, anchors 161 -> 162,
// records unchanged. All four tokens sit in that one comment: `rules/critical-stance.md`,
// `hooks/lib/__tests__/rules-emission-golden.test.ts`, and `rules/fusion-workbench-conventions.md`
// carrying `## Project language`. No scanner, exemption or class changed; attributed by restoring
// `bin/fusion-rules` alone to HEAD and re-running this gate, which was green at the old numbers.
// Re-approved 2026-08-21 — Step 0e's three shell blocks now resolve the source root themselves instead of
// reading the held `$FUSION_SRC` (issues 260821-0140 and 260821-0141). paths 1247 -> 1254, anchors and records
// unchanged: six are `$FUSION_PLUGIN_ROOT/bin/fusion-source-root`, twice in each block, the seventh is
// `bin/fusion-rules` in the new `case5-missing-local` entry. Attributed by reverting that one file; green at 1247.
// Re-approved 2026-08-21 — `agents/curator.md` gained the `Long-form prose vs short-form` block its seven
// sibling prose prompts already carry (step 17 of the same Circle). paths 1254 -> 1255, anchors and records
// unchanged. The one token is `rules/user-facing-output.md`, and it is the block's only plugin-tree-shaped
// candidate: the second mention spells the file bare as `user-facing-output.md` and carries no directory, and
// `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml` is skipped as a placeholder on `<lang>` and is not a
// plugin-tree spelling either way. Attributed by deleting that one block from `agents/curator.md` and
// re-running this gate, which was green at 1254. No scanner, exemption or class changed.
// Re-approved 2026-08-21 — the curator's applied entry L01 rewrote CLAUDE.md's `docs/` row, and the sentence
// it put there cites `docs/upgrading-to-v10-3.md` and `docs/upgrading-to-v10-4.md` where the sentence it
// replaced cited no path at all: that row's only earlier spelling, `upgrading-to-vN.md`, is bare and carries
// no directory. paths 1255 -> 1257, anchors and records unchanged, the new sentence naming no heading and no
// record; both files exist on disk, so both tokens resolve. No scanner, exemption or class changed.
// ATTRIBUTED BY READING THE DIFF, not by the revert-and-remeasure the notes above describe: all three files
// entry L01 touched (`CLAUDE.md`, `rules/fusion-workbench-conventions.md`, `rules/context-lean-claude-md.md`)
// carried uncommitted changes belonging to another party, so restoring one to HEAD was never available and no
// per-file measurement was taken. Their other seven changed lines are net zero in every class — none adds or
// drops a path, an anchor or a record, and `skills/archive/SKILL.md:96` -> `:102` is one file at a new line —
// which is what makes the read agree with the reported total: +2 is the `docs/` row's two new tokens alone.
// Re-approved 2026-08-21 — `rules/user-facing-output.md` was edited twice in one commit, by steps 2 and 3 of Circle
// 260821-1042-reply-bounded-whole-question-answered: paths 1257 -> 1258, anchors 162 -> 163, records 115 -> 116. The
// record is `## Length`'s citation of the decision fixing the session-summary total; the path and anchor are one
// adjacent citation of `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing`, prefix-resolved, in a
// new `## Information architecture` sentence. No other rewrite in either step carries one; no scanner, exemption or
// class changed. Attributed per step by undoing that edit: green at 115, then 1257/162.
const BASELINE = { paths: 1258, anchors: 163, records: 116 };

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
