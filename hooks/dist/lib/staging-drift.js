/**
 * Staging drift — the measurement behind issue `260811-0114`.
 *
 * ## The defect this answers
 *
 * The 17:23 queue rebuild of session `260810-1646` — `tasklist.md`, 2128 lines,
 * 1409 insertions against the committed copy — and its companion history file
 * `shared/history/260810-1723-tasklist-update.md` never entered a commit. The
 * queue the whole session worked from survived only in the working tree, for
 * eighteen commits, and nothing would have noticed if an ordinary
 * `git checkout -- fusion-workbench/` had taken it. A third file,
 * `.commit-msg-tmp`, sat at the workbench root holding the last commit's
 * message, because the message was written there instead of under `/tmp`.
 *
 * ## Why the staging rule did not catch it, and what that implies
 *
 * `agents/orchestrator.md` Step 3b step 4 installs a **shape**: every path
 * passed to `git add` is one you wrote out yourself — no `-A`, no `-u`, no
 * directory argument, no glob. That shape was installed after the opposite
 * defect (a `git add -u` over a directory staged three deletions whose renamed
 * successors were untracked, `f38f37d`), and it is right: it makes over-staging
 * impossible.
 *
 * It also makes under-staging **invisible**. A file nobody names is a file
 * nobody commits, and the queue rebuild ran forty-three minutes before the
 * range's first commit, so no task's staging list had a reason to name it. The
 * fix therefore cannot be a broader `git add` — loosening the shape is
 * explicitly excluded by the issue's own acceptance. It has to be a
 * measurement of the result, which is the move the guard already made when it
 * stopped predicting writes from a command's text and started fingerprinting
 * paths (`circles/260807-0923-guard-misst-statt-orakelt`).
 *
 * ## The trigger is HEAD, and it is measured rather than predicted
 *
 * This does not fire on every tool call, and it does not read a `Bash`
 * command's text to notice a commit. Both would be wrong, and for reasons this
 * codebase has already paid for:
 *
 *   - **Every tool call would cry wolf.** An unstaged record *mid-Turn* is the
 *     normal and correct state: a coder writes an issue file, and Step 3b
 *     stages it minutes later. A check that fires on its commonest path is one
 *     its reader learns to ignore (issue `260810-0710`, and
 *     `lib/review-coverage.ts` deciding the same question the same way).
 *   - **Reading the command would be the classifier again.** Deciding from a
 *     shell string whether it will move HEAD is the undecidable question the
 *     write-path classifier answered until v6.0.0; the git branch-switch policy
 *     that also asked it was deleted outright on 260809 after 24 consecutive
 *     false blocks. Nothing about a `Bash` command is read here.
 *
 * So the trigger is: **HEAD is not where it was on the previous tool call.**
 * That is a fact about the repository, read with one `git rev-parse`, and it is
 * true exactly once per commit — which is the moment a record left out of the
 * staging list becomes a record that missed its commit. `headMoved` below is
 * the whole of it.
 *
 * ## Classification, and why silence is never the answer
 *
 * `git status --porcelain` over the workbench reports everything, including
 * surfaces that are in flight by construction: `orchestrator-events.jsonl` is
 * appended to by every event emission, the session's own history file is
 * written all session long, `.guard-state/` moves on every guarded tool call.
 * Reporting those as faults would be the wolf-crying this module exists to
 * avoid. Dropping them would be the silence it exists to end.
 *
 * So every entry is classified and every entry is printed, with the reason:
 *
 *   - `commit-message` — a file whose name says it holds a commit message AND
 *     that no artifact store owns. A fault of its own kind: Step 3b prescribes
 *     `/tmp/fusion-commit-msg-<task-id>.txt` because `/tmp` is swept and the
 *     workbench is not, and `.commit-msg-tmp` is what improvising instead
 *     leaves behind. The store scoping is not a detail — without it the class
 *     also claimed every authored record whose topic slug says "commit
 *     message", and told the model to delete it (issue `260811-1141`).
 *   - `record` — an authored artifact: the root-anchored `tasklist.md` and
 *     `portfolio.md`, a Circle's `*_circle.md`, or anything under an artifact
 *     store. These are what a staging list is supposed to name.
 *   - `in-flight` — the live-state surfaces `rules/fusion-workbench-conventions.md`
 *     `## Which of them a tracked workbench tracks` groups as "do not track it",
 *     plus the three tracked-but-machine-written ones and the session's own
 *     history file. Never a fault.
 *   - `unclassified` — everything else under the workbench. Named, with the
 *     statement that it is **not** a record store and that nothing is claimed
 *     about it. The worked case is `shared/backlogs/`, a user's own note file:
 *     it must appear in a complete reading and must not raise an alarm.
 *
 * Only `record` and `commit-message` rows that are not fully staged enter the
 * verdict, the signature, and the sentence handed to the model. The CLI prints
 * all four classes, because the Turn-boundary read is deliberate and a
 * deliberate read should be complete.
 *
 * ## What it does NOT do
 *
 * It never stages anything, never commits, never writes a workbench record.
 * The only file it writes is its own throttle record under `.guard-state/`.
 * That is the same refusal `lib/state-drift.ts` states and for a stronger
 * reason here: a mechanism that staged files on its own behalf would be a
 * second author of the staging list, and the shape whose whole value is that
 * every path in it was written out by the party that knows why would be gone.
 * This makes an unstaged record impossible not to notice; it cannot commit it.
 *
 * ## Its callers
 *
 *   1. `hooks/tracker.ts` — the PostToolUse hook, on the HEAD-moved trigger.
 *   2. `hooks/staging-drift.ts` → `bin/fusion-staging-drift` — the CLI, read by
 *      `agents/orchestrator.md` at Phase 1 (after a queue rebuild is committed),
 *      at Step 3e (in the same command as the `turn_end` emission), and at
 *      Cleanup.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve, relative, sep } from "node:path";
import { readStateFile, stateField } from "./state-drift.js";
/* ------------------------------------------------------------------ *
 * Layout — root-anchored, exactly as `lib/state-drift.ts` reads it
 * ------------------------------------------------------------------ */
