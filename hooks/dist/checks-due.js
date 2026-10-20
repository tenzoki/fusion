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
import { dueChecks, pluginVersion } from "./lib/checks-due.js";
import { exitZeroOnStdoutEpipe } from "./lib/fail-open.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
// The reader may close stdout first; see exitZeroOnStdoutEpipe.
exitZeroOnStdoutEpipe();
function main(argv) {
    if (argv.length !== 1) {
        process.stderr.write("usage: checks-due.js <plugin-root>\n");
        return 1;
    }
    const version = pluginVersion(argv[0]);
    const root = findWorkbenchRoot();
    let line;
    if (version === null)
        line = "checks_due=unread (plugin version unreadable)";
    else if (root === null)
        line = "checks_due=unread (no workbench above the working directory)";
    else
        line = `checks_due=${dueChecks(root, version).join(",") || "none"}`;
    process.stdout.write(line + "\n");
    return 0;
}
process.exitCode = main(process.argv.slice(2));
