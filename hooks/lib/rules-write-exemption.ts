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
 * Nothing here reads `process.env`, touches the filesystem, or caches. Both the
 * environment and the filesystem arrive as arguments — the environment as a
 * `ProcessEnv`, the filesystem as an `FsLocator` — so every case is testable
 * in-process, without a subprocess and without mutating ambient state that a
 * neighbouring case would then read. `guard.ts` supplies the real adapters, the
 * same way it supplies `CheckoutResolver` to the git classifier.
 *
 * ## Two gates, and why the second one has to touch the disk
 *
 * A path is exempt only if it passes BOTH:
 *
 *   1. LEXICAL. `canonicalise` (shared with the protected-path check, see
 *      `paths.ts`) collapses `.`, `..` and trailing separators, and the result
 *      must match `RULE_DIR_PATTERNS` under the same `matchesAny` the protected
 *      list uses. This is what makes `rules/` and `rules/../agents/coder.md`
 *      non-exempt, and it computes the exempt set by the same mechanism that
 *      computes the protected set.
 *   2. FILESYSTEM. The path, resolved through the real filesystem, must still
 *      land strictly inside a real rule directory — and must not be a hard link.
 *
 * Gate 1 alone is not a boundary, and the reasoning that said it was is worth
 * naming because it is nearly right. Everywhere else in the guard a symlink
 * lets a write ESCAPE protection: a residual of a text classifier, and one the
 * protected-path check still carries. Here a symlink let a write ACQUIRE A
 * GRANT, which is an escalation, and a grant has to answer for it.
 *
 * The measured consequence: `ln -s ../ rules/up` is a write to a rule path, so
 * gate 1 exempts it; afterwards every path spelled `rules/up/…` still matches
 * `rules/**` while the write lands anywhere in the project. Two commands turned
 * the flag into a write-anywhere primitive, `agents/**`, `hooks/config.json`
 * and the guard's own `.guard-state/` included — precisely the set the section
 * above promises it does not reach.
 *
 * Canonicalisation cannot fix that, in any spelling: membership is decided on
 * text while the write follows the link. Only asking the filesystem can, which
 * is what gate 2 does.
 *
 * ## What gate 2 checks, and the two things it cannot see
 *
 * `FsLocator.locate` resolves symlinks (and, on a case-insensitive filesystem,
 * the platform's own path folding) for as much of the path as exists, then
 * re-appends the part that does not — a rule file usually has to be CREATED, so
 * a resolver that failed on a non-existent path would refuse every new rule.
 * The result must sit strictly under the resolved location of `rules/` or
 * `.claude/rules/`. A project whose `rules/` is itself a symlink into a shared
 * repository therefore still works: its whole subtree resolves inside the
 * resolved rule directory.
 *
 * A HARD LINK is the case realpath cannot see — `cp -l hooks/config.json
 * rules/copy` gives a protected inode a second name inside the rule directory,
 * and both names resolve to themselves. So the grant is also refused for an
 * existing regular file with more than one link. Directories are excluded from
 * that test (every directory has at least two links) and so are symlinks, which
 * gate 2's resolution already handles.
 *
 * The residuals, stated rather than implied: a link created between this check
 * and the write it authorises (a race no agent driving one tool call at a time
 * can run), and a filesystem-level alias the OS itself hides from `realpath`,
 * such as a bind mount.
 *
 * ## Refusing the grant is always the safe direction
 *
 * Every failure here — an unresolvable path, a throwing `realpath`, a missing
 * rule directory — returns false, and false means "not exempt", which leaves
 * the path exactly as protected as it was. The exemption is only ever consulted
 * for a path the protected list already matched, so this predicate fails closed
 * for free: it can refuse a write the user meant to allow, and it cannot allow
 * one the guard would otherwise have blocked.
 */

import { matchesAny, canonicalise } from "./paths.js";
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
 * The rule directories themselves, derived from the patterns above so the two
 * cannot drift: gate 2 resolves these, gate 1 matches those, and a rule root
 * added to one is added to the other.
 */
export const RULE_DIR_ROOTS: readonly string[] = RULE_DIR_PATTERNS.map((p) =>
  p.replace(/\/\*\*$/, ""),
);

/**
 * The filesystem, as much of it as the exemption needs, injected so this module
 * stays pure and every case stays in-process. `guard.ts` supplies the real
 * implementation (`fs-locator.ts`).
 */
export interface FsLocator {
  /**
   * The absolute real location `path` names — symlinks resolved, and on a
   * case-insensitive filesystem the platform's own folding applied — for as
   * much of the path as exists, with the non-existent remainder appended
   * unchanged. `path` is project-relative or absolute.
   *
   * Returns null only when nothing along the path can be resolved at all.
   * Resolving a path that does not yet exist is REQUIRED, not a convenience: a
   * new rule file has no location until the write creates it.
   */
  locate(path: string): string | null;

  /**
   * Does `path` name an existing REGULAR FILE with more than one name on this
   * filesystem — a hard link? False for a directory (every directory has at
   * least two links), for a symlink (`locate` answers those), and for a path
   * that does not exist.
   */
  hasHardLinks(path: string): boolean;
}

/** Is `child` strictly inside directory `parent`? Both absolute, both real. */
function isStrictlyInside(child: string, parent: string): boolean {
  const base = parent.endsWith("/") ? parent : parent + "/";
  return child.startsWith(base);
}

/**
 * Gate 2 — does this canonical path RESOLVE to a location inside a real rule
 * directory, under a name that is the file's only name?
 */
function resolvesInsideRuleDir(canonical: string, fs: FsLocator): boolean {
  if (fs.hasHardLinks(canonical)) return false;

  const located = fs.locate(canonical);
  if (located === null) return false;

  for (const dir of RULE_DIR_ROOTS) {
    const realDir = fs.locate(dir);
    if (realDir === null) continue;
    if (isStrictlyInside(located, realDir)) return true;
  }
  return false;
}

/**
 * Is this a project rule path — a file inside `rules/` or `.claude/rules/`,
 * including inside `retired/`?
 *
 * Both gates must hold; see the module docstring. The bare rule directory
 * itself is NOT one, in any spelling: the flag permits writing rule files, it
 * does not permit deleting the rule directory.
 */
export function isProjectRulePath(path: string, fs: FsLocator): boolean {
  if (!path) return false;
  const canonical = canonicalise(path);
  if (!matchesAny(canonical, [...RULE_DIR_PATTERNS])) return false;
  return resolvesInsideRuleDir(canonical, fs);
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
