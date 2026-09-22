/**
 * The artifact stores, named once.
 *
 * Three lists in three files used to enumerate the stores by hand, and they
 * drifted by one element each way: the staging classifier and the citation
 * grammar had no `forum` and no `checkouts`, the path-literal lint had `forum`
 * and no `checkouts`, and the comment on the first claimed a relation to the
 * third that the missing `forum` made false (issues
 * 260905-0933_*_the-new-checkouts-store-is-absent-from-the-two-code-level-enumerations-of-the-artifact-stores.md
 * and
 * 260917-1308_*_the-staging-classifiers-store-list-omits-forum-and-its-comment-states-a-relation-that-is-false-by-that-element.md).
 * The definition is the layout tree in `rules/fusion-workbench-conventions.md`
 * `## fusion-workbench Layout`, and `hooks/lib/__tests__/path-literal-lint.test.ts`
 * parses that tree's `shared/` subtree on every run and requires
 * `RECORD_STORES` to equal it, so a store added to the tree without a line
 * here, or the reverse, fails the suite.
 *
 * Each consumer composes its own set from these arrays and says which it
 * takes; none carries a literal of its own.
 */

/** The stores the layout tree names under `shared/`, in the tree's order. */
export const RECORD_STORES = [
  "planning",
  "issues",
  "decisions",
  "discussions",
  "analyses",
  "reviews",
  "investigations",
  "history",
  "consult",
  "memos",
  "forum",
  "checkouts",
] as const;

/**
 * Stores the tree no longer names but the working tree may still hold. The
 * two work items of the pre-container backlog store still sit under it, and a
 * citation of one has to stay reportable.
 */
export const LEGACY_STORES = ["backlog"] as const;

/**
 * The pre-v4 review folders, merged into `reviews/` at v4. A converted
 * workbench has none; a prompt naming one as a path is as much a literal as
 * naming a live store.
 */
export const RETIRED_REVIEW_FOLDERS = ["codereview", "ontoreview", "conceptreview"] as const;
