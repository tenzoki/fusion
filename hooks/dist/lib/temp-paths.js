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
import { mkdirSync, readFileSync, realpathSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
/** The directory under `$HOME` that holds one directory per checkout. */
export const FUSION_TMP_BASE = ".fusion-tmp";
/** The system temp directories a reboot or the OS cleaner empties. */
export const SYSTEM_TEMP_PREFIXES = ["/tmp", "/private/tmp", "/var/folders", "/private/var/folders"];
/** Claude Code's absolute-path form is `//path`, so each prefix gains one slash. */
export const DENY_ENTRIES = SYSTEM_TEMP_PREFIXES.map((p) => `Edit(/${p}/**)`);
export function grantEntries(id) {
    return { allow: `Edit(~/${FUSION_TMP_BASE}/${id}/**)`, directory: `~/${FUSION_TMP_BASE}/${id}` };
}
export class UnparseableSettings extends Error {
}
function isObject(v) {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}
/** Parse a settings file's text. Empty text is `{}`; anything not an object throws. */
export function parseSettings(text) {
    if (text.trim() === "")
        return {};
    let parsed;
    try {
        parsed = JSON.parse(text);
    }
    catch (e) {
        throw new UnparseableSettings(`not JSON: ${e.message}`);
    }
    if (!isObject(parsed))
        throw new UnparseableSettings("the top level is not an object");
    return parsed;
}
/**
 * Add the grant entries, and the deny entries when `deny` is set, to the
 * three `permissions` lists. A `permissions` that is not an object, or a list
 * that is not an array of strings, is refused: guessing a repair would be a
 * write the user did not ask for.
 */
export function mergeSettings(settings, opts) {
    const out = { ...settings };
    const perms = out.permissions === undefined ? {} : out.permissions;
    if (!isObject(perms))
        throw new UnparseableSettings("`permissions` is not an object");
    const nextPerms = { ...perms };
    const list = (key) => {
        const v = nextPerms[key];
        if (v === undefined)
            return [];
        if (!Array.isArray(v) || !v.every((x) => typeof x === "string")) {
            throw new UnparseableSettings(`\`permissions.${key}\` is not a list of strings`);
        }
        return [...v];
    };
    const missing = (key, wanted) => {
        const have = new Set(list(key));
        return wanted.filter((w) => !have.has(w));
    };
    const allowMissing = missing("allow", [opts.grant.allow]);
    const dirMissing = missing("additionalDirectories", [opts.grant.directory]);
    const denyMissing = missing("deny", DENY_ENTRIES);
    let added = 0;
    const extend = (key, entries) => {
        if (entries.length === 0)
            return;
        nextPerms[key] = [...list(key), ...entries];
        added += entries.length;
    };
    extend("allow", allowMissing);
    extend("additionalDirectories", dirMissing);
    if (opts.deny)
        extend("deny", denyMissing);
    if (added > 0)
        out.permissions = nextPerms;
    return { settings: out, added, grantsMissing: allowMissing.length + dirMissing.length, denyMissing: denyMissing.length };
}
function readText(path) {
    try {
        return readFileSync(path, "utf-8");
    }
    catch (e) {
        if (e.code === "ENOENT")
            return "";
        throw e;
    }
}
/** Merge into the file at `path`; writes only when something was added. */
export function mergeSettingsFile(path, id, deny, dryRun) {
    const result = mergeSettings(parseSettings(readText(path)), { grant: grantEntries(id), deny });
    if (result.added > 0 && !dryRun) {
        mkdirSync(dirname(path), { recursive: true });
        const staging = `${path}.fusion-tmp-${process.pid}`;
        writeFileSync(staging, JSON.stringify(result.settings, null, 2) + "\n");
        renameSync(staging, path);
    }
    return result;
}
/** True when any of the files parses and sets `sandbox.enabled: true`. Unreadable files are skipped. */
export function sandboxEnabled(paths) {
    return paths.some((p) => {
        try {
            const s = parseSettings(readText(p));
            return isObject(s.sandbox) && s.sandbox.enabled === true;
        }
        catch {
            return false;
        }
    });
}
const USAGE = "usage: temp-paths.js <settings path> <id> <yes|no> [--dry-run] | --sandbox <settings path>...";
function main(argv) {
    if (argv[0] === "--sandbox") {
        if (argv.length < 2) {
            process.stderr.write(USAGE + "\n");
            return 2;
        }
        process.stdout.write(`sandbox=${sandboxEnabled(argv.slice(1)) ? "yes" : "no"}\n`);
        return 0;
    }
    const dryRun = argv[3] === "--dry-run";
    const [path, id, deny] = argv;
    if (argv.length !== (dryRun ? 4 : 3) || !/^[0-9a-f]{8}$/.test(id ?? "") || (deny !== "yes" && deny !== "no")) {
        process.stderr.write(USAGE + "\n");
        return 2;
    }
    try {
        const r = mergeSettingsFile(path, id, deny === "yes", dryRun);
        process.stdout.write(`added=${r.added}\ngrants_missing=${r.grantsMissing}\ndeny_missing=${r.denyMissing}\n`);
        return 0;
    }
    catch (e) {
        if (!(e instanceof UnparseableSettings))
            throw e;
        process.stderr.write(`temp-paths: ${path} was not written: ${e.message}\n`);
        return 4;
    }
}
// Run only when executed as the entry, never when the hooks import the module.
function invokedAsEntry() {
    try {
        return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
    }
    catch {
        return false;
    }
}
if (invokedAsEntry())
    process.exitCode = main(process.argv.slice(2));
