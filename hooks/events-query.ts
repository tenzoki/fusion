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
 * Two things the pure module deliberately does not do, and each is why the
 * split exists at all:
 *
 *   1. **It opens the log.** `findWorkbenchRoot` locates the workbench, exactly
 *      as `review-coverage.ts` and `staging-drift.ts` do, and the log is read
 *      at its one fixed root-relative path.
 *   2. **It receives the identity rather than obtaining it.** `PERSON` and
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
 *
 * The `dispatches` subcommand's three `limit=` lines are the one departure, and
 * they are not an exception to the rule so much as a third class the rule had no
 * word for: they qualify figures that **were** taken. `DISPATCH_LIMITS` below
 * carries the reasoning.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  MEASURED_AGENTS,
  measureDispatchDurations,
  measurePresence,
  renderDispatch,
  renderParty,
  type ReadingIdentity,
} from "./lib/events-query.js";
import { exitZeroOnStdoutEpipe } from "./lib/fail-open.js";

// The reader may close stdout first; see exitZeroOnStdoutEpipe.
exitZeroOnStdoutEpipe();
import { findWorkbenchRoot } from "./lib/workbench-root.js";

const USAGE =
  "usage: fusion-events presence [--days N]\n" + //
  "       fusion-events dispatches [--minutes N] [--since YYYY-MM-DD]";

/** The log, at the one root-relative path every consumer reads it at. */
const LOG_REL = "fusion-workbench/orchestrator-events.jsonl";

const DEFAULT_DAYS = 7;

/**
 * The default floor of the `dispatches` reading, in UTC.
 *
 * It is the date the dispatch bound landed, and it stayed the floor after the
 * bound was retired on 2026-09-10 so that a reading taken today covers the same
 * window as the readings taken while the bound existed. `--since` overrides it,
 * and `--since 1970-01-01` reads the whole log.
 */
const DEFAULT_SINCE = "2026-09-08";

/**
 * The default cut point of the `dispatches` reading, in minutes.
 *
 * IT CONFIGURES NOTHING AND BOUNDS NOTHING. It is the figure `longer` is read
 * against, and `--minutes` replaces it; no project can set it, because the
 * setting that once did — `orchestrator.dispatchMinutes` — was retired with the
 * dispatch bound on 2026-09-10 and is now named by `hooks/lib/config.ts` as a
 * retirement rather than resolved as a value.
 *
 * The number is kept where the bound left it, and its measurement with it,
 * because either sentence alone reads as an arbitrary round figure. Over the
 * 131 machine-written dispatch pairs in this project's own event log, read on
 * 2026-09-07, 15 of them, 11.5 percent, ran longer than 20 minutes; over the
 * 114 of those pairs made by an agent the bound covered, 13, 11.4 percent, did.
 * Of four candidate values checked against the break-even arithmetic, 10, 20,
 * 25 and 30 minutes, 20 is the one that maximises the pessimistic cell, and the
 * break-even run length sits at 20.2 to 27.5 minutes, just past the figure
 * itself.
 *
 * The log the first sentence reads is
 * `fusion-workbench/orchestrator-events.jsonl`, on the date named in it, so a
 * later reader can re-take the figure. The second sentence is derived
 * arithmetic and comes from
 * `260907-2012-break-even-arithmetic-for-the-dispatch-split.md`; nothing else
 * in the tree reproduces the four-candidate check or the break-even band.
 */
const DEFAULT_THRESHOLD_MINUTES = 20;

function say(line: string): void {
  process.stderr.write(`fusion-events: ${line}\n`);
}

/* ------------------------------------------------------------------ *
 * The identity, as the wrapper handed it over
 * ------------------------------------------------------------------ */

function envValue(name: string): string | null {
  const v = process.env[name];
  return v === undefined || v === "" ? null : v;
}

