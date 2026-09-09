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
 * `260804-2100_*_from-a-subdirectory-cwd-the-protected-list-matches-nothing-while-fail-closed-still-denies.md`,
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
 * ## The second product: this session's `session_start` row
 *
 * Since the substrate step of the ceremony cut, this hook also appends one
 * machine-written `session_start` row to the workbench's event log — the
 * session identifier, the identity pair, the head commit the session starts
 * from, and the resolved domain. The row's schema, its coexistence with the
 * model-written row of the same name, and the once-per-session rule are
 * authored in `lib/orchestrator-events.ts` `## The session_start row` and are
 * deliberately not restated here. What belongs to THIS file is the ordering and
 * the two resolutions:
 *
 *   - **The envelope goes out first, before stdin is touched.** The warning
 *     above is this hook's verdict and the row is an addendum to it. Reading
 *     stdin is the one thing here that can block, so a payload that never
 *     arrives costs the row and never the warning.
 *   - **The head commit and the domain are resolved here, not in the module.**
 *     Each costs a subprocess, and that module is imported by three hooks that
 *     run on a tool call's own latency budget. They are passed in behind a
 *     thunk the module calls only when the row will actually be written, so a
 *     resumed session's second SessionStart spawns nothing.
 *   - **The domain is the cascade's own answer and no second implementation
 *     of it.** `lib/domain-cascade.ts` parses the cascade out of
 *     `agents/orchestrator.md` and runs it over the counts
 *     `bin/fusion-count-sources` prints. A helper that could not be run at all
 *     is NOT the same fact as a count it declined to take: the first leaves the
 *     key absent, the second reaches the cascade's own `counted_by == "none"`
 *     branch and is a real verdict.
 *
 * ## Channel
 *
 * `systemMessage`, not plain stdout. Plain stdout from a SessionStart hook is
 * `additionalContext` — the model reads it and the user does not (`CLAUDE.md`,
 * Conventions). A warning only the model sees is not a warning.
 *
 * That is now measured rather than reasoned, and measured from both ends:
 * plain stdout reaches the model verbatim, `systemMessage` never reaches it at
 * all — read out of the transcript's `hook_success` attachments against Claude
 * Code 2.1.245, in
 * `260825-2214-can-a-hook-obtain-the-session-identifier.md`,
 * finding (b). This file's choice is unchanged by it; what changed is that the
 * OTHER channel now has a user. `session-id.ts` is the sibling SessionStart
 * command that puts the Claude Code session identifier in front of the model,
 * on plain stdout, for exactly the reason this file rejects that channel. The
 * two are separate commands because one process writes one stdout and the two
 * concerns need opposite channels; that module's header carries the argument.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { countsFromHelperOutput, domainFor } from "./lib/domain-cascade.js";
import { failOpen } from "./lib/fail-open.js";
import { git } from "./lib/git.js";
import {
  emitSessionStartEvent,
  type SessionStartFacts,
  type SessionStartHookInput,
} from "./lib/orchestrator-events.js";
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

/**
 * The plugin's own root. The environment carries it under two names, either of
 * which beats a path derived from this file's location; the derivation is the
 * fallback and assumes the shipped `hooks/dist/` layout.
 */
function pluginRoot(): string {
  const fromEnv = process.env.CLAUDE_PLUGIN_ROOT ?? process.env.FUSION_PLUGIN_ROOT;
  if (fromEnv) return fromEnv;
  return resolve(dirname(fileURLToPath(import.meta.url)), "..");
}

/** The head commit, or `undefined` when git would not say. */
function gitHeadAtStart(root: string): string | undefined {
  const out = git(root, ["rev-parse", "HEAD"]);
  return out === null || out.trim() === "" ? undefined : out.trim();
}

/**
 * The session's domain, by the cascade in `agents/orchestrator.md`.
 *
 * `undefined` whenever the resolution could not be PERFORMED — no helper, no
 * prompt to read the cascade out of, output that carries no counts. A helper
 * that ran and declined to count prints `counted_by=none` on a non-zero exit,
 * and that is evidence rather than a failure: its stdout is read off the thrown
 * error exactly as `resolveIdentity` reads `bin/fusion-identity`'s, and the
 * cascade's own top branch answers it.
 */
function sessionDomain(root: string): string | undefined {
  try {
    const plugin = pluginRoot();
    const helper = resolve(plugin, "bin", "fusion-count-sources");
    if (!existsSync(helper)) return undefined;
    let out = "";
    try {
      out = execFileSync(helper, [], {
        cwd: root,
        encoding: "utf-8",
        timeout: 5_000,
        stdio: ["ignore", "pipe", "ignore"],
      });
    } catch (err) {
      const e = err as { stdout?: string | Buffer };
      out = typeof e.stdout === "string" ? e.stdout : (e.stdout?.toString("utf-8") ?? "");
    }
    const prompt = readFileSync(resolve(plugin, "agents", "orchestrator.md"), "utf-8");
    return domainFor(prompt, countsFromHelperOutput(out));
  } catch {
    return undefined;
  }
}

/** The two facts the row carries that this file resolves. */
function sessionStartFacts(root: string): SessionStartFacts {
  return { gitHeadAtStart: gitHeadAtStart(root), domain: sessionDomain(root) };
}

/**
 * The hook's payload. `null` for anything that is not a JSON object — an empty
 * stdin included, which is what a `spawnSync` with no `input` hands a child.
 */
async function readPayload(): Promise<SessionStartHookInput | null> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString("utf-8").trim();
  if (raw === "") return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as SessionStartHookInput)
      : null;
  } catch {
    return null;
  }
}

/**
 * Whether the verdict has already reached stdout. The fail-open handler reads
 * it so a late failure cannot emit a second envelope on top of the first.
 */
let envelopeWritten = false;

function emitEnvelope(warning: string | null): void {
  if (warning === null) {
    // A bare object: valid JSON, no fields, no banner. Same shape the guard's
    // allow path emits, so a quiet run is parseable rather than empty.
    process.stdout.write("{}\n");
  } else {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "SessionStart",
          systemMessage: warning,
        },
      }) + "\n",
    );
  }
  envelopeWritten = true;
}

async function main(): Promise<void> {
  const cwd = resolve(process.cwd());
  const root = findWorkbenchRoot(cwd);

  emitEnvelope(subdirectoryWarning(cwd, root));

  // Everything below is the addendum. No workbench, no log to append to.
  if (root === null) return;
  const payload = await readPayload();
  if (payload === null) return;
  emitSessionStartEvent(root, payload, () => sessionStartFacts(root));
}

main().catch((error) => {
  // Fail open, exactly as guard.ts and tracker.ts do: a hook that cannot decide
  // must not take the session down with it. The marker line is what the test
  // harness watches for, so a crash cannot pass as a quiet run.
  //
  // The verdict goes out first, as in both siblings — but only if it has not
  // gone out already. `main` writes the envelope before it touches stdin or the
  // event log, so the reachable failures are almost all AFTER it, and a second
  // envelope on top of the first would be unparseable stdout rather than a
  // degraded verdict.
  failOpen("session-start", error, () => {
    if (!envelopeWritten) process.stdout.write("{}\n");
  });
});
