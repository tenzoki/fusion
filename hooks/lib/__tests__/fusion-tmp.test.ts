import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { DENY_ENTRIES, FUSION_TMP_BASE, SYSTEM_TEMP_PREFIXES, UnparseableSettings, grantEntries, mergeSettings } from "../temp-paths.js";

// `bin/fusion-tmp` driven as a caller drives it, against throwaway projects.
//
// EVERY RUN SETS `HOME` TO A SCRATCH DIRECTORY, so the real `~/.fusion-tmp` and
// `~/.claude/` of the machine are never read or written. Git's global and
// system layers are cut off for the same reason, and an identity is supplied
// through a scratch global config so `bin/fusion-identity` prints a CHECKOUT=.
//
// Two fixture bases. Projects under the OS temp directory exercise everything
// except the deny entries, which the helper refuses to write from a directory
// under a system temp prefix, or when `~/.fusion-tmp/<id>` is. The deny cases
// therefore run in a project, and with a HOME, under the ignored
// `hooks/node_modules/`, which lies under no such prefix.

const script = join(pluginRoot, "bin", "fusion-tmp");
const scratch: string[] = [];
const outsideBase = join(pluginRoot, "hooks", "node_modules", ".fusion-tmp-test");
afterAll(() => {
  for (const d of scratch) rmSync(d, { recursive: true, force: true });
  try {
    rmdirSync(outsideBase); // only when empty: a concurrent run may still hold a project there
  } catch {
    /* not empty, or already gone */
  }
});

function mk(base: string, prefix: string): string {
  mkdirSync(base, { recursive: true });
  const d = mkdtempSync(join(base, prefix));
  scratch.push(d);
  return realpathSync(d);
}

const gitconfig = join(mk(tmpdir(), "fusion-tmp-cfg-"), "gitconfig");
writeFileSync(gitconfig, "[user]\n\tname = Test Person\n\temail = t@example.com\n");

function env(home: string): NodeJS.ProcessEnv {
  return { ...process.env, HOME: home, GIT_CONFIG_GLOBAL: gitconfig, GIT_CONFIG_NOSYSTEM: "1" };
}

function git(cwd: string, ...args: string[]): string {
  const r = spawnSync("git", args, { cwd, encoding: "utf-8", env: env(cwd) });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout;
}

/** A set-up project: the workbench marker, and optionally a git repository with one commit. */
function project(opts: { git?: boolean; outsideTemp?: boolean } = {}): string {
  const root = mk(opts.outsideTemp ? outsideBase : tmpdir(), "fusion-tmp-p-");
  mkdirSync(join(root, "fusion-workbench"));
  writeFileSync(join(root, "fusion-workbench", ".fusion-setup"), "{}\n");
  if (opts.git !== false) {
    git(root, "init", "-q");
    git(root, "commit", "-q", "--allow-empty", "-m", "init");
  }
  return root;
}

function home(): string {
  return mk(tmpdir(), "fusion-tmp-h-");
}

/** A scratch HOME under no system temp prefix, for the cases that expect the deny written. */
function homeOutside(): string {
  return mk(outsideBase, "fusion-tmp-h-");
}

interface Run {
  status: number;
  stdout: string;
  stderr: string;
  kv: Record<string, string>;
}

function run(cwd: string, h: string | undefined, ...args: string[]): Run {
  const e = h === undefined ? { ...env(cwd), HOME: undefined } : env(h);
  const r = spawnSync(script, args, { cwd, encoding: "utf-8", env: e });
  const kv: Record<string, string> = {};
  for (const l of (r.stdout ?? "").split("\n")) {
    const i = l.indexOf("=");
    if (i > 0 && !l.startsWith("other=")) kv[l.slice(0, i)] = l.slice(i + 1);
  }
  return { status: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "", kv };
}

const id = (root: string) => readFileSync(join(root, "fusion-workbench", ".checkout-id"), "utf-8").trim();
const settingsOf = (root: string) => join(root, ".claude", "settings.local.json");
const json = (p: string) => JSON.parse(readFileSync(p, "utf-8"));

