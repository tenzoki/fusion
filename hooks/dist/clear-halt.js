/**
 * Clear halt mode — manual reset utility.
 *
 * Run it from the project whose guard is halted:
 *   cd <project-root> && node ${CLAUDE_PLUGIN_ROOT}/hooks/dist/clear-halt.js
 *
 * ## Why the working directory is load-bearing
 *
 * The halt is PROJECT-scoped. It lives in
 * `<project-root>/fusion-workbench/.guard-state/escalation.json`, and
 * `lib/escalation.ts` finds that file by walking up from the working
 * directory. The command is spelled plugin-scoped, which invites running it
 * from anywhere at all.
 *
 * Until issue 260805-1134 this script did not notice the difference. It called
 * `loadEscalation()` straight away; with no workbench above the cwd that
 * returns the EMPTY state, the empty state is not halted, and the script
 * printed `Guard is not halted. No action needed.` — measured from a home
 * directory while the project's own state still read `haltActive: true,
 * consecutiveBlocks: 3`, unchanged after the run.
 *
 * The output was not false. It answered a different question than the one
 * asked: "is anything halted where I am standing?" rather than "is the halt I
 * came to clear gone?". A tool reporting normal operation while having done
 * nothing is the failure class this guard work spent the week closing, so the
 * two cases are separated BEFORE the state is loaded — "no workbench above
 * <cwd>" exits non-zero and says which directory it searched from, and every
 * other line names the workbench it actually read.
 */
import { resolve } from "node:path";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
import { loadEscalation, saveEscalation, clearHalt, isHalted, } from "./lib/escalation.js";
import { emitEvent } from "./lib/events.js";
/**
 * The same locator `lib/escalation.ts` resolves the state path through — not a
 * second implementation of "is this project fusion-set-up, and where". Asking
 * the one question once means this check can never disagree with the load that
 * follows it.
 */
const root = findWorkbenchRoot();
if (root === null) {
    // stderr and a non-zero exit, because a tool that found nothing has not
    // succeeded. Both directories are named: the one that was searched from, and
    // the shape of the one that should have been.
    const self = process.argv[1]
        ? resolve(process.argv[1])
        : "<plugin-root>/hooks/dist/clear-halt.js";
    console.error(`No fusion workbench found above ${process.cwd()}.`);
    console.error("Nothing here could record a halt, so nothing was checked — this is not a report that the guard is clear.");
    console.error("A halt is project-scoped: it lives in <project-root>/fusion-workbench/.guard-state/escalation.json,");
    console.error("found by walking up from the working directory. Run this again from the project whose guard is halted:");
    console.error(`  cd <project-root> && node ${self}`);
    process.exit(1);
}
console.log(`Workbench: ${resolve(root, "fusion-workbench")}`);
const state = loadEscalation();
if (!isHalted(state)) {
    // "in this project", never a bare "not halted": the answer is only ever about
    // the workbench named on the line above.
    console.log("Guard is not halted in this project. No action needed.");
    process.exit(0);
}
console.log(`Halt active. Consecutive blocks: ${state.consecutiveBlocks}`);
console.log("Recent events:");
for (const e of state.recentEvents.slice(-5)) {
    console.log(`  [${e.level}] ${e.trigger}: ${e.message}`);
}
clearHalt(state);
saveEscalation(state);
// No `failOpen` here, and the difference is not an oversight. This is a manual
// tool a human runs, not a hook: it owes Claude Code no verdict on stdout, and a
// run that could not do its job must exit non-zero with the stack trace rather
// than print a reassuring line. Every failure above this point is exactly that —
// the state could not be read or could not be written, so the halt is still
// there and the human needs to see why.
//
// What DOES carry over from the hooks is the half about reporting: the event row
// is a best-effort note about work already finished, and it must not be able to
// withdraw the confirmation of that work. `saveEscalation` has returned, so the
// halt IS cleared; an unwritable `.guard-state/` from here on costs the log line
// and nothing else.
try {
    emitEvent("halt_cleared", undefined, undefined, "Manual halt clear via clear-halt.ts");
}
catch (error) {
    console.error(`Note: the halt was cleared, but the event log could not be written: ${String(error)}`);
}
console.log("\nHalt cleared. Guard will resume normal operation.");
