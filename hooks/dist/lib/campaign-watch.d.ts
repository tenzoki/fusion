/**
 * The one poll both campaign sessions use: `probe`, which asks the remote
 * where the upstream branch stands, and `watch`, which repeats the probe on
 * an interval and prints a line only when the answer changes. Behind
 * `bin/fusion-campaign probe` and `watch`; that script's header,
 * `## probe and watch`, is the authoritative documentation of the output, and
 * this header is that of the mechanism.
 *
 * ## The probe
 *
 * The branch and its upstream are resolved as `fetchRef` in `lib/campaign.ts`
 * resolves them, in the same order and under the same state names, so a state
 * means the same thing on `probe` as on `overview`. Then one
 * `git ls-remote <remote> <remote ref>`, with every credential prompt turned
 * into a failure (`GIT_TERMINAL_PROMPT=0`, a batch mode ssh). No fetch, no
 * extraction, no codec: the probe answers "where is the head" and nothing
 * else, so a watch that sees no move costs one round trip and no turn.
 *
 * A remote that cannot be asked is `fetch-failed`, the name `overview` gives
 * the same failure of its fetch; a remote that answers without the branch is
 * `upstream-unresolved`. An upstream on the local repository (remote `.`) is
 * asked as `git ls-remote .`, which reads the local ref.
 *
 * ## The watch
 *
 * `watchLoop` never returns. The last head seen starts as `--since` where one
 * is given, so the first probe is compared against the head the caller last
 * read and not against itself: a push that lands between a monitor's expiry
 * and its re-arm is still a `moved=` (the expiry race of
 * `261120-1242-can-an-idle-session-poll-the-remote.md`). Without
 * `--since` the first answer is the baseline and prints nothing. A failure
 * prints once per run of failures, so a remote that is down for an hour is
 * one line and not twelve.
 *
 * ## The report mode
 *
 * `reportLoop` is the watch for a session that a background command's exit
 * wakes (`--report steering|lane`): it prints only what the session must act
 * on, then returns, so the exit is the wake. A probe whose head begins with
 * the last head seen is no move. On a move, `reportRows` fetches once and
 * extracts the old and the new head once each (`sideAt`), and computes the
 * mode's rows from what the overview and `sync` already compute: mode
 * `steering` the `--since` rows of `withSince` over `steeringAt`, and a
 * campaign that was `running` at the old head and is not at the new; mode
 * `lane` this checkout's questions by `mineOf` and `laneViewOf`, answered at
 * the new head and not at the old, and its campaign leaving `running`. A move
 * with no row becomes the last head in silence, so a push of this checkout's
 * own carries no wake unless it carries a row; no record of own pushes is
 * kept. A move whose fetch fails or whose new head does not read keeps the old
 * last head and counts as a failed probe, so the row it carried is reported
 * after the recovery. An old head that names no commit, is no ancestor of the
 * new or does not read is `unknown`, as `steeringSince` has it: every row
 * counts as new, with `note=since-unknown`, the one duplicate the mode allows.
 *
 * An outage is told once per session, by a state file
 * `campaign-watch-<session>.state` beside the pid file. Every failed probe
 * writes it or refreshes its mtime; a file older than two intervals is stale
 * and counts as absent. A failed probe with no fresh file writes it, prints
 * `failed=` and returns; with a fresh file it stays silent. A success removes
 * the file and prints nothing. So a re-armed watch, a new process, stays
 * silent in the outage its predecessor reported, and a new process, or a
 * resumed one after the file went stale, hears of a new outage.
 *
 * ## The bound on the remote
 *
 * Every `ls-remote` is killed after `REMOTE_TIMEOUT_MS`, and so is the report
 * mode's fetch (`fetchRef`'s `timeoutMs`): either is `fetch-failed`. Without
 * the bound a remote that accepts the connection and never answers would
 * silence a watch that no expiry restarts (issue
 * `261120-2050-campaign-watch-sets-no-timeout-on-ls-remote-so-a-hanging-remote-silences-it.md`).
 *
 * ## One watch per session and checkout
 *
 * The pid file is `campaign-watch-<session>.pid` under what `bin/fusion-tmp
 * path` prints, a directory that is already per checkout. A file whose pid
 * `kill -0` finds alive is a live twin; any other file is stale, from a
 * watch killed by its monitor's expiry, and is replaced. The file is removed
 * on exit when it still names this process.
 */
