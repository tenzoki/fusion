/**
 * The identity-scoped reading of `fusion-workbench/orchestrator-events.jsonl`,
 * printed for a human, a skill body or an agent prompt to read.
 *
 * The computation is `lib/events-query.ts`; this is its only caller, reached
 * through `bin/fusion-events`. **That script's header is the authoritative
 * documentation** — the usage block, the output shape and the exit table are
 * spelled there, as every other `bin/` helper's are, and this comment does not
 * restate them.
 *
 * ## What this file is for, given that the computation is elsewhere
 *
 * Three things the pure module deliberately does not do, and each is why the
 * split exists at all:
 *
 *   1. **It opens the log.** `findWorkbenchRoot` locates the workbench, exactly
 *      as `review-coverage.ts` and `staging-drift.ts` do, and the log is read
 *      at its one fixed root-relative path.
 *   2. **It reads `session.history_file`.** Through `lib/state-file.ts`, the
 *      shared flat read of `agentstate.yaml`, so `turns` cannot be pointed at a
 *      session that is not this one and there is no second reader of that file.
 *   3. **It receives the identity rather than obtaining it.** `PERSON` and
 *      `CHECKOUT` arrive in the environment from `bin/fusion-identity`, which
 *      the wrapper runs. Identity is obtained in exactly one place in the tree,
 *      and that place is not here. What *is* here is the one translation of
 *      that helper's exit vocabulary into what this program does about it:
 *      `resolveIdentity` below, which every branch reads instead of testing a
 *      code of its own. The checkout registry arrives the same way and for the
 *      same reason, as `FUSION_EVENTS_ROSTER`, and `readRoster` below is the
 *      one place its two maps are built.
 *
 * ## Reasons go to stderr, values to stdout
 *
 * stdout carries only figures that were taken. A figure that could not be taken
 * is **absent from stdout and named on stderr**, and the exit code says which
 * one it was. Nothing here prints a zero it did not measure: a presence report
 * that cannot read the log and says "nobody else has been here" is the one
 * failure this capability must not have, because a person reads it to decide
 * whether to activate a Circle.
 */
export {};
