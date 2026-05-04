/**
 * Glob-based path matching for the Compliance Guard.
 *
 * Ported from fusion/reactor/pkg/guard/decision_guard.go:73-87.
 * Converts glob patterns to regex: * → [^/]*, ** → .*, ? → .
 */

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
