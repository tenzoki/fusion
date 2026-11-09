import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { commitListing, commitNamedBy } from "../campaign.js";
import { pluginRoot } from "./helpers/citation-scan.js";
import { CASE_TIMEOUT } from "./helpers/guard-harness.js";
import { campaignFile, claim, createPackage, jsonWorkbenchAt, placeRecord, setDependencies, type JsonProject, type Package } from "./helpers/json-workbench.js";

// Drives the real `bin/fusion-campaign overview` the way `fusion-forum.test.ts` drives its script: a bare origin, a
// checkout that pushes into it and a checkout that reads, every path physical and no network. The pushing checkout's
// workbench is written by the kernel through `helpers/json-workbench.ts`; what is committed by hand is what no codec
// operation writes: the registry entries, the event log's `commit` rows and a campaign file. Under test is the
// interface the script's header names: the `held=` rows, the `note=` vocabulary, the states and the exit table.
//
// The reading clone is made BEFORE the claims are pushed and never pulls, so nothing in its working tree could have
// answered: every `held=` row is read out of the fetched ref. HOME is a directory of its own, because `bin/fusion-tmp`
// puts the scratch directory under it and a HOME inside the clone would dirty the tree the test holds unchanged.

const script = join(pluginRoot, "bin", "fusion-campaign");
/** The reading checkout's identifier, pre-written so nothing is minted here. */
const OWN = "abcdef01";
const tmpRoots: string[] = [];
afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

function scratch(tag: string): string {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), `fusion-campaign-${tag}-`)));
  tmpRoots.push(dir);
  return dir;
}
const home = scratch("home");
/** All three git config layers are cut off, so the identity under test is the fixture's. */
const env = (extra: Record<string, string> = {}): NodeJS.ProcessEnv => ({ ...process.env, HOME: home, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_CONFIG_NOSYSTEM: "1", ...extra });

function gitWith(extra: Record<string, string>, cwd: string, ...args: string[]): string {
  const r = spawnSync("git", args, { cwd, encoding: "utf-8", env: env(extra) });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} in ${cwd}: ${r.stderr}`);
  return (r.stdout ?? "").trim();
}
const git = (cwd: string, ...args: string[]): string => gitWith({}, cwd, ...args);
/** Author and committer date, as git reads them from the environment. */
const dated = (iso: string): Record<string, string> => ({ GIT_AUTHOR_DATE: iso, GIT_COMMITTER_DATE: iso });

interface Run {
  status: number;
  stdout: string;
  stderr: string;
  value(key: string): string | null;
  lines(key: string): string[];
}
function run(cwd: string, ...args: string[]): Run {
  const r = spawnSync(script, args, { cwd, encoding: "utf-8", env: env() });
  const stdout = r.stdout ?? "";
  const lines = (key: string) => stdout.split("\n").filter((l) => l.startsWith(`${key}=`)).map((l) => l.slice(key.length + 1));
  return { status: r.status ?? -1, stdout, stderr: r.stderr ?? "", lines, value: (k) => lines(k)[0] ?? null };
}

/** A bare origin and the checkout that pushes into it, its JSON workbench not yet committed. */
function pushing(tag: string): { origin: string; project: JsonProject } {
  const origin = scratch(`${tag}-origin`);
  git(origin, "init", "--bare", "-q", "-b", "main");
  const root = scratch(`${tag}-author`);
  git(root, "init", "-q", "-b", "main");
  git(root, "config", "user.name", "Ada");
  git(root, "config", "user.email", "ada@example.invalid");
  git(root, "remote", "add", "origin", origin);
  // What never travels: the codec's lock and journal, and a checkout's own identifier.
  writeFileSync(join(root, ".gitignore"), "fusion-workbench/.json-state/\nfusion-workbench/.checkout-id\n");
  // The first commit carries no workbench, which is what `workbench-untracked` reads.
  commit(root, "root", "2026-11-01T08:00:00Z");
  return { origin, project: { root, workbench: jsonWorkbenchAt(root), next: 1 } };
}

/** Commit everything under `subject` at `iso`, and return the commit's short hash as the lock would write it. */
function commit(root: string, subject: string, iso: string): string {
  git(root, "add", "-A");
  gitWith(dated(iso), root, "commit", "-q", "-m", subject);
  return git(root, "rev-parse", "--short", "HEAD");
}

/** A clone of `origin` that reads: an identity, and its checkout identifier already written. */
function reading(origin: string, tag: string): string {
  const dir = scratch(`${tag}-reader`);
  git(dir, "clone", "-q", origin, dir);
  git(dir, "config", "user.name", "Bo");
  git(dir, "config", "user.email", "bo@example.invalid");
  writeFileSync(join(dir, "fusion-workbench", ".checkout-id"), `${OWN}\n`);
  return dir;
}

/** A registry entry in the grammar `bin/fusion-checkout-name` reads. */
function register(p: JsonProject, checkout: string, alias: string): void {
  mkdirSync(join(p.workbench, "shared", "checkouts"), { recursive: true });
  writeFileSync(join(p.workbench, "shared", "checkouts", `${checkout}.md`), `# Checkout ${checkout}\n\n**Checkout:** ${checkout}\n**Alias:** ${alias}\n`);
}

