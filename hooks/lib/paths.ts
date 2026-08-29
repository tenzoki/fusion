/**
 * Case folding for a path comparison.
 *
 * ONE function, and one caller: `tracker.ts`, which folds both sides of a
 * containment test so a case-insensitive file system does not decide whether
 * the review-coverage measurement fires.
 *
 * ## What this module was, and why the rest of it went
 *
 * Until 2026-08-16 it also carried a glob-to-regex compiler ported from
 * `fusion/reactor/pkg/guard/decision_guard.go:73-87` (`globToRegex`,
 * `matchesPattern`, `matchesAny`) and the lexical normalisation a matched set
 * was computed on (`collapseSegments`). They existed to answer one question:
 * does this path fall inside a configured SET of paths?
 *
 * The guard has no such set left. `guard.protectedPaths` went with the
 * protected-path half on 2026-08-12, taking `matchesAnyFolded` and
 * `canonicalise` with it; `guard.categoryPaths` and the `findRelevantDecisions`
 * walk that read it went with the guard's verdict on 2026-08-16. A matcher with
 * nothing to match is not a capability held in reserve, and the four functions
 * were deleted rather than kept against a future caller — the rule this project
 * applies to a mechanism it can no longer measure. `hooks/lib/self-detect.ts`
 * is the one place the opposite call was made in the same release, and it is
 * kept because a decision record asks for it by name; nothing comparable was
 * ever written down for these four.
 *
 * ## Two things a reader coming from an older tree will look for
 *
 * The header used to explain a TRAILING-SEPARATOR ASYMMETRY at length:
 * `collapseSegments` kept a trailing separator because widening a match was the
 * safe direction against a deny-side set and the unsafe direction against a
 * grant-side one. Both sides are gone. The argument is recorded in this
 * module's history rather than restated here, because a normalisation nobody
 * calls has no direction to be safe in.
 *
 * The header also carried a DEFERRED question: whether the surviving
 * `categoryPaths` match should fold case, raised and deferred by the user on
 * 2026-08-04 in
 * `260804-1632_*_should-findrelevantdecisions-fold-case-now-that-a-project-can-configure-categorypaths.md`.
 * Its subject was deleted with the match, so the question can no longer be
 * decided either way.
 */

/**
 * Fold a path's case, so two spellings of one file compare alike.
 *
 * `toLowerCase` rather than `toLocaleLowerCase`: the Unicode default mapping is
 * the same everywhere, while the locale-sensitive one is not — under a Turkish
 * locale `I` lowercases to a dotless `ı` and `rules/I.md` would stop folding
 * onto `rules/i.md`. A comparison that moves with `LANG` is worse than one that
 * is slightly coarse.
 */
export function foldCase(path: string): string {
  return path.toLowerCase();
}
