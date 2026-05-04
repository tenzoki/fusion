/**
 * Clear halt mode — manual reset utility.
 *
 * Run when the guard has halted and you want to resume:
 *   node ${CLAUDE_PLUGIN_ROOT}/hooks/dist/clear-halt.js
 */
import { loadEscalation, saveEscalation, clearHalt, isHalted } from "./lib/escalation.js";
import { emitEvent } from "./lib/events.js";
const state = loadEscalation();
if (!isHalted(state)) {
    console.log("Guard is not halted. No action needed.");
    process.exit(0);
}
console.log(`Halt active. Consecutive blocks: ${state.consecutiveBlocks}`);
console.log("Recent events:");
for (const e of state.recentEvents.slice(-5)) {
    console.log(`  [${e.level}] ${e.trigger}: ${e.message}`);
}
clearHalt(state);
saveEscalation(state);
emitEvent("halt_cleared", undefined, undefined, "Manual halt clear via clear-halt.ts");
console.log("\nHalt cleared. Guard will resume normal operation.");