describe("bin/fusion-tmp path", () => {
  it("creates the directory with mode 700, prints it, and writes .origin once", () => {
    const root = project();
    const h = home();
    const r1 = run(root, h, "path");
    expect(r1.status, r1.stderr).toBe(0);
    const dir = join(h, FUSION_TMP_BASE, id(root));
    expect(r1.stdout).toBe(dir + "\n");
    expect(statSync(dir).mode & 0o777).toBe(0o700);
    expect(readFileSync(join(dir, ".origin"), "utf-8")).toBe(root + "\n");
    writeFileSync(join(dir, ".origin"), "kept\n");
    const r2 = run(root, h, "path");
    expect(r2.stdout).toBe(r1.stdout);
    expect(readFileSync(join(dir, ".origin"), "utf-8")).toBe("kept\n");
  });

  it("passes fusion-identity's mint notice to stderr, and nothing on a later call", () => {
    const root = project();
    const h = home();
    const r1 = run(root, h, "path");
    expect(r1.status, r1.stderr).toBe(0);
    // The long-path warning may follow, since this HOME sits deep under tmpdir(); it is not the subject.
    const ident = (r: Run) => r.stderr.split("\n").filter((l) => l.startsWith("fusion-identity:"));
    expect(ident(r1)).toEqual([expect.stringMatching(new RegExp(`^fusion-identity: minted ${id(root)}, `))]);
    const r2 = run(root, h, "path");
    expect([r2.status, ident(r2)]).toEqual([0, []]);
  });

  it("warns on stderr at 72 bytes and not at 71, and exits 0 both times", () => {
    const root = project();
    // The directory is HOME + "/.fusion-tmp/" + 8 hex, so HOME is padded to 50 and 51 bytes.
    const short = mkdtempSync("/tmp/ft-");
    scratch.push(short);
    for (const [len, warns] of [[71, false], [72, true]] as const) {
      const h = join(short, "h".repeat(len - 21 - short.length - 1));
      mkdirSync(h);
      const r = run(root, h, "path");
      expect(r.status).toBe(0);
      expect(r.stdout.trim().length).toBe(len);
      expect(r.stderr.includes("AF_UNIX"), r.stderr).toBe(warns);
    }
  });
});

describe("bin/fusion-tmp grant", () => {
  it("grants into an absent file and adds the ignore line once", () => {
    const root = project();
    const h = home();
    const r = run(root, h, "grant");
    expect(r.status, r.stderr).toBe(0);
    expect(r.kv).toMatchObject({ settings: settingsOf(root), added: "2", deny: "skipped-under-temp", ignored: "added" });
    const g = grantEntries(id(root));
    expect(json(settingsOf(root)).permissions).toEqual({ allow: [g.allow], additionalDirectories: [g.directory] });
    const again = run(root, h, "grant");
    expect(again.kv).toMatchObject({ added: "0", ignored: "yes" });
    expect(readFileSync(join(root, ".gitignore"), "utf-8")).toBe(".claude/settings.local.json\n");
  });

  it("keeps an existing allow entry and defaultMode", () => {
    const root = project();
    mkdirSync(join(root, ".claude"));
    writeFileSync(settingsOf(root), JSON.stringify({ permissions: { allow: ["Bash(ls)"], defaultMode: "acceptEdits" }, model: "x" }));
    const r = run(root, home(), "grant");
    expect(r.status, r.stderr).toBe(0);
    const s = json(settingsOf(root));
    expect(s.model).toBe("x");
    expect(s.permissions.defaultMode).toBe("acceptEdits");
    expect(s.permissions.allow).toEqual(["Bash(ls)", grantEntries(id(root)).allow]);
  });

  it("exits 4 on an unparseable file and leaves it, and .gitignore, untouched", () => {
    const root = project();
    mkdirSync(join(root, ".claude"));
    writeFileSync(settingsOf(root), "{ not json");
    const r = run(root, home(), "grant");
    expect(r.status).toBe(4);
    expect(readFileSync(settingsOf(root), "utf-8")).toBe("{ not json");
    expect(existsSync(join(root, ".gitignore"))).toBe(false);
  });

  it("from a linked worktree writes the main checkout's file", () => {
    const main = project();
    const wt = join(main + "-wt");
    scratch.push(wt);
    git(main, "worktree", "add", "-q", wt);
    mkdirSync(join(wt, "fusion-workbench"));
    writeFileSync(join(wt, "fusion-workbench", ".fusion-setup"), "{}\n");
    const h = home();
    // `check` names the same file: the permissions selector writes its half to it.
    expect(run(wt, h, "check").kv.settings).toBe(settingsOf(main));
    const r = run(wt, h, "grant");
    expect(r.status, r.stderr).toBe(0);
    expect(r.kv.settings).toBe(settingsOf(main));
    expect(r.kv.gitignore).toBe(join(main, ".gitignore"));
    expect(json(settingsOf(main)).permissions.allow).toEqual([grantEntries(id(wt)).allow]);
    expect(existsSync(settingsOf(wt))).toBe(false);
  });

  it("outside git writes <root>/.claude/ and reports not-a-repo", () => {
    const root = project({ git: false });
    const r = run(root, home(), "grant");
    expect(r.status, r.stderr).toBe(0);
    expect(r.kv).toMatchObject({ settings: settingsOf(root), ignored: "not-a-repo" });
    expect(existsSync(settingsOf(root))).toBe(true);
  });

  it("a tracked settings file gives ignored=tracked and is not edited", () => {
    const root = project();
    mkdirSync(join(root, ".claude"));
    writeFileSync(settingsOf(root), "{}\n");
    git(root, "add", "-f", ".claude/settings.local.json");
    git(root, "commit", "-q", "-m", "tracked");
    const r = run(root, home(), "grant");
    expect(r.status, r.stderr).toBe(0);
    expect(r.kv).toMatchObject({ added: "0", ignored: "tracked" });
    expect(readFileSync(settingsOf(root), "utf-8")).toBe("{}\n");
    expect(existsSync(join(root, ".gitignore"))).toBe(false);
  });
});