const WB = "fusion-workbench";
const THROTTLE_REL = `${WB}/.guard-state/staging-drift.json`;
/** Enough for a local `git status` on any repository this will meet. */
const GIT_TIMEOUT_MS = 10_000;
/**
 * The path Step 3b prescribes for a commit message, named here so the sentence
 * this module hands back can quote it rather than describe it.
 *
 * `commit-message-path.test.ts` asserts this constant and
 * `agents/orchestrator.md` still agree, so a prompt that moves the path fails
 * `npm test` instead of leaving the mechanism telling the model to use a path
 * the prompt no longer names.
 */
export const PRESCRIBED_MESSAGE_PATH = "/tmp/fusion-commit-msg-<task-id>.txt";
/**
 * The live-state surfaces, by exact workbench-relative name.
 *
 * The first six are the "do not track it" group of
 * `rules/fusion-workbench-conventions.md` `## Which of them a tracked workbench
 * tracks`; this repository's own `.gitignore` applies exactly that split, so in
 * a project that follows it they never reach `git status` at all. They are
 * listed anyway because whether the workbench is tracked, and how, is the
 * project's decision — a consumer that tracks `agentstate.yaml` must not be
 * told on every commit that it forgot to stage it.
 *
 * The last three are the opposite case and the more interesting one: they are
 * TRACKED by that same split, and they are still not a task's records.
 * `orchestrator-events.jsonl` is appended to by every event emission,
 * `.fusion-setup` is written by `/fusion:setup`, and the two `.plane-*` files
 * are owned by `bin/fusion-plane`. Each is in flight for the whole session by
 * construction, so a per-commit report about them would fire every time and
 * mean nothing.
 */
