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
 * is the two readings that follow from that, and nothing else.
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
 * ## The one thing every consumer of this file gets wrong
 *
 * The emit convention writes `ts` as UTC **without** the `Z` designator, and
 * ECMA-262 parses such a string as local time. `CLAUDE.md`'s symptom table
 * carries the resulting off-by-the-user's-offset bug as a standing trap, and
 * `bin/monitor` grew a `parseUTCTs()` helper for it. `parseTs` below appends
 * the designator; nothing here calls `Date.parse` directly.
 */
const STRING_FIELDS = ["ts", "event", "person", "checkout", "history_file"];
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
        kind: identity.person === null
            ? "unknown"
            : line.person === identity.person
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
            people.add(p.person ?? `checkout:${p.checkout}`);
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
 * Flattening rather than escaping keeps the record five fields wide with no
 * decoding step at the reader, at the cost of not being reversible. The five
 * fields are a class, a git identity, a hex identifier, a timestamp and a
 * directory name; none of them means anything different for having had a
 * control character flattened out of it.
 */
function flattenField(s) {
    return s.replace(/[\u0000-\u001f\u007f]+/g, " ");
}
/** One `party=` line. Tab-separated: the person value contains spaces. */
export function renderParty(p) {
    const person = p.person ?? "(not recorded)";
    return [`party=${p.kind}`, person, p.checkout, p.ts, p.circle]
        .map(flattenField)
        .join("\t");
}
/**
 * The Turn count of the session whose history file is `historyFile`.
 *
 * It replaces five sites that each derived the figure for themselves, and the two
 * quantities in that are different numbers rather than one: two literal whole-file
 * `grep -c turn_start` blocks, which counted every checkout's Turns and every
 * previous session's, and three prose derivations naming a window after this
 * session's `session_start`. All five now read this one implementation. It also
 * replaces the proposed repair of counting after the **last** `session_start`, which is
 * positional and does not survive the union merge
 * (`260823-1110_*_the-merge-driver-unsorts-a-second-event-log-reader-whose-repair-direction-is-positional.md`).
 *
 * The window is a **timestamp inside one checkout's own lines**, which is
 * genuine chronology: scope by checkout, sort by `ts`, take the first
 * `session_start` naming this history file, count `turn_start` from its stamp
 * on. `turns=0` is a real figure and reaches the ok branch.
 *
 * A `turn_start` with no readable `ts` cannot be placed against that anchor, so
 * it is not counted. It comes back as `unstamped` rather than vanishing, so a
 * count that is short by a line is a count that says it is short by a line.
 */
export function countTurns(text, historyFile, checkout) {
    const { lines, malformed } = parseLog(text);
    const scoped = lines
        .filter((l) => isOurs(l, checkout))
        .map((line, i) => ({ line, i, ms: parseTs(line.ts) }));
    // Stable on the original order, so two lines sharing a stamp keep the order
    // they were appended in. A line with no readable stamp sorts oldest, which is
    // the rule `bin/monitor` `_read_warnings` already applies to the guard log.
    scoped.sort((a, b) => {
        const am = a.ms ?? Number.NEGATIVE_INFINITY;
        const bm = b.ms ?? Number.NEGATIVE_INFINITY;
        return am !== bm ? am - bm : a.i - b.i;
    });
    const anchor = scoped.find((e) => e.line.event === "session_start" && e.line.history_file === historyFile);
    if (anchor === undefined) {
        return { ok: false, why: "no-session-start", historyFile, malformed };
    }
    if (anchor.ms === null) {
        return { ok: false, why: "anchor-without-timestamp", historyFile, malformed };
    }
    let turns = 0;
    let unstamped = 0;
    for (const e of scoped) {
        if (e.line.event !== "turn_start")
            continue;
        if (e.ms === null) {
            unstamped++;
            continue;
        }
        if (e.ms < anchor.ms)
            continue;
        turns++;
    }
    return {
        ok: true,
        turns,
        unstamped,
        historyFile,
        since: anchor.line.ts,
        malformed,
    };
}