describe("bin/fusion-tmp grant: the deny entries", () => {
  it("writes them without a sandbox, then reports present-under-sandbox and removes nothing", () => {
    const root = project({ outsideTemp: true });
    const h = homeOutside();
    const r1 = run(root, h, "grant");
    expect(r1.status, r1.stderr).toBe(0);
    expect(r1.kv).toMatchObject({ added: "6", deny: "written" });
    expect(json(settingsOf(root)).permissions.deny).toEqual([...DENY_ENTRIES]);
    expect(run(root, h, "grant").kv.deny).toBe("present");
    writeFileSync(join(root, ".claude", "settings.json"), JSON.stringify({ sandbox: { enabled: true } }));
    expect(run(root, h, "grant").kv).toMatchObject({ added: "0", deny: "present-under-sandbox" });
    expect(json(settingsOf(root)).permissions.deny).toEqual([...DENY_ENTRIES]);
  });

  it("skips them when the project file enables the sandbox", () => {
    const root = project({ outsideTemp: true });
    mkdirSync(join(root, ".claude"));
    writeFileSync(join(root, ".claude", "settings.json"), JSON.stringify({ sandbox: { enabled: true } }));
    const r = run(root, homeOutside(), "grant");
    expect(r.kv).toMatchObject({ added: "2", deny: "skipped-sandbox" });
    expect(json(settingsOf(root)).permissions.deny).toBeUndefined();
  });

  it("skips them when ~/.fusion-tmp/<id> lies under a system temp prefix, which they would deny", () => {
    const root = project({ outsideTemp: true });
    const h = home();
    expect(run(root, h, "check").kv.deny).toBe("skipped-home-under-temp");
    const r = run(root, h, "grant");
    expect(r.status, r.stderr).toBe(0);
    expect(r.kv).toMatchObject({ added: "2", deny: "skipped-home-under-temp" });
    expect(json(settingsOf(root)).permissions.deny).toBeUndefined();
  });
});

