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
 *
 * ## Why there is a check AFTER the clear
 *
 * Same failure class, second entrance (issue 260809-2049). The merge in
 * `saveEscalation` adopts a halt found on disk only when it is NEWLY raised,
 * and "newly" is decided against the halt the caller was shown — which is
 * exactly right for the caller this script is, since an unconditional OR would
 * resurrect the halt the human just cleared. What that test cannot see is a
 * SECOND, unrelated halt raised between this script's load and its save: the
 * baseline is already true, so the new halt is not adopted and is written away,
 * while its `recentEvents` entry survives the append-merge. The record of the
 * halt ends up in the file with the halt itself gone, and the human reads
 * "Guard will resume normal operation" for a protected-path violation that
 * happened while they were reading the output.
 *
 * The merge is not the place to fix that — the rule it applies is the right
 * default and the identity that would let it tell the two halts apart is not in
 * the state. So this script re-reads the file it just wrote and compares the
 * halt events there against the ones it was holding. Anything it did not see is
 * named on stderr and the run exits non-zero INSTEAD of printing the success
 * line. The clear itself still happened, and nothing is re-raised: the point is
 * that the human is never told "normal operation" about a state this script did
 * not actually leave behind.
 */
import { resolve } from "node:path";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
import { loadEscalation, saveEscalation, clearHalt, isHalted, } from "./lib/escalation.js";
import { emitEvent } from "./lib/events.js";
/**
 * Identity for one recorded event, for the comparison below only.
 *
 * Every mutation in `escalation.ts` is an append and no field is ever rewritten,
 * so the recorded tuple IS the identity — there is no id to carry and none is
 * added here. Elements are not validated on load (see `coerceState`), so this
 * reads defensively: a garbage element yields a garbage key, which matches only
 * an identical garbage element, which is the right answer for both.
 */
function eventKey(e) {
    return JSON.stringify([
        e?.level ?? null,
        e?.trigger ?? null,
        e?.message ?? null,
        e?.timestamp ?? null,
        e?.toolName ?? null,
        e?.filePath ?? null,
    ]);
}
/**
 * The halt events in `now` that are not accounted for by `seen`.
 *
 * A multiset rather than a set difference: two halts can legitimately carry the
 * same trigger, message and timestamp, and treating the second one as "already
 * seen" would drop the very thing this check exists to surface.
 *
 * `seen` is the state as LOADED, not the five lines that were printed. A halt
 * event further back than the last five was still on disk when the human asked
 * for the clear, and the halt they asked to clear is the one it belongs to —
 * reporting it would be a refusal with nothing behind it, which is the worse
 * defect for a tool that runs when every write is already blocked.
 */
function unseenHaltEvents(seen, now) {
    const budget = new Map();
    for (const e of seen) {
        if (e?.level !== "halt")
            continue;
        const key = eventKey(e);
        budget.set(key, (budget.get(key) ?? 0) + 1);
    }
    const arrived = [];
    for (const e of now) {
        if (e?.level !== "halt")
            continue;
        const key = eventKey(e);
        const remaining = budget.get(key) ?? 0;
        if (remaining > 0) {
            budget.set(key, remaining - 1);
            continue;
        }
        arrived.push(e);
    }
    return arrived;
}
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
// What the file held when this run took its decision. Copied before `clearHalt`
// appends to the same array, and kept for the comparison after the save.
const seenEvents = state.recentEvents.slice();
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
// Re-read what is on disk NOW and compare it against what this run was holding.
// The read is the last thing that can go wrong and the clear is already done, so
// a failure here costs the check and nothing else — it must not be able to
// withdraw the confirmation of work that finished, the same reasoning the
// `emitEvent` above is wrapped for. A state file that has become unreadable
// loads as the empty state rather than throwing, which reports nothing arrived;
// that direction is deliberate, because a check that cannot see is not evidence
// of a problem and this tool runs when every write is already blocked.
let arrived = [];
let stillHalted = false;
try {
    const after = loadEscalation();
    arrived = unseenHaltEvents(seenEvents, after.recentEvents);
    stillHalted = isHalted(after);
}
catch (error) {
    console.error(`Note: the halt was cleared, but the state could not be re-read to check for a halt raised meanwhile: ${String(error)}`);
}
if (arrived.length > 0 || stillHalted) {
    // Exit 2, distinct from the 1 above: there the tool did nothing, here it did
    // its job and something else happened around it. Both are non-zero because
    // neither is the outcome the success line describes.
    console.error("\nThe halt you came to clear is cleared.");
    if (arrived.length > 0) {
        console.error(`But ${arrived.length} halt${arrived.length === 1 ? " was" : "s were"} raised while this ran, which you were not shown:`);
        for (const e of arrived) {
            const where = e?.filePath ? ` (${e.filePath})` : "";
            console.error(`  [${e?.level}] ${e?.trigger}: ${e?.message}${where}`);
        }
    }
    else {
        console.error("But the guard is halted again, by something raised while this ran.");
    }
    if (stillHalted) {
        console.error("The guard is still halted. Read what is named above, then run this again to clear it.");
    }
    else {
        console.error("That halt is not in effect either: the merge cannot tell a halt raised meanwhile from the one you were clearing, so it was written away with it.");
        console.error("Nothing is blocked right now — but the violation above happened. Read what it names; the next measured change to that path halts again.");
    }
    process.exit(2);
}
console.log("\nHalt cleared. Guard will resume normal operation.");