/** `commit` rows appended to the event log, in the shape the commit lock writes. */
function logRows(p: JsonProject, rows: Array<{ ts: string; checkout: string; detail: string }>): void {
  for (const r of rows) appendFileSync(join(p.workbench, "orchestrator-events.jsonl"), `${JSON.stringify({ ts: r.ts, event: "commit", checkout: r.checkout, detail: r.detail })}\n`);
}

const [A, B] = ["a1a1a1a1", "b2b2b2b2"];
const stems = ["261101-0001-held-and-waiting", "261101-0002-held-and-free", "261101-0003-an-open-prerequisite"];
const WORKED = "2026-11-02T10:00:00";
let world: { origin: string; reader: string; packages: Package[] };

describe("bin/fusion-campaign overview, reduced tier", () => {
  beforeAll(() => {
    const { origin, project: p } = pushing("world");
    git(p.root, "push", "-q", "origin", "HEAD:refs/heads/bare");
    // A workbench with its marker and no manifest, kept as a branch: what the codec's gate refuses as legacy.
    git(p.root, "add", "fusion-workbench/.fusion-setup");
    gitWith(dated("2026-11-01T08:30:00Z"), p.root, "commit", "-q", "-m", "a legacy workbench");
    git(p.root, "push", "-q", "origin", "HEAD:refs/heads/legacy");
    const packages = stems.map((s) => createPackage(p, s));
    commit(p.root, "seed", "2026-11-01T09:00:00Z");
    git(p.root, "push", "-q", "origin", "main");
    const reader = reading(origin, "world");

    const [a, b, c] = packages;
    claim(p, a, A);
    claim(p, b, B);
    setDependencies(p, a, [{ target: c, condition: "terminal" }]);
    placeRecord(p.workbench, "decision-open", `${a.dir}/decisions/261101-0004-which-way.md`, "open");
    placeRecord(p.workbench, "decision-answered", `${a.dir}/decisions/261101-0005-ruled-already.md`, "answered");
    register(p, A, "amber-harbor");
    const hash = commit(p.root, "feat: the claims", `${WORKED}Z`);
    logRows(p, [{ ts: WORKED, checkout: A, detail: `${hash} feat: the claims` }]);
    commit(p.root, "chore(events): settle", "2026-11-02T10:05:00Z");
    git(p.root, "push", "-q", "origin", "main");

    git(p.root, "checkout", "-q", "-b", "with-campaign");
    campaignFile(p, "261101-0900-pipeline");
    commit(p.root, "a campaign file", "2026-11-02T11:00:00Z");
    git(p.root, "push", "-q", "origin", "with-campaign");
    world = { origin, reader, packages };
  }, CASE_TIMEOUT * 6);

  const heldRows = () => [
    [A, "amber-harbor", stems[0], `${WORKED}Z`, `edge:${stems[2]},decision:261101-0004-which-way.md`].join("\t"),
    [B, "-", stems[1], "none", "none"].join("\t"),
  ];

  it("state=ok: two held rows read out of the fetched ref, and a dirty reading tree left as it was", () => {
    const { reader, packages } = world;
    appendFileSync(join(reader, "fusion-workbench", packages[0].narrative), "an uncommitted line\n");
    writeFileSync(join(reader, "untracked.txt"), "x\n");
    const before = git(reader, "status", "--porcelain");
    const r = run(reader, "overview");
    expect(r.status, r.stderr).toBe(0);
    expect(["state", "ref", "head", "head_time", "window_hours", "campaigns"].map(r.value)).toEqual(["ok", "origin/main", git(reader, "rev-parse", "origin/main"), "2026-11-02T10:05:00Z", "24", "0"]);
    expect(r.value("age_minutes")).toMatch(/^\d+$/);
    expect(r.lines("held")).toEqual(heldRows());
    expect(r.lines("note")).toEqual([`no-commit-rows\t${B}`]);
    // The tree is as it was, it still reads both packages open, and the scratch directory is gone.
    expect([before === "", git(reader, "status", "--porcelain")]).toEqual([false, before]);
    expect(readFileSync(join(reader, "fusion-workbench", packages[0].path), "utf-8")).toContain('"status": "open"');
    expect(readdirSync(join(home, ".fusion-tmp", OWN)).filter((n) => n.startsWith("campaign-"))).toEqual([]);
  }, CASE_TIMEOUT * 3);

  it("a campaign file at the ref is counted and said to be unread, and the held rows stand; --window is printed back", () => {
    const r = run(world.reader, "overview", "--ref", "origin/with-campaign", "--window", "48");
    expect(r.status, r.stderr).toBe(0);
    expect(["state", "ref", "window_hours", "campaigns"].map(r.value)).toEqual(["ok", "origin/with-campaign", "48", "1"]);
    expect(r.lines("held")).toEqual(heldRows());
    expect(r.lines("note")).toEqual(["campaigns-not-evaluated\t1", `no-commit-rows\t${B}`]);
  }, CASE_TIMEOUT * 3);

  it("the states that are no answer, each with its exit code, and --ref reading where the branch tracks nothing", () => {
    const stray = reading(world.origin, "states");
    git(stray, "checkout", "-q", "-b", "side");
    const noUpstream = run(stray, "overview");
    expect([noUpstream.status, noUpstream.stdout]).toEqual([5, "state=no-upstream\nbranch=side\n"]);
    const named = run(stray, "overview", "--ref", "origin/main");
    expect([named.status, named.value("state"), named.lines("held")], named.stderr).toEqual([0, "ok", heldRows()]);
    git(stray, "checkout", "-q", "--detach");
    const detached = run(stray, "overview");
    expect([detached.status, detached.stdout]).toEqual([5, "state=no-branch\n"]);
    const unresolved = run(stray, "overview", "--ref", "origin/nowhere");
    expect([unresolved.status, unresolved.stdout]).toEqual([5, "state=upstream-unresolved\nref=origin/nowhere\n"]);
    const untracked = run(stray, "overview", "--ref", "origin/bare");
    expect([untracked.status, untracked.stdout]).toEqual([5, "state=workbench-untracked\nref=origin/bare\n"]);
    for (const args of [[], ["bogus"], ["overview", "--window", "0"], ["overview", "--window"], ["overview", "--ref", "-x"], ["overview", "--ref", "a", "--ref", "b"], ["overview", "--format", "json"]]) {
      const usage = run(stray, ...args);
      expect([usage.status, usage.stdout], args.join(" ")).toEqual([2, ""]);
    }
    expect(run(scratch("no-workbench"), "overview").status).toBe(3);
    // A workbench the codec does not read at the commit is a named failure and never an empty overview.
    const legacy = run(stray, "overview", "--ref", "origin/legacy");
    expect([legacy.status, legacy.stdout, legacy.stderr]).toEqual([4, "", expect.stringMatching(/fusion-campaign: the workbench at [0-9a-f]{40}:fusion-workbench is legacy .* No overview was read\.\n$/)]);
    git(stray, "remote", "set-url", "origin", join(world.origin, "gone.git"));
    const failed = run(stray, "overview", "--ref", "origin/main");
    // git's own stderr is passed through; its wording is locale-dependent, so what is asserted is that it arrived.
    expect([failed.status, failed.stdout, failed.stderr === ""]).toEqual([6, "state=fetch-failed\nref=origin/main\n", false]);
  }, CASE_TIMEOUT * 4);
});

