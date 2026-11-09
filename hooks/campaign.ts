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

import { join } from "node:path";

type Lib = typeof import("./lib/campaign.js");
type Readers = Lib & { findWorkbenchRoot: typeof import("./lib/workbench-root.js").findWorkbenchRoot; legacyLine: typeof import("./lib/record-index.js").legacyLine; notReadLine: typeof import("./lib/record-index.js").notReadLine; bundleMissing: typeof import("./lib/record-index.js").bundleMissing };

const USAGE = "usage: fusion-campaign overview [--window <hours>] [--ref <upstream>]\nThe header of bin/fusion-campaign is the authoritative documentation.";

/** The overview window where the caller names none. Nothing stores one. */
const DEFAULT_WINDOW_HOURS = 24;

/** `state=` to exit code, for every state that is no answer; `bin/fusion-forum`'s table. */
const STATE_EXIT = {
  "no-work-tree": 5,
  "no-branch": 5,
  "no-upstream": 5,
  "upstream-unresolved": 5,
  "workbench-untracked": 5,
  "fetch-failed": 6,
  "workbench-outside-repo": 7,
} as const;

interface OverviewArgs {
  windowHours: number;
  ref: string | null;
}

/** `--window <hours>` and `--ref <upstream>`, each at most once, in either order; anything else is null. */
function parseOverview(argv: string[]): OverviewArgs | null {
  const args: OverviewArgs = { windowHours: DEFAULT_WINDOW_HOURS, ref: null };
  const seen = new Set<string>();
  for (let i = 0; i < argv.length; i += 2) {
    const [flag, value] = [argv[i], argv[i + 1]];
    if (value === undefined || seen.has(flag)) return null;
    seen.add(flag);
    if (flag === "--window" && /^[1-9][0-9]{0,5}$/.test(value)) args.windowHours = Number(value);
    // A ref beginning with a dash would be read by git as an option.
    else if (flag === "--ref" && value !== "" && !value.startsWith("-")) args.ref = value;
    else return null;
  }
  return args;
}

function overview(args: OverviewArgs, lib: Readers): number {
  const say = (line: string): void => void process.stderr.write(`fusion-campaign: ${line}\n`);
  const cwd = process.cwd();
  const root = lib.findWorkbenchRoot(cwd);
  if (root === null) {
    say(`no fusion workbench found above ${cwd}.`);
    return 3;
  }

  const at = lib.fetchRef(cwd, join(root, "fusion-workbench"), args.ref);
  if (at.state !== "ok") {
    const lines = [`state=${at.state}`];
    if (at.branch !== undefined) lines.push(`branch=${at.branch}`);
    if (at.ref !== undefined) lines.push(`ref=${at.ref}`);
    process.stdout.write(lines.join("\n") + "\n");
    return STATE_EXIT[at.state];
  }

  const read = lib.withScratch(cwd, (scratch) => lib.readOverview(at, lib.extractAt(at, lib.OVERVIEW_ENTRIES, scratch), cwd));
  if (read.kind === "failed") {
    // The extract is gone by now, so the workbench is named as git names it: the commit and the path in it.
    const where = `${at.head}:${at.rel}`;
    say(`${read.cause === "legacy" ? lib.legacyLine(where) : lib.notReadLine(read, where)} No overview was read.`);
    return read.cause !== "legacy" && lib.bundleMissing(read) ? 1 : 4;
  }
  process.stdout.write(lib.renderOverview(read.overview, args.windowHours, Date.now()));
  return 0;
}

function main(argv: string[], lib: Readers): number {
  const [command, ...rest] = argv;
  if (command === "-h" || command === "--help" || command === "help") {
    process.stderr.write(`${USAGE}\n`);
    return 0;
  }
  const args = command === "overview" ? parseOverview(rest) : null;
  if (args === null) {
    process.stderr.write(`fusion-campaign: ${command === undefined ? "no sub-command" : `unknown or malformed arguments ${JSON.stringify(argv.join(" "))}`}\n${USAGE}\n`);
    return 2;
  }
  return overview(args, lib);
}

// 1 is "the helper itself could not run": a module missing from an incomplete
// install, a sibling program or `git` failing where no state names it, a throw
// of the reader. The modules are imported inside the `try` for the first of
// those.
try {
  const [lib, { findWorkbenchRoot }, { legacyLine, notReadLine, bundleMissing }, { exitZeroOnStdoutEpipe }] = await Promise.all([import("./lib/campaign.js"), import("./lib/workbench-root.js"), import("./lib/record-index.js"), import("./lib/fail-open.js")]);
  exitZeroOnStdoutEpipe(); // the reader may close stdout first
  for (const [signal, code] of [["SIGINT", 130], ["SIGTERM", 143], ["SIGHUP", 129]] as const) process.on(signal, () => process.exit(code));
  process.exitCode = main(process.argv.slice(2), { ...lib, findWorkbenchRoot, legacyLine, notReadLine, bundleMissing });
} catch (e) {
  const known = e instanceof Error && e.name === "HelperFailure";
  process.stderr.write(`fusion-campaign: ${known ? (e as Error).message : `an internal error stopped the campaign entry, a fusion bug or an incomplete install and not the workbench's.\n${e instanceof Error ? e.stack : String(e)}`}\nNothing was read.\n`);
  process.exitCode = 1;
}