const LIVE_STATE = [
    { path: "agentstate.yaml", why: "live session state — overwritten every Turn, deleted at Cleanup" },
    { path: "orchestrator-live.md", why: "the dashboard — overwritten at every step of every task" },
    { path: ".session-marker", why: "the orchestrator heartbeat — mtime is the signal" },
    { path: ".active-circle", why: "the active-Circle pointer — one line, rewritten on activation" },
    { path: "monitor", why: "a verbatim copy of bin/monitor, re-created by /fusion:setup" },
    { path: "orchestrator-events.jsonl", why: "append-only — written by every event emission, in flight all session" },
    { path: ".fusion-setup", why: "the setup marker — written by /fusion:setup" },
    { path: ".plane-map.json", why: "the Plane id map — owned by bin/fusion-plane" },
    { path: ".plane-outbox.jsonl", why: "the Plane outbox — owned by bin/fusion-plane" },
];
/** Live-state directories, by workbench-relative prefix. */
const LIVE_PREFIXES = [
    { prefix: ".guard-state/", why: "hook state — written by every guarded tool call" },
    { prefix: ".commit-lock/", why: "the commit lock — held and released around every commit" },
];
/**
 * The artifact stores. A path with one of these as a segment holds authored
 * records, whether it sits under a Circle or under `shared/`.
 *
 * This is the same set `hooks/lib/__tests__/path-literal-lint.test.ts` calls
 * `TYPE_FOLDERS`, minus the three retired pre-v4 review folders — a converted
 * workbench has no `codereview/`, and a workbench that still does is a
 * `/fusion:migrate` matter rather than a staging one.
 */
const STORES = [
    "planning",
    "issues",
    "decisions",
    "history",
    "reviews",
    "analyses",
    "investigations",
    "consult",
    "memos",
];
/** The root-anchored records: authored text, not machine-refreshed. */
const ROOT_RECORDS = [
    { path: "tasklist.md", why: "the work queue — the file this issue was filed about" },
    { path: "portfolio.md", why: "the Circle portfolio briefing" },
];
/**
 * A commit-message file, by name.
 *
 * Deliberately a name pattern rather than the one path that was improvised:
 * `.commit-msg-tmp` is what happened once, and a check that recognised only
 * that spelling would miss the next improvisation. `grep -rn commit-msg-tmp`
 * over `agents/`, `skills/`, `bin/` and `hooks/` returned nothing at the time
 * the file appeared — no helper put it there, so no helper's spelling bounds
 * what to look for.
 *
 * Broad is right for finding the next improvisation and wrong as a sole
 * discriminator, so this is NOT one: `classify` applies it last, over only what
 * `LIVE_STATE`, `stashes/`, `ROOT_RECORDS` and `STORES` have all declined to
 * claim. See the ordering contract on `classify` for why, and for what the
 * scoping gives up.
 */
const COMMIT_MESSAGE = /commit[-._]?(msg|message)/i;
/* ------------------------------------------------------------------ *
 * git
 * ------------------------------------------------------------------ */
function git(root, args) {
    try {
        return execFileSync("git", args, {
            cwd: root,
            encoding: "utf-8",
            timeout: GIT_TIMEOUT_MS,
            stdio: ["ignore", "pipe", "ignore"],
        });
    }
    catch {
        return null;
    }
}
/**
 * Unquote a porcelain path.
 *
 * git C-quotes a path containing a special character and leaves it bare
 * otherwise. The bare case is every path fusion produces — its filenames are
 * slug-cased — so this exists for the workbench that also holds something else.
 * A quoted form that `JSON.parse` cannot read is returned with its quotes
 * intact rather than dropped: a path this cannot spell is still a path the
 * reader has to see.
 */
function unquote(raw) {
    if (!raw.startsWith('"'))
        return raw;
    try {
        return JSON.parse(raw);
    }
    catch {
        return raw;
    }
}
/* ------------------------------------------------------------------ *
 * Classification
 * ------------------------------------------------------------------ */
