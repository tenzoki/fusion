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
export {};
