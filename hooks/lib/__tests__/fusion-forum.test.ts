import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// `bin/fusion-forum` is a bash script, so this drives the real script through child_process against scratch
// repositories (a bare origin, the checkout that pushes into it, the checkout that reads), the way the reading skill
// calls it. Under test is the interface its header names: the exit table, the `state=` vocabulary, and the three
// `note=` degradations, the only places the answer moves while the exit code does not.
//
// EVERY FIXTURE PATH IS PHYSICAL (`realpathSync`), because the script strips the git toplevel off the workbench with
// both sides taken as `pwd -P`, and on macOS `mktemp -d` returns a `/var/…` symlink onto a `/private/var/…` tree:
// built on the unresolved path, a fixture would take the workbench-outside-repo branch by accident. And NO NETWORK
// CALL IS MADE: every remote is a local path, the delta is proven by the author clone pushing into one, and the
// single fetch failure names a path that does not exist.

const script = join(pluginRoot, "bin", "fusion-forum");
const STORE = "shared/forum";
/** The reading checkout's identifier, pre-written so nothing is minted here. */
const OWN = "abcdef01";
const tmpRoots: string[] = [];

afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

/** All three git config layers are cut off, so the identity under test is the fixture's. */
const gitEnv = (home: string): Record<string, string> => ({
  HOME: home, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_CONFIG_NOSYSTEM: "1",
});

function scratch(tag: string): string {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), `fusion-forum-${tag}-`)));
  tmpRoots.push(dir);
  return dir;
}

