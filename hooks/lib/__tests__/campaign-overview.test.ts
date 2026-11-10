import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { commitListing, commitNamedBy } from "../campaign.js";
import { pluginRoot } from "./helpers/citation-scan.js";
import { CASE_TIMEOUT } from "./helpers/guard-harness.js";
import { campaignFile, claim, createPackage, jsonWorkbenchAt, must, placeRecord, setDependencies, setResources, transition, type JsonProject, type Package } from "./helpers/json-workbench.js";

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

  it("a campaign file at the ref is read: a draft without lanes prints its row, no lane and no condition, and the held rows stand; --window is printed back", () => {
    const r = run(world.reader, "overview", "--ref", "origin/with-campaign", "--window", "48");
    expect(r.status, r.stderr).toBe(0);
    expect(["state", "ref", "window_hours", "campaigns"].map(r.value)).toEqual(["ok", "origin/with-campaign", "48", "1"]);
    expect([r.lines("campaign"), r.lines("campaign-unreadable"), r.lines("lane"), r.lines("in-no-lane")]).toEqual([["261101-0900-pipeline\tdraft\t-\t-"], [], [], []]);
    expect(r.lines("held")).toEqual(heldRows());
    expect(r.lines("note")).toEqual([`no-commit-rows\t${B}`]);
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

/** The measured case of plan step 6, as far as the two tiers read it; every `_source` key is provenance and is not typed. */
interface Fixture {
  packages: Array<{ name: string; group: string; status: string; holder: string | null; claim_kept: string | null; outcome_class: string | null; depends_on: string[]; areas: string[] }>;
  lanes: Array<{ id: string; checkout: string; members: string[] }>;
  checkouts: Record<string, { alias: string }>;
  log: Array<{ ts: string; checkout: string; detail: string }>;
}
const fixture = JSON.parse(readFileSync(join(pluginRoot, "hooks", "lib", "__tests__", "fixtures", "campaign", "ax-k2-3-261105.json"), "utf-8")) as Fixture;
const utc = (seconds: string | number): string => `${new Date(Number(seconds) * 1000).toISOString().slice(0, 19)}Z`;
const subjectOf = (detail: string): string => detail.slice(detail.indexOf(" ") + 1);
const sha256 = (path: string): string => `sha256:${createHash("sha256").update(readFileSync(path)).digest("hex")}`;
/** A lane member, the `record_ref` the schema types, with the container as its display name. */
const member = (workbenchId: string, pkg: Package) => ({ workbench_id: workbenchId, record_id: pkg.id, display: pkg.dir.slice("work-packages/".length) });

describe("the measured case, reduced tier: the five holders of the consuming project at 56c19983a", () => {
  const REBASED = "cb430046";

  it("dates each holder by its fixture row's commit, cb430046 by the commit a rebase made of its second later row, and counts the one row no rule matches", () => {
    const { origin, project: p } = pushing("measured");
    const claimed = fixture.packages.filter((e) => e.status === "claimed");
    for (const e of claimed) claim(p, createPackage(p, e.name), e.holder as string);
    for (const [checkout, entry] of Object.entries(fixture.checkouts)) register(p, checkout, entry.alias);
    commit(p.root, "seed", "2026-11-01T09:00:00Z");

    // One commit per fixture row, under the row's subject and at the row's `ts`; the row then names that commit.
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

/**
 * The fixture's 28 packages, written through the kernel: every entry created,
 * the `depends_on` edges and the `areas` set while every package is open (the
 * codec sets both on a live package only), then each entry brought to its
 * status by its `holder` or `claim_kept` checkout. `shared_areas` are written
 * nowhere (ruling B of 2026-11-09), and an empty `areas` leaves `resources`
 * undeclared.
 */
function buildMeasured(p: JsonProject): { of: (name: string) => Package; workbenchId: string } {
  const packages = new Map(fixture.packages.map((e) => [e.name, createPackage(p, e.name)]));
  const of = (name: string): Package => packages.get(name) as Package;
  for (const e of fixture.packages) if (e.depends_on.length > 0) setDependencies(p, of(e.name), e.depends_on.map((t) => ({ target: of(t), condition: "terminal" as const })));
  for (const e of fixture.packages) if (e.areas.length > 0) setResources(p, of(e.name), e.areas);
  for (const e of fixture.packages) {
    const pkg = of(e.name);
    if (e.status === "paused") transition(p, pkg, "paused");
    if (e.status === "claimed") claim(p, pkg, e.holder as string);
    if (e.status === "done" || e.status === "dropped") {
      if (e.claim_kept !== null) claim(p, pkg, e.claim_kept);
      transition(p, pkg, e.status, { outcome: { class: e.outcome_class, reason: `as the package.json read at 56c19983a`, evidence: [] } });
    }
  }
  return { of, workbenchId: must(p, { op: "inspect" }).result.id as string };
}

describe("the measured case, full tier: the three lanes of the consuming project at 56c19983a", () => {
  const CAMPAIGN = "261105-0900-pipeline";
  const LANE2 = "f85f8da1";
  const name = (prefix: string): string => fixture.packages.map((e) => e.name).find((n) => n.startsWith(prefix)) as string;

  it("prints the four held packages in no lane, the two hand-offs out of lane 1, one cross-lane commit by lane 2 under pkg/ai and none under api/openapi.yaml, and every lane unconfirmed", () => {
    const { origin, project: p } = pushing("full");
    const { of, workbenchId } = buildMeasured(p);
    for (const [checkout, entry] of Object.entries(fixture.checkouts)) register(p, checkout, entry.alias);
    campaignFile(p, CAMPAIGN, { state: { state: "running" }, lanes: fixture.lanes.map((l) => ({ id: l.id, checkout_id: l.checkout, members: l.members.map((n) => member(workbenchId, of(n))) })) });
    commit(p.root, "seed", "2026-11-01T09:00:00Z");
    git(p.root, "push", "-q", "origin", "main");
    // The reader is cloned now: the commit rows and the two lane-2 commits below reach it only through the ref.
    const reader = reading(origin, "full");

    const rows = fixture.log.map((row) => {
      writeFileSync(join(p.root, `${row.checkout}.txt`), `${row.ts}\n`);
      return { ts: row.ts, checkout: row.checkout, detail: `${commit(p.root, subjectOf(row.detail), `${row.ts}Z`)} ${subjectOf(row.detail)}` };
    });
    // Lane 2's checkout commits under lane 3's area, and the commit is rebased before the push: the row keeps the old hash.
    const AI = "2026-11-05T07:00:00";
    mkdirSync(join(p.root, "codebase", "go", "pkg", "ai"), { recursive: true });
    writeFileSync(join(p.root, "codebase", "go", "pkg", "ai", "populate.go"), "package ai\n");
    const aiRow = { ts: AI, checkout: LANE2, detail: `${commit(p.root, "feat(ai): the fill floors move", `${AI}Z`)} feat(ai): the fill floors move` };
    git(p.root, "rebase", "-q", "--force-rebase", "--exec", 'GIT_COMMITTER_DATE="$(( $(git show -s --format=%at HEAD) + 3600 )) +0000" git commit -q --amend --no-edit', "HEAD~1");
    const rebasedAi = git(p.root, "rev-parse", "HEAD");
    // The same checkout touches a shared file no package declares.
    const API = "2026-11-05T07:30:00";
    mkdirSync(join(p.root, "api"), { recursive: true });
    writeFileSync(join(p.root, "api", "openapi.yaml"), "openapi: 3.1.0\n");
    const apiRow = { ts: API, checkout: LANE2, detail: `${commit(p.root, "docs(api): the contract", `${API}Z`)} docs(api): the contract` };
    logRows(p, [...rows, aiRow, apiRow]);
    commit(p.root, "chore(events): settle", "2026-11-05T08:30:00Z");
    git(p.root, "push", "-q", "origin", "main");

    const r = run(reader, "overview");
    expect(r.status, r.stderr).toBe(0);
    // The ref holds the rebased commit and not the hash lane 2's row carries.
    expect([git(reader, "rev-parse", "origin/main~2"), spawnSync("git", ["cat-file", "-e", `${aiRow.detail.split(" ")[0]}^{commit}`], { cwd: reader, env: env() }).status === 0]).toEqual([rebasedAi, false]);
    const revision = sha256(join(reader, "fusion-workbench", "campaigns", CAMPAIGN, "campaign.json"));
    const aliasOf = (checkout: string): string => fixture.checkouts[checkout].alias;
    expect([r.value("campaigns"), r.lines("campaign"), r.lines("campaign-unreadable")]).toEqual(["1", [`${CAMPAIGN}\trunning\t-\t3`], []]);

    // The five holders, as the reduced tier prints them; lane 2's checkout is dated by its rebased commit, the newest it pushed.
    const fixtureTime = new Map(fixture.log.map((row) => [row.checkout, `${row.ts}Z`]));
    const claimed = fixture.packages.filter((e) => e.status === "claimed");
    const packageOf = new Map(claimed.map((e) => [e.holder as string, e.name]));
    const holders = [...packageOf.keys()].sort();
    expect(holders).toEqual(["0838bf45", "95433365", "cb430046", "d44c592f", LANE2]);
    expect(r.lines("held")).toEqual(holders.map((h) => [h, aliasOf(h), packageOf.get(h), h === LANE2 ? utc(git(reader, "show", "-s", "--format=%ct", rebasedAi)) : fixtureTime.get(h), "none"].join("\t")));

    // The lanes: what each checkout holds, and the first live unheld member in lane order. Lane 2's `next` is the paused
    // 261026-2024, which the rule as written admits: live and unheld.
    const [plan, selection, ai] = fixture.lanes;
    expect(r.lines("lane")).toEqual([
      [CAMPAIGN, plan.id, plan.checkout, aliasOf(plan.checkout), name("261104-0833"), name("261002-1204"), "none"].join("\t"),
      [CAMPAIGN, selection.id, selection.checkout, aliasOf(selection.checkout), name("261104-1932"), name("261026-2024"), "none"].join("\t"),
      [CAMPAIGN, ai.id, ai.checkout, aliasOf(ai.checkout), name("260916-1447-be-ein-qualitaetsmass"), name("260814-1228"), "none"].join("\t"),
    ]);

    // The acceptance figures of plan step 14, from the fixture and not from the helper.
    expect(r.lines("in-no-lane")).toEqual([["0838bf45", name("261103-1957")], ["cb430046", name("261102-1042")], ["d44c592f", name("261104-0833")], [LANE2, name("261104-1932")]].map((row) => row.join("\t")));
    expect(r.lines("handoff-possible")).toEqual([
      [name("261031-1718"), name("260814-1228"), "lane-1", "lane-3"].join("\t"),
      [name("261031-1718"), name("261101-1002"), "lane-1", "lane-3"].join("\t"),
    ]);
    expect(r.lines("out-of-lane")).toEqual([]);
    expect(r.lines("cross-lane")).toEqual([[git(reader, "rev-parse", "--short", rebasedAi), "codebase/go/pkg/ai/populate.go", "lane-2", "lane-3"].join("\t")]);
    expect(r.lines("unconfirmed")).toEqual(fixture.lanes.map((l) => [CAMPAIGN, l.id, l.checkout, revision, "none"].join("\t")));
    expect([r.lines("silent"), r.lines("waits-decision"), r.lines("note")]).toEqual([[], [], []]);
  }, CASE_TIMEOUT * 10);
});

describe("silent and unreadable: a lane whose checkout holds nothing, and a campaign the codec reports against", () => {
  const ID = "261101-0900-pipeline";
  const BROKEN = "261101-0901-broken";

  it("--window 1 prints a silent row for a checkout that last pushed two hours ago and the default prints none; the broken campaign is unreadable and evaluated no further", () => {
    const { origin, project: p } = pushing("silent");
    const pkg = createPackage(p, "261101-0001-lane-work");
    const workbenchId = must(p, { op: "inspect" }).result.id as string;
    campaignFile(p, ID, { state: { state: "running" }, lanes: [{ id: "lane-1", checkout_id: A, members: [member(workbenchId, pkg)] }] });
    campaignFile(p, BROKEN, { state: { state: "running" }, lanes: [{ id: "lane-1", checkout_id: B, members: [] }, { id: "lane-2", checkout_id: B, members: [] }] });
    commit(p.root, "seed", "2026-11-01T09:00:00Z");
    const twoHoursAgo = new Date(Date.now() - 2 * 3_600_000).toISOString().slice(0, 19);
    writeFileSync(join(p.root, "work.txt"), "work\n");
    const hash = commit(p.root, "feat: two hours ago", `${twoHoursAgo}Z`);
    logRows(p, [{ ts: twoHoursAgo, checkout: A, detail: `${hash} feat: two hours ago` }]);
    commit(p.root, "chore(events): settle", `${new Date(Date.now() - 3_600_000).toISOString().slice(0, 19)}Z`);
    git(p.root, "push", "-q", "origin", "main");
    const reader = reading(origin, "silent");

    const narrow = run(reader, "overview", "--window", "1");
    expect(narrow.status, narrow.stderr).toBe(0);
    const revision = sha256(join(reader, "fusion-workbench", "campaigns", ID, "campaign.json"));
    expect([narrow.value("campaigns"), narrow.lines("campaign"), narrow.lines("campaign-unreadable"), narrow.lines("held")]).toEqual(["2", [`${ID}\trunning\t-\t1`], [`${BROKEN}\tschema-invalid/duplicate-lane-checkout`], []]);
    expect([narrow.lines("lane"), narrow.lines("silent"), narrow.lines("unconfirmed"), narrow.lines("note")]).toEqual([
      [`${ID}\tlane-1\t${A}\t-\tnone\t261101-0001-lane-work\tnone`],
      [`${ID}\tlane-1\t${A}\t${twoHoursAgo}Z`],
      [`${ID}\tlane-1\t${A}\t${revision}\tnone`],
      [],
    ]);
    const wide = run(reader, "overview");
    expect([wide.status, wide.value("window_hours"), wide.lines("silent"), wide.lines("lane").length]).toEqual([0, "24", [], 1]);
  }, CASE_TIMEOUT * 4);
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
