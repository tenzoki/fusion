/**
 * The orchestrator's Phase-2 Turn budget, resolved and printed for a prompt to
 * read at Setup.
 *
 * ## Why this is a program rather than a number in a prompt
 *
 * `agents/orchestrator.md` used to WRITE the budget out — `5`, in seven places
 * and four spellings ("Maximum 5 Turns", "`**Turn:** <N>/5`", "the existing
 * 5-Turn circuit breaker", "`max_turns` (default 5)", a circuit-breaker table
 * row, a YAML schema line, a dashboard example). No project could change it, and
 * one of the seven already called it a "default", which implied a source that
 * could override it. None existed, so the word was false (issue `260811-1712`).
 *
 * A prompt cannot merge three configuration layers, so the budget had to become
 * something the prompt READS. This is that read: one call at Setup, one line of
 * output, and the orchestrator carries the answer in `agentstate.yaml` where
 * `progress.max_turns` already had a home and where `/fusion:circle-stash`
 * already read it as data rather than assuming a number.
 *
 * ## Where the value comes from
 *
 * `hooks/lib/config.ts`, unchanged in mechanism: the project's
 * `fusion-guard.json`, then the plugin's `hooks/config.json`, then the built-in
 * `DEFAULTS`, merged per leaf. `fusion-guard.json` is the per-project surface a
 * project already has — git-tracked, reviewed in a diff, wrong values dropped
 * and named — so reusing it was the requirement, not inventing a second file
 * for one integer.
 *
 * A project declares a different budget with:
 *
 *   {"orchestrator": {"maxTurns": 12}}
 *
 * A value that is not a whole number of 1 or more is dropped, NAMED on stderr,
 * and inherits the default — the loader's standing drop-and-advise behaviour,
 * surfaced here rather than swallowed, because this is the one call that reads
 * it and a silent drop hands the session a budget nobody chose.
 *
 * ## Output and exits
 *
 * One `KEY=value` line on stdout, in the shape `bin/fusion-paths`,
 * `bin/fusion-count-sources` and `bin/fusion-churn-rank` use:
 *
 *   max_turns=5
 *
 * Diagnostics, if any, go to stderr, one per line, and do not change the exit
 * code: the budget is still resolved, from the layer the dropped key would have
 * overridden.
 *
 * Exit codes:
 *   0  resolved
 *   1  usage error
 *   2  no fusion workbench above the working directory
 *
 * Exit 2 rather than "print the plugin default anyway": without a workbench root
 * there is no project layer, so a project that declared 12 would be told 5, and
 * a wrong budget stated confidently is worse than no budget. The caller's own
 * unresolved branch handles it.
 */
export {};
