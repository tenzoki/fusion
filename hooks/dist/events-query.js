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
 *      code of its own.
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
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { countTurns, measurePresence, renderParty, } from "./lib/events-query.js";
import { readStateFile, stateField } from "./lib/state-file.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
const USAGE = "usage: fusion-events presence [--days N]\n" + //
    "       fusion-events turns";
/** The log, at the one root-relative path every consumer reads it at. */
const LOG_REL = "fusion-workbench/orchestrator-events.jsonl";
const DEFAULT_DAYS = 7;
function say(line) {
    process.stderr.write(`fusion-events: ${line}\n`);
}
/* ------------------------------------------------------------------ *
 * The identity, as the wrapper handed it over
 * ------------------------------------------------------------------ */
function envValue(name) {
    const v = process.env[name];
    return v === undefined || v === "" ? null : v;
}
const IDENTITY_VOCABULARY = new Map([
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
            note: "fusion-identity reports this is not a git work tree, so no person is owed — and the " +
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
function resolveIdentity(exit) {
    if (exit === null) {
        return {
            exit,
            identityOwed: true,
            note: "no identity was passed in; run this through bin/fusion-events.",
        };
    }
    const known = IDENTITY_VOCABULARY.get(exit);
    if (known !== undefined)
        return { exit, ...known };
    return {
        exit,
        identityOwed: true,
        note: `fusion-identity exited ${exit}, which is not a code this reader knows.`,
    };
}
function readIdentity() {
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
 * The log
 * ------------------------------------------------------------------ */
/**
 * The log text, or `null` when it could not be read.
 *
 * An **absent** log and an **empty** one are different facts and are kept
 * apart: an empty log is a real zero and reaches exit 0, while a log that is
 * not there, or will not open, reaches exit 3 with the cause on stderr.
 */
function readLog(root) {
    const path = resolve(root, LOG_REL);
    if (!existsSync(path)) {
        say(`${LOG_REL} does not exist under ${root}. Run /fusion:setup.`);
        return null;
    }
    try {
        return readFileSync(path, "utf-8");
    }
    catch {
        say(`${LOG_REL} exists but cannot be read.`);
        return null;
    }
}
function noteMalformed(n) {
    if (n > 0)
        say(`${n} line(s) of the log were not a JSON object and were skipped.`);
}
/**
 * `turn_start` lines that named a Turn and could not say when.
 *
 * Named separately from `malformed`, because they are well-formed objects and
 * the two are different facts. Both are on stderr rather than stdout: stdout
 * carries the figures, and these two say how far the log fell short of letting
 * them be taken.
 */
function noteUnstamped(n) {
    if (n > 0) {
        say(`${n} turn_start line(s) carry no readable ts and are not in the count, which is ` +
            "therefore short by that many Turns.");
    }
}
/* ------------------------------------------------------------------ *
 * presence
 * ------------------------------------------------------------------ */
function presence(root, days) {
    const { identity, status } = readIdentity();
    if (identity.checkout === null) {
        // Nothing can be classified: with no reading identifier every line carrying
        // one looks like somebody else's, and the report would be fiction.
        if (status.note !== "")
            say(status.note);
        say("this checkout could not be identified, so no line can be classified. No count printed.");
        return 3;
    }
    const text = readLog(root);
    if (text === null) {
        say("no line can be classified. No count printed.");
        return 3;
    }
    const result = measurePresence(text, identity, { now: Date.now(), windowDays: days });
    if (!result.ok) {
        say("this checkout could not be identified, so no line can be classified. No count printed.");
        return 3;
    }
    const r = result.report;
    noteMalformed(r.malformed);
    const out = [`window_days=${r.windowDays}`, "scope=pulled"];
    if (r.otherPeople !== null)
        out.push(`other_people=${r.otherPeople}`);
    out.push(`other_checkouts=${r.otherCheckouts}`);
    for (const p of r.parties)
        out.push(renderParty(p));
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
            if (status.note !== "")
                say(status.note);
            say("the reading person could not be read, so another person cannot be told from a " +
                "further checkout of your own. other_people is not printed; every other checkout " +
                "is counted in other_checkouts and its party line reads `unknown`.");
        }
        else {
            // One sentence, naming its own cause: the note would otherwise repeat it
            // in the words the helper's own stderr has already used.
            say("no git identity is owed here (not a git work tree), so there is no reading person " +
                "to compare against and another person cannot be told from a further checkout of " +
                "your own. Nothing is missing. other_people is not printed; every other checkout " +
                "is counted in other_checkouts and its party line reads `unknown`.");
        }
        return 4;
    }
    return 0;
}
/* ------------------------------------------------------------------ *
 * turns
 * ------------------------------------------------------------------ */
function turns(root) {
    const { identity, status } = readIdentity();
    // What the count was taken over, on stdout in the shape the rest of the
    // output uses. Without it the widening below was announced on stderr alone,
    // while stdout carried a number and the exit was 0 — so a prompt told to
    // "never fall back to the whole-file count" could not tell that the helper
    // just had. Record:
    // circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/
    //   260826-0131_*_turns-returns-exit-0-and-a-whole-file-count-when-the-
    //   checkout-is-unresolved-and-stdout-says-nothing.md
    const scope = identity.checkout === null ? "all-checkouts" : "checkout";
    if (identity.checkout === null) {
        // Not a failure here, and deliberately not one: keeping every line is the
        // exact pre-C4 behaviour, which is the stated degradation rather than a
        // fallback. It is said out loud so the figure is never quietly wider than
        // it looks.
        if (status.note !== "")
            say(status.note);
        say("this checkout could not be identified, so every line is counted, as before C4. " +
            "stdout carries scope=all-checkouts.");
    }
    const state = readStateFile(root);
    if (!state.ok) {
        say(state.missing
            ? "fusion-workbench/agentstate.yaml does not exist, so there is no session to scope to."
            : "fusion-workbench/agentstate.yaml exists but cannot be read.");
        return 3;
    }
    const historyFile = stateField(state.text, "history_file");
    if (historyFile === "") {
        say("agentstate.yaml carries no session.history_file, so there is no session to scope to.");
        return 3;
    }
    const text = readLog(root);
    if (text === null) {
        say("there is no session to scope to.");
        return 3;
    }
    const result = countTurns(text, historyFile, identity.checkout);
    noteMalformed(result.malformed);
    if (!result.ok) {
        // Printed, because it was measured: the session is named, and the scope the
        // search ran over is named, even though the count could not be taken.
        process.stdout.write(`history_file=${result.historyFile}\nscope=${scope}\n`);
        say(result.why === "no-session-start"
            ? "no session_start in this checkout's lines names that history file. That is a " +
                "finding, not a count of zero: the session may have emitted nothing at all."
            : "the session_start naming that history file carries no readable ts, so no window " +
                "can be opened. That is a finding, not a count of zero.");
        return 4;
    }
    noteUnstamped(result.unstamped);
    // `scope` is last so the two lines a caller was written against stay where
    // they were: a reader that ignores the key reads exactly what it read before.
    process.stdout.write(`turns=${result.turns}\nhistory_file=${result.historyFile}\nscope=${scope}\n`);
    return 0;
}
/* ------------------------------------------------------------------ *
 * main
 * ------------------------------------------------------------------ */
function main(argv) {
    const sub = argv[0];
    if (sub === undefined || sub === "-h" || sub === "--help") {
        process.stderr.write(`${USAGE}\n`);
        return 1;
    }
    if (sub !== "presence" && sub !== "turns") {
        say(`unknown subcommand ${JSON.stringify(sub)}`);
        process.stderr.write(`${USAGE}\n`);
        return 1;
    }
    let days = DEFAULT_DAYS;
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
        say(`unknown argument ${JSON.stringify(arg)} for ${sub}`);
        process.stderr.write(`${USAGE}\n`);
        return 1;
    }
    const root = findWorkbenchRoot();
    if (root === null) {
        say("no fusion workbench above the working directory — nothing to read.");
        return 2;
    }
    return sub === "presence" ? presence(root, days) : turns(root);
}
process.exitCode = main(process.argv.slice(2));
