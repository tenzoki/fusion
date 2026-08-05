/**
 * Glob-based path matching for the Compliance Guard, and the lexical
 * normalisations the two matched sets are computed on.
 *
 * Ported from fusion/reactor/pkg/guard/decision_guard.go:73-87.
 * Converts glob patterns to regex: * → [^/]*, ** → .*, ? → .
 *
 * ## Three functions, and the asymmetry between them is load-bearing
 *
 * The guard matches a path against two sets that want opposite things from a
 * spelling, so the normalisation is not shared:
 *
 *   - the PROTECTED set (`guard.protectedPaths`) — widening it denies more,
 *     which is the safe direction. It reads `collapseSegments` and matches
 *     through `matchesAnyFolded`.
 *   - the EXEMPT set (`RULE_DIR_PATTERNS`, `rules-write-exemption.ts`) —
 *     widening it GRANTS more, which is the unsafe direction. It reads
 *     `canonicalise` and matches through the plain `matchesAny`.
 *
 * `canonicalise` is `collapseSegments` plus a trailing-separator strip, and
 * `matchesAnyFolded` is `matchesAny` plus a case fold. Neither extra step may
 * cross to the other side. Unifying the pair has been proposed once already —
 * a Turn 1 review offered it as a one-liner — and it would have removed three
 * denials; the argument is written out at each definition below.
 */
import { posix } from "node:path";
/** Convert a glob pattern to a RegExp. */
export function globToRegex(pattern) {
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
export function matchesPattern(filePath, pattern) {
    try {
        return globToRegex(pattern).test(filePath);
    }
    catch {
        return false;
    }
}
/**
 * Check if a file path matches any pattern in a list.
 *
 * CASE-SENSITIVE. Three callers, and the case answer is deliberate for the
 * first, unexamined for the other two:
 *
 *   - the GRANT side (`rules-write-exemption.ts` gate 1) — folding would widen
 *     a permission, so it must not fold. `matchesAnyFolded` below carries that
 *     argument in full.
 *   - `config.ts findRelevantDecisions` (`guard.categoryPaths`) and
 *     `tracker.ts` (noise filtering). Both are outside `guard.protectedPaths`
 *     and were left as they were, so a differently-cased path escapes a
 *     decision-governed escalation the way it used to escape protection.
 *     `findRelevantDecisions` is REACHABLE: a consuming project's
 *     `fusion-guard.json` can declare `guard.categoryPaths` and `decisions`
 *     since the C5b loader shipped, which falsified the "no per-project config
 *     loader exists yet" this paragraph used to claim (`260804-1432`). Whether
 *     it should therefore fold is an open decision, deliberately not taken
 *     here: `decisions/260804-1632_o_should-findrelevantdecisions-fold-case-now-that-a-project-can-configure-categorypaths.md`.
 *     The argument the decision starts from is that the two sides of a
 *     `categoryPaths` match are both authored by the same project, which is not
 *     the situation `protectedPaths` is in. `tracker.ts`'s noise filter reads a
 *     hardcoded constant and stays exactly as unreachable as it was.
 *
 * The PROTECTION side calls `matchesAnyFolded`.
 */
export function matchesAny(filePath, patterns) {
    return patterns.some((p) => matchesPattern(filePath, p));
}
/**
 * Fold a path's case, so two spellings of one file compare alike.
 *
 * `toLowerCase` rather than `toLocaleLowerCase`: the Unicode default mapping is
 * the same everywhere, while the locale-sensitive one is not — under a Turkish
 * locale `I` lowercases to a dotless `ı` and `rules/I.md` would stop folding
 * onto `rules/i.md`. A security boundary that moves with `LANG` is worse than a
 * boundary that is slightly coarse.
 */
export function foldCase(path) {
    return path.toLowerCase();
}
/**
 * `matchesAny` with case folded on BOTH sides — the PROTECTION side's match.
 *
 * ## Why the fold
 *
 * `matchesPattern` compiles a glob to a regex over the path's TEXT, and a regex
 * is case-sensitive, so `agents/**` did not match `AGENTS/coder.md`. On a
 * case-insensitive filesystem — APFS in its default configuration, which is
 * every stock macOS install, and a case-insensitive Windows volume — those two
 * spellings are ONE file. Measured against the real guard before this existed:
 *
 *     Edit agents/coder.md     DENY
 *     Edit AGENTS/coder.md     allow   -> writes agents/coder.md
 *     Edit HOOKS/config.json   allow   -> writes hooks/config.json
 *     rm AGENTS/coder.md       allow
 *
 * That was the whole protected list bypassable by shifting one letter, on both
 * write surfaces, needing no flag.
 *
 * ## Why UNCONDITIONALLY, and not only where the filesystem folds
 *
 * The user's decision, recorded at
 * `circles/260801-1244-guard-rules-write/decisions/260803-1419_a_how-should-the-protected-path-check-treat-the-case-of-a-path.md`.
 * A boundary that differs by platform has to be re-stated in every document
 * that describes it, and is then discovered rather than known. Folding
 * everywhere over-blocks on a case-sensitive filesystem, where `AGENTS/coder.md`
 * really is a different file from `agents/coder.md` — a project deliberately
 * keeping both would find one of them unwritable. That is the accepted cost, and
 * over-blocking is the direction the guard already chooses in its fail-closed
 * rule.
 *
 * ## Why the GRANT side does not call this
 *
 * Folding the exempt set would widen a permission: `Edit RULES/x.md` would
 * acquire the `FUSION_ALLOW_RULES_WRITE` grant off a spelling that is not the
 * one `RULE_DIR_PATTERNS` names. The grant side has its own answer to case and
 * it is not textual — `isProjectRulePath` gate 2 resolves through
 * `realpathSync.native`, which applies the platform's OWN folding, so on a
 * case-insensitive filesystem the case question is already settled there by the
 * kernel rather than by this module. Nothing here is the grant's business.
 *
 * The consequence is stated rather than hidden: with the flag set,
 * `Edit RULES/x.md` denies while `Edit rules/x.md` allows, on a filesystem where
 * both name the same file. The protected set widened and the exempt set did not,
 * which is the only direction a guard may move.
 *
 * STILL PURELY TEXTUAL — no filesystem, and no query about how THIS filesystem
 * treats case. A path that reaches a different target through a SYMLINK still
 * reads as this one.
 */
export function matchesAnyFolded(filePath, patterns) {
    return matchesAny(foldCase(filePath), patterns.map((p) => foldCase(p)));
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
 * ## CASE is not folded here
 *
 * The protection side matches case-insensitively, and this is not where that
 * happens. `canonicalise` is built on this function, so a fold added here would
 * fold the grant too — the asymmetry above, lost in the other direction. The
 * fold belongs to the MATCH, where the two sides already use different
 * functions: `matchesAnyFolded` for the protected set, plain `matchesAny` for
 * the exempt one.
 *
 * PURELY TEXTUAL — no filesystem. This collapses a path to the target its TEXT
 * names, which closes the `.`/`..`/separator class and nothing else. A path
 * that reaches a different target through a SYMLINK still reads as this one;
 * see `rules-write-exemption.ts` for why the grant side additionally resolves
 * against the real filesystem and the protection side does not.
 */
export function collapseSegments(path) {
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
export function canonicalise(path) {
    const collapsed = collapseSegments(path);
    const trimmed = collapsed.replace(/\/+$/, "");
    // A path that was nothing but separators collapses to the empty string; keep
    // it non-empty so it cannot accidentally match a pattern.
    return trimmed.length === 0 ? collapsed : trimmed;
}
