/**
 * Compliance Guard — PreToolUse hook for Claude Code.
 *
 * The hook decides nothing. It receives the four write tools
 * (Write/Edit/MultiEdit/NotebookEdit), Bash, and the sub-agent dispatch tool
 * (Task/Agent), allows every one of them, and exists for three products:
 *
 *   1. The write trace — one `guard_allow` row per write-tool call in
 *      `.guard-state/events.jsonl`. That log is what the monitor's panel
 *      renders, and it is the only record of what the write surface did.
 *   2. The configuration diagnostic — one `guard_advisory` per problem the
 *      config loader hands back, on every guarded call, Bash included, for as
 *      long as the project's configuration file is broken or names a retired
 *      key.
 *   3. The dispatch trace (v10.8.0) — one machine-written `task_start` row in
 *      `fusion-workbench/orchestrator-events.jsonl` per sub-agent dispatch,
 *      while an orchestrator session is in flight. `lib/orchestrator-events.ts`
 *      carries the schema, the identity resolution and the gate, and why the
 *      row moved from a prompt mandate to a writer that cannot forget.
 *      Dispatch calls take this branch alone: they are not "guarded calls", so
 *      they see no configuration diagnostic and write no guard state.
 *
 * The name is historical and is kept because the event vocabulary, the state
 * directory and the monitor panel all carry it. Nothing here guards anything.
 *
 * Protocol: reads JSON from stdin, writes JSON to stdout.
 *   Allow: {}
 * There is no second verdict. Every path through `main` writes `{}`.
 *
 * ## What this hook used to check, and when each half went
 *
 * Written in the past tense and kept rather than deleted: a reader arriving
 * from an older tree, an older README, or an existing `events.jsonl` full of
 * `guard_block` and `guard_halt` rows needs somewhere to land.
 *
 *   - **Protected paths.** A deny reading `guard.protectedPaths`, softened by
 *     one exemption (`FUSION_ALLOW_RULES_WRITE`) and backed by a fingerprint of
 *     every protected path taken here and compared again in `tracker.ts`, with
 *     anything that moved written back. Removed 2026-08-12: in roughly 450
 *     records across this project and its largest consumer there was no
 *     instance of the failure it existed to prevent, and it stood down in
 *     fusion's own tree — the only tree whose patterns name what they say they
 *     name — from the first public release.
 *   - **The halt (CHECK 1) and the decision-governed escalation (CHECK 3).**
 *     CHECK 1 blocked every write while a halt was active. CHECK 3 blocked a
 *     write into a path matched by `guard.categoryPaths` at `high` sensitivity
 *     and counted the block toward the halt threshold. Once the protected-path
 *     half was gone, CHECK 3 was the only thing left that could raise a halt,
 *     and it was inert in every shipped configuration layer — so the halt was
 *     reachable only through a check that shipped switched off. Both went on
 *     2026-08-16, with `lib/escalation.ts` and `clear-halt.ts` behind them. A
 *     halt flag left in a consuming project's `escalation.json` by either
 *     mechanism blocks nothing at this version; `/fusion:setup` offers to
 *     delete the file.
 *   - **The fusion-repository stand-down.** `isFusionPluginCwd()` allowed every
 *     write when the working directory was the plugin's own repository, so a
 *     fusion developer could edit the files the protected-path deny covered. It
 *     outlived that deny by four days and was standing down only the two checks
 *     above, neither of which it was built for. It went with them on
 *     2026-08-16, which is why the guard now behaves identically in this tree
 *     and in a consuming project.
 *
 * Two policies before those read the *text* of a Bash command and asked the
 * same undecidable question of it: a classifier predicting whether a command
 * was about to write a protected path (retired 2026-08-07), and a branch policy
 * predicting whether a command was about to move HEAD (deleted 2026-08-09,
 * after five patches in one afternoon, 24 consecutive false blocks against the
 * agents' own verification commands, and no recorded true positive). Nothing
 * about a Bash command has been read here since.
 *
 * Ported from fusion/reactor/pkg/guard/decision_guard.go.
 *
 * ## The verdict is still written before it is recorded
 *
 * There is no bare `allow()` after a state write anywhere below. The one site
 * that reports goes through `answer` from lib/fail-open.ts — the verdict first,
 * then the event row as a guarded report — and the diagnostic loop, which
 * cannot be moved after the verdict, goes through `bestEffort`. That ordering
 * mattered most when a report could throw away a deny; it is kept now because
 * a report that throws must not cost the hook its stdout, which is how the
 * guard exits 1 with an empty verdict and stalls the tool call. That module's
 * header carries the class, the measurements and the records.
 */
export {};