describe("the measured case, reduced tier: the five holders of the consuming project at 56c19983a", () => {
  interface Fixture {
    packages: Array<{ name: string; status: string; holder: string | null }>;
    checkouts: Record<string, { alias: string }>;
    log: Array<{ ts: string; checkout: string; detail: string }>;
  }
  const fixture = JSON.parse(readFileSync(join(pluginRoot, "hooks", "lib", "__tests__", "fixtures", "campaign", "ax-k2-3-261105.json"), "utf-8")) as Fixture;
  const REBASED = "cb430046";
  const utc = (seconds: string | number): string => `${new Date(Number(seconds) * 1000).toISOString().slice(0, 19)}Z`;

  it("dates each holder by its fixture row's commit, cb430046 by the commit a rebase made of its second later row, and counts the one row no rule matches", () => {
    const { origin, project: p } = pushing("measured");
    const claimed = fixture.packages.filter((e) => e.status === "claimed");
    for (const e of claimed) claim(p, createPackage(p, e.name), e.holder as string);
    for (const [checkout, entry] of Object.entries(fixture.checkouts)) register(p, checkout, entry.alias);
    commit(p.root, "seed", "2026-11-01T09:00:00Z");

    // One commit per fixture row, under the row's subject and at the row's `ts`; the row then names that commit.
    const subjectOf = (detail: string): string => detail.slice(detail.indexOf(" ") + 1);
    const rows = fixture.log.map((row) => {
      writeFileSync(join(p.root, `${row.checkout}.txt`), `${row.ts}\n`);
      return { ts: row.ts, checkout: row.checkout, detail: `${commit(p.root, subjectOf(row.detail), `${row.ts}Z`)} ${subjectOf(row.detail)}` };
    });
    // Three later commits by the one checkout, each with its row, as the lock wrote them before the pull.
    const later = [["2026-11-03T16:40:00", "fix: first later commit"], ["2026-11-03T16:55:00", "fix: second later commit"], ["2026-11-03T17:03:59", "docs: the rebased hash is recorded"]].map(([ts, subject]) => {
      writeFileSync(join(p.root, `${REBASED}.txt`), `${ts}\n`);
      return { ts, checkout: REBASED, detail: `${commit(p.root, subject, `${ts}Z`)} ${subject}` };
    });
    // A forced rebase rewrites all three: subject and author time stay, the committer time moves two hours on and
    // the hash is another one. The third is then reworded as well, so no rule can name it.
    git(p.root, "rebase", "-q", "--force-rebase", "--exec", 'GIT_COMMITTER_DATE="$(( $(git show -s --format=%at HEAD) + 7200 )) +0000" git commit -q --amend --no-edit', "HEAD~3");
    gitWith({ GIT_COMMITTER_DATE: `${git(p.root, "show", "-s", "--format=%ct", "HEAD")} +0000` }, p.root, "commit", "-q", "--amend", "-m", "docs: reworded after the rebase");
    logRows(p, [...rows, ...later]);
    commit(p.root, "chore(events): settle", "2026-11-05T08:00:00Z");
    git(p.root, "push", "-q", "origin", "main");

    const reader = reading(origin, "measured");
    // The origin holds none of the three hashes the rows carry.
    for (const row of later) expect(spawnSync("git", ["cat-file", "-e", `${row.detail.split(" ")[0]}^{commit}`], { cwd: reader, env: env() }).status, row.detail).not.toBe(0);
    const r = run(reader, "overview");
    expect(r.status, r.stderr).toBe(0);
    const held = r.lines("held").map((l) => l.split("\t"));
    const packageOf = new Map(claimed.map((e) => [e.holder as string, e.name]));
    const fixtureTime = new Map(fixture.log.map((row) => [row.checkout, `${row.ts}Z`]));
    const secondRewritten = utc(git(reader, "show", "-s", "--format=%ct", "origin/main~2"));
    const holders = [...packageOf.keys()].sort();
    expect(holders).toEqual(["0838bf45", "95433365", REBASED, "d44c592f", "f85f8da1"]);
    expect(held).toEqual(holders.map((h) => [h, fixture.checkouts[h].alias, packageOf.get(h), h === REBASED ? secondRewritten : fixtureTime.get(h), "none"]));
    // Later than its fixture row's commit, and not the third rewritten commit's time, which no row names.
    expect([secondRewritten, secondRewritten > (fixtureTime.get(REBASED) as string)]).toEqual(["2026-11-03T18:55:00Z", true]);
    expect(utc(git(reader, "show", "-s", "--format=%ct", "origin/main~1"))).toBe("2026-11-03T19:03:59Z");
    expect(r.lines("note")).toEqual([`commit-rows-unmatched\t${REBASED}\t1\t2026-11-03T17:03:59Z`]);
  }, CASE_TIMEOUT * 8);
});

