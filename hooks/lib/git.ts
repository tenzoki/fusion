/**
 * The one `git` the guard's measurements run.
 *
 * ## Why this module exists
 *
 * Three measurement modules landed in one afternoon — `lib/review-coverage.ts`,
 * `lib/staging-drift.ts` and a `lib/state-drift.ts` that was removed on
 * 2026-08-15 with the session counters it measured — and each asked git the
 * same way: `execFileSync` with the root as cwd, a timeout, stderr discarded,
 * and every failure collapsed to `null`. Two carried the wrapper verbatim
 * (`review-coverage.ts`, `staging-drift.ts`); the third inlined it inside
 * `commitsSince`. That is the failure class `lib/guard-state-file.ts` names for
 * state files, arriving for subprocesses: a defect fixed once would have had to
 * be fixed three times. Two callers remain and the argument is unchanged — the
 * wrapper exists because copies of it drift, not because there were three.
 *
 * ## The three properties, stated once
 *
 * 1. **cwd is the root, never the process's own.** Every caller has already
 *    resolved a workbench root, and a hook's `process.cwd()` is whatever
 *    directory the session happens to sit in — which is the wrong repository as
 *    readily as the right one.
 * 2. **stderr is discarded and every failure is `null`.** A hook that printed
 *    git's complaints would put them in the model's transcript on a path the
 *    model cannot act on. `null` means "git would not say", and each caller
 *    turns that into its own sentence — a hash that no longer resolves after a
 *    rebase is not drift and must not be reported as one.
 * 3. **A timeout is mandatory.** These run inside a PostToolUse hook, on the
 *    tool call's own latency budget. A git invocation that hangs would hang
 *    every tool call in the session.
 *
 * ## What this module is NOT
 *
 * It is not the measurement chassis. Decision
 * `shared/decisions/260811-1146_*_does-the-measurement-family-get-a-shared-chassis-before-the-fourth-module.md`
 * takes option 2 — the two pieces that already had an owner — and leaves the
 * tracker's per-measurement bodies, the CLI mains and the `bin/` wrappers as
 * per-measurement copies until a further measurement is proposed. There were
 * three sets of them when that decision was taken and there are two now; the
 * trip-wire is the count going UP, so the removal moved it further off rather
 * than resetting it. See the trigger criterion in `hooks/tracker.ts` for what
 * decides whether a new measurement is a sibling at all.
 */

import { execFileSync } from "node:child_process";

/**
 * The default budget: enough for a local `git rev-list`, `git log`, `git show`
 * or `git rev-parse` on any repository this will meet.
 *
 * A call that walks the working tree rather than reading refs — `git status`
 * over a whole workbench is the only one in this family — passes its own,
 * larger budget and says why at the call site.
 */
export const GIT_TIMEOUT_MS = 5_000;

/**
 * Run git in `root` and return its stdout, or `null` when it would not answer.
 *
 * `null` covers every way git can decline — not a repository, a ref that does
 * not resolve, a non-zero exit, the timeout — because no caller in this family
 * distinguishes them: each one turns "git would not say" into a report that
 * claims nothing rather than into a fault.
 */
export function git(
  root: string,
  args: string[],
  timeoutMs: number = GIT_TIMEOUT_MS,
): string | null {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf-8",
      timeout: timeoutMs,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}