function git(cwd: string, ...args: string[]): string {
  const r = spawnSync("git", args, { cwd, encoding: "utf-8", env: { ...process.env, ...gitEnv(cwd) } });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} in ${cwd}: ${r.stderr}`);
  return (r.stdout ?? "").trim();
}

const identify = (dir: string, name: string) => {
  git(dir, "config", "user.name", name);
  git(dir, "config", "user.email", `${name.toLowerCase()}@example.invalid`);
};

/** `value` returns `null` for an ABSENT line, distinct from present-and-empty. */
interface Run {
  status: number; stdout: string; stderr: string;
  value(key: string): string | null; lines(key: string): string[];
}

function run(cwd: string, ...args: string[]): Run {
  const r = spawnSync(script, args, { cwd, encoding: "utf-8", env: { ...process.env, ...gitEnv(cwd) } });
  const stdout = r.stdout ?? "";
  const lines = (key: string) =>
    stdout.split("\n").filter((l) => l.startsWith(`${key}=`)).map((l) => l.slice(key.length + 1));
  return { status: r.status ?? -1, stdout, stderr: r.stderr ?? "", lines, value: (k) => lines(k)[0] ?? null };
}

/** Writes the named entries into the author's store, commits and pushes them. */
function publish(dir: string, ...names: string[]): void {
  for (const n of names) writeFileSync(join(dir, "fusion-workbench", STORE, n), `body of ${n}\n`);
  git(dir, "add", "-A");
  git(dir, "commit", "-qm", names.join(",") || "seed");
  git(dir, "push", "-q", "origin", "main");
}

/** A bare origin, the checkout that pushes into it, and the checkout that reads; the
 *  workbench is committed, so the clone carries it and its upstream. */
function trio(...seed: string[]) {
  const origin = scratch("origin");
  git(origin, "init", "--bare", "-q", "-b", "main");
  const author = scratch("author");
  git(author, "init", "-q", "-b", "main");
  identify(author, "Ada");
  mkdirSync(join(author, "fusion-workbench", STORE), { recursive: true });
  writeFileSync(join(author, "fusion-workbench", ".fusion-setup"), "{}\n");
  git(author, "remote", "add", "origin", origin);
  publish(author, ...seed);
  const reader = scratch("reader");
  git(reader, "clone", "-q", origin, reader);
  identify(reader, "Bo");
  writeFileSync(join(reader, "fusion-workbench", ".checkout-id"), `${OWN}\n`);
  return { origin, author, reader };
}

const entryPath = (name: string) => `fusion-workbench/${STORE}/${name}`;

describe("bin/fusion-forum", () => {
  it("state=ok over an empty store: new=0 is a real answer and reaches exit 0", () => {
    const t = trio();
    const r = run(t.reader, "new", STORE);
    expect(r.status, r.stderr).toBe(0);
    expect([r.value("state"), r.value("ref"), r.value("mark"), r.value("new")]).toEqual(["ok", "origin/main", "none", "0"]);
    expect(r.value("head")).toBe(git(t.reader, "rev-parse", "origin/main"));
    expect([r.lines("entry"), r.lines("note")]).toEqual([[], []]);
  });

  it("a mark that resolves cuts the answer to what the fetch brought in, and seen keeps unknown anchor keys", () => {
    const t = trio("260907-1000-99999999-hello.md");
    const anchors = join(t.reader, "fusion-workbench", ".cadence-anchors");
    writeFileSync(anchors, "last_reconcile_commit=1111111\n");
    const first = run(t.reader, "new", STORE);
    expect([first.status, first.value("new")], first.stderr).toEqual([0, "1"]);
    expect(run(t.reader, "seen", first.value("head")!).status).toBe(0);
    // `seen` writes through bin/fusion-cadence-anchor, which spells the key and leaves another consumer's mark standing.
    expect(readFileSync(anchors, "utf-8")).toContain("last_reconcile_commit=1111111\n");
    expect(readFileSync(anchors, "utf-8")).toContain(`last_forum_read_commit=${first.value("head")}\n`);
    publish(t.author, "260907-1200-99999999-later.md");
    const second = run(t.reader, "new", STORE);
    expect(second.status, second.stderr).toBe(0);
    // The mark is what `seen` wrote, and the right-hand side moved because this run fetched.
    expect([second.value("mark"), second.value("head") === first.value("head")]).toEqual([first.value("head"), false]);
    expect([second.lines("entry"), second.lines("note")]).toEqual([[entryPath("260907-1200-99999999-later.md")], []]);
  });

  it("a mark that does not resolve reads the whole store as new, and says so", () => {
    const t = trio("260907-1000-99999999-hello.md", "260907-1001-99999999-second.md");
    const absent = "deadbeef".repeat(5);
    expect(run(t.reader, "seen", absent).status).toBe(0);
    const r = run(t.reader, "new", STORE);
    expect(r.status, r.stderr).toBe(0);
    expect([r.value("mark"), r.value("new")]).toEqual([absent, "2"]);
    expect(r.lines("note")).toEqual([expect.stringContaining("does not resolve")]);
  });

  it("this checkout's own entries are dropped, and an unreadable identifier drops none and reports", () => {
    const t = trio(`260907-1100-${OWN}-mine.md`, "260907-1101-99999999-yours.md");
    const filtered = run(t.reader, "new", STORE);
    expect(filtered.status, filtered.stderr).toBe(0);
    expect([filtered.lines("entry"), filtered.lines("note")]).toEqual([[entryPath("260907-1101-99999999-yours.md")], []]);
    // A malformed identifier is one bin/fusion-identity refuses to overwrite, so it arrives here as no CHECKOUT line at all.
    writeFileSync(join(t.reader, "fusion-workbench", ".checkout-id"), "not-hex\n");
    const unfiltered = run(t.reader, "new", STORE);
    expect(unfiltered.value("new")).toBe("2");
    expect(unfiltered.lines("note")).toEqual([expect.stringContaining("checkout identifier could not be read")]);
  });

  it("exit 5, once per state: no work tree, a detached HEAD, no upstream, an upstream that does not resolve", () => {
    const bare = scratch("no-repo");
    mkdirSync(join(bare, "fusion-workbench"));
    writeFileSync(join(bare, "fusion-workbench", ".fusion-setup"), "{}\n");
    const noTree = run(bare, "new", STORE);
    expect([noTree.status, noTree.value("state")]).toEqual([5, "no-work-tree"]);
    const t = trio();
    git(t.reader, "checkout", "-q", "--detach");
    const detached = run(t.reader, "new", STORE);
    expect([detached.status, detached.value("state")]).toEqual([5, "no-branch"]);
    git(t.reader, "checkout", "-q", "main");
    git(t.reader, "config", "--unset", "branch.main.remote");
    git(t.reader, "config", "--unset", "branch.main.merge");
    const noUpstream = run(t.reader, "new", STORE);
    expect([noUpstream.status, noUpstream.value("state"), noUpstream.value("branch")]).toEqual([5, "no-upstream", "main"]);
    // Configured, fetchable, and naming a ref the fetch does not produce.
    git(t.reader, "config", "branch.main.remote", "origin");
    git(t.reader, "config", "branch.main.merge", "refs/heads/nowhere");
    const unresolved = run(t.reader, "new", STORE);
    expect([unresolved.status, unresolved.value("state"), unresolved.value("ref")]).toEqual([5, "upstream-unresolved", "origin/nowhere"]);
  });

  it("a branch tracking a local ref skips the fetch and says the comparison is that local", () => {
    const t = trio("260907-1000-99999999-hello.md");
    git(t.reader, "branch", "side");
    git(t.reader, "config", "branch.main.remote", ".");
    git(t.reader, "config", "branch.main.merge", "refs/heads/side");
    const r = run(t.reader, "new", STORE);
    expect(r.status, r.stderr).toBe(0);
    expect([r.value("state"), r.value("ref")]).toEqual(["ok", "side"]);
    expect(r.lines("note")).toEqual([expect.stringContaining("tracks a local ref")]);
  });

  it("exit 7: the workbench sits in an ancestor of the repository, so no git path can be derived", () => {
    const root = scratch("outside");
    mkdirSync(join(root, "fusion-workbench"));
    writeFileSync(join(root, "fusion-workbench", ".fusion-setup"), "{}\n");
    const repo = join(root, "repo");
    mkdirSync(repo);
    git(repo, "init", "-q", "-b", "main");
    identify(repo, "Cy");
    writeFileSync(join(repo, "a.txt"), "a\n");
    git(repo, "add", "-A");
    git(repo, "commit", "-qm", "seed");
    git(repo, "branch", "side");
    // Tracking a local ref keeps the fixture off any remote; the derivation under test runs after the fetch either way.
    git(repo, "config", "branch.main.remote", ".");
    git(repo, "config", "branch.main.merge", "refs/heads/side");
    const r = run(repo, "new", STORE);
    expect([r.status, r.value("state")]).toEqual([7, "workbench-outside-repo"]);
  });

  it("the rest of the table: exit 6 on a fetch that cannot complete, exit 3 with no workbench, exit 2 on usage", () => {
    const t = trio();
    git(t.reader, "remote", "set-url", "origin", join(t.origin, "gone.git"));
    const failed = run(t.reader, "new", STORE);
    expect([failed.status, failed.value("state"), failed.value("ref")]).toEqual([6, "fetch-failed", "origin/main"]);
    // git's own stderr, passed through rather than paraphrased; its wording is locale-dependent, so what is asserted is that it arrived.
    expect(failed.stderr).not.toBe("");
    expect(run(scratch("stray"), "new", STORE).status).toBe(3);
    for (const args of [["bogus"], ["new"], ["new", "/absolute"], ["new", "../escape"], ["show", "HEAD"]]) {
      expect(run(t.reader, ...args).status, args.join(" ")).toBe(2);
    }
  });

  it("show renders the blob at the pinned commit, and exits 1 rather than leaking git's 128", () => {
    const t = trio();
    publish(t.author, "260907-1000-99999999-hello.md");
    const listed = run(t.reader, "new", STORE);
    const [head, path] = [listed.value("head")!, listed.lines("entry")[0]];
    const hit = run(t.reader, "show", head, path);
    expect([hit.status, hit.stdout], hit.stderr).toEqual([0, "body of 260907-1000-99999999-hello.md\n"]);
    // Out of the ref and not out of the working tree: pushed after the clone, so nothing on disk here could have answered.
    expect(existsSync(join(t.reader, path))).toBe(false);
    expect(run(t.reader, "show", head, entryPath("absent.md")).status).toBe(1);
  });
});
