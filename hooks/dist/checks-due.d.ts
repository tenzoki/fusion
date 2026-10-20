/**
 * The due list of fusion's periodic checks, printed for `/fusion:setup`.
 *
 * The computation is `lib/checks-due.ts`; this is one of its two callers. The
 * other is `hooks/session-start.ts`, which names the due checks at every
 * session start. Called through `bin/fusion-checks-due`, which passes the
 * plugin root it sits in, so an install copy and a work tree each compare
 * against their own version.
 *
 * Output, one line:
 *
 *   checks_due=claude-md,upstream     # the due selectors, in /fusion:check's order
 *   checks_due=none                   # nothing is due
 *   checks_due=unread (<why>)         # no due list could be computed
 *
 * `unread` covers an unreadable plugin version and a working directory with no
 * workbench above it; the wrapper prints it too when node is missing. Exit 0
 * in every one of those: a due list is a result to read, not a failure
 * (issue `260810-0710_*_the-drift-checks-last-line-makes-the-whole-block-exit-non-zero-when-no-circle-is-active.md`).
 * Only a usage error exits 1.
 */
export {};