describe("bin/fusion-tmp link", () => {
  it("links a free tmp after ignoring /tmp, and leaves an occupied one alone", () => {
    const root = project();
    const h = home();
    const r = run(root, h, "link");
    expect(r.status, r.stderr).toBe(0);
    expect(r.kv.link).toBe("created");
    expect(realpathSync(join(root, "tmp"))).toBe(realpathSync(join(h, FUSION_TMP_BASE, id(root))));
    expect(readFileSync(join(root, ".gitignore"), "utf-8")).toBe("/tmp\n");
    expect(run(root, h, "link").kv.link).toBe("ours");
    expect(git(root, "status", "--porcelain")).not.toMatch(/(^|\s)tmp\/?$/m);

    const busy = project();
    mkdirSync(join(busy, "tmp"));
    writeFileSync(join(busy, "tmp", "mine"), "x");
    expect(run(busy, h, "link").kv.link).toBe("occupied");
    expect(readFileSync(join(busy, "tmp", "mine"), "utf-8")).toBe("x");
    expect(existsSync(join(busy, ".gitignore"))).toBe(false);
  });
});

describe("bin/fusion-tmp check", () => {
  it("lists this root's earlier identities only, and changes nothing under ~/.fusion-tmp", () => {
    const root = project();
    const h = home();
    run(root, h, "path");
    const base = join(h, FUSION_TMP_BASE);
    for (const [name, origin] of [["aaaaaaaa", root], ["bbbbbbbb", "/elsewhere"], ["cccccccc", root]]) {
      mkdirSync(join(base, name));
      writeFileSync(join(base, name, ".origin"), origin + "\n");
    }
    mkdirSync(join(root, "fusion-workbench", "shared", "checkouts"), { recursive: true });
    writeFileSync(join(root, "fusion-workbench", "shared", "checkouts", "cccccccc.md"), "x\n");

    const fmt = process.platform === "darwin" ? ["-f", "%N %p %z %m"] : ["-c", "%n %a %s %Y"];
    const listing = () => spawnSync("find", [base, "-exec", "stat", ...fmt, "{}", ";"], { encoding: "utf-8" }).stdout;
    const before = listing();
    const r = run(root, h, "check");
    expect(r.status, r.stderr).toBe(0);
    expect(listing()).toBe(before);

    expect(r.kv).toMatchObject({ present: "yes", grants: "missing", ignored: "no", link: "absent" });
    expect(r.kv.tmp).toBe(join(base, id(root)));
    expect(r.kv.path_len).toBe(String(r.kv.tmp.length));
    expect(r.kv.long).toBe(r.kv.tmp.length > 71 ? "yes" : "no");
    const others = r.stdout.split("\n").filter((l) => l.startsWith("other="));
    expect(others).toEqual([
      `other=${join(base, "aaaaaaaa")} earlier-identity unregistered`,
      `other=${join(base, "cccccccc")} earlier-identity registered`,
    ]);
    expect(existsSync(settingsOf(root))).toBe(false);
  });
});

describe("bin/fusion-tmp exits", () => {
  it("1 with no workbench, 1 with no HOME, 2 on usage", () => {
    const bare = mk(tmpdir(), "fusion-tmp-bare-");
    const r = run(bare, home(), "path");
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("no fusion workbench");
    expect(r.stdout).toBe("");
    const root = project();
    expect(run(root, undefined, "path").status).toBe(1);
    expect(run(root, home(), "nope").status).toBe(2);
    expect(run(root, home()).status).toBe(2);
  });
});

describe("hooks/lib/temp-paths.ts", () => {
  it("holds the same base name and prefixes as bin/fusion-tmp", () => {
    const sh = readFileSync(script, "utf-8");
    expect(sh).toContain(`TMP_BASE='${FUSION_TMP_BASE}'`);
    expect(sh).toContain(`TEMP_PREFIXES='${SYSTEM_TEMP_PREFIXES.join(" ")}'`);
    expect(DENY_ENTRIES).toEqual(["Edit(//tmp/**)", "Edit(//private/tmp/**)", "Edit(//var/folders/**)", "Edit(//private/var/folders/**)"]);
  });

  it("refuses a permissions list it would have to repair", () => {
    const grant = grantEntries("ab12cd34");
    expect(() => mergeSettings({ permissions: { allow: "x" } }, { grant, deny: false })).toThrow(UnparseableSettings);
    expect(() => mergeSettings({ permissions: [] }, { grant, deny: false })).toThrow(UnparseableSettings);
  });
});
