/**
 * The event log, read by the identity on each line rather than by position.
 *
 * ## The defect this answers
 *
 * `fusion-workbench/orchestrator-events.jsonl` is class R2 in
 * `rules/workbench-tracking.md` and carries `merge=union`, so after a pull it
 * holds two checkouts' lines with no ordering between the blocks. Every reader
 * of it treated the file as one session's chronology. The measurement in
 * `260823-1302_*_the-monitor-attributes-a-merged-event-log-to-one-session-and-reports-another-checkouts-state.md`
 * establishes that sorting the file moves that reading from vague to wrong
 * rather than repairing it: neither position nor timestamp separates one
 * session's lines from another's.
 *
 * The repair is not a better inference. Each line carries the person and the
 * checkout that wrote it, so membership is **read off the line**. This module
 * is the readings that follow from that, and nothing else.
 *
 * One of the two is identity-scoped, `measurePresence`.
 * `measureDispatchDurations` deliberately is not: a bound dispatch made from
 * another checkout is still a bound dispatch, so it reads every line and calls
 * `isOurs` nowhere.
 *
 * ## Why it is a pure function
 *
 * Everything here takes the log text, the reading identity and the current time
 * as arguments and returns a value. It opens no file, runs no subprocess, asks
 * nothing about git and phrases no sentence for a user. The identity is
 * obtained in exactly one place in the tree, `bin/fusion-identity`, and reaches
 * this module through `bin/fusion-events` as two strings. That is what lets
 * every case in the plan's `## Data Structures` table be a fixture string and
 * an assertion, with no git tree and no temporary workbench.
 *
 * ## The rule an absent identifier follows
 *
 * A line carrying no `checkout` counts as the reading checkout's own. The
 * existing log, 2331 lines when this was written, carries the field on no line,
 * no record is rewritten, and the degradation is exact: a reader that cannot
 * resolve its own identifier keeps every line and behaves as it did before this
 * module existed. The cost the user accepted with that rule is that another
 * checkout's pre-C4 lines, already merged in, read as this checkout's own. It
 * is bounded and shrinking, and it applies to no line written after.
 *
 * ## The identity map, and what it changes about a figure already reported
 *
 * `measurePresence` classifies on `canon(g) = identityMap[g] ?? g`, a map from
 * a git identity to the person who claims it. It is a table a human wrote, in
 * the checkout registry, so a person who registers a second identity changes
 * what `other_people` counted yesterday over the same window. That is the
 * correction landing rather than a drift: the two identities were always one
 * person, and the log could not say so.
 *
 * Where two entries map one git identity to two different persons, the first by
 * filename order wins and the conflict is named on stderr. The map is built in
 * `hooks/events-query.ts` from one `bin/fusion-checkout-name roster` call, so
 * that resolution and the sentence about it live there and this module still
 * opens no file and runs no subprocess.
 *
 * The join column is the git identity and never the hex, because an
 * unregistered line carries both and only the first can be canonised. Joining
 * on the hex would classify an unregistered checkout of the reading person as
 * another person, which is the one regression this reading must not have.
 * `canon` is applied at the classification and at the `people` set and nowhere
 * else: the party key, the sort and the `checkouts` set stay on raw values,
 * because they are about lines rather than about people.
 *
 * ## The one thing every consumer of this file gets wrong
 *
 * The emit convention writes `ts` as UTC **without** the `Z` designator, and
 * ECMA-262 parses such a string as local time. `CLAUDE.md`'s symptom table
 * carries the resulting off-by-the-user's-offset bug as a standing trap, and
 * `bin/monitor` grew a `parseUTCTs()` helper for it. `parseTs` below appends
 * the designator; nothing here calls `Date.parse` directly.
 */
const STRING_FIELDS = [
    "ts",
    "event",
    "person",
    "checkout",
    "history_file",
    "agent",
    "task",
    "session_id",
];
/**
 * Parse the log text. A line that is not a JSON object is counted and skipped:
 * one truncated append must not cost a reader the rest of the file, and a
 * skipped line that nobody counts is the silent under-report this whole Circle
 * exists to remove.
 */
