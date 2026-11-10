/**
 * The campaign entry, behind `bin/fusion-campaign`: `overview [--window
 * <hours>] [--ref <upstream>]`, the two tiers of the overview above the
 * checkouts, `cut --checkouts <N> [--tolerance <k>]`, the lane proposal, the
 * seven steering writes `open`, `lanes`, `pause`, `resume`, `move`,
 * `reassign` and `end`, and `sync`, the commit-cycle read.
 *
 * `bin/fusion-campaign`'s header is the authoritative documentation of the
 * output, the state vocabulary and the exit table; `lib/campaign.ts` is the
 * overview's computation, `lib/campaign-cut.ts` the cut's,
 * `lib/campaign-write.ts` the writes' and `lib/campaign-sync.ts` the cycle's,
 * each header the account of its mechanism. This file parses the arguments,
 * finds the workbench above the working directory, and maps what the
 * computation answers onto stdout, stderr and an exit code.
 *
 * ## Stdout is whole or empty
 *
 * The text is rendered once the read has finished and written in one piece.
 * On every exit code but 0, 5, 6, 7, 8, 9, 10 and 11 stdout is empty and the
 * reason is on stderr; on 5, 6 and 7 it carries the `state=` line and what
 * was resolved before the read stopped, as `bin/fusion-forum` prints it; on 8
 * and 9 the `state=` line and the line that says why (`held=`, `refused=`),
 * the detail on stderr; on 10 and 11 the whole of `sync`'s page, `state=`
 * naming the stopped rebase or the push that did not land.
 *
 * ## The scratch directory survives no way out
 *
 * `withScratch` removes it in a `finally`. The whole run is synchronous, so a
 * signal handler registered here runs only after that `finally`; without a
 * handler, node's default for SIGINT ends the process at once and the extract
 * would stay behind.
 */
export {};
