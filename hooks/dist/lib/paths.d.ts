/**
 * Glob-based path matching for the Compliance Guard.
 *
 * Ported from fusion/reactor/pkg/guard/decision_guard.go:73-87.
 * Converts glob patterns to regex: * → [^/]*, ** → .*, ? → .
 */
/** Convert a glob pattern to a RegExp. */
export declare function globToRegex(pattern: string): RegExp;
/** Check if a file path matches a single glob pattern. */
export declare function matchesPattern(filePath: string, pattern: string): boolean;
/** Check if a file path matches any pattern in a list. */
export declare function matchesAny(filePath: string, patterns: string[]): boolean;
