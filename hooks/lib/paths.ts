/**
 * Glob-based path matching for the Compliance Guard, and the one lexical
 * canonicalisation both matched sets are computed on.
 *
 * Ported from fusion/reactor/pkg/guard/decision_guard.go:73-87.
 * Converts glob patterns to regex: * → [^/]*, ** → .*, ? → .
 */

import { posix } from "node:path";

/** Convert a glob pattern to a RegExp. */
export function globToRegex(pattern: string): RegExp {
  let regexStr = pattern;

  // Escape regex special chars except our glob chars (* ? [ ])
  regexStr = regexStr.replace(/[.+^${}()|\\]/g, "\\$&");

  // Order matters: ** before *
  regexStr = regexStr.replace(/\*\*/g, "{{GLOBSTAR}}");
  regexStr = regexStr.replace(/\*/g, "[^/]*");
  regexStr = regexStr.replace(/\{\{GLOBSTAR\}\}/g, ".*");
  regexStr = regexStr.replace(/\?/g, ".");

  return new RegExp(`^${regexStr}$`);
}

/** Check if a file path matches a single glob pattern. */
export function matchesPattern(filePath: string, pattern: string): boolean {
  try {
    return globToRegex(pattern).test(filePath);
  } catch {
    return false;
  }
}

/** Check if a file path matches any pattern in a list. */
export function matchesAny(filePath: string, patterns: string[]): boolean {
  return patterns.some((p) => matchesPattern(filePath, p));
}

/**
 * Collapse `.`, `..` and repeated separators, keeping a trailing separator.
 * This is the spelling BOTH matched sets are computed on.
 *
 * ## Why the collapse
 *
 * `matchesAny` compiles a glob to a regex over the path's TEXT, so two
 * spellings of one file are two different answers. `agents/**` compiles to
 * `^agents/.*$`, which `./agents/coder.md` and `x/../agents/coder.md` do not
 * match although both write `agents/coder.md`. Uncollapsed, the entire
 * protected list was bypassable on the write-tool path with a two-character
 * prefix — `normalizeToRelative` returns a relative path untouched.
 *
 * ## Why the trailing separator STAYS
 *
 * A trailing separator WIDENS whatever set the path is matched against, and
 * the two sets want opposite things from that:
 *
 *   - Against the PROTECTED set, widening is protection. `rules/**` compiles to
 *     `^rules/.*$`, whose `.*` matches the empty string, so `agents/` matches
 *     while `agents` does not. Stripping it here would turn a denied write into
 *     an allowed one, which is the one direction a guard may never move.
 *   - Against the EXEMPT set, widening is a bigger grant. `rm -rf rules/` would
 *     walk straight through the exemption and take the rule directory with it,
 *     while the bare `rm -rf rules` stayed correctly denied through the
 *     ancestor pass.
 *
 * So the shrinking step belongs to the grant alone; `canonicalise` below adds
 * it, and `rules-write-exemption.ts` is the only caller.
 *
 * PURELY TEXTUAL — no filesystem. This collapses a path to the target its TEXT
 * names, which closes the `.`/`..`/separator class and nothing else. A path
 * that reaches a different target through a SYMLINK still reads as this one;
 * see `rules-write-exemption.ts` for why the grant side additionally resolves
 * against the real filesystem and the protection side does not.
 */
export function collapseSegments(path: string): string {
  return posix.normalize(path);
}

/**
 * `collapseSegments` plus the trailing-separator strip — the spelling a
 * permission GRANT is read off.
 *
 * A grant read off a widened spelling grants more than it names, so the exempt
 * set is computed on the narrowest honest reading of the path. See
 * `collapseSegments` for why the protected set is not.
 */
export function canonicalise(path: string): string {
  const collapsed = collapseSegments(path);
  const trimmed = collapsed.replace(/\/+$/, "");
  // A path that was nothing but separators collapses to the empty string; keep
  // it non-empty so it cannot accidentally match a pattern.
  return trimmed.length === 0 ? collapsed : trimmed;
}