/**
 * What `bin/fusion-identity` reported, resolved once and read from here by
 * every branch below.
 *
 * The wrapper passes that helper's exit code through untouched, so the reason a
 * half is missing is read off a number rather than guessed at from the missing
 * value. Its header is the authoritative table and this is the single
 * translation of it in this program.
 *
 * **Why the single point.** The vocabulary was read three different ways inside
 * one change: exit 1 as a halt in one place and as a degradation in another,
 * and exit 4 folded in with 3 and 5 as though nothing could be *read*, when
 * what it says is that nothing is *owed*. The helper's own header devotes a
 * section to why those codes must stay distinguishable, and a per-branch switch
 * is how they stop being. Records:
 * `260826-0135_*_a-tree-that-owes-no-git-identity-is-read-as-one-whose-identity-could-not-be-read.md`.
 */
interface IdentityStatus {
  /** The code as the wrapper passed it through; `null` if none reached us. */
  exit: number | null;
  /**
   * Whether a git identity is owed here at all.
   *
   * `false` **only** where the helper said so: its 4 (not a git work tree) and
   * its 5 (that, and the checkout identifier unresolved too). Every other code
   * is `true`, the codes that could not tell included — `nothing is owed` is
   * the stronger claim of the two, and a reader that could not establish it
   * reports a half as unread rather than as not owed.
   */
  identityOwed: boolean;
  /** The one sentence for stderr. Empty on exit 0, where nothing is missing. */
  note: string;
}

const IDENTITY_VOCABULARY = new Map<number, Omit<IdentityStatus, "exit">>([
  [0, { identityOwed: true, note: "" }],
  [
    1,
    {
      identityOwed: true,
      note: "fusion-identity halted: git could not be run, or user.name/user.email are unset.",
    },
  ],
  [
    3,
    {
      identityOwed: true,
      note: "fusion-identity could not resolve this checkout's identifier.",
    },
  ],
  [
    4,
    {
      identityOwed: false,
      note: "fusion-identity reports no git identity is owed here (not a git work tree).",
    },
  ],
  [
    5,
    {
      identityOwed: false,
      note:
        "fusion-identity reports this is not a git work tree, so no person is owed — and the " +
        "checkout identifier did not resolve either.",
    },
  ],
  [
    // The wrapper's sentinel for "the installed copy does not carry the
    // helper", which is the ordinary state of an install one release behind the
    // tree that added it. Nothing was asked, so nothing is known about the tree.
    127,
    {
      identityOwed: true,
      note: "bin/fusion-identity is missing — the plugin install does not carry it.",
    },
  ],
]);

function resolveIdentity(exit: number | null): IdentityStatus {
  if (exit === null) {
    return {
      exit,
      identityOwed: true,
      note: "no identity was passed in; run this through bin/fusion-events.",
    };
  }
  const known = IDENTITY_VOCABULARY.get(exit);
  if (known !== undefined) return { exit, ...known };
  return {
    exit,
    identityOwed: true,
    note: `fusion-identity exited ${exit}, which is not a code this reader knows.`,
  };
}

function readIdentity(): { identity: ReadingIdentity; status: IdentityStatus } {
  const raw = envValue("FUSION_EVENTS_IDENTITY_EXIT");
  const parsed = raw === null ? Number.NaN : Number.parseInt(raw, 10);
  return {
    identity: {
      person: envValue("FUSION_EVENTS_PERSON"),
      checkout: envValue("FUSION_EVENTS_CHECKOUT"),
    },
    status: resolveIdentity(Number.isInteger(parsed) ? parsed : null),
  };
}

/* ------------------------------------------------------------------ *
 * The checkout registry, as the wrapper handed it over
 * ------------------------------------------------------------------ */

/**
 * `bin/fusion-checkout-name roster` output, parsed into the two maps presence
 * needs: a git identity to the person who claims it, and a hex to its alias.
 *
 * It arrives in `FUSION_EVENTS_ROSTER` for the reason the identity does. The
 * wrapper obtains it, so `lib/events-query.ts` stays a pure function of the log
 * text, the reading identity and the current time.
 *
 * The roster is `entries=<n>` and one `entry=` line per registration,
 * TAB-separated as hex, alias, person, git identity. An unset variable, an
 * empty one and a roster of nothing are the same state here: two empty maps,
 * which make `canon` the identity function and every alias lookup a miss, so a
 * project with no registry gets the figures it got before the registry existed
 * from this same code path rather than from a fallback branch.
 *
 * Where two entries claim one git identity for two different persons, the first
 * wins and the disagreement is said on stderr. The roster's order is the store's
 * glob order, which is filename order, so the winner is the same on every run
 * and the figure is deterministic while the conflict stays visible.
 */
