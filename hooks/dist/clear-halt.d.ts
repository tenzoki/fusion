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
export {};
