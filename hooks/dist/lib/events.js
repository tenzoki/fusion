/**
 * Append-only event logger for the Compliance Guard.
 *
 * Writes JSONL to state/events.jsonl. Each line is a self-contained
 * JSON object with timestamp, event type, and context.
 *
 * No-op when no fusion workbench is set up at or above the current
 * working directory (i.e. the project never ran `/fusion:setup`).
 */
import { appendFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { findWorkbenchRoot } from "./workbench-root.js";
function getEventsPath() {
    const root = findWorkbenchRoot();
    if (!root)
        return null;
    const stateDir = resolve(root, "fusion-workbench", ".guard-state");
    return { stateDir, eventsPath: resolve(stateDir, "events.jsonl") };
}
/**
 * The Claude Code session this hook run belongs to, or undefined.
 *
 * Module state, and safe as module state for one reason: a hook is a fresh node
 * process per tool call, so there is no second session for this to leak into.
 *
 * ## Why it is set here rather than passed at each call
 *
 * The alternative was a fifth parameter on `emitEvent`. It fails at the one call
 * site that matters most: the `guard_error` row both hooks emit from their
 * top-level `main().catch()` handler, which is outside `main` and has no `input`
 * in scope. Passing the value there means each hook hoisting a module-level
 * variable of its own — this variable, twice, with two chances to disagree about
 * when it is set. One seam, set once after the parse, and every row a run writes
 * carries the same answer.
 *
 * ## Absent, never empty
 *
 * A non-string or an empty string reads as unresolved, and an unresolved value
 * makes the key ABSENT from the row rather than present and empty. That is the
 * same rule `agents/orchestrator.md` `### 2. Structured Event Log` states for
 * `person` and `checkout` on the orchestrator's own log, and the reason is the
 * same: a reader can tell "no session was named" from "the session is the empty
 * string", and only one of those is a thing that can happen.
 *
 * A run that never reaches the parse — unreadable stdin, unparseable JSON —
 * never calls this, so its rows carry no session and say so by omission.
 */
let sessionId;
/** Record the session for every event this run goes on to emit. */
export function setEventSession(id) {
    sessionId = typeof id === "string" && id !== "" ? id : undefined;
}
/**
 * Append a single event to the JSONL log. No-op if no workbench is found.
 *
 * **There is no line or byte ceiling here, and none may be added.** Not as a
 * convenience, not as a "reasonable default", not as part of an unrelated
 * change. Every ceiling expressible in lines or bytes discards the OLDEST lines
 * first, and the oldest lines are the `guard_block`, `guard_halt` and
 * `halt_cleared` events — 0.6 % of the file at the measurement that settled
 * this, and the only lines recording the guard ever enforcing anything. A guard
 * that forgets it halted is a strange guard.
 *
 * What bounds the file instead is the archive step of `/fusion:cleanup`
 * (`--only archive`), which rolls the live log
 * into the archive store under a dated name and starts a fresh empty one. The
 * log is classified as evidence, not telemetry, in
 * `rules/fusion-workbench-conventions.md` `### Which of them a tracked
 * workbench tracks`; the reasoning and the three rejected alternatives are in
 * decision
 * `260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md`.
 *
 * A roll may move the file out from under this function between calls. That is
 * safe by construction: it opens, appends and closes on every call rather than
 * holding a descriptor, and `mkdirSync` + `appendFileSync` re-create both the
 * directory and the file.
 */
export function emitEvent(event, tool, file, detail) {
    const paths = getEventsPath();
    if (!paths)
        return;
    mkdirSync(paths.stateDir, { recursive: true });
    const entry = {
        ts: new Date().toISOString(),
        event,
        ...(sessionId && { session_id: sessionId }),
        ...(tool && { tool }),
        ...(file && { file }),
        ...(detail && { detail }),
    };
    appendFileSync(paths.eventsPath, JSON.stringify(entry) + "\n", "utf-8");
}
