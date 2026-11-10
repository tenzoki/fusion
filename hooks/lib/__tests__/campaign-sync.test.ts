import { afterAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { campaignReadRow, mineOf, settleMessage, type CampaignAtRef } from "../campaign-sync.js";
import { pluginRoot } from "./helpers/citation-scan.js";
import { CASE_TIMEOUT } from "./helpers/guard-harness.js";
import { campaignFile, claim, createPackage, jsonWorkbenchAt, must, placeRecord, type JsonProject, type Package } from "./helpers/json-workbench.js";

// Drives the real `bin/fusion-campaign sync` over a bare origin and two clones, the way `campaign-overview.test.ts`
// drives `overview`: the workbench written by the kernel, the campaign file placed (the codec has no write for one),
// every path physical, no network. Under test is plan step 17's contract: the cycle with a second clone's push in
// between (rebase, union merge on the log, push, the `campaign_read` row on origin, `overview` reading the rebased
// commit, `pushed=` naming hashes a clone resolves and never the pre-rebase one, a decision taking one of them), the
// aborted conflict, the deferred dirty tree, the paused campaign and the unreadable one.
//
// The orchestrator's own commit is made as it is made in a session: `bin/fusion-commit-lock with` under a
// `FUSION_SESSION_ID`, so the `commit` row the rebase then rewrites the hash of is the lock's and not a fixture's.
// The three identity exports of a real session are cut from the environment, so the identity under test is the
// clone's own: its git config and its `.checkout-id`. HOME is a directory of its own, because `bin/fusion-tmp` puts
// the scratch directory under it.

const script = join(pluginRoot, "bin", "fusion-campaign");
const lock = join(pluginRoot, "bin", "fusion-commit-lock");
const write = join(pluginRoot, "bin", "fusion-write");
const LOG = "fusion-workbench/orchestrator-events.jsonl";
const ID = "261101-0900-pipeline";
const [A, B] = ["a1a1a1a1", "b2b2b2b2"];
const tmpRoots: string[] = [];
afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

function scratch(tag: string): string {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), `fusion-campaign-sync-${tag}-`)));
  tmpRoots.push(dir);
  return dir;
}
const home = scratch("home");
const base: Record<string, string | undefined> = { ...process.env };
for (const key of ["FUSION_PERSON", "FUSION_CHECKOUT", "FUSION_SESSION_ID"]) delete base[key];
/** All three git config layers cut off, no session export: the identity under test is the clone's. */
const env = (extra: Record<string, string> = {}): NodeJS.ProcessEnv => ({ ...base, HOME: home, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_CONFIG_NOSYSTEM: "1", ...extra });

