/**
 * Glob-based path matching for the Compliance Guard, and the lexical
 * normalisation the matched set is computed on.
 *
 * Ported from fusion/reactor/pkg/guard/decision_guard.go:73-87.
 * Converts glob patterns to regex: * → [^/]*, ** → .*, ? → .
 *
 * ## There used to be two matched sets, and the asymmetry between them shaped
 * ## this file
 *
 * Until 2026-08-12 the guard matched a path against two sets that wanted
 * opposite things from a spelling, so the normalisation was not shared:
 *
 *   - the PROTECTED set (`guard.protectedPaths`) — widening it denied more,
 *     which is the safe direction. It read `collapseSegments` and matched
 *     through `matchesAnyFolded`, which was `matchesAny` plus a case fold.
 *   - the EXEMPT set (`RULE_DIR_PATTERNS`, in the `FUSION_ALLOW_RULES_WRITE`
 *     exemption) — widening it GRANTED more, which is the unsafe direction. It
 *     read `canonicalise`, which was `collapseSegments` plus a trailing-separator
 *     strip, and matched through the plain `matchesAny`.
 *
 * Both sets went with the protected-path half of the guard, and
 * `matchesAnyFolded` and `canonicalise` went with them, and the churn heatmap's
 * two noise filters over hardcoded constants went with it on 2026-08-15. What is
 * left matches ONE set — `guard.categoryPaths`, read by
 * `findRelevantDecisions`.
 *
 * The asymmetry is recorded rather than deleted because it explains the shape of
 * what remains: `collapseSegments` keeps a trailing separator, and the reason is
 * a set that no longer exists. Anyone re-deriving it from the surviving caller
 * alone would find no argument either way and could reasonably change it.
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
/**
 * Check if a file path matches a single glob pattern.
 *
 * EXPORTED WITH NO EXTERNAL CALLER, as of 2026-08-12. Its one caller outside
 * this module was the rules-write exemption's ancestor pass, which was removed
 * with the protected-path half of the guard; what is left is `matchesAny` just
 * below, plus `paths.test.ts`, which covers it directly. It is kept exported
 * rather than made module-private because the unit coverage is worth more than
 * the narrowed visibility, and because a second caller is the ordinary way this
 * file grows. Noted so the next reader does not have to re-derive that it is not
 * dead.
 */
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
 * CASE-SENSITIVE, and this is now the ONLY path match in the guard.
 *
 * ONE caller: `config.ts findRelevantDecisions`, matching `guard.categoryPaths`,
 * and it is REACHABLE — a consuming project's `fusion-guard.json` can declare
 * `guard.categoryPaths` and `decisions`, which falsified the "no per-project
 * config loader exists yet" this paragraph used to claim (`260804-1432`). Two
 * others read hardcoded constants and were as unreachable by a differently-cased
 * path as they ever were: the churn heatmap's noise filters in `churn.ts` and
 * `tracker.ts`, removed on 2026-08-15.
 *
 * Whether that third caller should fold was raised and DEFERRED by the user on
 * 2026-08-04, on two grounds: the two sides of a `categoryPaths` match are both
 * authored by the same project, unlike `guard.protectedPaths`; and the deferral
 * record states that the folded protected match is unaffected either way. THE
 * SECOND GROUND NO LONGER HOLDS. `matchesAnyFolded` and the list it matched were
 * removed on 2026-08-12, so this is the only path match left and the comparison
 * the deferral rested on has no other side. The record is
 * `circles/260801-1244-guard-rules-write/decisions/260804-1632_d_should-findrelevantdecisions-fold-case-now-that-a-project-can-configure-categorypaths.md`
 * and it is the user's to re-open; the behaviour is unchanged here.
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
 * Collapse `.`, `..` and repeated separators, keeping a trailing separator.
 * This is the spelling the guard's one matched set is computed on.
 *
 * ## Why the collapse
 *
 * `matchesAny` compiles a glob to a regex over the path's TEXT, so two
 * spellings of one file are two different answers. `agents/**` compiles to
 * `^agents/.*$`, which `./agents/coder.md` and `x/../agents/coder.md` do not
 * match although both write `agents/coder.md`. Measured on the protected list,
 * where uncollapsed it made the entire list bypassable on the write-tool path
 * with a two-character prefix. That list is gone; `guard.categoryPaths` is
 * matched by the same `matchesAny` over the same text and has the same property.
 *
 * ## Why the trailing separator STAYS
 *
 * A trailing separator WIDENS whatever set the path is matched against, and the
 * two sets this file served wanted opposite things from that:
 *
 *   - Against the PROTECTED set, widening was protection. `rules/**` compiles to
 *     `^rules/.*$`, whose `.*` matches the empty string, so `agents/` matched
 *     while `agents` did not. Stripping it here would have turned a denied write
 *     into an allowed one, which is the one direction a guard may never move.
 *   - Against the EXEMPT set, widening was a bigger grant. `rm -rf rules/` would
 *     have walked straight through the exemption and taken the rule directory
 *     with it, while the bare `rm -rf rules` stayed correctly denied through the
 *     ancestor pass.
 *
 * Both sets were removed on 2026-08-12, and with them `canonicalise`, which was
 * this function plus the trailing-separator strip the grant side needed. The
 * separator is kept ANYWAY, and the argument above is why: the surviving caller
 * is `guard.categoryPaths`, a deny-side match, where widening is still the safe
 * direction. Read the paragraphs as history explaining a choice, not as a
 * description of two live callers.
 *
 * ## CASE is not folded here
 *
 * Nothing in the guard folds case on a path match any more — `matchesAnyFolded`
 * went with the protected set. A fold added HERE would be worse than one added
 * at the match: this is a normalisation, so it would silently change the
 * spelling every future caller reads, whichever direction that caller wants. The
 * fold belongs to the match.
 *
 * PURELY TEXTUAL — no filesystem. This collapses a path to the target its TEXT
 * names, which closes the `.`/`..`/separator class and nothing else. A path
 * that reaches a different target through a SYMLINK still reads as this one.
 */
export function collapseSegments(path) {
    return posix.normalize(path);
}
