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
 * ## One watch per session and checkout
 *
 * The pid file is `campaign-watch-<session>.pid` under what `bin/fusion-tmp
 * path` prints, a directory that is already per checkout. A file whose pid
 * `kill -0` finds alive is a live twin; any other file is stale, from a
 * watch killed by its monitor's expiry, and is replaced. The file is removed
 * on exit when it still names this process.
 */
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
/** One probe. `stderr` is git's own, for the caller to pass on or to hold. */
export declare function probe(cwd: string): Promise<{
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
/** The pid file of the watch of `session` in this checkout's directory under `bin/fusion-tmp path`. */
export declare function pidFileOf(tmp: string, session: string | undefined): string;
/**
 * Take the pid file for this process, or report the live twin that holds it.
 * A file that exists and names no live process is replaced by rename. On
 * `claimed`, the file is removed at exit while it still names this process.
 */
export declare function claimWatch(file: string): "claimed" | "already-watching";
