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

import { writeFileSync } from "node:fs";
import { join } from "node:path";

type Lib = typeof import("./lib/campaign.js");
type Cutter = typeof import("./lib/campaign-cut.js");
type Writes = typeof import("./lib/campaign-write.js");
type Cycle = typeof import("./lib/campaign-sync.js");
type Readers = Lib & { findWorkbenchRoot: typeof import("./lib/workbench-root.js").findWorkbenchRoot; legacyLine: typeof import("./lib/record-index.js").legacyLine; notReadLine: typeof import("./lib/record-index.js").notReadLine; bundleMissing: typeof import("./lib/record-index.js").bundleMissing; cutter: Cutter; writes: Writes; cycle: Cycle };

const USAGE = [
  "usage: fusion-campaign overview [--window <hours>] [--ref <upstream>]",
  "       fusion-campaign cut --checkouts <N> [--tolerance <k>]",
  "       fusion-campaign sync",
  "       fusion-campaign open --id <YYMMDD-HHMM-slug> --objective <text> --authorisation <citation> [--stop <text>]...",
  "       fusion-campaign lanes --from <proposal file> [--assign <lane>=<hex>]... [--campaign <id>]",
  "       fusion-campaign pause --reason <text> [--campaign <id>]",
  "       fusion-campaign resume [--campaign <id>]",
  "       fusion-campaign move <package> --to <lane> [--campaign <id>]",
  "       fusion-campaign reassign <lane> --checkout <hex> [--campaign <id>]",
  "       fusion-campaign end --outcome completed|bounded|failed|cancelled [--reason <text>] [--objective-met] [--intake-closed] [--all-attempts-terminal] [--final-audit-passed] [--watermark <text>] [--audit-ref <text>] [--campaign <id>]",
  "The header of bin/fusion-campaign is the authoritative documentation.",
].join("\n");

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

/** `sync`'s own two states, rows 10 and 11 of the table; `ok` is 0. */
const SYNC_EXIT = { ok: 0, conflict: 10, rejected: 11 } as const;

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

/** The imbalance tolerance where the caller names none: one member above `ceil(members / N)`. */
const DEFAULT_TOLERANCE = 1;

interface CutArgs {
  checkouts: number;
  tolerance: number;
}

/** `--checkouts <N>`, required, a whole number above zero; `--tolerance <k>`, a whole number from zero; each at most once. */
function parseCut(argv: string[]): CutArgs | null {
  const p = parseFlags(argv, ["--checkouts", "--tolerance"], [], [], 0);
  const checkouts = p?.values.get("--checkouts")?.[0];
  const tolerance = p?.values.get("--tolerance")?.[0] ?? String(DEFAULT_TOLERANCE);
  if (p === null || checkouts === undefined || !/^[1-9][0-9]{0,5}$/.test(checkouts) || !/^(0|[1-9][0-9]{0,5})$/.test(tolerance)) return null;
  return { checkouts: Number(checkouts), tolerance: Number(tolerance) };
}

/* ------------------------------------------------------------------ *
 * The writes' arguments
 * ------------------------------------------------------------------ */

type Act = import("./lib/campaign-write.js").Act;
type Outcome = import("./lib/campaign-write.js").Outcome;
const WRITES = new Set(["open", "lanes", "pause", "resume", "move", "reassign", "end"]);
const EVIDENCE_FLAGS = ["--objective-met", "--intake-closed", "--all-attempts-terminal", "--final-audit-passed"] as const;

/**
 * Flags into a map: a value flag takes the next word (never one beginning
 * with a dash), a boolean flag none; `repeatable` flags collect, every other
 * flag is given at most once. `positional` words are what precedes the first
 * flag. Null on an unknown flag, a missing value or a repeat.
 */