import { type Ask } from "./record-client.js";
/** How long one `ls-remote` or the report mode's fetch may take before it is killed and counts as `fetch-failed`. */
export declare const REMOTE_TIMEOUT_MS = 60000;
/** The states a probe can end in besides `ok`: `fetchRef`'s, less the two that need an extraction. */
export type ProbeState = "no-work-tree" | "no-branch" | "no-upstream" | "upstream-unresolved" | "fetch-failed";
export type Probed = {
    state: "ok";
    branch: string;
    ref: string;
    head: string;
} | {
    state: ProbeState;
    branch?: string;
    ref?: string;
};
/** One probe, its `ls-remote` killed after `timeoutMs`. `stderr` is git's own, for the caller to pass on or to hold. */
export declare function probe(cwd: string, timeoutMs?: number): Promise<{
    probed: Probed;
    stderr: string;
}>;
/** The page of `probe`: `state=`, then `ref=` and `head=` on `ok`, or `branch=` and `ref=` as far as they were resolved. */
export declare function renderProbe(p: Probed): string;
export interface WatchDeps {
    probe: () => Promise<{
        probed: Probed;
        stderr: string;
    }>;
    /** One stdout line, written at once: the monitor reads line by line. */
    emit: (line: string) => void;
    /** git's stderr on the first failure of a run, so the reason is there once. */
    warn: (text: string) => void;
    sleep: (ms: number) => Promise<void>;
}
/** The poll. `since` is a full or abbreviated hash the caller last read, or null for "the first answer is the baseline". */
export declare function watchLoop(since: string | null, intervalMs: number, deps: WatchDeps): Promise<never>;
export type ReportMode = "steering" | "lane";
/**
 * The rows `mode` reports for the move from `since` to the head one bounded
 * fetch lands on, with that head; or the state that makes the move a failed
 * probe: `fetchRef`'s, or `unread` where the new head did not read.
 */
export declare function reportRows(cwd: string, workbench: string, since: string, mode: ReportMode, checkout: string | null, timeoutMs?: number, ask?: Ask): {
    rows: string[];
    head: string;
} | {
    failed: string;
};
/** The per-session outage memory of the header's `## The report mode`, at `file`, stale after two intervals. */
export interface Outage {
    fresh: () => boolean;
    mark: (state: string) => void;
    clear: () => void;
}
export declare function outageAt(file: string, intervalMs: number): Outage;
export interface ReportDeps extends WatchDeps {
    /** `reportRows` from the last head seen. */
    delta: (since: string) => {
        rows: string[];
        head: string;
    } | {
        failed: string;
    };
    outage: Outage;
}
/** The report mode's poll: returns 0 after printing rows and `head=`, or the first `failed=` of an outage this session was not told of. */
export declare function reportLoop(since: string | null, intervalMs: number, deps: ReportDeps): Promise<number>;
/** The pid file of the watch of `session` in this checkout's directory under `bin/fusion-tmp path`. */
export declare function pidFileOf(tmp: string, session: string | undefined): string;
/** The report mode's outage file beside the pid file `pidFile`. */
export declare const stateFileOf: (pidFile: string) => string;
/**
 * Take the pid file for this process, or report the live twin that holds it.
 * A file that exists and names no live process is replaced by rename. On
 * `claimed`, the file is removed at exit while it still names this process.
 */
export declare function claimWatch(file: string): "claimed" | "already-watching";
