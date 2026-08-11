/**
 * Session-state drift — the measurement behind issue `260801-2038`.
 *
 * ## The defect this answers
 *
 * Three of the four session-state surfaces stop being written after the first
 * Turn while the session runs on. Measured six times across six sessions:
 * `agentstate.yaml` said `commits: 0` while git counted 6, then 7, then 8, then
 * 12; a Circle record said `Status: anticipated` with an empty Turn log while
 * that Circle had been active for days; a session history said
 * `Directive: (not yet stated)` while eight hours of work followed. Resume is
 * the feature it breaks, because the state file is authoritative in exactly the
 * situation where the session that wrote it is gone and cannot be asked.
 *
 * `orchestrator-events.jsonl` never froze, and that is the diagnostic rather
 * than a coincidence: emitting an event is a per-action call that cannot be
 * forgotten without the action visibly failing, while the other three are
 * end-of-Turn writes a session can skip with nothing breaking. Git is the
 * second such record — a commit is the work itself, not a note about it.
 *
 * So this module reads those two un-freezable records and prints each
 * bookkeeping surface beside the one record that can contradict it.
 *
 * ## Why it is a program and not a paragraph
 *
 * `agents/orchestrator.md` carried this as an inline shell snippet, and issue
 * `260801-2038`'s own reconciliation measured what that bought: the check
 * landed at 04:15, both of its call points were reached at 06:55, and neither
 * fired — because **an agent prompt is loaded at session start, so a fix
 * written into a prompt cannot reach the session that writes it**. That is not
 * task pressure and is not overridable; it is construction. The enforcement had
 * to move somewhere that runs without being asked.
 *
 * Three callers now share this one computation, and none of them is the session
 * that installed it:
 *
 *   1. `hooks/tracker.ts` — the PostToolUse hook, on every guarded tool call.
 *      Claude Code invokes it from `hooks/hooks.json`; it needs no cooperation
 *      from the session and reads `hooks/dist/tracker.js` fresh each call. This
 *      is the call point that makes the Turn-boundary write ride an obligation
 *      the session already holds: a commit is what moves `git rev-list --count`
 *      past what `agentstate.yaml` claims, and the tracker fires on the very
 *      tool call that committed.
 *   2. `hooks/state-drift.ts` → `bin/fusion-state-drift` — the CLI, read by
 *      `/fusion:setup` Step 1 on the user-triggered resume path and available
 *      to the reconciler and to any human at a terminal.
 *   3. `bin/monitor` — surfaces the `state_drift` events this module's callers
 *      emit, rather than computing the divergence a second time.
 *
 * ## What it does NOT do, and why that is deliberate
 *
 * It never writes `agentstate.yaml`, a Circle record or a session history file.
 * Candidate 3 of the issue — letting something other than the orchestrator
 * repair the surfaces — is rejected there and stays rejected: it would put two
 * writers on the session-state surfaces, and a second writer racing the
 * orchestrator's own overwrite is a worse failure than a stale number. The only
 * file this module writes is its own throttle record under `.guard-state/`.
 *
 * The honest consequence: this makes a skipped write **impossible not to
 * notice**. It cannot make the write happen. That residual is stated in the
 * report and in `agents/orchestrator.md` rather than left to be discovered.
 *
 * Read-only against everything else, and it throws nothing it can help — every
 * row that cannot be decided is reported as `unchecked` with its reason, never
 * dropped. A drift check that exists to catch a silent skip must not perform
 * one.
 */
import { closeSync, existsSync, fstatSync, openSync, readFileSync, readSync, readdirSync, } from "node:fs";
import { resolve } from "node:path";
import { git } from "./git.js";
import { isStateObject, loadGuardState, saveGuardState } from "./guard-state-file.js";
/* ------------------------------------------------------------------ *
 * Layout — root-anchored, exactly as every other consumer reads it
 * ------------------------------------------------------------------ */
/**
 * The root-anchored surfaces, named literally.
 *
 * `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` puts
 * these at fixed root-relative paths precisely because the hooks, the monitor
 * and the `bin/` helpers read them there and none of them has a fallback.
 * `circles/` is in the same class: `bin/fusion-paths` resolves `SCAN_CIRCLES`
 * to the constant `circles`, so there is no per-project spelling to look up.
 * The Circle *inside* it is not constant, which is what `.active-circle` is for.
 */
