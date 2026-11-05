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
 * It also owns the one boundary for a literal system temp path
 * (`systemTempTokens`), which the shipped-text lint gates with and the
 * tracker's job 0d reads `Bash` commands with, and the session-start line
 * (`tempRootLine`). Both only report; nothing here blocks.
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
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
/** The directory under `$HOME` that holds one directory per checkout. */
export const FUSION_TMP_BASE = ".fusion-tmp";
/** The system temp directories a reboot or the OS cleaner empties. */
export const SYSTEM_TEMP_PREFIXES = ["/tmp", "/private/tmp", "/var/folders", "/private/var/folders"];
/** Claude Code's absolute-path form is `//path`, so each prefix gains one slash. */
export const DENY_ENTRIES = SYSTEM_TEMP_PREFIXES.map((p) => `Edit(/${p}/**)`);
/**
 * A literal system temp path in a line of text. The boundary is the one
 * `__tests__/temp-path-lint.test.ts` states and gates the shipped text with:
 * no letter, digit, `_`, `.`, `~`, `/`, `>`, `}` or `)` before it, so
 * `<root>/tmp`, `${…}/tmp`, `$(…)/tmp` and `.fusion-tmp` never match, and no
 * name character after the prefix, so `/tmpfoo` does not either.
 */
const TEMP_PATH = new RegExp(`(?<![A-Za-z0-9_.~/>})])(?:${[...SYSTEM_TEMP_PREFIXES].sort((a, b) => b.length - a.length).join("|")})(?![A-Za-z0-9_-])(?:/[^\\s\`'"]*)?`, "g");
/** Every literal system temp path a line names, trailing punctuation dropped. */
export function systemTempTokens(line) {
    return [...line.matchAll(TEMP_PATH)].map((m) => m[0].replace(/[.,;:)]+$/, ""));
}
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
/**
 * `/private/tmp/x` and `/tmp/x` name one file on macOS, so a token and a root
 * are compared with the `/private` spelling folded away.
 */
function folded(p) {
    return p.replace(/^\/private(?=\/(?:tmp|var)(?:\/|$))/, "");
}
function realOrSelf(p) {
    try {
        return realpathSync(p);
    }
    catch {
        return resolve(p);
    }
}
/** A `mktemp` call with its words up to the next shell separator. */
const MKTEMP = /(?<![A-Za-z0-9_./-])mktemp(?![A-Za-z0-9_.-])([^;&|)`\n]*)/g;
/**
 * True when a `mktemp` call names no place: no template operand and no `-p` or
 * `--tmpdir`. With no template macOS `mktemp` ignores `TMPDIR`, so the file
 * lands in the system temp directory whatever the launcher exported.
 */
function bareMktemp(args) {
    const words = args.trim().split(/\s+/).filter((w) => w !== "");
    for (let i = 0; i < words.length; i++) {
        const w = words[i].replace(/^["']|["']$/g, "");
        if (w === "-p" || w.startsWith("--tmpdir") || /^-[A-Za-z]*p/.test(w))
            return false;
        if (w === "-t" || w === "--suffix")
            i++;
        else if (!w.startsWith("-"))
            return false;
    }
    return true;
}
/**
 * What a `Bash` command's text names in the system temp directories: each
 * literal path at the lint's boundary, and each bare `mktemp`. A path under
 * the project root or under `~/.fusion-tmp`, either as spelled or resolved, is
 * dropped: a project or a scratch `HOME` can itself lie under `/var/folders`.
 * The text is read for what it names, never for what it will do.
 */
export function systemTempMentions(command, root, home) {
    const bases = [root, realOrSelf(root)];
    if (home)
        bases.push(join(home, FUSION_TMP_BASE), realOrSelf(join(home, FUSION_TMP_BASE)));
    const spared = bases.map(folded);
    const paths = systemTempTokens(command).filter((t) => !spared.some((b) => folded(t) === b || folded(t).startsWith(b + "/")));
    const bare = [...command.matchAll(MKTEMP)].filter((m) => bareMktemp(m[1])).map((m) => `mktemp${m[1]}`.trim());
    return [...new Set([...paths, ...bare])];
}
/** The tracker's one sentence for a non-empty `systemTempMentions`. */
export function tempSentence(mentions) {
    return (`fusion: this command names ${mentions.map((m) => `\`${m}\``).join(", ")} in the system temp directory, ` +
        "where files are lost at a reboot. Write intermediate files under the directory " +
        "`\"$FUSION_PLUGIN_ROOT/bin/fusion-tmp\" path` prints, and give `mktemp` a template there " +
        "(`rules/fusion-workbench-conventions.md` `## Intermediate files`). Nothing was blocked.");
}
/**
 * The session-start line, or `null`: no checkout id or no `$HOME` (the
 * question is then undecidable), or both variables already resolve to
 * `~/.fusion-tmp/<id>`. It reads the environment the hook was started with,
 * so a sandbox's replaced Bash `TMPDIR` is invisible to it.
 */
export function tempRootLine(env, home, id) {
    if (!id || !home)
        return null;
    const want = join(home, FUSION_TMP_BASE, id);
    const wanted = realOrSelf(want);
    const off = ["CLAUDE_CODE_TMPDIR", "TMPDIR"].flatMap((name) => {
        const v = env[name];
        if (!v)
            return [`${name} is unset`];
        return realOrSelf(v) === wanted ? [] : [`${name} is ${v}`];
    });
    if (off.length === 0)
        return null;
    return `fusion: start sessions with \`fusion\` rather than \`claude\`: ${off.join(", ")}, so temp files go where a reboot empties them; both should name ${want}.`;
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
