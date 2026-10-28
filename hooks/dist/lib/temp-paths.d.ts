/**
 * The strings fusion's intermediate-file location is made of, and the one
 * merge that grants it in a Claude Code settings file.
 *
 * `bin/fusion-tmp` owns the location and its grants; this module owns what the
 * helper and the hooks must agree on: the base name under `$HOME`, the four
 * system temp prefixes, the two grant entries and the four deny entries. Why
 * the location is `~/.fusion-tmp/<checkout-id>` and not a project or system
 * temp directory is argued in the helper's header, and is not restated here.
 *
 * ## The merge only adds
 *
 * `mergeSettings` adds each missing string to `permissions.allow`,
 * `permissions.additionalDirectories` and, when asked, `permissions.deny`.
 * It touches no other key and removes nothing, because Claude Code saves the
 * user's "don't ask again" approvals into the same file: an overwrite would
 * lose them. A file that does not parse, or parses to something that is not a
 * settings object, is refused rather than repaired, so its bytes stay as they
 * were.
 *
 * ## The compiled entry
 *
 * The helper calls this file as `hooks/dist/lib/temp-paths.js`, the way
 * `bin/fusion-write` calls `hooks/dist/write.js`:
 *
 *   node temp-paths.js <settings path> <id> <deny yes|no> [--dry-run]
 *     added=<n>            entries written (would be written, with --dry-run)
 *     grants_missing=<n>   of the two grant entries, before the merge
 *     deny_missing=<n>     of the four deny entries, before the merge
 *   node temp-paths.js --sandbox <settings path>...
 *     sandbox=yes|no       whether any readable file sets sandbox.enabled true
 *
 * Exit 0, 2 on usage, 4 when the settings file does not parse (nothing is
 * written). An absent or empty file reads as `{}`. A file is written only
 * when `added` is not zero, through a sibling temporary file and a rename.
 */
/** The directory under `$HOME` that holds one directory per checkout. */
export declare const FUSION_TMP_BASE = ".fusion-tmp";
/** The system temp directories a reboot or the OS cleaner empties. */
export declare const SYSTEM_TEMP_PREFIXES: readonly ["/tmp", "/private/tmp", "/var/folders", "/private/var/folders"];
/** Claude Code's absolute-path form is `//path`, so each prefix gains one slash. */
export declare const DENY_ENTRIES: readonly string[];
export interface GrantEntries {
    /** For `permissions.allow`: default mode stops prompting for writes there. */
    allow: string;
    /** For `permissions.additionalDirectories`: `acceptEdits` and the sandbox. */
    directory: string;
}
export declare function grantEntries(id: string): GrantEntries;
export declare class UnparseableSettings extends Error {
}
export interface MergeResult {
    /** The settings object after the merge; the input object is not mutated. */
    settings: Record<string, unknown>;
    added: number;
    grantsMissing: number;
    denyMissing: number;
}
/** Parse a settings file's text. Empty text is `{}`; anything not an object throws. */
export declare function parseSettings(text: string): Record<string, unknown>;
/**
 * Add the grant entries, and the deny entries when `deny` is set, to the
 * three `permissions` lists. A `permissions` that is not an object, or a list
 * that is not an array of strings, is refused: guessing a repair would be a
 * write the user did not ask for.
 */
export declare function mergeSettings(settings: Record<string, unknown>, opts: {
    grant: GrantEntries;
    deny: boolean;
}): MergeResult;
/** Merge into the file at `path`; writes only when something was added. */
export declare function mergeSettingsFile(path: string, id: string, deny: boolean, dryRun: boolean): MergeResult;
/** True when any of the files parses and sets `sandbox.enabled: true`. Unreadable files are skipped. */
export declare function sandboxEnabled(paths: string[]): boolean;
