/**
 * SessionStart hook — the working-directory warning.
 *
 * ## What it answers
 *
 * "Did this session start at the project root, or below it?" Below it, fusion
 * still works, but not everywhere: what fusion resolves against `process.cwd()`
 * rather than against the workbench root inspects, from a subdirectory, a
 * directory that is not the project's. One such resolution is left, and it is
 * the reason this warning still fires:
 *
 *   - the work-tree preference of the three `bin/` helpers. `bin/fusion-rules`,
 *     `bin/fusion-paths` and `bin/fusion-source-root` each ask
 *     `bin/fusion-plugin-cwd` whether the working directory is fusion's own
 *     source repository, and that helper tests cwd with NO upward walk. Started
 *     one directory down inside that repository, all three answer "no" and read
 *     the installed plugin copy — rules, prompts and the root a skill body's
 *     citations open against — instead of the work tree being edited.
 *
 * Two sharper instances stood here and are gone, which is why the warning reads
 * as it does rather than as it did. The protected-path deny matched
 * `guard.protectedPaths` against the working directory, so from a subdirectory
 * an `Edit` of a genuinely protected path passed the pre-check and was caught
 * only afterwards by the root-anchored measurement; both halves went with the
 * protected-path mechanism on 2026-08-12. The PreToolUse write-tool checks then
 * computed the project-relative spelling `guard.categoryPaths` was matched
 * against from the working directory, and the guard's own stand-down asked cwd
 * whether it was fusion's repository; both went on 2026-08-16, when the guard
 * stopped deciding anything. The issue that tracked the first residual is
 * `circles/260801-1244-guard-rules-write/issues/260804-2100_*_from-a-subdirectory-cwd-the-protected-list-matches-nothing-while-fail-closed-still-denies.md`,
 * still open at the time of writing and now moot — its subject is gone, and
 * closing it is a reconciler's act, not this file's.
 *
 * What survives is milder in consequence and not milder in kind: nothing is
 * blocked or reverted wrongly any more, but an agent can spend a whole session
 * reading rules and prompts from a copy that is days stale against the sources
 * in front of it, silently, which is the failure the work-tree preference was
 * built to end. That is a reason to keep saying it out loud, not to stop.
 *
 * The helpers could be taught to walk up. That would be three copies of a walk
 * with three chances to disagree, and their no-upward-walk bound is deliberate
 * and documented in `bin/fusion-source-root`. This warning fixes nothing and is
 * not meant to: it makes the assumption **audible**, at the single moment the
 * session's working directory is chosen and still cheap to change.
 *
 * ## The case split
 *
 * `findWorkbenchRoot()` walks up from cwd, so the root it returns is always cwd
 * itself or a strict ancestor of it. Three cases, disjoint and complete:
 *
 *   1. no root found      → not a fusion project. Nothing to warn about.
 *   2. root === cwd       → started at the root. Nothing to warn about.
 *   3. root is an ancestor → warn.
 *
 * No path comparison beyond string equality is needed, and that is a property
 * rather than an omission: the root is built by `resolve`/`dirname` from the
 * same `process.cwd()` string this file compares it against, so case 2 is
 * exactly string equality. Introducing a `realpath` here would compare a
 * resolved root against an unresolved cwd and reintroduce the very mismatch the
 * guard harness documents as the macOS symlink trap.
 *
 * ## Why a separate hook rather than the existing banner
 *
 * `hooks.json` already runs a static `printf` that emits the "Fusion loaded"
 * banner. Folding this check into it would mean reimplementing the upward walk
 * in shell inside a JSON string literal — a second definition of the one
 * question `findWorkbenchRoot()` already answers for every hook. Folding the
 * banner into THIS file would put the unconditional message behind a node
 * process, so a broken build would take the banner with it. They stay two
 * commands because they are two concerns: one is unconditional and static, the
 * other is conditional and computed.
 *
 * ## Why the message is English
 *
 * Every string fusion's hooks emit is English — this file's sibling banner, the
 * guard's configuration advisories, the tracker's review-coverage and
 * staging-drift notices. Hook and CLI operator strings are one of the surfaces
 * `rules/fusion-workbench-conventions.md` `## Project language` exempts from a
 * project's declared languages; a hook fires before any agent has read
 * `CLAUDE.md`, and teaching a SessionStart hook to parse that file for one
 * string would be a new mechanism serving one caller. Localising one of fusion's
 * operator strings while the rest stay English is the inconsistency, not the fix.
 *
 * The count that stood in that last sentence is deliberately not restated: the
 * set has shrunk three times since it was measured, so a number written into
 * prose about it is stale before it is committed.
 *
 * ## Channel
 *
 * `systemMessage`, not plain stdout. Plain stdout from a SessionStart hook is
 * `additionalContext` — the model reads it and the user does not (`CLAUDE.md`,
 * Conventions). A warning only the model sees is not a warning.
 */

import { resolve } from "node:path";
import { failOpen } from "./lib/fail-open.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";

/**
 * The warning text for a session whose working directory is `cwd`, given the
 * workbench root `root` found above it (or `null` when there is none).
 *
 * Returns `null` in the two cases that are not a warning. Both directories are
 * named in full: the user has to be able to tell which is which without
 * re-deriving either.
 */
export function subdirectoryWarning(
  cwd: string,
  root: string | null,
): string | null {
  if (root === null) return null;
  if (root === cwd) return null;

  return [
    `fusion: restart this session at the project root.`,
    ``,
    `  project root:      ${root}`,
    `  working directory: ${cwd}`,
    ``,
    `This session started below the project root. Some of fusion's checks`,
    `resolve against the working directory instead of the root, so from here`,
    `they inspect the wrong directory and let through what they would`,
    `otherwise stop. The workbench itself is found by walking up, so your`,
    `files and settings are still read from the right place.`,
  ].join("\n");
}

function main(): void {
  const cwd = resolve(process.cwd());
  const warning = subdirectoryWarning(cwd, findWorkbenchRoot(cwd));

  if (warning === null) {
    // A bare object: valid JSON, no fields, no banner. Same shape the guard's
    // allow path emits, so a quiet run is parseable rather than empty.
    process.stdout.write("{}\n");
    return;
  }

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        systemMessage: warning,
      },
    }) + "\n",
  );
}

try {
  main();
} catch (error) {
  // Fail open, exactly as guard.ts and tracker.ts do: a hook that cannot decide
  // must not take the session down with it. The marker line is what the test
  // harness watches for, so a crash cannot pass as a quiet run.
  //
  // No event is emitted here, and that is the one way this handler differs from
  // its two siblings. This hook writes nothing under `.guard-state/` on any
  // path, so it has no log to append to and teaching it one would mean a
  // SessionStart hook creating guard state before a single tool call has run.
  // What it shares is the order: the `{}` goes out before the marker line, so a
  // broken stderr cannot cost the session its verdict.
  failOpen("session-start", error, () => process.stdout.write("{}\n"));
}