const WB = "fusion-workbench";
const STATE_REL = `${WB}/agentstate.yaml`;
const EVENTS_REL = `${WB}/orchestrator-events.jsonl`;
const POINTER_REL = `${WB}/.active-circle`;
const CIRCLES_REL = `${WB}/circles`;
/**
 * The throttle record's file NAME, not its path: `lib/guard-state-file.ts`
 * builds the path under `.guard-state/` and this module no longer knows how.
 */
const THROTTLE_FILE = "state-drift.json";
/**
 * How much of the event log is read, from the end.
 *
 * The log is append-only and grows for the life of a project, and this runs on
 * every guarded tool call, so reading the whole file would put an unbounded
 * cost on a hook that must stay cheap. The consequence is named rather than
 * hidden: when no `session_start` line falls inside the tail, the Turn row is
 * reported `unchecked` instead of being counted from the start of the window —
 * counting from an arbitrary offset would report a number that looks like an
 * answer and is not one.
 */
const EVENT_TAIL_BYTES = 1 << 20;
/* ------------------------------------------------------------------ *
 * Reading the surfaces
 * ------------------------------------------------------------------ */
/**
 * The session state file, read once.
 *
 * Exported, and paired with `stateField` below, because three modules now ask
 * `agentstate.yaml` questions — this one, `lib/review-coverage.ts` for the
 * session anchor, and `lib/staging-drift.ts` for the session's own history file
 * — and a fourth copy of the same six lines is how a flat read starts
 * disagreeing with itself about what "absent" means. The split into a file read
 * and a field read is not decoration: `measureStateDrift` asks five questions of
 * one file and runs on every guarded tool call, so a per-field read would be
 * five file reads a call.
 *
 * `missing` distinguishes "there is no session in progress" from "there is one
 * and its state file will not open". Both leave the caller without a value, and
 * only the caller knows which sentence to say about it, so this reports the
 * fact and phrases nothing.
 */
export function readStateFile(root) {
    const path = resolve(root, STATE_REL);
    if (!existsSync(path))
        return { ok: false, missing: true };
    try {
        return { ok: true, text: readFileSync(path, "utf-8") };
    }
    catch {
        return { ok: false, missing: false };
    }
}
/**
 * First value for `key` anywhere in the state file, quotes stripped.
 *
 * Deliberately flat rather than a YAML parse, and deliberately first-match:
 * this is the same reading `agents/orchestrator.md` documented as a `sed`
 * one-liner, so the program and the prompt cannot disagree about what a field
 * says. Every key it is asked for (`commits`, `turn`, `git_head_at_start`,
 * `history_file`, `directive`) occurs first at the place it means; `work_queue`
 * entries carry `commit`, which is a different key from `commits`.
 */