export function parseLog(text) {
    const lines = [];
    let malformed = 0;
    for (const raw of text.split("\n")) {
        if (raw.trim() === "")
            continue;
        let value;
        try {
            value = JSON.parse(raw);
        }
        catch {
            malformed++;
            continue;
        }
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
            malformed++;
            continue;
        }
        const src = value;
        const line = {};
        for (const f of STRING_FIELDS) {
            const v = src[f];
            if (typeof v === "string" && v !== "")
                line[f] = v;
        }
        lines.push(line);
    }
    return { lines, malformed };
}
/**
 * `ts` as milliseconds, or `null` when it is absent or unreadable.
 *
 * The designator is appended only when the string carries no zone of its own,
 * so a line some future writer stamps with `Z` or with an offset is read as it
 * was written rather than shifted a second time.
 */
export function parseTs(ts) {
    if (typeof ts !== "string" || ts === "")
        return null;
    const zoned = /(?:Z|z|[+-]\d{2}:?\d{2})$/.test(ts);
    const ms = Date.parse(zoned ? ts : `${ts}Z`);
    return Number.isNaN(ms) ? null : ms;
}
/**
 * The Circle a session ran on, read off `history_file` and off no field of its
 * own. A workbench-relative path beginning `circles/` names its Circle in the
 * second segment; any other path is shared work; an absent field is `unknown`.
 */
export function circleOf(historyFile) {
    if (typeof historyFile !== "string" || historyFile === "")
        return "unknown";
    const parts = historyFile.split("/");
    if (parts[0] !== "circles")
        return "shared";
    const dir = parts[1];
    return dir === undefined || dir === "" ? "unknown" : dir;
}
/**
 * Whether a line belongs to the reading checkout.
 *
 * An absent `checkout` is ours, per the rule in this module's header. An
 * unresolved reading identifier keeps **every** line, which is the exact
 * pre-C4 behaviour and the stated degradation rather than a fallback.
 */
export function isOurs(line, checkout) {
    if (checkout === null)
        return true;
    return line.checkout === undefined || line.checkout === checkout;
}
/**
 * Separator for the party key. A NUL, because the person value contains spaces
 * by construction and any printable separator is something a git identity can
 * legitimately hold.
 */
const KEY_SEP = "\u0000";
/**
 * Who else has been here, over the last `windowDays`.
 *
 * The split is the one in the plan's `## Data Structures`, and it is disjoint
 * and complete over the `session_start` lines inside the window.
 *
 * The window has a floor and no ceiling. A line stamped in the future is kept,
 * because the clock that wrote it belongs to another machine and a skew of
 * minutes must not hide a person who was here. A line whose `ts` cannot be read
 * is dropped: it cannot be placed in the window, and placing it anyway would be
 * the guess this module exists to stop making.
 */
export function measurePresence(text, identity, opts) {
    if (identity.checkout === null)
        return { ok: false, why: "unidentified-checkout" };
    const { lines, malformed } = parseLog(text);
    const floor = opts.now - opts.windowDays * 24 * 60 * 60 * 1000;
    // Membership is asked with `Object.hasOwn`, because the map is a plain object
    // built from parsed input and a git identity spelled `__proto__` must not
    // resolve to whatever the prototype carries.
    const canon = (g) => {
        if (g === undefined || g === null)
            return null;
        return Object.hasOwn(opts.identityMap, g) ? opts.identityMap[g] : g;
    };
    const me = canon(identity.person);
    // Keyed by the pair, because two checkouts of one person are two parties and
    // one checkout that changed hands is still one.
    const seen = new Map();
    for (const line of lines) {
        if (line.event !== "session_start")
            continue;
        if (isOurs(line, identity.checkout))
            continue;
        const ms = parseTs(line.ts);
        if (ms === null || ms < floor)
            continue;
        const key = `${line.person ?? ""}${KEY_SEP}${line.checkout}`;
        const held = seen.get(key);
        if (held === undefined || ms >= held.ms)
            seen.set(key, { line, ms });
    }
    const parties = [...seen.values()].map(({ line }) => ({
        kind: me === null
            ? "unknown"
            : canon(line.person) === me
                ? "checkout"
                : "person",
        person: line.person ?? null,
        // Established by the `isOurs` filter above: a line with no `checkout` is
        // ours and never reaches here.
        checkout: line.checkout,
        ts: line.ts,
        circle: circleOf(line.history_file),
    }));
    // Most recent first, then by the whole key the map is built on — the
    // checkout and the person both — so the order is total and a test can assert
    // it. Breaking on the checkout alone left two parties that share a checkout
    // and a stamp to order by their position in the file, which is the one input
    // this module exists to stop reading.
    parties.sort((a, b) => {
        const d = (parseTs(b.ts) ?? 0) - (parseTs(a.ts) ?? 0);
        if (d !== 0)
            return d;
        const c = a.checkout.localeCompare(b.checkout);
        return c !== 0 ? c : (a.person ?? "").localeCompare(b.person ?? "");
    });
    const people = new Set();
    const checkouts = new Set();
    for (const p of parties) {
        if (p.kind === "person") {
            // A party whose person was not recorded is counted as its own party,
            // named by the checkout it wrote from. Merging such parties would claim
            // they are one person, which the lines do not say.
            people.add(canon(p.person) ?? `checkout:${p.checkout}`);
        }
        else {
            checkouts.add(p.checkout);
        }
    }
    return {
        ok: true,
        report: {
            windowDays: opts.windowDays,
            parties,
            otherPeople: identity.person === null ? null : people.size,
            otherCheckouts: checkouts.size,
            malformed,
        },
    };
}
/**
 * Every control character in a rendered field, replaced by one space.
 *
 * The separator is a TAB, so a TAB inside a field shifts every later field by
 * one and a newline splits the record in two. `person` is git's `Name <email>`
 * as some other machine's `git config` holds it, and JSON carries `\t` and `\n`
 * through the round trip intact, so the value can hold either. This is the
 * reasoning that put a NUL in `KEY_SEP` above, carried to the output format,
 * which is the surface a consumer actually parses.
 *
 * Flattening rather than escaping keeps the record six fields wide with no
 * decoding step at the reader, at the cost of not being reversible. The six
 * fields are a class, a git identity, a hex identifier, a timestamp, a
 * directory name and an alias; none of them means anything different for
 * having had a control character flattened out of it.
 */