/**
 * Which class a workbench-relative path falls in, and why.
 *
 * The order is the contract, and the contract is one sentence: **every location
 * judgment runs first, the name test runs last.** Live state runs before the
 * store test so the session's own history file is not reported as a record it
 * has not finished writing; `stashes/` runs before it too, because a stash
 * snapshot is a frozen copy owned by `/fusion:circle-stash` rather than a
 * record this session authored; and `commit-message` runs at the end, claiming
 * only what no store owns and `ROOT_RECORDS` does not name.
 *
 * ## Why `commit-message` no longer runs first
 *
 * It did, so that a message file dropped inside a store was still read as one.
 * `COMMIT_MESSAGE` has no directory scope, so running it first also claimed
 * every authored record whose topic slug happens to say "commit message" —
 * three such records existed in this workbench the day it was filed, one of
 * them the record reporting this very defect — and `stagingSentence` then told
 * the model to delete them. Two failures in one, because the classes are
 * exclusive: the destructive instruction, and the silent suppression of the
 * unstaged `record` fault that same file actually was. Issue `260811-1141`.
 *
 * The distinguishing fact was never the name. A leftover message file is one no
 * store owns; an authored record is one a store does. That is a question about
 * location, which is how every other class here is already decided — so the fix
 * is ordering, not a second name pattern.
 *
 * ## What the scoping gives up, stated rather than glossed
 *
 * A commit message genuinely written into `shared/issues/` or a Circle's
 * `planning/` is no longer read as a message file. It comes back as an unstaged
 * `record`: the model is told to stage it, not to delete it, so the leftover
 * enters a commit instead of being swept, and the sentence naming
 * `PRESCRIBED_MESSAGE_PATH` is not printed for it. That case is real. It is also
 * the weaker of the two, on two counts — the misread runs in the safe direction
 * (stage, never delete), and the improvisation this class exists to catch is
 * `.commit-msg-tmp` at the workbench root, which the scoping still catches,
 * along with any other spelling anywhere the stores do not reach. The ordering
 * it replaces misread authored records in the destructive direction, and did so
 * demonstrably, three times over, before anything hypothetical was weighed.
 */
export function classify(rel, sessionHistory) {
    const segments = rel.split("/");
    const name = basename(rel);
    for (const live of LIVE_STATE) {
        if (rel === live.path)
            return { klass: "in-flight", why: live.why };
    }
    for (const live of LIVE_PREFIXES) {
        if (rel.startsWith(live.prefix))
            return { klass: "in-flight", why: live.why };
    }
    if (sessionHistory !== "" && rel === sessionHistory) {
        return {
            klass: "in-flight",
            why: "this session's own history file — written until the session ends",
        };
    }
    if (segments[0] === "stashes") {
        return {
            klass: "unclassified",
            why: "a stash snapshot, owned by /fusion:circle-stash — not a record this session authored",
        };
    }
    for (const record of ROOT_RECORDS) {
        if (rel === record.path)
            return { klass: "record", why: record.why };
    }
    if (segments[0] === "circles" && name.endsWith("_circle.md")) {
        return { klass: "record", why: "a Circle record" };
    }
    for (const store of STORES) {
        if (segments.includes(store)) {
            return { klass: "record", why: `an authored record under the ${store} store` };
        }
    }
    // Last, and only over what nothing above claimed.
    if (COMMIT_MESSAGE.test(name)) {
        return {
            klass: "commit-message",
            why: "a commit-message-shaped name that no artifact store owns — Step 3b prescribes " +
                PRESCRIBED_MESSAGE_PATH,
        };
    }
    return {
        klass: "unclassified",
        why: "not a record store and not live state — nothing is claimed about it",
    };
}
/* ------------------------------------------------------------------ *
 * The measurement
 * ------------------------------------------------------------------ */
