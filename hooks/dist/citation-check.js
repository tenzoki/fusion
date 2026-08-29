/**
 * The citation check over a consuming project, printed for a human or an agent.
 *
 * The grammar is `lib/citation-scan.ts`; this is its shipped caller, the one
 * decision `260828-0904_*_does-fusion-ship-a-citation-checker-to-consuming-projects.md`
 * asked for. Called through `bin/fusion-citation-check` by `/fusion:cleanup`
 * Step 8 and by anyone at a terminal.
 *
 * ## Corpus
 *
 * Every `.md` under the workbench except the frozen stores (`archive/`,
 * `stashes/`, `.migration-v2-backup/`), which the workbench gate excludes for
 * the same reason, plus at the directory the workbench root names: `CLAUDE.md`,
 * `rules/*.md`, `.claude/rules/*.md` and `docs/**\/*.md`, where present.
 * Workbench files are named `fusion-workbench/<rel>` in every row.
 *
 * ## Output, one `KEY=value` per line, then one row per violation
 *
 *   anchor=workbench-root
 *   root=<project directory>
 *   files=<n>            tokens=<n>          judged=<n>
 *   resolved=<n>         dangling=<n>        store-prefixed=<n>
 *   undecidable=<n>      exempt=<n>
 *   verdict=clean|violations
 *     <file>:<line>  '<token>'  <status>  <problem>
 *
 * `judged` is every token the gate reads (`GATE_KINDS`, resolved or not);
 * `dangling` counts `dangling` and `stale-marker` together, the two ways a
 * pointer fails to find its record; `store-prefixed` is the spelling the
 * storeless form retired; `undecidable` is the bare stamps and the ambiguous
 * tokens, which no reader of the token can settle and which reach no verdict.
 * `verdict=violations` when dangling + store-prefixed > 0. `--undecidable`
 * adds one row per undecidable token after the violations.
 *
 * It decides nothing per line about pointer versus statement: a citation
 * inside a fenced code block or a blockquote is exempt, and that fencing is
 * the whole of the distinction (`rules/fusion-workbench-conventions.md`
 * `## Filename Patterns`). There is no `--fix`: the rewriter is
 * `citation-sweep.ts` through `bin/fusion-citation-sweep`, run by hand after
 * reading its census and behind its own three guards.
 *
 * ## Exit codes
 *
 *   0  the check ran. `verdict=` says what it found — a violation is a line
 *      of output and never an exit code, for the reason `bin/fusion-review-coverage`
 *      gives at the same place (issue `260810-0710_*_the-drift-checks-last-line-makes-the-whole-block-exit-non-zero-when-no-circle-is-active.md`).
 *   1  usage error.
 *   2  no fusion workbench above the working directory; nothing to check.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { createScanner, markdownFilesUnder, partition, GATE_KINDS, } from "./lib/citation-scan.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
import { exitZeroOnStdoutEpipe } from "./lib/fail-open.js";
// The reader may close stdout first; see exitZeroOnStdoutEpipe.
exitZeroOnStdoutEpipe();
const USAGE = "usage: fusion-citation-check [--undecidable]";
const FROZEN_PREFIXES = ["archive/", "stashes/", ".migration-v2-backup/"];
/** The project-side files the check reads beside the workbench. */
function projectFiles(root) {
    const out = [];
    const claude = join(root, "CLAUDE.md");
    if (existsSync(claude))
        out.push({ rel: "CLAUDE.md", abs: claude });
    for (const dir of ["rules", ".claude/rules"]) {
        const abs = join(root, dir);
        if (!existsSync(abs))
            continue;
        for (const f of readdirSync(abs).sort()) {
            if (f.endsWith(".md"))
                out.push({ rel: `${dir}/${f}`, abs: join(abs, f) });
        }
    }
    for (const f of markdownFilesUnder(join(root, "docs")))
        out.push({ rel: `docs/${f.rel}`, abs: f.abs });
    return out;
}
function row(h) {
    return `  ${h.file}:${h.line}  '${h.token}'  ${h.status}  ${h.problem ?? ""}`.trimEnd();
}
function main(argv) {
    let undecidable = false;
    for (const a of argv) {
        if (a === "--undecidable")
            undecidable = true;
        else {
            process.stderr.write(`fusion-citation-check: unknown argument ${JSON.stringify(a)}\n${USAGE}\n`);
            return 1;
        }
    }
    const root = findWorkbenchRoot();
    if (root === null) {
        process.stderr.write("fusion-citation-check: no fusion workbench above the working directory — nothing to check.\n");
        return 2;
    }
    const workbenchRoot = join(root, "fusion-workbench");
    const scanner = createScanner(workbenchRoot);
    const files = [
        ...markdownFilesUnder(workbenchRoot)
            .filter((f) => !FROZEN_PREFIXES.some((p) => f.rel.startsWith(p)))
            .map((f) => ({ rel: `fusion-workbench/${f.rel}`, abs: f.abs })),
        ...projectFiles(root),
    ];
    const hits = [];
    for (const f of files) {
        const lines = readFileSync(f.abs, "utf-8")
            .split("\n")
            .map((text, i) => ({ line: i + 1, text }));
        hits.push(...scanner.scanCitationTokens(f.rel, lines));
    }
    const p = partition(hits);
    const storePrefixed = p.dangling.filter((h) => h.status === "store-prefixed");
    const dangling = p.dangling.filter((h) => h.status !== "store-prefixed");
    const judged = hits.filter((h) => h.status !== "exempt" && GATE_KINDS.includes(h.kind));
    const violations = [...dangling, ...storePrefixed].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
    const out = [
        "anchor=workbench-root",
        `root=${relative(process.cwd(), root).split(sep).join("/") || "."}`,
        `files=${files.length}`,
        `tokens=${hits.length}`,
        `judged=${judged.length}`,
        `resolved=${p.resolved.length}`,
        `dangling=${dangling.length}`,
        `store-prefixed=${storePrefixed.length}`,
        `undecidable=${p.undecidable.length}`,
        `exempt=${p.exempt.length}`,
        `verdict=${violations.length > 0 ? "violations" : "clean"}`,
    ];
    for (const h of violations)
        out.push(row(h));
    if (undecidable)
        for (const h of p.undecidable)
            out.push(row(h));
    process.stdout.write(out.join("\n") + "\n");
    return 0;
}
process.exitCode = main(process.argv.slice(2));