function flattenField(s) {
    return s.replace(/[\u0000-\u001f\u007f]+/g, " ");
}
/**
 * One `party=` line. Tab-separated: the person value contains spaces.
 *
 * `aliasOf` resolves the checkout registry's name for a hex, and the sixth
 * field carries it or `-`. It is **appended**, so a consumer reading five
 * fields is unaffected, and it is a rendering of a report rather than anything
 * written to a record: no alias reaches `orchestrator-events.jsonl`, no
 * comparison here runs on one, and a hex with no entry renders exactly what it
 * rendered before the registry existed.
 */
export function renderParty(p, aliasOf) {
    const person = p.person ?? "(not recorded)";
    return [`party=${p.kind}`, person, p.checkout, p.ts, p.circle, aliasOf(p.checkout) ?? "-"]
        .map(flattenField)
        .join("\t");
}
/* ------------------------------------------------------------------ *
 * dispatches, the reading of how long a dispatch ran
 * ------------------------------------------------------------------ */
/**
 * The seven agents whose dispatches carry a stopping time.
 *
 * **Two copies of one set, one gate holding them equal, and no third copy.**
 * The other copy is the `IS_BOUND_AGENT` case arm in `bin/fusion-rules`, which
 * is what decides who receives `rules/bounded-dispatch.md`; a test pins the two
 * in exact set equality, the way `review-coverage-mandate.test.ts` pins
 * `REVIEW_SENDERS` in `hooks/lib/review-coverage.ts` against `IS_REVIEWER_AGENT`.
 * They exist separately because a shell script cannot import a TypeScript
 * constant and this module must stay free of subprocesses; the gate is what
 * stops a name being added to one side alone.
 *
 * The order is the script's, which is the specification's: agent by agent, with
 * the reason beside each name at
 * `260907-0820_*_spec-bounded-executor-dispatches.md`.
 */
export const BOUND_AGENTS = [
    "coder",
    "ontocoder",
    "bugfixer",
    "reconciler",
    "coderev",
    "ontorev",
    "curator",
];
/**
 * How long each dispatch of a bound agent ran, since a cutoff.
 *
 * Pure, like its two siblings: it opens no file, runs no subprocess and phrases
 * no sentence for a user. It is **not** identity-scoped, deliberately — a bound
 * dispatch made from another checkout is still a bound dispatch, and `isOurs`
 * is not applied anywhere below.
 *
 * The order of the filters is the specification's and matters:
 *
 *   1. pair `task_start` with `task_done` on `task`, and only where `task` is
 *      present. A start with no completion is `unpaired`;
 *   2. keep only what starts at or after `cutoffIso`, so the reading does not
 *      report every long dispatch in the log's history;
 *   3. keep only the agents asked for;
 *   4. mark what no `session_start` accounts for as `unattributable`, which is
 *      reported and neither dropped nor counted.
 *
 * Steps 2 and 3 apply to an unpaired start as well. Without that the `unpaired`
 * figure would run over the whole file and over every agent, which is the exact
 * widening the cutoff exists to prevent, and it would not be comparable with
 * `counted` beside it.
 *
 * **A cutoff that cannot be parsed keeps nothing.** The failure is closed
 * towards the empty reading rather than the whole history, because the history
 * is what the cutoff is there to exclude.
 *
 * Every timestamp goes through `parseTs`. The emit convention writes UTC with
 * no `Z` designator and ECMA-262 reads such a string as local time.
 */