function git(cwd: string, ...args: string[]): string {
  const r = spawnSync("git", args, { cwd, encoding: "utf-8", env: env() });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} in ${cwd}: ${r.stderr}`);
  return (r.stdout ?? "").trim();
}
const resolves = (cwd: string, hash: string): boolean => spawnSync("git", ["cat-file", "-e", `${hash}^{commit}`], { cwd, env: env() }).status === 0;

interface Run {
  status: number;
  stdout: string;
  stderr: string;
  value(key: string): string | null;
  lines(key: string): string[];
}
function run(cwd: string, extra: Record<string, string>, ...args: string[]): Run {
  const r = spawnSync(script, args, { cwd, encoding: "utf-8", env: env(extra) });
  const stdout = r.stdout ?? "";
  const lines = (key: string) => stdout.split("\n").filter((l) => l.startsWith(`${key}=`)).map((l) => l.slice(key.length + 1));
  return { status: r.status ?? -1, stdout, stderr: r.stderr ?? "", lines, value: (k) => lines(k)[0] ?? null };
}
/** The orchestrator's Step 4: the paths staged and committed under the lock, which then appends the `commit` row. */
function lockCommit(cwd: string, session: string, subject: string, ...paths: string[]): string {
  const r = spawnSync(lock, ["with", "orchestrator", "--", "bash", "-c", `git add ${paths.map((p) => `'${p}'`).join(" ")} && git commit -q -m '${subject}'`], { cwd, encoding: "utf-8", env: env({ FUSION_SESSION_ID: session }) });
  if (r.status !== 0) throw new Error(`the locked commit failed: ${r.stderr}`);
  return git(cwd, "rev-parse", "HEAD");
}
const rows = (text: string): Array<Record<string, unknown>> => text.split("\n").filter((l) => l !== "").map((l) => JSON.parse(l) as Record<string, unknown>);
const originLog = (origin: string): Array<Record<string, unknown>> => rows(git(origin, "show", `main:${LOG}`));
const sha = (root: string, rel: string): string => `sha256:${createHash("sha256").update(readFileSync(join(root, rel))).digest("hex")}`;
const rfc3339 = (seconds: string): string => `${new Date(Number(seconds) * 1000).toISOString().slice(0, 19)}Z`;
const member = (p: JsonProject, pkg: Package) => ({ workbench_id: must(p, { op: "inspect" }).result.id, record_id: pkg.id, display: pkg.dir.slice("work-packages/".length) });

/** A bare origin and a seeded `main`: the workbench the kernel wrote plus what `seed` adds, the log with one row, the union driver on it. */
function world(tag: string, seed: (p: JsonProject) => void): { origin: string; project: JsonProject } {
  const origin = scratch(`${tag}-origin`);
  git(origin, "init", "--bare", "-q", "-b", "main");
  const root = scratch(`${tag}-author`);
  git(root, "init", "-q", "-b", "main");
  git(root, "config", "user.name", "Ada");
  git(root, "config", "user.email", "ada@example.invalid");
  git(root, "remote", "add", "origin", origin);
  writeFileSync(join(root, ".gitignore"), "fusion-workbench/.json-state/\nfusion-workbench/.checkout-id\n");
  writeFileSync(join(root, ".gitattributes"), `${LOG} merge=union\n`);
  writeFileSync(join(root, "shared.txt"), "base\n");
  const project: JsonProject = { root, workbench: jsonWorkbenchAt(root), next: 1 };
  writeFileSync(join(root, LOG), `${JSON.stringify({ ts: "2026-11-01T08:00:00", event: "session_start", detail: "seed" })}\n`);
  seed(project);
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", "seed");
  git(root, "push", "-q", "origin", "main");
  return { origin, project };
}

/** A clone with its own git identity and checkout identifier, tracking `main`. */
function clone(origin: string, tag: string, checkout: string): string {
  const dir = scratch(`${tag}-clone`);
  git(dir, "clone", "-q", origin, dir);
  git(dir, "config", "user.name", tag);
  git(dir, "config", "user.email", `${tag}@example.invalid`);
  writeFileSync(join(dir, "fusion-workbench", ".checkout-id"), `${checkout}\n`);
  return dir;
}

describe("bin/fusion-campaign sync, the commit-cycle read", () => {
  it("the cycle with a second clone's push in between: rebase, union merge on the log, push, the row on origin, overview and a record reading the pushed hash", () => {
    let pkg!: Package;
    const decision = "shared/decisions/261101-0005-which-hash.md";
    const { origin, project: p } = world("cycle", (p) => {
      pkg = createPackage(p, "261101-0001-lane-work");
      claim(p, pkg, A);
      campaignFile(p, ID, { state: { state: "running" }, lanes: [{ id: "lane-1", checkout_id: A, members: [member(p, pkg)] }] });
      placeRecord(p.workbench, "decision-answered", decision, "answered");
    });
    const a = clone(origin, "cycle-a", A);
    const b = clone(origin, "cycle-b", B);

    // The orchestrator's commit in a: the lock appends the row and the tree is dirty by the log alone.
    writeFileSync(join(a, "work.txt"), "work\n");
    const pre = lockCommit(a, "sid-a", "feat: a step", join(a, "work.txt"));
    expect(git(a, "status", "--porcelain")).toBe(`M ${LOG}`);
    // The second clone commits under its own lock, settles its log and pushes: the upstream moves and the log diverges.
    writeFileSync(join(b, "other.txt"), "other\n");
    lockCommit(b, "sid-b", "feat: the other clone", join(b, "other.txt"));
    git(b, "add", LOG);
    git(b, "commit", "-q", "-m", "chore(events): settle b");
    git(b, "push", "-q", "origin", "main");
    const fetchedHead = git(origin, "rev-parse", "main");

    const r = run(a, { FUSION_SESSION_ID: "sid-a" }, "sync");
    expect(r.status, r.stderr).toBe(0);
    const revision = sha(a, `fusion-workbench/campaigns/${ID}/campaign.json`);
    expect(["state", "ref", "head", "mine", "settled"].map(r.value)).toEqual(["ok", "origin/main", fetchedHead, ID, "yes"]);
    expect([r.lines("campaign"), r.lines("campaign-unreadable"), r.lines("deferred"), r.lines("conflict"), r.lines("paused"), r.lines("note")]).toEqual([[`${ID}\trunning\t${revision}\t-`], [], [], [], [], []]);
    const pushed = r.lines("pushed").map((l) => l.split("\t"));
    expect(pushed.map(([, subject]) => subject)).toEqual(["feat: a step", settleMessage(A)]);

    // The acceptance lines: a clean tree, the settling commit on origin, one campaign_read row per campaign.
    expect(git(a, "status", "--porcelain")).toBe("");
    expect(git(a, "log", "origin/main", "-1", "--format=%s")).toBe(settleMessage(A));
    const log = originLog(origin);
    expect(log.filter((row) => row.event === "campaign_read")).toEqual([{ ts: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/), event: "campaign_read", person: "cycle-a <cycle-a@example.invalid>", checkout: A, session_id: "sid-a", campaign: ID, state: "running", revision, detail: `${ID} running ${revision.slice("sha256:".length, "sha256:".length + 12)}` }]);
    // The union merge kept both clones' commit rows (in the driver's order, which is not pinned); a's names the pre-rebase hash, which nothing on origin resolves.
    const commits = log.filter((row) => row.event === "commit").map((row) => String(row.detail));
    expect([commits.map((d) => d.slice(8)).sort(), commits.includes(`${pre.slice(0, 7)} feat: a step`)]).toEqual([["feat: a step", "feat: the other clone"], true]);

    // The pushed hashes are what the second clone resolves after a fetch; the pre-rebase hash is not among them and resolves nowhere there.
    git(b, "fetch", "-q");
    expect(pushed.map(([hash]) => resolves(b, hash))).toEqual([true, true]);
    expect([pushed.some(([hash]) => hash === pre), resolves(b, pre), pushed[0][0] === git(a, "rev-parse", "HEAD~1")]).toEqual([false, false, true]);

    // overview from the second clone: the pushing checkout's last_push is the committer time of its rebased commit, found by subject and author time.
    const o = run(b, {}, "overview");
    expect(o.status, o.stderr).toBe(0);
    const container = pkg.dir.slice("work-packages/".length);
    expect(o.lines("held")).toEqual([[A, "-", container, rfc3339(git(b, "show", "-s", "--format=%ct", pushed[0][0])), "none"].join("\t")]);
    // The full tier reads the campaign: its lane holds the package, and the pushed `campaign_read` row confirms the revision, so nothing is unconfirmed.
    expect([o.value("campaigns"), o.lines("campaign"), o.lines("lane"), o.lines("unconfirmed"), o.lines("in-no-lane"), o.lines("note")]).toEqual(["1", [`${ID}\trunning\t-\t1`], [`${ID}\tlane-1\t${A}\t-\t${container}\tnone\tnone`], [], [], []]);

    // A decision moved to implemented through bin/fusion-write with a pushed= hash carries a ref that clone resolves.
    const control = decision.replace(/\.md$/, ".record.json");
    const w = spawnSync(write, ["transition", "--record", control, "--actor", "orchestrator", "--to", "implemented", "--reason", "step 17 landed", "--implementation-ref", JSON.stringify(pushed[0][0])], { cwd: b, encoding: "utf-8", env: env() });
    expect(w.status, w.stderr).toBe(0);
    const shown = must({ root: b, workbench: join(b, "fusion-workbench"), next: 1 }, { op: "show", record: { path: control } }).result.control as Record<string, any>;
    expect([shown.control.state, shown.control.implementation_ref, resolves(b, shown.control.implementation_ref)]).toEqual(["implemented", pushed[0][0], true]);
  }, CASE_TIMEOUT * 8);

  it("a conflict: the rebase is aborted, exit 10, no pushed= line, the clone at the HEAD it had before the rebase and no rebase in progress", () => {
    const { origin, project: p } = world("conflict", (p) => void campaignFile(p, ID, { state: { state: "running" } }));
    void p;
    const a = clone(origin, "conflict-a", A);
    const b = clone(origin, "conflict-b", B);
    writeFileSync(join(b, "shared.txt"), "theirs\n");
    git(b, "add", "shared.txt");
    git(b, "commit", "-q", "-m", "feat: theirs");
    git(b, "push", "-q", "origin", "main");
    const upstream = git(origin, "rev-parse", "main");
    writeFileSync(join(a, "shared.txt"), "ours\n");
    const pre = lockCommit(a, "sid-a", "feat: ours", join(a, "shared.txt"));

    const first = run(a, { FUSION_SESSION_ID: "sid-a" }, "sync");
    expect([first.status, first.value("state"), first.value("mine"), first.value("settled"), first.lines("conflict"), first.lines("pushed")]).toEqual([10, "conflict", ID, "yes", ["shared.txt"], []]);
    expect(first.stderr).toContain("shared.txt");
    // The settling commit landed before the rebase and stands; the rebase left nothing behind.
    const settled = git(a, "rev-parse", "HEAD");
    expect([git(a, "rev-parse", "HEAD~1"), git(a, "log", "-1", "--format=%s"), git(a, "status", "--porcelain"), git(a, "diff", "--name-only", pre, "HEAD")]).toEqual([pre, settleMessage(A), "", LOG]);
    expect([existsSync(git(a, "rev-parse", "--git-path", "rebase-merge")), existsSync(git(a, "rev-parse", "--git-path", "rebase-apply")), git(origin, "rev-parse", "main")]).toEqual([false, false, upstream]);
    expect(readFileSync(join(a, "shared.txt"), "utf-8")).toBe("ours\n");

    // Without a session no row is owed, nothing is settled, and the clone stands exactly at its pre-sync HEAD.
    const second = run(a, {}, "sync");
    expect([second.status, second.value("state"), second.value("settled"), second.lines("conflict"), second.lines("pushed")]).toEqual([10, "conflict", null, ["shared.txt"], []]);
    expect([git(a, "rev-parse", "HEAD"), git(a, "status", "--porcelain")]).toEqual([settled, ""]);
  }, CASE_TIMEOUT * 6);

  it("a dirty tracked file: every dirty path deferred, no settling commit, no rebase, the push as a fast-forward; the states and the usage error", () => {
    const { origin } = world("deferred", (p) => void campaignFile(p, ID, { state: { state: "running" }, lanes: [{ id: "lane-1", checkout_id: A, members: [member(p, createPackage(p, "261101-0002-held"))] }] }));
    const a = clone(origin, "deferred-a", A);
    writeFileSync(join(a, "work.txt"), "work\n");
    const feat = lockCommit(a, "sid-a", "feat: a step", join(a, "work.txt"));
    writeFileSync(join(a, "shared.txt"), "an in-flight edit\n");

    const r = run(a, { FUSION_SESSION_ID: "sid-a" }, "sync");
    expect(r.status, r.stderr).toBe(0);
    expect([r.value("state"), r.value("mine"), r.value("settled"), r.lines("deferred"), r.lines("pushed")]).toEqual(["ok", ID, null, [LOG, "shared.txt"], [`${feat}\tfeat: a step`]]);
    // The push landed as a fast-forward, the edit and the rows stay in the tree, and the row reached origin with nothing.
    expect([git(origin, "rev-parse", "main"), git(a, "status", "--porcelain").split("\n").map((l) => l.trim()).sort()]).toEqual([feat, [`M ${LOG}`, "M shared.txt"]]);
    expect([rows(readFileSync(join(a, LOG), "utf-8")).filter((row) => row.event === "campaign_read").length, originLog(origin).filter((row) => row.event === "campaign_read").length]).toEqual([1, 0]);

    // The states sync shares with overview, and sync's refusal of a flag.
    git(a, "checkout", "-q", "-b", "side");
    expect([run(a, {}, "sync").status, run(a, {}, "sync").stdout]).toEqual([5, "state=no-upstream\nbranch=side\n"]);
    for (const args of [["sync", "--ref", "origin/main"], ["sync", "--window", "1"]]) expect([run(a, {}, ...args).status, run(a, {}, ...args).stdout], args.join(" ")).toEqual([2, ""]);
  }, CASE_TIMEOUT * 5);

  it("a paused campaign without lanes is mine and reported with its reason; a terminal campaign naming this checkout steers nobody", () => {
    const PAUSED = "261101-0901-paused";
    const { origin } = world("paused", (p) => {
      campaignFile(p, PAUSED, { state: { state: "paused", reason: "the parser schema is being decided" } });
      campaignFile(p, ID, { state: { state: "completed" }, lanes: [{ id: "lane-1", checkout_id: A, members: [member(p, createPackage(p, "261101-0003-done"))] }] });
    });
    const a = clone(origin, "paused-a", A);
    const r = run(a, { FUSION_SESSION_ID: "sid-a" }, "sync");
    expect(r.status, r.stderr).toBe(0);
    const revisionOf = (id: string) => sha(a, `fusion-workbench/campaigns/${id}/campaign.json`);
    expect([r.value("mine"), r.lines("paused"), r.lines("campaign"), r.lines("note")]).toEqual([PAUSED, [`${PAUSED}\tthe parser schema is being decided`], [`${ID}\tcompleted\t${revisionOf(ID)}\t-`, `${PAUSED}\tpaused\t${revisionOf(PAUSED)}\tthe parser schema is being decided`], []]);
    // One row per campaign read, the terminal one included; the settling commit alone was pushed.
    expect([originLog(origin).filter((row) => row.event === "campaign_read").map((row) => [row.campaign, row.state]), r.lines("pushed").map((l) => l.split("\t")[1])]).toEqual([[[ID, "completed"], [PAUSED, "paused"]], [settleMessage(A)]]);
  }, CASE_TIMEOUT * 4);

  it("a campaign with a lane rule broken at the ref is printed unreadable, gets no row and pauses nobody; two live campaigns without lanes are none and a note", () => {
    const [BROKEN, ONE, TWO] = ["261101-0902-broken", "261101-0903-one", "261101-0904-two"];
    const { origin } = world("unreadable", (p) => {
      const [x, y] = [createPackage(p, "261101-0004-x"), createPackage(p, "261101-0005-y")];
      campaignFile(p, BROKEN, { state: { state: "paused", reason: "would pause a1a1a1a1" }, lanes: [{ id: "lane-1", checkout_id: A, members: [member(p, x)] }, { id: "lane-2", checkout_id: A, members: [member(p, y)] }] });
      campaignFile(p, ONE, { state: { state: "running" } });
      campaignFile(p, TWO, { state: { state: "running" } });
    });
    const a = clone(origin, "unreadable-a", A);
    const r = run(a, { FUSION_SESSION_ID: "sid-a" }, "sync");
    expect(r.status, r.stderr).toBe(0);
    expect([r.value("mine"), r.lines("paused"), r.lines("campaign-unreadable"), r.lines("campaign").map((l) => l.split("\t")[0]), r.lines("note")]).toEqual(["none", [], [`${BROKEN}\tschema-invalid/duplicate-lane-checkout`], [ONE, TWO], [`several-campaigns-without-lanes\t${ONE},${TWO}`]]);
    expect(originLog(origin).filter((row) => row.event === "campaign_read").map((row) => row.campaign)).toEqual([ONE, TWO]);
  }, CASE_TIMEOUT * 4);
});

describe("mineOf and campaignReadRow", () => {
  // Lanes with no members: `mineOf` reads a lane's checkout and nothing else of it.
  const c = (id: string, state: string, laneCheckouts: Array<string | null> | null): CampaignAtRef => ({ id, state, revision: `sha256:${"ab".repeat(32)}`, reason: null, lanes: laneCheckouts === null ? null : laneCheckouts.map((checkout, i) => ({ id: `lane-${i + 1}`, checkout, members: [] })) });

  it("names the one live campaign whose lanes name the checkout, else the one without lanes, and never picks between two", () => {
    expect(mineOf([c("x", "running", [A]), c("y", "running", null)], A).mine?.id).toBe("x");
    expect(mineOf([c("x", "completed", [A]), c("y", "paused", null)], A).mine?.id).toBe("y");
    expect(mineOf([c("x", "running", [B]), c("y", "running", null)], null).mine?.id).toBe("y");
    expect(mineOf([c("x", "running", [A]), c("y", "running", [null, A])], A)).toEqual({ mine: null, note: ["several-campaigns-name-checkout", A, "x,y"] });
    expect(mineOf([c("x", "running", null), c("y", "paused", null), c("z", "cancelled", null)], A)).toEqual({ mine: null, note: ["several-campaigns-without-lanes", "x,y"] });
    expect(mineOf([c("x", "running", [B]), c("z", "completed", null)], A)).toEqual({ mine: null, note: null });
  });

  it("writes the plan's field set in order, an unresolved half an absent key", () => {
    const row = campaignReadRow("2026-11-10T09:00:00", { person: null, checkout: A }, "sid", c("x", "running", null));
    expect(row).toBe(`{"ts":"2026-11-10T09:00:00","event":"campaign_read","checkout":"${A}","session_id":"sid","campaign":"x","state":"running","revision":"sha256:${"ab".repeat(32)}","detail":"x running abababababab"}`);
  });
});