function readRoster(): {
  identityMap: Record<string, string>;
  aliasOf: (hex: string) => string | null;
} {
  // No prototype: a git identity spelled `__proto__` is then an ordinary key.
  const identityMap: Record<string, string> = Object.create(null);
  const aliases = new Map<string, string>();

  for (const raw of (envValue("FUSION_EVENTS_ROSTER") ?? "").split("\n")) {
    if (!raw.startsWith("entry=")) continue;
    const [hex, alias, person, gitIdentity] = raw.slice("entry=".length).split("\t");

    if (hex !== undefined && hex !== "" && alias !== undefined && alias !== "") {
      if (!aliases.has(hex)) aliases.set(hex, alias);
    }

    if (!gitIdentity || !person) continue;
    const held = identityMap[gitIdentity];
    if (held === undefined) identityMap[gitIdentity] = person;
    else if (held !== person) {
      say(
        `the registry claims ${JSON.stringify(gitIdentity)} for both ${JSON.stringify(held)} ` +
          `and ${JSON.stringify(person)}. The first by filename order is the one counted.`,
      );
    }
  }

  return { identityMap, aliasOf: (hex) => aliases.get(hex) ?? null };
}

/* ------------------------------------------------------------------ *
 * The log
 * ------------------------------------------------------------------ */

/**
 * The log text, or `null` when it could not be read.
 *
 * An **absent** log and an **empty** one are different facts and are kept
 * apart: an empty log is a real zero and reaches exit 0, while a log that is
 * not there, or will not open, reaches exit 3 with the cause on stderr.
 */
function readLog(root: string): string | null {
  const path = resolve(root, LOG_REL);
  if (!existsSync(path)) {
    say(`${LOG_REL} does not exist under ${root}. Run /fusion:setup.`);
    return null;
  }
  try {
    return readFileSync(path, "utf-8");
  } catch {
    say(`${LOG_REL} exists but cannot be read.`);
    return null;
  }
}

function noteMalformed(n: number): void {
  if (n > 0) say(`${n} line(s) of the log were not a JSON object and were skipped.`);
}

/* ------------------------------------------------------------------ *
 * presence
 * ------------------------------------------------------------------ */

function presence(root: string, days: number): number {
  const { identity, status } = readIdentity();

  if (identity.checkout === null) {
    // Nothing can be classified: with no reading identifier every line carrying
    // one looks like somebody else's, and the report would be fiction.
    if (status.note !== "") say(status.note);
    say("this checkout could not be identified, so no line can be classified. No count printed.");
    return 3;
  }

  const text = readLog(root);
  if (text === null) {
    say("no line can be classified. No count printed.");
    return 3;
  }

  const { identityMap, aliasOf } = readRoster();
  const result = measurePresence(text, identity, {
    now: Date.now(),
    windowDays: days,
    identityMap,
  });
  if (!result.ok) {
    say("this checkout could not be identified, so no line can be classified. No count printed.");
    return 3;
  }

  const r = result.report;
  noteMalformed(r.malformed);

  const out: string[] = [`window_days=${r.windowDays}`, "scope=pulled"];
  if (r.otherPeople !== null) out.push(`other_people=${r.otherPeople}`);
  out.push(`other_checkouts=${r.otherCheckouts}`);
  for (const p of r.parties) out.push(renderParty(p, aliasOf));
  process.stdout.write(out.join("\n") + "\n");

  if (r.otherPeople === null) {
    // Two states reach here and they are not the same fact. A tree that owes no
    // git identity is not a tree whose identity could not be read: the helper
    // spends two codes keeping them apart, and folding them printed one line
    // saying nothing is owed and a second saying nothing could be read.
    //
    // **The exit code is 4 for both, deliberately.** What a caller does is
    // identical — `other_people` is absent from stdout and every party line
    // reads `unknown` — and exit 0 promises a figure this run did not take. The
    // wording is what was wrong, and the wording is what changed.
    if (status.identityOwed) {
      if (status.note !== "") say(status.note);
      say(
        "the reading person could not be read, so another person cannot be told from a " +
          "further checkout of your own. other_people is not printed; every other checkout " +
          "is counted in other_checkouts and its party line reads `unknown`.",
      );
    } else {
      // One sentence, naming its own cause: the note would otherwise repeat it
      // in the words the helper's own stderr has already used.
      say(
        "no git identity is owed here (not a git work tree), so there is no reading person " +
          "to compare against and another person cannot be told from a further checkout of " +
          "your own. Nothing is missing. other_people is not printed; every other checkout " +
          "is counted in other_checkouts and its party line reads `unknown`.",
      );
    }
    return 4;
  }

  return 0;
}

