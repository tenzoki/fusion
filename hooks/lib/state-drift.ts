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

import { execFileSync } from "node:child_process";
import {
  closeSync,
  existsSync,
  fstatSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { resolve } from "node:path";

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
const STATE_DIR_REL = `${WB}/.guard-state`;
const THROTTLE_REL = `${STATE_DIR_REL}/state-drift.json`;

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

/** Enough for a local `git rev-list` on any repository this will meet. */
const GIT_TIMEOUT_MS = 5_000;

/* ------------------------------------------------------------------ *
 * The report shape
 * ------------------------------------------------------------------ */

/**
 * `ok` — the two values agree under this row's own condition.
 * `drift` — they disagree, and the disagreement is a fault.
 * `unchecked` — the comparison could not be made; `why` says what was missing.
 */
export type RowVerdict = "ok" | "drift" | "unchecked";

export interface DriftRow {
  /** The bookkeeping surface, spelled as `agents/orchestrator.md` spells it. */
  surface: string;
  /** What the (freezable) surface says. */
  says: string;
  /** What the un-freezable record says. */
  record: string;
  verdict: RowVerdict;
  /** Why the row could not be decided. Present only when `unchecked`. */
  why?: string;
}

export interface DriftReport {
  /** The workbench root, or null when there is no fusion project above cwd. */
  root: string | null;
  /** False when `agentstate.yaml` is absent — no session state to compare. */
  statePresent: boolean;
  rows: DriftRow[];
  /** The subset of `rows` whose verdict is `drift`. */
  drifted: DriftRow[];
  /**
   * A stable identity for the current divergence, empty when nothing drifted.
   *
   * This is what the throttle compares. It carries both values of every drifted
   * row, so a divergence that GROWS — the session committed again without
   * bringing the surfaces current — reads as a new signature and is reported
   * again, while a divergence that merely persists across the next tool call is
   * reported once.
   */
  signature: string;
}

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
export function readStateFile(
  root: string,
): { ok: true; text: string } | { ok: false; missing: boolean } {
  const path = resolve(root, STATE_REL);
  if (!existsSync(path)) return { ok: false, missing: true };
  try {
    return { ok: true, text: readFileSync(path, "utf-8") };
  } catch {
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
export function stateField(state: string, key: string): string {
  const re = new RegExp(`^[ \\t]*${key}:[ \\t]*(.*)$`, "m");
  const hit = re.exec(state);
  if (!hit) return "";
  return hit[1].trim().replace(/^["']/, "").replace(/["']$/, "").trim();
}

/**
 * The last `EVENT_TAIL_BYTES` of a file, or the whole file when it is smaller.
 *
 * Returns null when the file cannot be read at all. `truncated` says whether
 * anything was cut, which is what decides between counting and reporting the
 * Turn row unchecked.
 */
function tail(path: string, maxBytes: number): { text: string; truncated: boolean } | null {
  let fd: number | null = null;
  try {
    fd = openSync(path, "r");
    const size = fstatSync(fd).size;
    const from = size > maxBytes ? size - maxBytes : 0;
    const length = size - from;
    const buf = Buffer.alloc(length);
    if (length > 0) readSync(fd, buf, 0, length, from);
    return { text: buf.toString("utf-8"), truncated: from > 0 };
  } catch {
    return null;
  } finally {
    if (fd !== null) {
      try {
        closeSync(fd);
      } catch {
        /* nothing left to do with it */
      }
    }
  }
}

/** Turns started since the last `session_start` in the event log. */
function turnsRun(root: string): { count: number | null; why: string } {
  const path = resolve(root, EVENTS_REL);
  if (!existsSync(path)) {
    return { count: null, why: "orchestrator-events.jsonl is absent" };
  }
  const read = tail(path, EVENT_TAIL_BYTES);
  if (read === null) return { count: null, why: "orchestrator-events.jsonl is unreadable" };

  const lines = read.text.split("\n");
  let from = 0;
  let found = false;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes('"event":"session_start"')) {
      from = i;
      found = true;
      break;
    }
  }
  if (!found && read.truncated) {
    // Counting from the start of a window that begins mid-session would report
    // every Turn of every earlier session in the tail as this session's.
    return { count: null, why: "no session_start inside the read tail of the event log" };
  }

  let count = 0;
  for (let i = from; i < lines.length; i++) {
    if (lines[i].includes('"event":"turn_start"')) count++;
  }
  return { count, why: "" };
}

/** Commits on HEAD since the session's recorded starting point. */
function commitsSince(root: string, head: string): { count: number | null; why: string } {
  if (head === "") return { count: null, why: "session.git_head_at_start is unset" };
  try {
    const out = execFileSync("git", ["rev-list", "--count", `${head}..HEAD`], {
      cwd: root,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT_MS,
      stdio: ["ignore", "pipe", "ignore"],
    });
    const n = Number.parseInt(out.trim(), 10);
    if (!Number.isFinite(n)) return { count: null, why: "git printed no count" };
    return { count: n, why: "" };
  } catch {
    // A hash that no longer resolves (a rebase, a fresh clone, a shallow one)
    // is not drift and must not be reported as one.
    return { count: null, why: `git could not count ${head}..HEAD` };
  }
}

/** The active Circle's record file, or null with the reason it is not there. */
function circleRecord(root: string): { path: string | null; why: string } {
  const pointer = resolve(root, POINTER_REL);
  if (!existsSync(pointer)) return { path: null, why: "" }; // no Circle active — ordinary
  let name = "";
  try {
    name = readFileSync(pointer, "utf-8").trim();
  } catch {
    return { path: null, why: ".active-circle is unreadable" };
  }
  if (name === "") return { path: null, why: "" };
  if (name.includes("/") || name.includes("\\")) {
    return { path: null, why: `.active-circle holds ${JSON.stringify(name)}, not a bare name` };
  }
  const dir = resolve(root, CIRCLES_REL, name);
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return { path: null, why: `circles/${name} does not exist` };
  }
  const rec = entries.find((e) => e.endsWith("_circle.md"));
  if (rec === undefined) return { path: null, why: `circles/${name} holds no *_circle.md` };
  return { path: resolve(dir, rec), why: "" };
}

/** `- Turn …` entries under the record's `## Turn log` heading. */
function turnLogEntries(recordPath: string): number | null {
  let text: string;
  try {
    text = readFileSync(recordPath, "utf-8");
  } catch {
    return null;
  }
  const after = text.split(/^## Turn log[ \t]*$/m)[1];
  if (after === undefined) return null;
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
function directiveLine(historyPath: string): { text: string; placeholder: boolean } | null {
  let text: string;
  try {
    text = readFileSync(historyPath, "utf-8");
  } catch {
    return null;
  }
  const hit = /^\*\*Directive:\*\*[ \t]*(.*)$/m.exec(text);
  if (!hit) return null;
  const value = hit[1].trim();
  return { text: value, placeholder: /^\((?:not yet|noch|noch nicht|none|kein)/i.test(value) };
}

/* ------------------------------------------------------------------ *
 * The measurement
 * ------------------------------------------------------------------ */

function row(
  surface: string,
  says: string,
  record: string,
  verdict: RowVerdict,
  why?: string,
): DriftRow {
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
export function measureStateDrift(root: string): DriftReport {
  const read = readStateFile(root);
  if (!read.ok) {
    return { root, statePresent: false, rows: [], drifted: [], signature: "" };
  }
  const state = read.text;

  const rows: DriftRow[] = [];

  // 1. progress.commits against git — the row that measured 6, 7, 8 and 12.
  const head = stateField(state, "git_head_at_start");
  const claimed = Number.parseInt(stateField(state, "commits"), 10);
  const real = commitsSince(root, head);
  if (real.count === null || !Number.isFinite(claimed)) {
    rows.push(
      row(
        "progress.commits",
        Number.isFinite(claimed) ? String(claimed) : "(unset)",
        real.count === null ? "?" : String(real.count),
        "unchecked",
        real.count === null ? real.why : "progress.commits is unset or not a number",
      ),
    );
  } else {
    rows.push(
      row(
        "progress.commits",
        String(claimed),
        `${real.count} (git ${head}..HEAD)`,
        Math.abs(real.count - claimed) > 1 ? "drift" : "ok",
      ),
    );
  }

  // 2. progress.turn against the event log — never against itself.
  const turns = turnsRun(root);
  const claimedTurn = Number.parseInt(stateField(state, "turn"), 10);
  if (turns.count === null || !Number.isFinite(claimedTurn)) {
    rows.push(
      row(
        "progress.turn",
        Number.isFinite(claimedTurn) ? String(claimedTurn) : "(unset)",
        turns.count === null ? "?" : String(turns.count),
        "unchecked",
        turns.count === null ? turns.why : "progress.turn is unset or not a number",
      ),
    );
  } else {
    rows.push(
      row(
        "progress.turn",
        String(claimedTurn),
        `${turns.count} (turn_start events this session)`,
        turns.count !== claimedTurn ? "drift" : "ok",
      ),
    );
  }

  // 3. session.history_file against the disk — the dangling resume anchor.
  const historyRel = stateField(state, "history_file");
  const historyPath = historyRel === "" ? null : resolve(root, WB, historyRel);
  if (historyRel === "") {
    rows.push(row("session.history_file", "(unset)", "-", "unchecked", "session.history_file is unset"));
  } else {
    const present = historyPath !== null && existsSync(historyPath);
    rows.push(
      row("session.history_file", historyRel, present ? "present (on disk)" : "MISSING (on disk)",
        present ? "ok" : "drift"),
    );
  }

  // 4. The history file's Directive line against the state file's.
  const directive = stateField(state, "directive");
  const line = historyPath === null ? null : directiveLine(historyPath);
  if (line === null || directive === "") {
    rows.push(
      row("history Directive", line === null ? "(unreadable)" : line.text.slice(0, 40),
        directive === "" ? "(unset)" : directive.slice(0, 40), "unchecked",
        line === null ? "the history file has no **Directive:** line" : "session.directive is unset"),
    );
  } else {
    rows.push(
      row("history Directive", line.text.slice(0, 40), directive.slice(0, 40),
        line.placeholder ? "drift" : "ok"),
    );
  }

  // 5. The Circle record's Turn log against the Turns run. Absent Circle is the
  //    ordinary state of a session with no Circle active, and produces no row —
  //    there is nothing to contradict. A Circle that IS active but whose record
  //    cannot be read produces an `unchecked` row, never silence.
  const rec = circleRecord(root);
  if (rec.why !== "") {
    rows.push(row("Circle Turn log", "?", "?", "unchecked", rec.why));
  } else if (rec.path !== null) {
    const entries = turnLogEntries(rec.path);
    if (entries === null || turns.count === null) {
      rows.push(
        row("Circle Turn log", entries === null ? "?" : `${entries} entries`,
          turns.count === null ? "?" : `${turns.count} turns run`, "unchecked",
          entries === null ? "the Circle record has no ## Turn log section" : turns.why),
      );
    } else {
      rows.push(
        row("Circle Turn log", `${entries} entries`, `${turns.count} turns run`,
          entries < turns.count ? "drift" : "ok"),
      );
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
 * The signature last reported to the model, or "" when none was.
 *
 * Without this the hook would repeat itself on every tool call for as long as
 * the drift stands, and a message that arrives on every call is one an agent
 * learns to read past — the failure this whole mechanism exists to catch,
 * arriving one level up (the same reasoning `agents/orchestrator.md` records
 * for the Circle row's `if`).
 */
export function lastReported(root: string): string {
  try {
    const raw = readFileSync(resolve(root, THROTTLE_REL), "utf-8");
    const parsed = JSON.parse(raw) as { reported?: unknown };
    return typeof parsed.reported === "string" ? parsed.reported : "";
  } catch {
    return "";
  }
}

/** Record the signature just reported. `""` clears it, so a later drift speaks again. */
export function recordReported(root: string, signature: string): void {
  const dir = resolve(root, STATE_DIR_REL);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    resolve(root, THROTTLE_REL),
    JSON.stringify({ reported: signature }) + "\n",
    "utf-8",
  );
}

/* ------------------------------------------------------------------ *
 * Rendering
 * ------------------------------------------------------------------ */

/** One row, in the fixed-width shape the prompt's `row()` printed. */
export function renderRow(r: DriftRow): string {
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
export function driftSentence(report: DriftReport): string {
  const rows = report.drifted
    .map((r) => `${r.surface} says ${r.says}, the record says ${r.record}`)
    .join("; ");
  return (
    "fusion: session bookkeeping has drifted from the records that cannot freeze. " +
    rows +
    ". This is issue 260801-2038, measured six times: agentstate.yaml, the active " +
    "Circle's Turn log and this session's history file stop being written after " +
    "Turn 1 while the session runs on, and an interrupted-session resume then " +
    "restarts from a point hours behind reality. If you are the orchestrator, do " +
    "the writes Write Points already required — the state file, the Circle's " +
    "Turn-log entry, the history file's Per-Turn Log — and emit a state_drift " +
    "event naming these rows before agentstate.yaml is deleted at Cleanup. If you " +
    "are a sub-agent, carry this line into your report; the state surfaces are the " +
    "orchestrator's to write and yours to leave alone."
  );
}
