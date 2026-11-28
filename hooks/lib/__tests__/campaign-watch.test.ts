import { afterAll, afterEach, describe, expect, it } from "vitest";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { CASE_TIMEOUT } from "./helpers/guard-harness.js";
import { campaignFile, claim, createPackage, jsonWorkbenchAt, must, placeRecord, type JsonProject, type Package } from "./helpers/json-workbench.js";

// Drives the real `bin/fusion-campaign probe` and `watch` over a local bare origin, a watching clone and a pushing
// clone, at `--interval 1`: no network, every path physical. Under test is plan step 4 of
// `261119-1248-plan-campaign-peers-follow-the-steering-session-and-report-back.md`: silence while the head stands,
// one `moved=` per push, `--since` compared on the first probe (the expiry race), one `failed=` per run of failures
// and `recovered=` after it, the pid-file refusal and its release by a kill, and `no-upstream` at exit 5. Every watch
// a case starts is killed in `afterEach`; HOME is a directory of its own, because `bin/fusion-tmp` puts the pid file
// under it. The second describe is step 2 of `261123-1000-plan-fix-the-three-trial-causes-and-retest-before-13-6-0.md`:
// `--report steering|lane` over a workbench the kernel wrote, the outage state file, and the bound on a remote call.

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
function startWatch(cwd: string, session: string, args: string[] = [], extra: Record<string, string> = {}): Watch {
  const interval = args.includes("--interval") ? [] : ["--interval", "1"];
  const child = spawn(script, ["watch", ...interval, ...args], { cwd, env: env({ FUSION_SESSION_ID: session, ...extra }), stdio: ["ignore", "pipe", "pipe"] });
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
    const w = startWatch(watcher, "sid-since", ["--since", older.slice(0, 12)]);
    await until("the move", () => w.lines.length === 1, 5_000);
    expect(w.lines).toEqual([`moved=${older.slice(0, 12)}\t${newer}`]);
    // An abbreviated --since naming the head itself is no move.
    const quiet = startWatch(watcher, "sid-since-head", ["--since", newer.slice(0, 7)]);
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

const ID = "261101-0900-pipeline";
const [A, B, C] = ["a1a1a1a1", "b2b2b2b2", "c3c3c3c3"];
const [Q1, Q2, Q3, HELD] = ["261101-0006-which-parser.md", "261101-0007-which-schema.md", "261101-0008-which-lexer.md", "261101-0010-held"];

/** A bare origin seeded through the kernel: a running campaign whose lane-1 checkout A holds HELD with Q1 open and whose lane-2 checkout B holds another package with Q2 open; and a clone per checkout. */
function campaignWorld(tag: string): (checkout: string) => string {
  const origin = scratch(`${tag}-origin`);
  git(origin, "init", "--bare", "-q", "-b", "main");
  const ident = (dir: string): void => void [["user.name", tag], ["user.email", `${tag}@example.invalid`]].forEach(([k, v]) => git(dir, "config", k, v));
  const root = scratch(`${tag}-author`);
  git(root, "init", "-q", "-b", "main");
  ident(root);
  writeFileSync(join(root, ".gitignore"), "fusion-workbench/.json-state/\nfusion-workbench/.checkout-id\n");
  const p: JsonProject = { root, workbench: jsonWorkbenchAt(root), next: 1 };
  const [held, other] = [createPackage(p, HELD), createPackage(p, "261101-0011-other")];
  claim(p, held, A);
  claim(p, other, B);
  const member = (x: Package) => ({ workbench_id: must(p, { op: "inspect" }).result.id, record_id: x.id, display: x.dir.slice("work-packages/".length) });
  campaignFile(p, ID, { state: { state: "running" }, lanes: [{ id: "lane-1", checkout_id: A, members: [member(held)] }, { id: "lane-2", checkout_id: B, members: [member(other)] }] });
  placeRecord(p.workbench, "decision-open", `${held.dir}/decisions/${Q1}`, "open");
  placeRecord(p.workbench, "decision-open", `${other.dir}/decisions/${Q2}`, "open");
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", "seed");
  git(root, "push", "-q", origin, "main");
  return (checkout) => {
    const dir = scratch(`${tag}-${checkout}`);
    git(dir, "clone", "-q", origin, dir);
    ident(dir);
    writeFileSync(join(dir, "fusion-workbench", ".checkout-id"), `${checkout}\n`);
    return dir;
  };
}

/** Everything in `dir` committed, rebased onto the remote and pushed; the pushed head. */
function publish(dir: string, subject: string): string {
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", subject);
  git(dir, "pull", "-q", "--rebase");
  git(dir, "push", "-q");
  return git(dir, "rev-parse", "HEAD");
}
const campaign = (cwd: string, ...args: string[]) => spawnSync(script, args, { cwd, encoding: "utf-8", env: env() });
const askQ3 = (peer: string): void => placeRecord(join(peer, "fusion-workbench"), "decision-open", `work-packages/${HELD}/decisions/${Q3}`, "open");
const newQ3 = `new-question=${ID}\tlane-1\t${A}\t${HELD}\t${Q3}\tfusion-workbench/work-packages/${HELD}/decisions/${Q3}\tnone`;
const exited = (w: Watch): Promise<void> => until("the exit", () => w.child.exitCode !== null, 60_000);
/** The watch has had time to probe, and to read the move to `head` in `cwd` once its fetch landed it, and has printed nothing and not exited. */
async function quiet(w: Watch, cwd?: string, head?: string): Promise<void> {
  if (cwd !== undefined) await until("the watch's fetch", () => git(cwd, "rev-parse", "origin/main") === head, 30_000);
  await sleep(8000);
  expect([w.lines, w.child.exitCode]).toEqual([[], null]);
}
const report = (cwd: string, session: string, mode: string, since: string, ...more: string[]): Watch => startWatch(cwd, session, ["--report", mode, "--since", since, ...more]);

describe("bin/fusion-campaign watch --report: a wake only with a row to act on, an outage told once per session", () => {
  it("steering: a new question and an ended campaign each print their row and head= and exit; a push carrying neither, its own included, prints nothing", async () => {
    const clone = campaignWorld("steer");
    const [peer, steer] = [clone(A), clone(C)];
    const w = report(steer, "sid-steer", "steering", git(steer, "rev-parse", "HEAD"));
    writeFileSync(join(steer, "e.txt"), "E\n");
    await quiet(w, steer, publish(steer, "the steering checkout's own push"));
    askQ3(peer);
    const asked = publish(peer, "a question");
    await exited(w);
    expect([w.lines, w.child.exitCode]).toEqual([[newQ3, `head=${asked}`], 0]);
    git(steer, "pull", "-q");
    const again = report(steer, "sid-steer", "steering", asked);
    expect(campaign(steer, "end", "--outcome", "cancelled", "--reason", "enough").status).toBe(0);
    const ended = publish(steer, "end");
    await exited(again);
    expect(again.lines).toEqual([`campaign=${ID}\tcancelled`, `head=${ended}`]);
  }, CASE_TIMEOUT * 6);

  it("lane: an answer to this checkout's question and a pause each print and exit; an answer to another checkout's prints nothing", async () => {
    const clone = campaignWorld("lane");
    const [peer, steer] = [clone(A), clone(C)];
    const w = report(peer, "sid-lane", "lane", git(peer, "rev-parse", "HEAD"));
    expect(campaign(steer, "answer", "--question", Q2, "--option", "yes").status).toBe(0);
    await quiet(w, peer, publish(steer, "the answer to B"));
    const r = campaign(steer, "answer", "--question", Q1, "--option", "the old one");
    const by = basename(/^path=(.*)$/m.exec(r.stdout)?.[1] ?? "").replace(/\.record\.json$/, ".md");
    const answered = publish(steer, "the answer to A");
    await exited(w);
    expect(w.lines).toEqual([`answered=${Q1}\t${by}`, `head=${answered}`]);
    const again = report(peer, "sid-lane", "lane", answered);
    expect(campaign(steer, "pause", "--reason", "hold on").status).toBe(0);
    const paused = publish(steer, "pause");
    await exited(again);
    expect(again.lines).toEqual([`paused=${ID}`, `head=${paused}`]);
  }, CASE_TIMEOUT * 6);

  it("outage: failed= once over two watches of one session, again for another session and after the file went stale; a success removes it and prints nothing", async () => {
    const { origin, watcher } = world("outage");
    const since = git(watcher, "rev-parse", "HEAD");
    const state = pidFile("sid-out").replace(/\.pid$/, ".state");
    const arm = (session: string): Watch => report(watcher, session, "steering", since, "--interval", "2");
    renameSync(origin, `${origin}.gone`);
    const first = arm("sid-out");
    await exited(first);
    const second = arm("sid-out");
    await quiet(second);
    const other = arm("sid-out-2");
    await exited(other);
    expect([first.lines, other.lines]).toEqual([["failed=fetch-failed"], ["failed=fetch-failed"]]);
    await stop(second.child, "SIGTERM");
    const old = new Date(Date.now() - 10_000);
    utimesSync(state, old, old);
    const stale = arm("sid-out");
    await exited(stale);
    expect(stale.lines).toEqual(["failed=fetch-failed"]);
    const last = arm("sid-out");
    await until("the claim", () => holds("sid-out", last.child));
    renameSync(`${origin}.gone`, origin);
    await until("the file's removal", () => !existsSync(state));
    await quiet(last);
  }, CASE_TIMEOUT * 4);

  it("a move whose fetch fails keeps the last head, prints failed= once, and reports the question it carried after the recovery", async () => {
    const clone = campaignWorld("delta");
    const [peer, steer] = [clone(A), clone(C)];
    const since = git(steer, "rev-parse", "HEAD");
    // ls-remote and the upstream still resolve; the fetch also asks for a branch the remote does not have, and fails.
    git(steer, "config", "--add", "remote.origin.fetch", "refs/heads/absent:refs/remotes/origin/absent");
    askQ3(peer);
    const asked = publish(peer, "a question");
    const first = report(steer, "sid-delta", "steering", since, "--interval", "2");
    await exited(first);
    expect(first.lines).toEqual(["failed=fetch-failed"]);
    const second = report(steer, "sid-delta", "steering", since, "--interval", "2");
    await quiet(second);
    git(steer, "config", "--unset", "remote.origin.fetch", "absent");
    await exited(second);
    expect(second.lines).toEqual([newQ3, `head=${asked}`]);
  }, CASE_TIMEOUT * 4);

  it("a move whose extraction throws is failed=unread with the error on stderr, and its question is reported after a restart from the same --since", async () => {
    const clone = campaignWorld("throw");
    const [peer, steer] = [clone(A), clone(C)];
    const since = git(steer, "rev-parse", "HEAD");
    const shim = scratch("throw-shim");
    writeFileSync(join(shim, "tar"), "#!/bin/sh\nexit 1\n", { mode: 0o755 });
    askQ3(peer);
    const asked = publish(peer, "a question");
    const first = startWatch(steer, "sid-throw", ["--report", "steering", "--since", since], { PATH: `${shim}:${base.PATH ?? ""}` });
    let err = "";
    first.child.stderr?.on("data", (d: Buffer) => void (err += d.toString("utf-8")));
    await exited(first);
    expect([first.lines, first.child.exitCode, err.includes("tar")]).toEqual([["failed=unread"], 0, true]);
    const second = report(steer, "sid-throw", "steering", since);
    await exited(second);
    expect(second.lines).toEqual([newQ3, `head=${asked}`]);
  }, CASE_TIMEOUT * 4);

  it("a remote that accepts the connection and never answers is failed=fetch-failed within the bound", async () => {
    const { watcher } = world("hang");
    git(watcher, "config", "remote.origin.uploadpack", "sleep 20;:");
    const began = Date.now();
    const w = startWatch(watcher, "sid-hang", ["--report", "steering"], { FUSION_CAMPAIGN_TIMEOUT: "2" });
    await exited(w);
    expect([w.lines, Date.now() - began < 10_000]).toEqual([["failed=fetch-failed"], true]);
  }, CASE_TIMEOUT);
});