/* ------------------------------------------------------------------ *
 * dispatches
 * ------------------------------------------------------------------ */

/**
 * The three qualifications, printed **on stdout** beside the figures.
 *
 * This module's standing rule is values to stdout and reasons to stderr, and
 * these are neither. A reason on stderr says why a figure could not be taken;
 * these qualify figures that **were** taken, and C4's seventh criterion requires
 * the reading to state them beside those figures. A qualification landing on a
 * stream the figures are not on is a qualification nobody reads: a prompt
 * captures stdout and an exit code, and this reading's whole honesty is in what
 * it declines to claim.
 *
 * TAB-separated, in the shape of the `party=` and `dispatch=` records, so one
 * parser reads the whole block.
 */
const DISPATCH_LIMITS: ReadonlyArray<readonly [string, string]> = [
  [
    "no-bound-to-overrun",
    "no dispatch carries a stopping time. The bound was retired on 2026-09-10, and every " +
      "dispatch before that overran it or did not with nothing enforcing either, so `longer` " +
      "says a dispatch ran past the threshold this reading was handed and never that it broke " +
      "a rule.",
  ],
  [
    "threshold-is-the-readings",
    "the threshold belongs to the reading and to no dispatch. It is 20 minutes unless " +
      "--minutes named another figure, and no row records what any dispatch was asked for, " +
      "because none was asked for anything.",
  ],
  [
    "no-session-invisible",
    "a dispatch made with no orchestrator session running writes no rows and cannot be seen " +
      "here at all.",
  ],
];

/**
 * How long each dispatch of a measured agent ran, since the cutoff.
 *
 * **Identity is deliberately not used here.** The wrapper obtains it for the
 * other two subcommands and this one ignores it: a dispatch made from another
 * checkout is still a dispatch, and scoping this reading to one checkout would
 * hide exactly the dispatches a reviewer of a merged log is looking for.
 * Nothing below calls `readIdentity`.
 */