export function stateField(state, key) {
    const re = new RegExp(`^[ \\t]*${key}:[ \\t]*(.*)$`, "m");
    const hit = re.exec(state);
    if (!hit)
        return "";
    return hit[1].trim().replace(/^["']/, "").replace(/["']$/, "").trim();
}
/**
 * The last `EVENT_TAIL_BYTES` of a file, or the whole file when it is smaller.
 *
 * Returns null when the file cannot be read at all. `truncated` says whether
 * anything was cut, which is what decides between counting and reporting the
 * Turn row unchecked.
 */
function tail(path, maxBytes) {
    let fd = null;
    try {
        fd = openSync(path, "r");
        const size = fstatSync(fd).size;
        const from = size > maxBytes ? size - maxBytes : 0;
        const length = size - from;
        const buf = Buffer.alloc(length);
        if (length > 0)
            readSync(fd, buf, 0, length, from);
        return { text: buf.toString("utf-8"), truncated: from > 0 };
    }
    catch {
        return null;
    }
    finally {
        if (fd !== null) {
            try {
                closeSync(fd);
            }
            catch {
                /* nothing left to do with it */
            }
        }
    }
}
/**
 * Where THIS session begins in the event log — the anchor the Turn row counts from.
 *
 * ## Why the anchor is a question at all
 *
 * `commitsSince` below counts from `session.git_head_at_start`, a field of
 * `agentstate.yaml`. A resume does not rewrite it, and that is correct: a
 * session's commits are counted from where the *session* began, not from where
 * the process now reading it began. `progress.turn` is the same kind of number
 * — the cumulative Turn the session is in, carried across the interruption — so
 * its record has to be counted over the same window, or two rows of one report
 * answer "since when?" with two different answers.
 *
 * They did. This counted from the LAST `session_start` line, and Setup step 8
 * emits a fresh one on every resume. Measured in this repository at `951c809`:
 * the commits row read 32 against 32 while the Turn row read `surface=4
 * record=0` and said DRIFT, on every guarded tool call for the rest of the
 * session, with nothing whatever stale (issue `260811-2143`). A row that speaks
 * on its commonest path is one its reader learns to read past — the trigger
 * doctrine in `hooks/tracker.ts` calls that shape disqualifying — and this one
 * was worse than noisy: on a resumed session it reported drift whether or not
 * any existed, so it carried no information at all.
 *
 * ## Why a stamp comparison is not the fix
 *
 * `session.started` marks the session's own beginning and survives a resume,
 * which is the property wanted. It cannot be compared against an event `ts`:
 * `session.started` is written by `date +%y%m%d-%H%M` (local) and an event by
 * `date -u +%Y-%m-%dT%H:%M:%S` (UTC), and neither string carries an offset.
 * Measured in this repository: `session.started: "260811-0752"` against that
 * same session's `session_start` at `2026-08-11T05:52:24` — two hours apart,
 * and the error's direction would silently drop the session's first Turns from
 * the count. `CLAUDE.md` records the same trap for `bin/monitor`.
 *
 * ## The anchor, and the input that had to be obtained for it
 *
 * The event log carries no session identity, so *which* `session_start` began
 * the session `agentstate.yaml` describes is not decidable from the log alone.
 * Every rule over line positions approximates it and each gets some shape
 * wrong: "the last one" is wrong on a resume, "the first since the last
 * `session_end`" is wrong on a Restart after a crash. That is the case
 * `rules/critical-stance.md` §4 names — change the mechanism rather than pick
 * the approximation whose counter-example is rarer — so the mechanism obtains
 * the missing input. `session_start` now carries `history_file`, and a session
 * keeps one history file for its whole life: a resume inherits it, a Restart
 * creates a new one. It is the identity `session.history_file` already is,
 * written into the record that cannot freeze.
 *
 * Three cases, and every log falls in exactly one:
 *
 *  1. **A `session_start` names this session's history file.** The FIRST such
 *     line is where the session began; a resume's second `session_start` names
 *     the same file and is passed over. Exact — and independent of whether the
 *     resume path emits anything at all, which is what keeps this row from
 *     depending on an emission the resume path may be right not to make.
 *  2. **No line names it, and exactly one `session_start` follows the last
 *     `session_end`.** A clean exit ends a session and deletes its state file,
 *     so a `session_start` after the last one belongs to this session, and a
 *     single candidate is unambiguous. This is every log written before the
 *     field existed, for every session that was not resumed: unchanged.
 *  3. **Anything else is undecided, and says so.** Two or more candidates (a
 *     pre-field log, resumed) cannot be attributed to a session; a trailing
 *     `session_end` with no `session_start` after it contradicts the state
 *     file's existence. Both report `unchecked` with the reason rather than a
 *     number nobody can trust.
 */
function sessionAnchor(lines, truncated, historyRel) {
    const starts = [];
    let lastEnd = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('"event":"session_start"'))
            starts.push(i);
        else if (lines[i].includes('"event":"session_end"'))
            lastEnd = i;
    }
    // 1. The session's own identity, first occurrence.
    if (historyRel !== "") {
        const named = starts.find((i) => lines[i].includes(historyRel));
        if (named !== undefined)
            return { from: named, why: "" };
    }
    // 2. One unambiguous candidate since the last clean exit.
    const candidates = starts.filter((i) => i > lastEnd);
    if (candidates.length === 1)
        return { from: candidates[0], why: "" };
    // 3. Undecided, each with the reason that distinguishes it.
    if (candidates.length > 1) {
        const named = historyRel === "" ? "this session's history file" : historyRel;
        return {
            from: null,
            why: `${candidates.length} session_start lines since the last session_end and none names ` +
                `${named}, so which of them began this session is not decidable`,
        };
    }
    if (starts.length > 0) {
        return {
            from: null,
            why: "the event log's last session boundary is a session_end, so no session_start in it begins this session",
        };
    }
    if (truncated) {
        // Counting from the start of a window that begins mid-session would report
        // every Turn of every earlier session in the tail as this session's.
        return { from: null, why: "no session_start inside the read tail of the event log" };
    }
    // A log that has never recorded a session boundary: the whole tail is it.
    return { from: 0, why: "" };
}
/**
 * Turns started since this session began — never since this process did.
 *
 * `historyRel` is `session.history_file` as `agentstate.yaml` carries it: the
 * session's identity, and what makes this count span an interruption exactly as
 * `commitsSince` already does. `sessionAnchor` above says why it is needed.
 */