describe("commitNamedBy: a row names one commit or none", () => {
  const listing = commitListing(["aaaa1111\t1000\t1000\tone subject", "aaaa2222\t2000\t9000\ttwice", "bbbb3333\t2030\t9500\ttwice", "cccc4444\t5000\t5000\ta\ttab"].join("\n"));
  const named = (ts: string, detail: string) => commitNamedBy({ ts, detail }, listing)?.hash ?? null;
  const at = (seconds: number) => new Date(seconds * 1000).toISOString().slice(0, 19);

  it("reads the hash first, then subject and author time, and never picks between two", () => {
    // 1: the hash, whatever the subject and the time say.
    expect(named(at(0), "aaaa1 another subject")).toBe("aaaa1111");
    // 2: the hash is gone; one commit carries the subject within the window, the designator read either way.
    expect([named(at(1060), "ffff000 one subject"), named(`${at(940)}Z`, "ffff000 one subject"), named(at(5000), "ffff000 atab")]).toEqual(["aaaa1111", "aaaa1111", "cccc4444"]);
    // 3: outside the window, two candidates by subject, a prefix two hashes share, a detail that is no row.
    expect([named(at(1061), "ffff000 one subject"), named(at(2015), "ffff000 twice"), named(at(0), "aaaa nothing"), named(at(1000), "one subject")]).toEqual([null, null, null, null]);
    expect(named(at(1960), "ffff000 twice")).toBe("aaaa2222");
  });
});