function parseFlags(argv: string[], valued: readonly string[], boolean: readonly string[], repeatable: readonly string[], positionals: number): { values: Map<string, string[]>; positional: string[] } | null {
  const values = new Map<string, string[]>();
  const positional: string[] = [];
  let i = 0;
  while (i < argv.length && !argv[i].startsWith("-") && positional.length < positionals) positional.push(argv[i++]);
  if (positional.length !== positionals) return null;
  for (; i < argv.length; i += 1) {
    const flag = argv[i];
    const has = values.has(flag);
    if (boolean.includes(flag)) {
      if (has) return null;
      values.set(flag, []);
    } else if (valued.includes(flag)) {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("-") || (has && !repeatable.includes(flag))) return null;
      values.set(flag, [...(values.get(flag) ?? []), value]);
      i += 1;
    } else return null;
  }
  return { values, positional };
}

/** The act `command` and `argv` spell, or null for a usage error. */
function parseWrite(command: string, argv: string[], writes: Writes): Act | null {
  const one = (m: Map<string, string[]>, flag: string): string | null => m.get(flag)?.[0] ?? null;
  const campaign = (m: Map<string, string[]>): string | null => one(m, "--campaign");
  switch (command) {
    case "open": {
      const p = parseFlags(argv, ["--id", "--objective", "--authorisation", "--stop"], [], ["--stop"], 0);
      const id = p && one(p.values, "--id");
      const objective = p && one(p.values, "--objective");
      const authorisation = p && one(p.values, "--authorisation");
      if (p === null || id === null || objective === null || authorisation === null || !writes.CAMPAIGN_ID.test(id) || objective === "" || authorisation === "") return null;
      return { act: "open", id, objective, authorisation, stops: p.values.get("--stop") ?? [] };
    }
    case "lanes": {
      const p = parseFlags(argv, ["--from", "--assign", "--campaign"], [], ["--assign"], 0);
      const from = p && one(p.values, "--from");
      if (p === null || from === null || from === "") return null;
      const assign: Record<string, string> = {};
      for (const entry of p.values.get("--assign") ?? []) {
        const eq = entry.indexOf("=");
        const [lane, hex] = [entry.slice(0, eq), entry.slice(eq + 1)];
        if (eq <= 0 || !writes.CHECKOUT_HEX.test(hex) || lane in assign) return null;
        assign[lane] = hex;
      }
      return { act: "lanes", campaign: campaign(p.values), from, assign };
    }
    case "pause": {
      const p = parseFlags(argv, ["--reason", "--campaign"], [], [], 0);
      const reason = p && one(p.values, "--reason");
      if (p === null || reason === null || reason === "") return null;
      return { act: "pause", campaign: campaign(p.values), reason };
    }
    case "resume": {
      const p = parseFlags(argv, ["--campaign"], [], [], 0);
      return p === null ? null : { act: "resume", campaign: campaign(p.values) };
    }
    case "move": {
      const p = parseFlags(argv, ["--to", "--campaign"], [], [], 1);
      const to = p && one(p.values, "--to");
      if (p === null || to === null || to === "") return null;
      return { act: "move", campaign: campaign(p.values), package: p.positional[0], to };
    }
    case "reassign": {
      const p = parseFlags(argv, ["--checkout", "--campaign"], [], [], 1);
      const checkout = p && one(p.values, "--checkout");
      if (p === null || checkout === null || !writes.CHECKOUT_HEX.test(checkout)) return null;
      return { act: "reassign", campaign: campaign(p.values), lane: p.positional[0], checkout };
    }
    case "end": {
      const p = parseFlags(argv, ["--outcome", "--reason", "--watermark", "--audit-ref", "--campaign"], EVIDENCE_FLAGS, [], 0);
      const outcome = p && one(p.values, "--outcome");
      if (p === null || outcome === null || !(writes.OUTCOMES as readonly string[]).includes(outcome)) return null;
      const evidenceGiven = [...EVIDENCE_FLAGS, "--watermark", "--audit-ref"].some((f) => p.values.has(f));
      // The evidence belongs to `completed` alone; stating it on another outcome is a usage error, not a silently dropped flag.
      if (outcome !== "completed" && evidenceGiven) return null;
      const evidence = outcome === "completed" ? { objective_met: p.values.has("--objective-met"), intake_closed: p.values.has("--intake-closed"), all_attempts_terminal: p.values.has("--all-attempts-terminal"), final_audit_passed: p.values.has("--final-audit-passed"), watermark: one(p.values, "--watermark"), audit_ref: one(p.values, "--audit-ref") } : null;
      return { act: "end", campaign: campaign(p.values), outcome: outcome as Outcome, reason: one(p.values, "--reason"), evidence };
    }
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * The two sub-command families
 * ------------------------------------------------------------------ */

const say = (line: string): void => void process.stderr.write(`fusion-campaign: ${line}\n`);

function overview(args: OverviewArgs, lib: Readers): number {
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

/** The cut: `readCutInput` over the working tree's workbench, `lib/campaign-cut.ts` at N, N+1 and N−1, the proposal file under what `bin/fusion-tmp path` prints, then the page. */
function cut(args: CutArgs, lib: Readers): number {
  const cwd = process.cwd();
  const root = lib.findWorkbenchRoot(cwd);
  if (root === null) {
    say(`no fusion workbench found above ${cwd}.`);
    return 3;
  }
  const workbench = join(root, "fusion-workbench");
  const read = lib.readCutInput(workbench);
  if (read.kind === "failed") {
    say(`${read.cause === "legacy" ? lib.legacyLine(workbench) : lib.notReadLine(read, workbench)} No cut was made.`);
    return read.cause !== "legacy" && lib.bundleMissing(read) ? 1 : 4;
  }
  const report = lib.cutter.cutReport(read.input, args.checkouts, args.tolerance);
  // Named by its parameters and not by the clock, so two runs over one store print the same bytes and the second replaces the first's file.
  const proposal = join(lib.tmpPath(cwd), `campaign-cut-${args.checkouts}-${args.tolerance}.json`);
  writeFileSync(proposal, JSON.stringify(lib.cutter.proposalOf(report.cut), null, 2) + "\n", "utf-8");
  process.stdout.write(lib.cutter.renderCut(report, read.input.nodes.length, proposal));
  return 0;
}

/** A steering write: the claim test, the sequence of `lib/campaign-write.ts`, then `path=` and `revision=` or the state that refused it. */
function steer(act: Act, lib: Readers): number {
  const cwd = process.cwd();
  const root = lib.findWorkbenchRoot(cwd);
  if (root === null) {
    say(`no fusion workbench found above ${cwd}.`);
    return 3;
  }
  const workbench = join(root, "fusion-workbench");
  const result = lib.writes.write(act, workbench, cwd);
  switch (result.kind) {
    case "written":
      process.stdout.write(`path=${result.path}\nrevision=${result.revision}\n`);
      return 0;
    case "holds-package":
      process.stdout.write(`state=holds-package\nheld=${result.detail.split("\n")[0]}\n`);
      say(`${result.detail}\nA steering act runs only from a checkout holding no claimed package. Nothing was written.`);
      return 8;
    case "refused":
      process.stdout.write(`state=refused\nrefused=${result.refusal.class}/${result.refusal.reason}\n`);
      say(`${act.act} was refused (${result.refusal.class}/${result.refusal.reason})${result.refusal.detail === undefined ? "" : `: ${result.refusal.detail}`}\nNothing was written.`);
      return 9;
    case "failed":
      say(`${result.cause === "legacy" ? lib.legacyLine(workbench) : lib.notReadLine(result, workbench)} Nothing was written.`);
      return result.cause !== "legacy" && lib.bundleMissing(result) ? 1 : 4;
  }
}

/** The commit-cycle read: the sequence of `lib/campaign-sync.ts`, then its page under `state=ok`, `conflict` or `rejected`. */
function syncCycle(lib: Readers): number {
  const cwd = process.cwd();
  const root = lib.findWorkbenchRoot(cwd);
  if (root === null) {
    say(`no fusion workbench found above ${cwd}.`);
    return 3;
  }
  const result = lib.cycle.sync(cwd, join(root, "fusion-workbench"));
  switch (result.kind) {
    case "no-ref": {
      const lines = [`state=${result.at.state}`];
      if (result.at.branch !== undefined) lines.push(`branch=${result.at.branch}`);
      if (result.at.ref !== undefined) lines.push(`ref=${result.at.ref}`);
      process.stdout.write(lines.join("\n") + "\n");
      return STATE_EXIT[result.at.state];
    }
    case "failed": {
      const where = `${result.head}:${result.rel}`;
      say(`${result.cause === "legacy" ? lib.legacyLine(where) : lib.notReadLine(result, where)} No campaign was read, no row written, nothing rebased or pushed.`);
      return result.cause !== "legacy" && lib.bundleMissing(result) ? 1 : 4;
    }
    case "synced":
      process.stdout.write(lib.cycle.renderSync(result));
      if (result.state === "conflict") say(`git rebase ${result.ref} stopped on ${result.conflicts.join(", ")} and was aborted; the user resolves it, nothing is forced.`);
      if (result.state === "rejected") process.stderr.write(result.rejection ?? "");
      return SYNC_EXIT[result.state];
  }
}

function main(argv: string[], lib: Readers): number {
  const [command, ...rest] = argv;
  if (command === "-h" || command === "--help" || command === "help") {
    process.stderr.write(`${USAGE}\n`);
    return 0;
  }
  const usage = (): number => {
    process.stderr.write(`fusion-campaign: ${command === undefined ? "no sub-command" : `unknown or malformed arguments ${JSON.stringify(argv.join(" "))}`}\n${USAGE}\n`);
    return 2;
  };
  if (command === "overview") {
    const args = parseOverview(rest);
    return args === null ? usage() : overview(args, lib);
  }
  if (command === "cut") {
    const args = parseCut(rest);
    return args === null ? usage() : cut(args, lib);
  }
  // `sync` takes no flag: it reads the branch's upstream, the orchestrator's cycle and nobody's named ref.
  if (command === "sync") return rest.length === 0 ? syncCycle(lib) : usage();
  if (command !== undefined && WRITES.has(command)) {
    const act = parseWrite(command, rest, lib.writes);
    return act === null ? usage() : steer(act, lib);
  }
  return usage();
}

// 1 is "the helper itself could not run": a module missing from an incomplete
// install, a sibling program or `git` failing where no state names it, a throw
// of the reader. The modules are imported inside the `try` for the first of
// those.
try {
  const [lib, cutter, writes, cycle, { findWorkbenchRoot }, { legacyLine, notReadLine, bundleMissing }, { exitZeroOnStdoutEpipe }] = await Promise.all([import("./lib/campaign.js"), import("./lib/campaign-cut.js"), import("./lib/campaign-write.js"), import("./lib/campaign-sync.js"), import("./lib/workbench-root.js"), import("./lib/record-index.js"), import("./lib/fail-open.js")]);
  exitZeroOnStdoutEpipe(); // the reader may close stdout first
  for (const [signal, code] of [["SIGINT", 130], ["SIGTERM", 143], ["SIGHUP", 129]] as const) process.on(signal, () => process.exit(code));
  process.exitCode = main(process.argv.slice(2), { ...lib, cutter, writes, cycle, findWorkbenchRoot, legacyLine, notReadLine, bundleMissing });
} catch (e) {
  const known = e instanceof Error && e.name === "HelperFailure";
  process.stderr.write(`fusion-campaign: ${known ? (e as Error).message : `an internal error stopped the campaign entry, a fusion bug or an incomplete install and not the workbench's.\n${e instanceof Error ? e.stack : String(e)}`}\nNothing was read or written.\n`);
  process.exitCode = 1;
}
