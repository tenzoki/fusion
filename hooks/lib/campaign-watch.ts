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

import { spawn } from "node:child_process";
import { readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { run } from "./campaign.js";

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

/** One probe. `stderr` is git's own, for the caller to pass on or to hold. */
export async function probe(cwd: string): Promise<{ probed: Probed; stderr: string }> {
  const up = upstreamOf(cwd);
  if ("state" in up) return { probed: up, stderr: "" };
  const { branch, ref } = up;
  const asked = await new Promise<{ status: number; stdout: string; stderr: string }>((done) => {
    const child = spawn("git", ["ls-remote", up.remote, up.remoteRef], { cwd, env: BATCH_ENV(), stdio: ["ignore", "pipe", "pipe"] });
    let [stdout, stderr] = ["", ""];
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

/** The pid file of the watch of `session` in this checkout's directory under `bin/fusion-tmp path`. */
export function pidFileOf(tmp: string, session: string | undefined): string {
  const name = session === undefined || session === "" ? "no-session" : session.replace(/[^A-Za-z0-9._-]/g, "_");
  return join(tmp, `campaign-watch-${name}.pid`);
}

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
