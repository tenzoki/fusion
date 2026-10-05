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
];
/**
 * Stores the tree no longer names but the working tree may still hold. The
 * two work items of the pre-container backlog store still sit under it, and a
 * citation of one has to stay reportable.
 */
export const LEGACY_STORES = ["backlog"];
/**
 * The pre-v4 review folders, merged into `reviews/` at v4. A converted
 * workbench has none; a prompt naming one as a path is as much a literal as
 * naming a live store.
 */
export const RETIRED_REVIEW_FOLDERS = ["codereview", "ontoreview", "conceptreview"];
/**
 * The v11 name of each store v12 renamed, read beside the new name during the
 * v12 window. The window closed at 13.0.0, which emptied this record and
 * deleted the layout tree's subsection it copied; `window-bound.test.ts` holds
 * it empty (ruling
 * 260922-1114_*_does-the-transition-windows-legacy-read-live-at-one-site-per-runtime.md).
 */
export const WINDOW_LEGACY_NAMES = {};
/** The v11 container root, outliving the window: an archive sweep keeps it, and a citation spelling it is still read. */
export const V11_CONTAINER_ROOT = "circles";
/**
 * The v11 names of the record stores v12 renamed, outliving the window: a
 * citation spelling one stays a store-prefixed token, and a path under one a
 * record, since `/fusion:migrate` renames directories and rewrites no record.
 */
export const V11_RECORD_STORES = ["planning", "consult"];
/** The three v11 store names, outliving the window: the migration refuses them and `/fusion:migrate` renames them. */
export const V11_STORE_NAMES = [V11_CONTAINER_ROOT, ...V11_RECORD_STORES];
/** A store's names during the window: the new one first, then its legacy one if any. */
export function namesOf(kind) {
    const legacy = WINDOW_LEGACY_NAMES[kind];
    return legacy === undefined ? [kind] : [kind, legacy];
}
/** Every name a container root may carry, the new one first. */
export const CONTAINER_ROOT_NAMES = namesOf(CONTAINER_STORE);
/**
 * The container roots an archive sweep may hold. NOT part of the window: a
 * sweep taken before v12 keeps `circles/` for good, so this list outlives
 * `WINDOW_LEGACY_NAMES` and the closing release leaves it alone.
 */
export const ARCHIVED_CONTAINER_ROOTS = [CONTAINER_STORE, V11_CONTAINER_ROOT];
/** Every container root name a citation or a staged path may spell: the live ones, then the v11 root. */
export const CITED_CONTAINER_ROOTS = [...CONTAINER_ROOT_NAMES, V11_CONTAINER_ROOT];
/* ------------------------------------------------------------------ *
 * The JSON surfaces, by name
 *
 * A JSON-controlled workbench adds a manifest at its root, a local journal
 * directory beside it, and one control file beside each narrative. These are
 * the codec's names (`codec/src/store.ts`), copied rather than imported: the
 * codec is its own package and the hook build does not resolve its sources.
 * `fusion-stores.test.ts` reads that file's text and holds each copy equal.
 * Names only: nothing here opens a file, so an automatic hook may use them.
 * ------------------------------------------------------------------ */
/** The workbench manifest, at the workbench root. */
export const WORKBENCH_MANIFEST = "workbench.json";
/** The codec's local journal and lock directory, at the workbench root; ignored by its own `.gitignore`. */
export const JSON_STATE_DIR = ".json-state";
/** A package's control file, in its container. */
export const PACKAGE_CONTROL = "package.json";
/** The suffix of an issue, plan, discussion or decision record's control file. */
export const RECORD_CONTROL_SUFFIX = ".record.json";
/** The suffix of an evidence record, which sits beside the report it records. */
export const EVIDENCE_SUFFIX = ".evidence.json";
/** `<basename>[.<n>].evidence.json`, `n` a correction counter from 2 with no leading zero: the codec's `EVIDENCE_NAME`. */
const EVIDENCE_NAME = /^(.*?)(?:\.([2-9]|[1-9][0-9]+))?\.evidence\.json$/;
/** A control file, by its file name alone. */
export function isControlFile(name) {
    return name === PACKAGE_CONTROL || name.endsWith(RECORD_CONTROL_SUFFIX) || name.endsWith(EVIDENCE_SUFFIX);
}
/**
 * The narrative a control file pairs with, workbench-relative, or null when
 * `controlPath` names no control file or a package file outside a directory.
 * `<stem>.record.json` pairs with `<stem>.md`; `<dir>/package.json` with
 * `<dir>/<basename of dir>.md`; an evidence record with the report its name
 * reads. Read from the path alone: a record whose `narrative.path` says
 * otherwise is the codec's finding, not this function's.
 */
export function narrativeOf(controlPath) {
    const slash = controlPath.lastIndexOf("/");
    const dir = controlPath.slice(0, slash + 1);
    const name = controlPath.slice(slash + 1);
    if (name === PACKAGE_CONTROL)
        return slash < 0 ? null : `${dir}${dir.slice(0, -1).split("/").pop()}.md`;
    if (name.endsWith(RECORD_CONTROL_SUFFIX))
        return `${dir}${name.slice(0, -RECORD_CONTROL_SUFFIX.length)}.md`;
    const evidence = EVIDENCE_NAME.exec(name);
    return evidence === null ? null : `${dir}${evidence[1]}.md`;
}
/**
 * The container roots under the workbench `wb` to walk: the new root always,
 * the legacy root only when it exists on disk. Relative names, not paths.
 */
export function containerRoots(wb) {
    return CONTAINER_ROOT_NAMES.filter((n, i) => i === 0 || existsSync(join(wb, n)));
}
/**
 * The directories of store `kind` under `base`: `<base>/<kind>` always,
 * `<base>/<legacy name>` only when it exists on disk.
 */
export function storeDirs(base, kind) {
    return namesOf(kind)
        .filter((n, i) => i === 0 || existsSync(join(base, n)))
        .map((n) => join(base, n));
}