function turnsRun(root, historyRel) {
    const path = resolve(root, EVENTS_REL);
    if (!existsSync(path)) {
        return { count: null, why: "orchestrator-events.jsonl is absent" };
    }
    const read = tail(path, EVENT_TAIL_BYTES);
    if (read === null)
        return { count: null, why: "orchestrator-events.jsonl is unreadable" };
    const lines = read.text.split("\n");
    const anchor = sessionAnchor(lines, read.truncated, historyRel);
    if (anchor.from === null)
        return { count: null, why: anchor.why };
    let count = 0;
    for (let i = anchor.from; i < lines.length; i++) {
        if (lines[i].includes('"event":"turn_start"'))
            count++;
    }
    return { count, why: "" };
}
/** Commits on HEAD since the session's recorded starting point. */
function commitsSince(root, head) {
    if (head === "")
        return { count: null, why: "session.git_head_at_start is unset" };
    const out = git(root, ["rev-list", "--count", `${head}..HEAD`]);
    if (out === null) {
        // A hash that no longer resolves (a rebase, a fresh clone, a shallow one)
        // is not drift and must not be reported as one.
        return { count: null, why: `git could not count ${head}..HEAD` };
    }
    const n = Number.parseInt(out.trim(), 10);
    if (!Number.isFinite(n))
        return { count: null, why: "git printed no count" };
    return { count: n, why: "" };
}
/** The active Circle's record file, or null with the reason it is not there. */
function circleRecord(root) {
    const pointer = resolve(root, POINTER_REL);
    if (!existsSync(pointer))
        return { path: null, why: "" }; // no Circle active — ordinary
    let name = "";
    try {
        name = readFileSync(pointer, "utf-8").trim();
    }
    catch {
        return { path: null, why: ".active-circle is unreadable" };
    }
    if (name === "")
        return { path: null, why: "" };
    if (name.includes("/") || name.includes("\\")) {
        return { path: null, why: `.active-circle holds ${JSON.stringify(name)}, not a bare name` };
    }
    const dir = resolve(root, CIRCLES_REL, name);
    let entries;
    try {
        entries = readdirSync(dir);
    }
    catch {
        return { path: null, why: `circles/${name} does not exist` };
    }
    const rec = entries.find((e) => e.endsWith("_circle.md"));
    if (rec === undefined)
        return { path: null, why: `circles/${name} holds no *_circle.md` };
    return { path: resolve(dir, rec), why: "" };
}
/** `- Turn …` entries under the record's `## Turn log` heading. */
function turnLogEntries(recordPath) {
    let text;
    try {
        text = readFileSync(recordPath, "utf-8");
    }
    catch {
        return null;
    }
    const after = text.split(/^## Turn log[ \t]*$/m)[1];
    if (after === undefined)
        return null;
    const body = after.split(/^## /m)[0];
    return body.split("\n").filter((l) => /^- Turn\b/.test(l)).length;
}
/**
 * Whether the history file's `**Directive:**` line is still a placeholder.
 *
 * Only the placeholder shape counts. Different *wording* between the history
 * file and the state file is not drift — the two are written at different
 * moments and neither is the other's source; the fourth measured instance is
 * the one where the history line read "(not yet stated)" while the state file
 * carried the real Directive, and that is the only shape this looks for. Both
 * project languages are covered because the placeholder is authored prose:
 * `(not yet …)` in an `en` project, `(noch …)` in a `de` one.
 */
function directiveLine(historyPath) {
    let text;
    try {
        text = readFileSync(historyPath, "utf-8");
    }
    catch {
        return null;
    }
    const hit = /^\*\*Directive:\*\*[ \t]*(.*)$/m.exec(text);
    if (!hit)
        return null;
    const value = hit[1].trim();
    return { text: value, placeholder: /^\((?:not yet|noch|noch nicht|none|kein)/i.test(value) };
}
/* ------------------------------------------------------------------ *
 * The measurement
 * ------------------------------------------------------------------ */
function row(surface, says, record, verdict, why) {
    return why === undefined ? { surface, says, record, verdict } : { surface, says, record, verdict, why };
}
/**
 * Compare every bookkeeping surface with the record that can contradict it.
 *
 * The five rows and their conditions are the ones `agents/orchestrator.md`
 * `### Drift check` tabulates; that table is the contract and this is its
 * implementation. Two conditions are not derivable from the row name and are
 * the reason the table exists: `progress.commits` tolerates a difference of one
 * (the commit currently in flight), and the Directive row counts only a
 * placeholder, never different wording.
 */
export function measureStateDrift(root) {
    const read = readStateFile(root);
    if (!read.ok) {
        return { root, statePresent: false, rows: [], drifted: [], signature: "" };
    }
    const state = read.text;
    const rows = [];
    /**
     * The session's identity, read once and used by two rows.
     *
     * Row 3 compares it with the disk. Row 2 uses it to find where this session
     * begins in the event log, which is what makes the Turn row and the commits
     * row measure one session rather than two (issue `260811-2143`).
     */
    const historyRel = stateField(state, "history_file");
    // 1. progress.commits against git — the row that measured 6, 7, 8 and 12.
    const head = stateField(state, "git_head_at_start");
    const claimed = Number.parseInt(stateField(state, "commits"), 10);
    const real = commitsSince(root, head);
    if (real.count === null || !Number.isFinite(claimed)) {
        rows.push(row("progress.commits", Number.isFinite(claimed) ? String(claimed) : "(unset)", real.count === null ? "?" : String(real.count), "unchecked", real.count === null ? real.why : "progress.commits is unset or not a number"));
    }
    else {
        rows.push(row("progress.commits", String(claimed), `${real.count} (git ${head}..HEAD)`, Math.abs(real.count - claimed) > 1 ? "drift" : "ok"));
    }
    // 2. progress.turn against the event log — never against itself.
    const turns = turnsRun(root, historyRel);
    const claimedTurn = Number.parseInt(stateField(state, "turn"), 10);
    if (turns.count === null || !Number.isFinite(claimedTurn)) {
        rows.push(row("progress.turn", Number.isFinite(claimedTurn) ? String(claimedTurn) : "(unset)", turns.count === null ? "?" : String(turns.count), "unchecked", turns.count === null ? turns.why : "progress.turn is unset or not a number"));
    }
    else {
        rows.push(row("progress.turn", String(claimedTurn), `${turns.count} (turn_start events since this session began)`, turns.count !== claimedTurn ? "drift" : "ok"));
    }
    // 3. session.history_file against the disk — the dangling resume anchor.
    const historyPath = historyRel === "" ? null : resolve(root, WB, historyRel);
    if (historyRel === "") {
        rows.push(row("session.history_file", "(unset)", "-", "unchecked", "session.history_file is unset"));
    }
    else {
        const present = historyPath !== null && existsSync(historyPath);
        rows.push(row("session.history_file", historyRel, present ? "present (on disk)" : "MISSING (on disk)", present ? "ok" : "drift"));
    }
    // 4. The history file's Directive line against the state file's.
    const directive = stateField(state, "directive");
    const line = historyPath === null ? null : directiveLine(historyPath);
    if (line === null || directive === "") {
        rows.push(row("history Directive", line === null ? "(unreadable)" : line.text.slice(0, 40), directive === "" ? "(unset)" : directive.slice(0, 40), "unchecked", line === null ? "the history file has no **Directive:** line" : "session.directive is unset"));
    }
    else {
        rows.push(row("history Directive", line.text.slice(0, 40), directive.slice(0, 40), line.placeholder ? "drift" : "ok"));
    }
    // 5. The Circle record's Turn log against the Turns run. Absent Circle is the
    //    ordinary state of a session with no Circle active, and produces no row —
    //    there is nothing to contradict. A Circle that IS active but whose record
    //    cannot be read produces an `unchecked` row, never silence.
    const rec = circleRecord(root);
    if (rec.why !== "") {
        rows.push(row("Circle Turn log", "?", "?", "unchecked", rec.why));
    }
    else if (rec.path !== null) {
        const entries = turnLogEntries(rec.path);
        if (entries === null || turns.count === null) {
            rows.push(row("Circle Turn log", entries === null ? "?" : `${entries} entries`, turns.count === null ? "?" : `${turns.count} turns run`, "unchecked", entries === null ? "the Circle record has no ## Turn log section" : turns.why));
        }
        else {
            rows.push(row("Circle Turn log", `${entries} entries`, `${turns.count} turns run`, entries < turns.count ? "drift" : "ok"));
        }
    }
    const drifted = rows.filter((r) => r.verdict === "drift");
    const signature = drifted.map((r) => `${r.surface}=${r.says}|${r.record}`).join(";");
    return { root, statePresent: true, rows, drifted, signature };
}
/* ------------------------------------------------------------------ *
 * The throttle
 * ------------------------------------------------------------------ */
/**
 * The throttle record's only field, read as a signature.
 *
 * Total, as `lib/guard-state-file.ts` requires: an absent file, unreadable
 * text, a non-object and a `reported` of the wrong type all read as "never
 * reported", which is the safe direction — the next drift speaks rather than
 * being silently swallowed by a state nobody can parse.
 */
function coerceThrottle(value) {
    if (!isStateObject(value))
        return "";
    return typeof value.reported === "string" ? value.reported : "";
}
/**
 * The signature last reported to the model, or "" when none was.
 *
 * Without this the hook would repeat itself on every tool call for as long as
 * the drift stands, and a message that arrives on every call is one an agent
 * learns to read past — the failure this whole mechanism exists to catch,
 * arriving one level up (the same reasoning `agents/orchestrator.md` records
 * for the Circle row's `if`).
 */
export function lastReported(root) {
    return loadGuardState(THROTTLE_FILE, coerceThrottle, root);
}
/** Record the signature just reported. `""` clears it, so a later drift speaks again. */
export function recordReported(root, signature) {
    saveGuardState(THROTTLE_FILE, { reported: signature }, root);
}
/* ------------------------------------------------------------------ *
 * Rendering
 * ------------------------------------------------------------------ */
/** One row, in the fixed-width shape the prompt's `row()` printed. */
export function renderRow(r) {
    const tag = r.verdict === "drift" ? "  DRIFT" : r.verdict === "unchecked" ? `  UNCHECKED (${r.why})` : "";
    return `  ${r.surface.padEnd(22)} surface=${r.says.padEnd(16)} record=${r.record}${tag}`;
}
/**
 * The sentence handed back to the model when a surface has drifted.
 *
 * It names what diverged and from what, and asks for exactly the writes
 * `agents/orchestrator.md` `### Write Points` already required — nothing new,
 * and nothing this process does itself.
 */
export function driftSentence(report) {
    const rows = report.drifted
        .map((r) => `${r.surface} says ${r.says}, the record says ${r.record}`)
        .join("; ");
    return ("fusion: session bookkeeping has drifted from the records that cannot freeze. " +
        rows +
        ". This is issue 260801-2038, measured six times: agentstate.yaml, the active " +
        "Circle's Turn log and this session's history file stop being written after " +
        "Turn 1 while the session runs on, and an interrupted-session resume then " +
        "restarts from a point hours behind reality. If you are the orchestrator, do " +
        "the writes Write Points already required — the state file, the Circle's " +
        "Turn-log entry, the history file's Per-Turn Log — and emit a state_drift " +
        "event naming these rows before agentstate.yaml is deleted at Cleanup. If you " +
        "are a sub-agent, carry this line into your report; the state surfaces are the " +
        "orchestrator's to write and yours to leave alone.");
}
