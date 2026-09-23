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
 * parses that tree on every run and requires `CONTAINER_STORE`,
 * `RECORD_STORES` and `WINDOW_LEGACY_NAMES` to equal it, so a store added to
 * the tree without a line here, or the reverse, fails the suite.
 *
 * Each consumer composes its own set from these arrays and says which it
 * takes; none carries a literal of its own.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

/** The container store: one directory per work package, at the workbench root. */
export const CONTAINER_STORE = "work-packages";

/** The stores the layout tree names under `shared/`, in the tree's order. */
export const RECORD_STORES = [
  "plans",
  "issues",
  "decisions",
  "discussions",
  "analyses",
  "reviews",
  "investigations",
  "history",
  "consultations",
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

/**
 * The v11 name of each store v12 renamed: read beside the new name while that
 * directory exists, never written. A copy of the layout tree's `### Transition
 * window (v12.0.0 to v13.0.0)`, held equal to it by `path-literal-lint.test.ts`
 * and to the plugin's major by `window-bound.test.ts`; the closing release,
 * 13.0.0, empties it (ruling
 * 260922-1114_*_does-the-transition-windows-legacy-read-live-at-one-site-per-runtime.md).
 * Typed as a record rather than `as const` so that emptying it is a one-line edit.
 */
export const WINDOW_LEGACY_NAMES: Readonly<Record<string, string>> = {
  "work-packages": "circles",
  plans: "planning",
  consultations: "consult",
};

/** A store's names during the window: the new one first, then its legacy one if any. */
export function namesOf(kind: string): string[] {
  const legacy = WINDOW_LEGACY_NAMES[kind];
  return legacy === undefined ? [kind] : [kind, legacy];
}

/** Every name a container root may carry, the new one first. */
export const CONTAINER_ROOT_NAMES: readonly string[] = namesOf(CONTAINER_STORE);

/**
 * The container roots an archive sweep may hold. NOT part of the window: a
 * sweep taken before v12 keeps `circles/` for good, so this list outlives
 * `WINDOW_LEGACY_NAMES` and the closing release leaves it alone.
 */
export const ARCHIVED_CONTAINER_ROOTS: readonly string[] = [CONTAINER_STORE, "circles"];

/** The live root names as a regex alternation, for the citation grammar. */
export const CONTAINER_ROOT_ALT = CONTAINER_ROOT_NAMES.join("|");

/** The record stores' legacy names, for the segment lists that must still recognise them. */
export const WINDOW_LEGACY_RECORD_STORES: readonly string[] = RECORD_STORES.flatMap((s) => namesOf(s).slice(1));

/**
 * The container roots under the workbench `wb` to walk: the new root always,
 * the legacy root only when it exists on disk. Relative names, not paths.
 */
export function containerRoots(wb: string): string[] {
  return CONTAINER_ROOT_NAMES.filter((n, i) => i === 0 || existsSync(join(wb, n)));
}

/**
 * The directories of store `kind` under `base`: `<base>/<kind>` always,
 * `<base>/<legacy name>` only when it exists on disk.
 */
export function storeDirs(base: string, kind: string): string[] {
  return namesOf(kind)
    .filter((n, i) => i === 0 || existsSync(join(base, n)))
    .map((n) => join(base, n));
}
