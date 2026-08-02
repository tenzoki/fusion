/**
 * The `FUSION_ALLOW_RULES_WRITE` exemption — one predicate, two consumers.
 *
 * A project's rule files are protected by `guard.protectedPaths` (`rules/**`),
 * which is right for ordinary work and wrong for the one job that exists to
 * edit them: curating, revising and retiring rules. This module answers the two
 * questions that job needs answered, and nothing else:
 *
 *   1. Did the user deliberately set the flag? (`rulesWriteExemptionActive`)
 *   2. Is this path one of the rule paths the flag exempts? (`isProjectRulePath`)
 *
 * Both must hold. The write-tool path (`guard.ts` CHECK 2) and the Bash
 * mutation path (`MutationOptions.exempt`) ask the same two questions of the
 * same kind of value — a normalised, project-relative path — so they ask them
 * HERE. Writing the boundary twice, once per surface, is two places for a
 * security-relevant rule to drift apart.
 *
 * ## What the flag does NOT do
 *
 * It grants exactly one permission, the way the two git overrides do. It waives
 * the protected-path check for rule files and nothing else. It does not turn the
 * guard off, it does not lift an active halt, it does not touch the
 * decision-governed check, and it exempts no path outside the rule directories —
 * not `agents/**`, not `skills/**`, not `hooks/config.json`, not
 * `hooks/hooks.json`, not `settings.json`, not `bin/monitor`, not
 * `.claude-plugin/plugin.json`, not the guard's own state directory, and not
 * `fusion-guard.json`, the project guard configuration, which has its own
 * self-protection floor.
 *
 * ## PURE, and the environment is a parameter
 *
 * Nothing here reads `process.env`, touches the filesystem, or caches. The
 * environment arrives as an argument so every case is testable in-process,
 * without a subprocess and without mutating ambient state that a neighbouring
 * case would then read.
 *
 * ## Why the path is canonicalised before it is matched
 *
 * The exempt set is `RULE_DIR_PATTERNS` matched by the same `matchesAny` the
 * protected list uses, so the two sets are computed by one mechanism. But the
 * exemption is a permission GRANT, and a grant read off an un-canonical spelling
 * of a path grants more than it names. Two spellings matter, and both are
 * reachable at the call sites this module serves:
 *
 *   - A trailing separator. `rules/**` compiles to `^rules/.*$`, whose `.*`
 *     matches the empty string, so the bare directory `rules/` matches while
 *     `rules` does not. Un-canonicalised, `rm -rf rules` would stay denied
 *     (correctly, through the ancestor pass) while `rm -rf rules/` walked
 *     straight through the exemption and took the rule directory with it. The
 *     Bash path's own `node:path.normalize` does not strip it.
 *   - A `..` segment. `rules/../agents/coder.md` matches `rules/**` textually,
 *     which is why it is protected today, but it WRITES `agents/coder.md`. The
 *     Bash path collapses this before the predicate sees it; the write-tool path
 *     does not, because `normalizeToRelative` returns a relative path untouched.
 *
 * So the path is canonicalised lexically — trailing separators dropped, `.` and
 * `..` collapsed — before it is matched. Canonicalisation only ever SHRINKS the
 * exempt set: it resolves a path to the target it actually names, and a path
 * that names a target outside the rule directories stops being exempt. The
 * exemption is only ever consulted for a path the protected list already
 * matched, so shrinking it can never allow a write the guard would otherwise
 * have blocked.
 */

import { posix } from "node:path";
import { matchesAny } from "./paths.js";
import { isEnvFlagSet } from "./git-branch-guard.js";

/** The environment variable that activates the exemption. Named for diagnostics. */
export const RULES_WRITE_ENV = "FUSION_ALLOW_RULES_WRITE";

/**
 * The rule directories the flag exempts, as globs in the same dialect as
 * `guard.protectedPaths`.
 *
 * `.claude/rules/**` is deliberately included although it is not on the
 * protected list today, so the exemption is already correct when
 * `shared/issues/260801-1020_o_guard-protects-rules-but-not-claude-rules.md`
 * closes. Until then it is a harmless no-op: the exemption is consulted only for
 * a path that was already protected.
 *
 * `rules/retired/` needs no pattern of its own — it is inside `rules/`.
 */
export const RULE_DIR_PATTERNS: readonly string[] = [
  "rules/**",
  ".claude/rules/**",
];

/**
 * Lexically canonicalise a path before matching: drop trailing separators, then
 * collapse `.` and `..` segments. See the module docstring for why both matter.
 * Purely textual — no filesystem, so a symlink is not followed here any more
 * than it is anywhere else in the guard.
 */
function canonicalise(path: string): string {
  const normalised = posix.normalize(path);
  // `normalize` keeps a trailing separator (`rules/` stays `rules/`), and it is
  // the trailing separator that makes a bare directory match `rules/**`.
  const trimmed = normalised.replace(/\/+$/, "");
  // A path that was nothing but separators collapses to the empty string; keep
  // it non-empty so it cannot accidentally match a pattern.
  return trimmed.length === 0 ? normalised : trimmed;
}

/**
 * Is this a project rule path — a file inside `rules/` or `.claude/rules/`,
 * including inside `retired/`?
 *
 * The bare rule directory itself is NOT one, in any spelling. The flag permits
 * writing rule files; it does not permit deleting the rule directory.
 */
export function isProjectRulePath(path: string): boolean {
  if (!path) return false;
  return matchesAny(canonicalise(path), [...RULE_DIR_PATTERNS]);
}

/**
 * Did the user set `FUSION_ALLOW_RULES_WRITE`?
 *
 * The accepted spellings are `"1"` and `"true"`, case-insensitive, and nothing
 * else — `isEnvFlagSet` is the same parser the two git overrides use, so a user
 * who knows how `FUSION_ALLOW_BRANCH_SWITCH` behaves already knows how this
 * behaves. `env` is a parameter: this module never reads the ambient
 * environment.
 */
export function rulesWriteExemptionActive(env: NodeJS.ProcessEnv): boolean {
  return isEnvFlagSet(env[RULES_WRITE_ENV]);
}

/**
 * The advisory message recorded when the exemption lets a write through — the
 * escalation entry's `message` and the `guard_advisory` event's detail, which
 * are deliberately the same string.
 *
 * Shaped like the git override note (`guard.ts` STEP 3): it names the variable
 * that granted the permission and what the permission let through, so a reader
 * of `events.jsonl` sees the cause and not only the effect.
 */
export function rulesWriteDetail(paths: string[]): string {
  const label = paths.length === 1 ? "rule path" : "rule paths";
  // Empty is not a case any call site produces — the note is written only for
  // paths that were exempted — but a detail string that silently reads as
  // though nothing happened would be worse than one that says so.
  const list = paths.length === 0 ? "(none recorded)" : paths.join(", ");
  return `Override ${RULES_WRITE_ENV} allowed a normally-denied write to a protected ${label}: ${list}`;
}
