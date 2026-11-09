/**
 * The campaign entry, behind `bin/fusion-campaign`. One sub-command at this
 * step: `overview [--window <hours>] [--ref <upstream>]`, the reduced tier of
 * the overview above the checkouts.
 *
 * `bin/fusion-campaign`'s header is the authoritative documentation of the
 * output, the state vocabulary and the exit table; `lib/campaign.ts` is the
 * computation and its header the account of the mechanism. This file parses
 * the arguments, finds the workbench above the working directory, and maps
 * what the computation answers onto stdout, stderr and an exit code.
 *
 * ## Stdout is whole or empty
 *
 * The text is rendered once the read has finished and written in one piece.
 * On every exit code but 0, 5, 6 and 7 stdout is empty and the reason is on
 * stderr; on 5, 6 and 7 it carries the `state=` line and what was resolved
 * before the read stopped, as `bin/fusion-forum` prints it.
 *
 * ## The scratch directory survives no way out
 *
 * `withScratch` removes it in a `finally`. The whole run is synchronous, so a
 * signal handler registered here runs only after that `finally`; without a
 * handler, node's default for SIGINT ends the process at once and the extract
 * would stay behind.
 */
export {};
