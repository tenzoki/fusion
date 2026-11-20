import { afterAll, afterEach, describe, expect, it } from "vitest";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { CASE_TIMEOUT } from "./helpers/guard-harness.js";

// Drives the real `bin/fusion-campaign probe` and `watch` over a local bare origin, a watching clone and a pushing
// clone, at `--interval 1`: no network, every path physical. Under test is plan step 4 of
// `261119-1248-plan-campaign-peers-follow-the-steering-session-and-report-back.md`: silence while the head stands,
// one `moved=` per push, `--since` compared on the first probe (the expiry race), one `failed=` per run of failures
// and `recovered=` after it, the pid-file refusal and its release by a kill, and `no-upstream` at exit 5. Every watch
// a case starts is killed in `afterEach`; HOME is a directory of its own, because `bin/fusion-tmp` puts the pid file
// under it.

const script = join(pluginRoot, "bin", "fusion-campaign");
const CHECKOUT = "e5e5e5e5";
const tmpRoots: string[] = [];
const live = new Set<ChildProcess>();
afterEach(async () => {
  await Promise.all([...live].map((c) => stop(c, "SIGTERM")));
});
afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

function scratch(tag: string): string {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), `fusion-campaign-watch-${tag}-`)));
  tmpRoots.push(dir);
  return dir;
}
const home = scratch("home");
const base: Record<string, string | undefined> = { ...process.env };
for (const key of ["FUSION_PERSON", "FUSION_CHECKOUT", "FUSION_SESSION_ID"]) delete base[key];
const env = (extra: Record<string, string> = {}): NodeJS.ProcessEnv => ({ ...base, HOME: home, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_CONFIG_NOSYSTEM: "1", ...extra });