function dispatches(root: string, minutes: number | null, since: string | null): number {
  const text = readLog(root);
  if (text === null) return 3;

  // The threshold is this program's own, and no project sets it: the leaf that
  // once did was retired with the dispatch bound. `--minutes` is the only way
  // to read against a different figure.
  const thresholdMinutes = minutes ?? DEFAULT_THRESHOLD_MINUTES;
  const cutoff = since ?? DEFAULT_SINCE;

  const r = measureDispatchDurations(text, {
    thresholdMinutes,
    cutoffIso: cutoff,
    agents: MEASURED_AGENTS,
  });

  noteMalformed(r.malformed);
  if (r.unstamped > 0) {
    say(
      `${r.unstamped} dispatch(es) carry no readable ts on one of their two rows and could ` +
        "neither be placed against the cutoff nor measured. They are in no figure below.",
    );
  }

  const out: string[] = [
    `threshold_minutes=${thresholdMinutes}`,
    `threshold_source=${minutes === null ? "default" : "argument"}`,
    `cutoff=${cutoff}`,
    `counted=${r.counted}`,
    `longer_than_threshold=${r.longerThanThreshold}`,
    `unattributable=${r.unattributable}`,
    `unpaired=${r.unpaired}`,
  ];
  for (const [key, sentence] of DISPATCH_LIMITS) out.push(`limit=${key}\t${sentence}`);
  for (const row of r.rows) out.push(renderDispatch(row));
  process.stdout.write(out.join("\n") + "\n");

  if (r.unattributable > 0) {
    // The cause, with this log's own coverage derived from the lines just read
    // rather than asserted from a figure somebody once took. A session_start
    // that lost its session_id renders every dispatch of that session
    // unattributable, and that field is model-written.
    say(
      `${r.unattributable} dispatch(es) name a session_id no session_start row accounts for, ` +
        "so they are reported and not counted. The cause is a session_start row written " +
        `without a session_id: ${r.sessionStartsWithoutId} of the ${r.sessionStarts} ` +
        "session_start rows in this log carry none, so this is a real gap rather than a " +
        "hypothetical one.",
    );
  }

  return 0;
}

/* ------------------------------------------------------------------ *
 * main
 * ------------------------------------------------------------------ */

function main(argv: string[]): number {
  const sub = argv[0];
  if (sub === undefined || sub === "-h" || sub === "--help") {
    process.stderr.write(`${USAGE}\n`);
    return 1;
  }

  if (sub !== "presence" && sub !== "dispatches") {
    say(`unknown subcommand ${JSON.stringify(sub)}`);
    process.stderr.write(`${USAGE}\n`);
    return 1;
  }

  let days = DEFAULT_DAYS;
  // Both stay `null` where the argument was not given, so `dispatches` can tell
  // a value it was handed from one it resolved, which is what
  // `threshold_source=` reports.
  let minutes: number | null = null;
  let since: string | null = null;
  const rest = argv.slice(1);

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--days" && sub === "presence") {
      const value = rest[i + 1];
      if (value === undefined || value.startsWith("--")) {
        say("--days needs a value");
        process.stderr.write(`${USAGE}\n`);
        return 1;
      }
      const n = Number.parseInt(value, 10);
      if (!Number.isInteger(n) || String(n) !== value.trim() || n < 1) {
        say(`--days takes a whole number of days, 1 or more, not ${JSON.stringify(value)}`);
        return 1;
      }
      days = n;
      i++;
      continue;
    }
    if (arg === "--minutes" && sub === "dispatches") {
      const value = rest[i + 1];
      if (value === undefined || value.startsWith("--")) {
        say("--minutes needs a value");
        process.stderr.write(`${USAGE}\n`);
        return 1;
      }
      const n = Number.parseInt(value, 10);
      if (!Number.isInteger(n) || String(n) !== value.trim() || n < 1) {
        say(`--minutes takes a whole number of minutes, 1 or more, not ${JSON.stringify(value)}`);
        return 1;
      }
      minutes = n;
      i++;
      continue;
    }
    if (arg === "--since" && sub === "dispatches") {
      const value = rest[i + 1];
      if (value === undefined || value.startsWith("--")) {
        say("--since needs a value");
        process.stderr.write(`${USAGE}\n`);
        return 1;
      }
      // Rejected here rather than downstream: a cutoff the reading cannot parse
      // keeps nothing, so a typo would return an empty reading that looks like
      // an answer.
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        say(`--since takes a date as YYYY-MM-DD, not ${JSON.stringify(value)}`);
        return 1;
      }
      since = value;
      i++;
      continue;
    }
    say(`unknown argument ${JSON.stringify(arg)} for ${sub}`);
    process.stderr.write(`${USAGE}\n`);
    return 1;
  }

  const root = findWorkbenchRoot();
  if (root === null) {
    say("no fusion workbench above the working directory — nothing to read.");
    return 2;
  }

  if (sub === "presence") return presence(root, days);
  return dispatches(root, minutes, since);
}

process.exitCode = main(process.argv.slice(2));