const EMPTY = (root, why) => ({
    root,
    why,
    rows: [],
    faults: [],
    signature: "",
});
/**
 * Every `git status --porcelain` entry under the workbench, classified.
 *
 * `--untracked-files=all` rather than the default: without it git collapses an
 * untracked directory to a single entry, and the file that has to be named —
 * `shared/history/260810-1723-tasklist-update.md`, inside a directory git was
 * already tracking — is exactly the case where naming the file rather than its
 * directory is the whole report. The issue's own reproduction used the same
 * flag.
 *
 * Paths come out of porcelain relative to the repository toplevel, which is not
 * necessarily the workbench root — the layout allows the workbench to sit below
 * the git toplevel. So the toplevel is read and every path is re-anchored,
 * rather than assumed.
 */
export function measureStagingDrift(root) {
    const wbAbs = resolve(root, WB);
    const toplevelOut = git(root, ["rev-parse", "--show-toplevel"]);
    if (toplevelOut === null) {
        return EMPTY(root, `${root} is not inside a git repository — nothing is staged or unstaged here`);
    }
    const toplevel = toplevelOut.trim();
    const statusOut = git(root, ["status", "--porcelain", "--untracked-files=all", "--", wbAbs]);
    if (statusOut === null) {
        return EMPTY(root, `git status could not read ${WB}`);
    }
    // The session's own history file, workbench-relative, from the one surface
    // that records it. Absent state file, absent field and unreadable file all
    // collapse to "" — which classifies nothing and is the safe direction: the
    // history file is then read as an ordinary record, which over-reports rather
    // than staying quiet.
    const state = readStateFile(root);
    const sessionHistory = state.ok ? stateField(state.text, "history_file") : "";
    const rows = [];
    for (const line of statusOut.split("\n")) {
        if (line.length < 4)
            continue;
        const code = line.slice(0, 2);
        // A rename is `R  <old> -> <new>`. The new name is the one on disk and the
        // one a staging list would have to carry; the old one is reported with it,
        // because Step 3b's own rule is that a rename is two paths.
        const paths = line
            .slice(3)
            .split(" -> ")
            .map((p) => unquote(p.trim()))
            .filter((p) => p !== "");
        for (const p of paths) {
            const abs = resolve(toplevel, p);
            const rel = relative(wbAbs, abs);
            if (rel === "" || rel.startsWith("..") || rel.startsWith(sep))
                continue;
            const norm = rel.split(sep).join("/");
            const { klass, why } = classify(norm, sessionHistory);
            // Staged means: the index column says something and the worktree column
            // says nothing. `??` is untracked in both columns and is never staged.
            const staged = code[0] !== " " && code[0] !== "?" && code[1] === " ";
            const fault = (klass === "record" || klass === "commit-message") && !staged;
            rows.push({ path: norm, code, klass, why, staged, fault });
        }
    }
    rows.sort((a, b) => a.path.localeCompare(b.path));
    const faults = rows.filter((r) => r.fault);
    const signature = faults.map((r) => `${r.code}${r.path}`).join(";");
    return { root, why: "", rows, faults, signature };
}
/** The throttle record, or an empty one when there is none to read. */
export function readStagingState(root) {
    try {
        const raw = readFileSync(resolve(root, THROTTLE_REL), "utf-8");
        const parsed = JSON.parse(raw);
        return {
            head: typeof parsed.head === "string" ? parsed.head : "",
            reported: typeof parsed.reported === "string" ? parsed.reported : "",
        };
    }
    catch {
        return { head: "", reported: "" };
    }
}
/** Write the throttle record. `reported: ""` clears it, so a later miss speaks again. */
export function writeStagingState(root, state) {
    mkdirSync(resolve(root, `${WB}/.guard-state`), { recursive: true });
    writeFileSync(resolve(root, THROTTLE_REL), JSON.stringify(state) + "\n", "utf-8");
}
/** HEAD right now, or "" when git will not say (no repository, no commits yet). */
export function currentHead(root) {
    const out = git(root, ["rev-parse", "HEAD"]);
    return out === null ? "" : out.trim();
}
/**
 * Whether HEAD moved since the previous tool call — the trigger, in one place.
 *
 * `previous` is passed in rather than read here, because the caller has already
 * read the throttle record for the signature it also needs and this runs on
 * every guarded tool call; one file read a call is the budget.
 *
 * The first sighting is deliberately NOT a move. There is no previous value to
 * have moved from, and treating the absence of a record as a commit would fire
 * this on the first tool call of every fresh workbench — a report about a
 * commit that did not happen, which is the wolf-crying failure in its purest
 * form. The head is recorded and the answer is `false`.
 *
 * A HEAD that git will not name at all (no repository, or a repository with no
 * commits yet) is likewise not a move: there is no commit for a staging list to
 * have missed.
 */
