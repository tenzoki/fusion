/**
 * The artefact stores, named once.
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
/** The container store: one directory per work package, at the workbench root. */
export declare const CONTAINER_STORE = "work-packages";
/** The stores the layout tree names under `shared/`, in the tree's order. */
export declare const RECORD_STORES: readonly ["plans", "issues", "decisions", "discussions", "analyses", "reviews", "investigations", "history", "consultations", "memos", "forum", "checkouts"];
/**
 * Stores the tree no longer names but the working tree may still hold. The
 * two work items of the pre-container backlog store still sit under it, and a
 * citation of one has to stay reportable.
 */
export declare const LEGACY_STORES: readonly ["backlog"];
/**
 * The pre-v4 review folders, merged into `reviews/` at v4. A converted
 * workbench has none; a prompt naming one as a path is as much a literal as
 * naming a live store.
 */
export declare const RETIRED_REVIEW_FOLDERS: readonly ["codereview", "ontoreview", "conceptreview"];
/**
 * The v11 name of each store v12 renamed: read beside the new name while that
 * directory exists, never written. A copy of the layout tree's `### Transition
 * window (v12.0.0 to v13.0.0)`, held equal to it by `path-literal-lint.test.ts`
 * and to the plugin's major by `window-bound.test.ts`; the closing release,
 * 13.0.0, empties it (ruling
 * 260922-1114_*_does-the-transition-windows-legacy-read-live-at-one-site-per-runtime.md).
 * Typed as a record rather than `as const` so that emptying it is a one-line edit.
 */
export declare const WINDOW_LEGACY_NAMES: Readonly<Record<string, string>>;
/** A store's names during the window: the new one first, then its legacy one if any. */
export declare function namesOf(kind: string): string[];
/** Every name a container root may carry, the new one first. */
export declare const CONTAINER_ROOT_NAMES: readonly string[];
/**
 * The container roots an archive sweep may hold. NOT part of the window: a
 * sweep taken before v12 keeps `circles/` for good, so this list outlives
 * `WINDOW_LEGACY_NAMES` and the closing release leaves it alone.
 */
export declare const ARCHIVED_CONTAINER_ROOTS: readonly string[];
/** The live root names as a regex alternation, for the citation grammar. */
export declare const CONTAINER_ROOT_ALT: string;
/** The record stores' legacy names, for the segment lists that must still recognise them. */
export declare const WINDOW_LEGACY_RECORD_STORES: readonly string[];
/** The workbench manifest, at the workbench root. */
export declare const WORKBENCH_MANIFEST = "workbench.json";
/** The codec's local journal and lock directory, at the workbench root; ignored by its own `.gitignore`. */
export declare const JSON_STATE_DIR = ".json-state";
/** A package's control file, in its container. */
export declare const PACKAGE_CONTROL = "package.json";
/** The suffix of an issue, plan, discussion or decision record's control file. */
export declare const RECORD_CONTROL_SUFFIX = ".record.json";
/** The suffix of an evidence record, which sits beside the report it records. */
export declare const EVIDENCE_SUFFIX = ".evidence.json";
/** A control file, by its file name alone. */
export declare function isControlFile(name: string): boolean;
/**
 * The narrative a control file pairs with, workbench-relative, or null when
 * `controlPath` names no control file or a package file outside a directory.
 * `<stem>.record.json` pairs with `<stem>.md`; `<dir>/package.json` with
 * `<dir>/<basename of dir>.md`; an evidence record with the report its name
 * reads. Read from the path alone: a record whose `narrative.path` says
 * otherwise is the codec's finding, not this function's.
 */
export declare function narrativeOf(controlPath: string): string | null;
/**
 * The container roots under the workbench `wb` to walk: the new root always,
 * the legacy root only when it exists on disk. Relative names, not paths.
 */
export declare function containerRoots(wb: string): string[];
/**
 * The directories of store `kind` under `base`: `<base>/<kind>` always,
 * `<base>/<legacy name>` only when it exists on disk.
 */
export declare function storeDirs(base: string, kind: string): string[];