function git(cwd: string, ...args: string[]): string {
  const r = spawnSync("git", args, { cwd, encoding: "utf-8", env: env() });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} in ${cwd}: ${r.stderr}`);
  return (r.stdout ?? "").trim();
}

/** A bare origin with one commit on `main`, a watching clone carrying a workbench marker and an identity, and a pushing clone. */
function world(tag: string): { origin: string; watcher: string; push: () => string } {
  const origin = scratch(`${tag}-origin`);
  git(origin, "init", "--bare", "-q", "-b", "main");
  const [watcher, pusher] = [scratch(`${tag}-watcher`), scratch(`${tag}-pusher`)];
  for (const dir of [watcher, pusher]) {
    git(dir, "init", "-q", "-b", "main");
    git(dir, "config", "user.name", tag);
    git(dir, "config", "user.email", `${tag}@example.invalid`);
    git(dir, "remote", "add", "origin", origin);
  }
  let n = 0;
  const push = (): string => {
    writeFileSync(join(pusher, "n.txt"), `${(n += 1)}\n`);
    git(pusher, "add", "n.txt");
    git(pusher, "commit", "-q", "-m", `push ${n}`);
    git(pusher, "push", "-q", "origin", "main");
    return git(pusher, "rev-parse", "HEAD");
  };
  push();
  git(watcher, "fetch", "-q", "origin");
  git(watcher, "checkout", "-q", "-b", "main", "--track", "origin/main");
  mkdirSync(join(watcher, "fusion-workbench"));
  writeFileSync(join(watcher, "fusion-workbench", ".fusion-setup"), "{}\n");
  writeFileSync(join(watcher, "fusion-workbench", ".checkout-id"), `${CHECKOUT}\n`);
  return { origin, watcher, push };
}

interface Watch {
  child: ChildProcess;
  lines: string[];
}
function startWatch(cwd: string, session: string, ...args: string[]): Watch {
  const child = spawn(script, ["watch", "--interval", "1", ...args], { cwd, env: env({ FUSION_SESSION_ID: session }), stdio: ["ignore", "pipe", "pipe"] });
  live.add(child);
  const w: Watch = { child, lines: [] };
  let buffered = "";
  child.stdout?.on("data", (d: Buffer) => {
    const parts = (buffered + d.toString("utf-8")).split("\n");
    buffered = parts.pop() ?? "";
    w.lines.push(...parts);
  });
  child.stderr?.resume();
  return w;
}
function stop(child: ChildProcess, signal: NodeJS.Signals): Promise<void> {
  live.delete(child);
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve();
  return new Promise((done) => {
    child.once("close", () => done());
    child.kill(signal);
  });
}
const sleep = (ms: number): Promise<void> => new Promise((done) => setTimeout(done, ms));
async function until(what: string, test: () => boolean, ms = 10_000): Promise<void> {
  for (const end = Date.now() + ms; Date.now() < end; await sleep(100)) if (test()) return;
  throw new Error(`timed out waiting for ${what}`);
}
const pidFile = (session: string): string => join(home, ".fusion-tmp", CHECKOUT, `campaign-watch-${session}.pid`);
const holds = (session: string, child: ChildProcess): boolean => existsSync(pidFile(session)) && readFileSync(pidFile(session), "utf-8").trim() === String(child.pid);

describe("bin/fusion-campaign probe and watch, the poll of the upstream head", () => {
  it("prints nothing while the head stands and one moved= per push", async () => {
    const { watcher, push } = world("moved");
    const start = git(watcher, "rev-parse", "origin/main");
    const w = startWatch(watcher, "sid-moved");
    await until("the claim", () => holds("sid-moved", w.child));
    await sleep(2500);
    expect(w.lines).toEqual([]);
    const first = push();
    await until("the first move", () => w.lines.length === 1);
    const second = push();
    await until("the second move", () => w.lines.length === 2);
    await sleep(1500);
    expect(w.lines).toEqual([`moved=${start}\t${first}`, `moved=${first}\t${second}`]);
  }, CASE_TIMEOUT);

  it("compares its first probe against --since, so a push before the arm is still a move", async () => {
    const { watcher, push } = world("since");
    const older = git(watcher, "rev-parse", "origin/main");
    const newer = push();
    const w = startWatch(watcher, "sid-since", "--since", older.slice(0, 12));
    await until("the move", () => w.lines.length === 1, 5_000);
    expect(w.lines).toEqual([`moved=${older.slice(0, 12)}\t${newer}`]);
    // An abbreviated --since naming the head itself is no move.
    const quiet = startWatch(watcher, "sid-since-head", "--since", newer.slice(0, 7));
    await until("the claim", () => holds("sid-since-head", quiet.child));
    await sleep(2500);
    expect(quiet.lines).toEqual([]);
  }, CASE_TIMEOUT);

  it("prints one failed= over a run of failed probes, then recovered=", async () => {
    const { origin, watcher } = world("failed");
    const head = git(watcher, "rev-parse", "origin/main");
    const w = startWatch(watcher, "sid-failed");
    await until("the claim", () => holds("sid-failed", w.child));
    await sleep(1500);
    renameSync(origin, `${origin}.gone`);
    await until("the failure", () => w.lines.length === 1);
    await sleep(3500); // three more probes at --interval 1, each failing
    expect(w.lines).toEqual(["failed=fetch-failed"]);
    renameSync(`${origin}.gone`, origin);
    await until("the recovery", () => w.lines.length === 2);
    expect(w.lines).toEqual(["failed=fetch-failed", `recovered=${head}`]);
  }, CASE_TIMEOUT);

  it("refuses a live twin with already-watching and refuses nothing after the twin is killed", async () => {
    const { watcher } = world("twin");
    const first = startWatch(watcher, "sid-twin");
    await until("the claim", () => holds("sid-twin", first.child));
    const twin = spawnSync(script, ["watch", "--interval", "1"], { cwd: watcher, encoding: "utf-8", env: env({ FUSION_SESSION_ID: "sid-twin" }), timeout: 10_000 });
    expect([twin.status, twin.stdout]).toEqual([0, "state=already-watching\n"]);
    // Another session in the same checkout is no twin.
    const other = startWatch(watcher, "sid-other");
    await until("the other claim", () => holds("sid-other", other.child));
    // A monitor's expiry kills without a word: the pid file stays behind and must not refuse.
    await stop(first.child, "SIGKILL");
    expect(existsSync(pidFile("sid-twin"))).toBe(true);
    const next = startWatch(watcher, "sid-twin");
    await until("the takeover", () => holds("sid-twin", next.child));
    await sleep(1500);
    expect([next.lines, next.child.exitCode]).toEqual([[], null]);
    await stop(next.child, "SIGTERM");
    expect(existsSync(pidFile("sid-twin"))).toBe(false);
  }, CASE_TIMEOUT);

  it("probe prints state, ref and head, and no-upstream at exit 5 on a branch that tracks nothing", () => {
    const { watcher } = world("probe");
    const head = git(watcher, "rev-parse", "origin/main");
    const ok = spawnSync(script, ["probe"], { cwd: watcher, encoding: "utf-8", env: env() });
    expect([ok.status, ok.stdout]).toEqual([0, `state=ok\nref=origin/main\nhead=${head}\n`]);
    git(watcher, "checkout", "-q", "-b", "loose");
    const loose = spawnSync(script, ["probe"], { cwd: watcher, encoding: "utf-8", env: env() });
    expect([loose.status, loose.stdout]).toEqual([5, "state=no-upstream\nbranch=loose\n"]);
  }, CASE_TIMEOUT);
});
