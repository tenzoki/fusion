/**
 * The churn ranking, printed for a human or an agent to read.
 *
 * ## Why this is a program rather than a paragraph
 *
 * The orchestrator's Setup used to READ `fusion-workbench/.guard-state/churn.json`
 * and note the high-thrash files itself. The map keeps every file it has ever
 * seen — `recordChange` only adds and `resetSession` keeps `totalChanges` on
 * purpose — so what that read surfaced was led by files that had been deleted,
 * renamed or moved, and (before the anchor moved) by keys spelled against a
 * working directory the reader could not reconstruct. Three of the top four
 * entries in this repository named files that were not there (issue
 * `260809-2023`).
 *
 * Decision `260810-0920` part (c) keeps every entry and excludes the absent ones
 * from the ranking the reader sees, on the READ path — once per Setup rather
 * than once per tool call. A read path that has to apply a rule is a program;
 * asking a reader to stat 600 keys by hand is how the rule stops being applied.
 *
 * Read-only. It does not save the migration `loadChurn` may have run in memory —
 * a helper that reports a ranking must not rewrite the state it reports on. The
 * tracker persists it on the next tracked write.
 *
 * Output, one `KEY=value` per line in the shape `bin/fusion-paths` and
 * `bin/fusion-count-sources` use, then one line per ranked file:
 *
 *   anchor=workbench-root
 *   entries=590
 *   absent=367
 *   ranked=10
 *   score=53 total=147 session=0 path=hooks/lib/churn.ts
 *
 * Exit codes:
 *   0  ranked (an empty ranking is a ranking — a project with no churn yet)
 *   1  usage error
 *   2  no fusion workbench above the working directory; nothing to rank
 */
import { loadChurn, rankThrashing, KEY_ANCHOR } from "./lib/churn.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
/** Enough to see a pattern, short enough to read in a Setup summary. */
const DEFAULT_LIMIT = 10;
const USAGE = "usage: fusion-churn-rank [--limit <n>]   (--limit 0 = all)";
/**
 * Parse argv, or throw the usage error.
 *
 * Not exported: `main` runs at module load, exactly as the three hook entry
 * points do, so importing this file to reach a function would run the program.
 * The test spawns it instead, which is also the only way to give it a working
 * directory.
 */
function parseArgs(argv) {
    let limit = DEFAULT_LIMIT;
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--limit") {
            const value = argv[++i];
            if (value === undefined)
                throw new Error("--limit needs a number");
            limit = readLimit(value);
            continue;
        }
        if (arg.startsWith("--limit=")) {
            limit = readLimit(arg.slice("--limit=".length));
            continue;
        }
        throw new Error(`unknown argument ${JSON.stringify(arg)}`);
    }
    return { limit };
}
function readLimit(value) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0) {
        throw new Error(`--limit must be a non-negative integer, got ${JSON.stringify(value)}`);
    }
    return n;
}
function main(argv) {
    let options;
    try {
        options = parseArgs(argv);
    }
    catch (err) {
        process.stderr.write(`fusion-churn-rank: ${err.message}\n${USAGE}\n`);
        return 1;
    }
    const root = findWorkbenchRoot();
    if (root === null) {
        process.stderr.write(`fusion-churn-rank: no fusion workbench found above ${process.cwd()} — run /fusion:setup at the project root.\n`);
        return 2;
    }
    const ranking = rankThrashing(loadChurn(), root, options.limit);
    const lines = [
        `anchor=${KEY_ANCHOR}`,
        `entries=${ranking.entries}`,
        `absent=${ranking.absent}`,
        `ranked=${ranking.ranked.length}`,
        ...ranking.ranked.map(({ path, stats }) => `score=${stats.thrashingScore} total=${stats.totalChanges} ` +
            `session=${stats.changesThisSession} path=${path}`),
    ];
    process.stdout.write(lines.join("\n") + "\n");
    return 0;
}
process.exitCode = main(process.argv.slice(2));