export function measureDispatchDurations(text, opts) {
    const { lines, malformed } = parseLog(text);
    const sessions = new Set();
    let sessionStarts = 0;
    let sessionStartsWithoutId = 0;
    for (const line of lines) {
        if (line.event !== "session_start")
            continue;
        sessionStarts++;
        if (line.session_id === undefined)
            sessionStartsWithoutId++;
        else
            sessions.add(line.session_id);
    }
    // First occurrence wins. The union merge can leave one dispatch's rows in the
    // file twice after a pull, and the duplicates are byte-identical, so which one
    // wins does not change a figure — but the rule has to be written down for the
    // result to be deterministic on any input.
    const done = new Map();
    for (const line of lines) {
        if (line.event !== "task_done" || line.task === undefined)
            continue;
        if (!done.has(line.task))
            done.set(line.task, line);
    }
    const cutoffMs = parseTs(`${opts.cutoffIso}T00:00:00`);
    const agents = new Set(opts.agents);
    const rows = [];
    let counted = 0;
    let longerThanThreshold = 0;
    let unattributable = 0;
    let unpaired = 0;
    let unstamped = 0;
    const seenStart = new Set();
    for (const line of lines) {
        if (line.event !== "task_start" || line.task === undefined)
            continue;
        if (seenStart.has(line.task))
            continue;
        seenStart.add(line.task);
        const startMs = parseTs(line.ts);
        if (startMs === null || cutoffMs === null) {
            unstamped++;
            continue;
        }
        if (startMs < cutoffMs)
            continue;
        if (line.agent === undefined || !agents.has(line.agent))
            continue;
        const agent = line.agent;
        const task = line.task;
        const ts = line.ts;
        const end = done.get(task);
        if (end === undefined) {
            // Named, and neither compliant nor a zero: C4's eighth criterion.
            unpaired++;
            rows.push({ agent, task, ts, minutes: null, outcome: "unpaired" });
            continue;
        }
        const endMs = parseTs(end.ts);
        if (endMs === null) {
            unstamped++;
            continue;
        }
        const minutes = (endMs - startMs) / 60000;
        // Decided before the comparison, because a dispatch this reading cannot
        // place must not be scored against the threshold at all.
        if (line.session_id === undefined || !sessions.has(line.session_id)) {
            unattributable++;
            rows.push({ agent, task, ts, minutes, outcome: "unattributable" });
            continue;
        }
        counted++;
        const longer = minutes > opts.thresholdMinutes;
        if (longer)
            longerThanThreshold++;
        rows.push({ agent, task, ts, minutes, outcome: longer ? "longer" : "within" });
    }
    // Oldest first, stable on the order the lines were read in. Two rows sharing
    // a stamp keep their file order rather than swapping between runs.
    rows.sort((a, b) => (parseTs(a.ts) ?? 0) - (parseTs(b.ts) ?? 0));
    return {
        rows,
        counted,
        longerThanThreshold,
        unattributable,
        unpaired,
        unstamped,
        sessionStarts,
        sessionStartsWithoutId,
        malformed,
    };
}
/**
 * One `dispatch=` line. Tab-separated, and flattened for the reason
 * `renderParty` is: a control character inside a field would shift every later
 * field by one.
 *
 * The minutes field carries `-` on an unpaired row. It is the one place a
 * number is deliberately absent rather than zero.
 */
export function renderDispatch(row) {
    const minutes = row.minutes === null ? "-" : row.minutes.toFixed(1);
    return [`dispatch=${row.agent}`, row.task, row.ts, minutes, row.outcome]
        .map(flattenField)
        .join("\t");
}
