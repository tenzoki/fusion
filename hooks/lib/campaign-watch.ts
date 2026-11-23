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

import { spawn } from "node:child_process";
import { readFileSync, renameSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { extractAt, fetchRef, mustGit, readCampaignsAt, run, steeringAt, STEERING_ENTRIES, withScratch, withSince, type CampaignAtRef, type Overview, type Question, type Ready } from "./campaign.js";
import { laneViewOf, mineOf } from "./campaign-sync.js";
import { ask as askCodec, type Ask } from "./record-client.js";

/** How long one `ls-remote` or the report mode's fetch may take before it is killed and counts as `fetch-failed`. */
export const REMOTE_TIMEOUT_MS = 60_000;

/** The states a probe can end in besides `ok`: `fetchRef`'s, less the two that need an extraction. */
export type ProbeState = "no-work-tree" | "no-branch" | "no-upstream" | "upstream-unresolved" | "fetch-failed";

export type Probed = { state: "ok"; branch: string; ref: string; head: string } | { state: ProbeState; branch?: string; ref?: string };

/** The environment every remote call runs in: a prompt for credentials is an immediate failure. */
const BATCH_ENV = (): NodeJS.ProcessEnv => ({ ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_SSH_COMMAND: "ssh -oBatchMode=yes" });

type Upstream = { branch: string; ref: string; remote: string; remoteRef: string };

/** The branch, its upstream as `overview` prints it, and where to ask for it; or the state that stops the probe first. */
function upstreamOf(cwd: string): Upstream | { state: "no-work-tree" | "no-branch" | "no-upstream"; branch?: string } {
  if (run("git", ["rev-parse", "--is-inside-work-tree"], cwd).stdout.trim() !== "true") return { state: "no-work-tree" };
  const branch = run("git", ["symbolic-ref", "-q", "--short", "HEAD"], cwd).stdout.trim();
  if (branch === "") return { state: "no-branch" };
  const listed = run("git", ["for-each-ref", "--format=%(upstream:short)%09%(upstream:remotename)%09%(upstream:remoteref)", `refs/heads/${branch}`], cwd);
  const [ref = "", remote = "", remoteRef = ""] = listed.stdout.trim().split("\t");
  if (listed.status !== 0 || ref === "" || remoteRef === "") return { state: "no-upstream", branch };
  return { branch, ref, remote: remote === "" ? "." : remote, remoteRef };
}

/** One probe, its `ls-remote` killed after `timeoutMs`. `stderr` is git's own, for the caller to pass on or to hold. */
export async function probe(cwd: string, timeoutMs: number = REMOTE_TIMEOUT_MS): Promise<{ probed: Probed; stderr: string }> {
  const up = upstreamOf(cwd);
  if ("state" in up) return { probed: up, stderr: "" };
  const { branch, ref } = up;
  const asked = await new Promise<{ status: number; stdout: string; stderr: string }>((resolve) => {
    const child = spawn("git", ["ls-remote", up.remote, up.remoteRef], { cwd, env: BATCH_ENV(), stdio: ["ignore", "pipe", "pipe"] });
    let [stdout, stderr] = ["", ""];
    const done = (r: { status: number; stdout: string; stderr: string }): void => {
      clearTimeout(timer);
      resolve(r);
    };
    // Not `close`: a transport's own child may hold the pipes open long after git itself was killed.
    const timer = setTimeout(() => {
      child.kill();
      child.stdout.destroy();
      child.stderr.destroy();
      done({ status: -1, stdout: "", stderr: `${stderr}git ls-remote did not answer within ${timeoutMs / 1000} s and was stopped.\n` });
    }, timeoutMs);
    child.stdout.on("data", (d: Buffer) => (stdout += d.toString("utf-8")));
    child.stderr.on("data", (d: Buffer) => (stderr += d.toString("utf-8")));
    child.on("error", (e) => done({ status: -1, stdout, stderr: String(e) }));
    child.on("close", (status) => done({ status: status ?? -1, stdout, stderr }));
  });
  if (asked.status !== 0) return { probed: { state: "fetch-failed", branch, ref }, stderr: asked.stderr };
  // ls-remote matches a pattern by its tail; only the exact ref is the answer.
  const head = asked.stdout.split("\n").map((l) => l.split("\t")).find(([, name]) => name === up.remoteRef)?.[0];
  if (head === undefined || !/^[0-9a-f]{40,64}$/.test(head)) return { probed: { state: "upstream-unresolved", branch, ref }, stderr: asked.stderr };
  return { probed: { state: "ok", branch, ref, head }, stderr: asked.stderr };
}

/** The page of `probe`: `state=`, then `ref=` and `head=` on `ok`, or `branch=` and `ref=` as far as they were resolved. */
export function renderProbe(p: Probed): string {
  const lines = [`state=${p.state}`];
  if (p.state === "ok") lines.push(`ref=${p.ref}`, `head=${p.head}`);
  else {
    if (p.branch !== undefined) lines.push(`branch=${p.branch}`);
    if (p.ref !== undefined) lines.push(`ref=${p.ref}`);
  }
  return lines.join("\n") + "\n";
}

export interface WatchDeps {
  probe: () => Promise<{ probed: Probed; stderr: string }>;
  /** One stdout line, written at once: the monitor reads line by line. */
  emit: (line: string) => void;
  /** git's stderr on the first failure of a run, so the reason is there once. */
  warn: (text: string) => void;
  sleep: (ms: number) => Promise<void>;
}

/** The poll. `since` is a full or abbreviated hash the caller last read, or null for "the first answer is the baseline". */
export async function watchLoop(since: string | null, intervalMs: number, deps: WatchDeps): Promise<never> {
  let seen = since;
  let failing = false;
  for (;;) {
    const { probed, stderr } = await deps.probe();
    if (probed.state !== "ok") {
      if (!failing) {
        deps.emit(`failed=${probed.state}`);
        if (stderr !== "") deps.warn(stderr);
      }
      failing = true;
    } else {
      if (failing) deps.emit(`recovered=${probed.head}`);
      failing = false;
      // An abbreviated `--since` that the head begins with is the same commit, not a move.
      if (seen !== null && !probed.head.startsWith(seen)) deps.emit(`moved=${seen}\t${probed.head}`);
      seen = probed.head;
    }
    await deps.sleep(intervalMs);
  }
}

/* ------------------------------------------------------------------ *
 * The report mode
 * ------------------------------------------------------------------ */

export type ReportMode = "steering" | "lane";

/** One side of a move: the workbench extracted at a commit, null where it is in no tree there, and its campaigns. */
interface Side {
  workbench: string | null;
  campaigns: CampaignAtRef[];
}

type At = { gitRoot: string; head: string; rel: string };

/** The side at `sha` extracted below `into`; `unknown` where `sha` names no commit or no ancestor of the head, as `steeringSince` has it; `unread` where its campaigns did not read. */
function sideAt(at: At, sha: string, into: string, ask: Ask): Side | "unknown" | "unread" {
  const resolved = run("git", ["rev-parse", "-q", "--verify", "--end-of-options", `${sha}^{commit}`], at.gitRoot);
  if (resolved.status !== 0) return "unknown";
  const commit = resolved.stdout.trim();
  if (run("git", ["merge-base", "--is-ancestor", commit, at.head], at.gitRoot).status !== 0) return "unknown";
  if (mustGit(at.gitRoot, "ls-tree", "-d", "--full-tree", commit, "--", at.rel).trim() === "") return { workbench: null, campaigns: [] };
  const workbench = extractAt({ ...at, head: commit }, STEERING_ENTRIES, into);
  const read = readCampaignsAt(workbench, ask);
  return read.kind === "failed" ? "unread" : { workbench, campaigns: read.campaigns };
}

/** The campaigns `running` at the old side that stand in another state at the new. */
const leftRunning = (before: Side, now: Side): CampaignAtRef[] => now.campaigns.filter((c) => c.state !== "running" && before.campaigns.some((b) => b.id === c.id && b.state === "running"));

/** Mode `steering`: the `new-question=` and `new-ready=` rows `overview --since` prints, and `campaign=` per campaign that left `running`. Null where the new head does not read. */
function steeringRows(rel: string, now: Side & { workbench: string }, before: Side | null, ask: Ask): string[] | null {
  const read = steeringAt(now.workbench, ask);
  if ("unread" in read) return null;
  let prior: { questions: Question[]; ready: Ready[] } | "unknown" = "unknown";
  if (before !== null && before.workbench === null) prior = { questions: [], ready: [] };
  else if (before !== null && before.workbench !== null) {
    const old = steeringAt(before.workbench, ask);
    if (!("unread" in old)) prior = old;
  }
  // `withSince` reads the questions, the ready lanes and the notes of an overview, and is the one rule of what is new.
  const delta = withSince({ ...read, notes: [] } as unknown as Overview, prior);
  // The row text is `renderOverview`'s for `new-question=` and `new-ready=`.
  const rows = [
    ...(delta.newQuestions ?? []).map((q) => `new-question=${[q.campaign, q.lane, q.checkout ?? "-", q.package, q.decision, `${rel}/${q.path}`, q.answer ?? "none"].join("\t")}`),
    ...(delta.newReady ?? []).map((r) => `new-ready=${[r.campaign, r.lane, r.package].join("\t")}`),
    ...(before === null ? [] : leftRunning(before, now).map((c) => `campaign=${c.id}\t${c.state}`)),
  ];
  return prior === "unknown" && rows.length > 0 ? [...rows, "note=since-unknown"] : rows;
}

/** Mode `lane`: `answered=` per question of this checkout answered at the new head and not at the old, and `paused=` or `campaign=` where its campaign left `running`. Null where the new head does not read. */
function laneRows(now: Side & { workbench: string }, before: Side | null, checkout: string | null, ask: Ask): string[] | null {
  const view = (side: Side & { workbench: string }) => laneViewOf(side.workbench, mineOf(side.campaigns, checkout).mine, checkout, [], ask);
  const current = view(now);
  if ("unread" in current) return null;
  const old = before === null || before.workbench === null ? null : view({ ...before, workbench: before.workbench });
  const known = before !== null && (old === null || !("unread" in old));
  const answered = new Set(old === null || "unread" in old ? [] : old.questions.filter((q) => q.answer !== null).map((q) => q.decision));
  const rows = current.questions.filter((q) => q.answer !== null && !answered.has(q.decision)).map((q) => `answered=${q.decision}\t${q.answer}`);
  const mine = before === null ? null : mineOf(before.campaigns, checkout).mine;
  if (before !== null && mine !== null) for (const c of leftRunning(before, now).filter((c) => c.id === mine.id)) rows.push(c.state === "paused" ? `paused=${c.id}` : `campaign=${c.id}\t${c.state}`);
  return !known && rows.length > 0 ? [...rows, "note=since-unknown"] : rows;
}

/**
 * The rows `mode` reports for the move from `since` to the head one bounded
 * fetch lands on, with that head; or the state that makes the move a failed
 * probe: `fetchRef`'s, or `unread` where the new head did not read.
 */
export function reportRows(cwd: string, workbench: string, since: string, mode: ReportMode, checkout: string | null, timeoutMs: number = REMOTE_TIMEOUT_MS, ask: Ask = askCodec): { rows: string[]; head: string } | { failed: string } {
  const at = fetchRef(cwd, workbench, null, timeoutMs);
  if (at.state !== "ok") return { failed: at.state };
  return withScratch(cwd, (scratch) => {
    const now = sideAt(at, at.head, join(scratch, "new"), ask);
    if (typeof now === "string" || now.workbench === null) return { failed: "unread" };
    const old = sideAt(at, since, join(scratch, "old"), ask);
    const before = typeof old === "string" ? null : old;
    const current = { ...now, workbench: now.workbench };
    const rows = mode === "steering" ? steeringRows(at.rel, current, before, ask) : laneRows(current, before, checkout, ask);
    return rows === null ? { failed: "unread" } : { rows, head: at.head };
  });
}

/** The per-session outage memory of the header's `## The report mode`, at `file`, stale after two intervals. */
export interface Outage {
  fresh: () => boolean;
  mark: (state: string) => void;
  clear: () => void;
}

export function outageAt(file: string, intervalMs: number): Outage {
  return {
    fresh: () => {
      try {
        return Date.now() - statSync(file).mtimeMs < 2 * intervalMs;
      } catch {
        return false;
      }
    },
    // The content is for a reader; only the file's presence and mtime are read.
    mark: (state) => writeFileSync(file, `${state}\t${new Date().toISOString()}\n`),
    clear: () => rmSync(file, { force: true }),
  };
}

export interface ReportDeps extends WatchDeps {
  /** `reportRows` from the last head seen. */
  delta: (since: string) => { rows: string[]; head: string } | { failed: string };
  outage: Outage;
}

/** The report mode's poll: returns 0 after printing rows and `head=`, or the first `failed=` of an outage this session was not told of. */
export async function reportLoop(since: string | null, intervalMs: number, deps: ReportDeps): Promise<number> {
  let seen = since;
  for (;;) {
    const { probed, stderr } = await deps.probe();
    let failed: string | null = null;
    if (probed.state !== "ok") failed = probed.state;
    // An abbreviated `--since` that the head begins with is the same commit, not a move; without one the first answer is the baseline.
    else if (seen === null || probed.head.startsWith(seen)) seen = probed.head;
    else {
      const moved = deps.delta(seen);
      if ("failed" in moved) failed = moved.failed;
      else if (moved.rows.length === 0) seen = moved.head;
      else {
        deps.outage.clear();
        for (const row of moved.rows) deps.emit(row);
        deps.emit(`head=${moved.head}`);
        return 0;
      }
    }
    if (failed === null) deps.outage.clear();
    else if (deps.outage.fresh()) deps.outage.mark(failed);
    else {
      deps.outage.mark(failed);
      deps.emit(`failed=${failed}`);
      if (stderr !== "") deps.warn(stderr);
      return 0;
    }
    await deps.sleep(intervalMs);
  }
}

/** The pid file of the watch of `session` in this checkout's directory under `bin/fusion-tmp path`. */
export function pidFileOf(tmp: string, session: string | undefined): string {
  const name = session === undefined || session === "" ? "no-session" : session.replace(/[^A-Za-z0-9._-]/g, "_");
  return join(tmp, `campaign-watch-${name}.pid`);
}

/** The report mode's outage file beside the pid file `pidFile`. */
export const stateFileOf = (pidFile: string): string => pidFile.replace(/\.pid$/, ".state");

/** `kill -0`: alive, or alive and someone else's (EPERM). */
function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === "EPERM";
  }
}

const pidIn = (file: string): number | null => {
  try {
    const n = Number(readFileSync(file, "utf-8").trim());
    return Number.isInteger(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
};

/**
 * Take the pid file for this process, or report the live twin that holds it.
 * A file that exists and names no live process is replaced by rename. On
 * `claimed`, the file is removed at exit while it still names this process.
 */
export function claimWatch(file: string): "claimed" | "already-watching" {
  const own = process.pid;
  try {
    writeFileSync(file, `${own}\n`, { flag: "wx" });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
    const held = pidIn(file);
    if (held !== null && held !== own && alive(held)) return "already-watching";
    const next = `${file}.${own}`;
    writeFileSync(next, `${own}\n`);
    renameSync(next, file);
  }
  // Two stale-file takeovers racing: the rename that lands last holds it, and the other is the twin.
  const holder = pidIn(file);
  if (holder !== own && holder !== null && alive(holder)) return "already-watching";
  process.on("exit", () => {
    if (pidIn(file) === own) {
      try {
        unlinkSync(file);
      } catch {
        // Already gone: nothing to release.
      }
    }
  });
  return "claimed";
}