export function headMoved(root, previous) {
    const head = currentHead(root);
    if (head === "")
        return { moved: false, head };
    return { moved: previous !== "" && previous !== head, head };
}
/* ------------------------------------------------------------------ *
 * Rendering
 * ------------------------------------------------------------------ */
/** One row: its class, its porcelain code, its path, and why it is classified so. */
export function renderStagingRow(r) {
    const tag = r.fault ? "  UNSTAGED" : r.staged ? "  staged" : "";
    return `  ${r.klass.padEnd(14)} ${r.code} ${r.path}${tag}  (${r.why})`;
}
/**
 * The sentence handed back to the model when a commit left a record behind.
 *
 * It names the paths rather than counting them, for the reason
 * `lib/review-coverage.ts` names commits rather than counting them: the session
 * that produced this issue could see `git status` at any moment for eighteen
 * commits and the number was never the part nobody read.
 *
 * It also says what NOT to do. An agent told "files were missed by `git add`"
 * reaches for `git add -A`, and that is the defect on the other side —
 * `f38f37d`, three records out of HEAD. The acceptance for this issue makes the
 * staging shape a constraint rather than a nicety, so the sentence carries it.
 */
export function stagingSentence(report) {
    if (report.faults.length === 0)
        return "";
    const records = report.faults.filter((r) => r.klass === "record");
    const messages = report.faults.filter((r) => r.klass === "commit-message");
    const parts = [];
    if (records.length > 0) {
        parts.push(`fusion: HEAD moved and ${records.length} record(s) under ${WB}/ are still uncommitted — ` +
            records.map((r) => `${r.path} (${r.code.trim() === "??" ? "untracked" : "unstaged"})`).join("; ") +
            ". No staging list named them, so no commit could carry them.");
    }
    if (messages.length > 0) {
        parts.push(`A commit-message-shaped file that no artifact store owns is sitting in the workbench: ` +
            `${messages.map((r) => r.path).join(", ")}. ` +
            `Step 3b writes the message to ${PRESCRIBED_MESSAGE_PATH} — /tmp is swept and the workbench is not, ` +
            "and the workbench is the tree git status reports on. Read the file before you act on it: if it is a " +
            "leftover commit message, delete it and write the next one to the prescribed path; if it is something " +
            "a session authored, name it to the user and stage it instead. This class is decided by the file's " +
            "NAME once every store has declined to claim it, so a false positive can enter it, and deleting an " +
            "authored file on a name match is not recoverable — issue 260811-1141 is what that cost when the " +
            "instruction was unconditional.");
    }
    parts.push("This is issue 260811-0114: a queue rebuild and its history file sat in the working tree for eighteen " +
        "commits because the rebuild ran before the first task and no task's staging list had a reason to name " +
        "them. If you are the orchestrator, add these paths — written out in full, absolute — to the next Step 3b " +
        "staging list, and commit a queue rebuild at Phase 1 where the dispatch that produced it happened. " +
        "Do NOT reach for `git add -A`, `-u`, a directory argument or a glob: the shape at Step 3b step 4 is what " +
        "makes over-staging impossible, it is not what failed here, and loosening it re-opens `f38f37d`. " +
        "If you are a sub-agent, carry this line into your report — committing is the orchestrator's.");
    return parts.join(" ");
}
