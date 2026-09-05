import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// `bin/fusion-checkout-name` is a bash script, so this drives the real script
// through child_process against throwaway workbenches — the way a skill body
// calls it. What is under test is the pair its header calls its interface: the
// exit table (a caller keys on the number, never on stderr prose) and the entry
// grammar (`**Key:** value`, first occurrence wins, an absent field absent
// rather than empty). The header states both; this file asserts them.
//
// THE PROPERTY WORTH MORE THAN THE REST: a refresh rewrites the git identity
// and the stamp and NOTHING ELSE. The alias and the person are a human's claim,
// and a helper that re-derived them would silently undo the one question
// `/fusion:setup` asks per checkout.
//
// NO WORKER FIELD IS TESTED because none exists: decision
// `260904-1058_*_does-a-registry-entry-carry-hostname-account-name-and-folder-path.md`,
// option 1 — nothing here publishes a hostname, an account name or a folder
// path, and every value below is obviously synthetic for the same reason.

const script = join(pluginRoot, "bin", "fusion-checkout-name");
const tmpRoots: string[] = [];

afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

/** All three git config layers are cut off, so the fixture's identity is the
 *  one under test rather than whatever the runner's machine holds. */
function gitEnv(home: string): Record<string, string> {
  return { HOME: home, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };
}

interface Fixture { dir: string; store: string }

function fixture(): Fixture {
  const dir = mkdtempSync(join(tmpdir(), "fusion-checkout-name-"));
  tmpRoots.push(dir);
  mkdirSync(join(dir, "fusion-workbench"), { recursive: true });
  writeFileSync(join(dir, "fusion-workbench", ".fusion-setup"), "{}\n");
  const env = { ...process.env, ...gitEnv(dir) };
  spawnSync("git", ["init", "-q"], { cwd: dir, env });
  spawnSync("git", ["config", "user.name", "Ada Example"], { cwd: dir, env });
  spawnSync("git", ["config", "user.email", "ada@example.invalid"], { cwd: dir, env });
  return { dir, store: join(dir, "fusion-workbench", "shared", "checkouts") };
}

/** `value` returns `null` for an ABSENT line, distinct from present-and-empty. */
interface Run {
  status: number; stdout: string; stderr: string;
  value(key: string): string | null;
  lines(key: string): string[];
}

function run(f: Fixture, ...args: string[]): Run {
  const r = spawnSync(script, args, { cwd: f.dir, encoding: "utf-8", env: { ...process.env, ...gitEnv(f.dir) } });
  const stdout = r.stdout ?? "";
  const lines = (key: string) =>
    stdout.split("\n").filter((l) => l.startsWith(`${key}=`)).map((l) => l.slice(key.length + 1));
  return { status: r.status ?? -1, stdout, stderr: r.stderr ?? "", lines, value: (k) => lines(k)[0] ?? null };
}

/** This checkout's hex, which only the helper and `bin/fusion-identity` mint. */
const ownHex = (f: Fixture) => readFileSync(join(f.dir, "fusion-workbench", ".checkout-id"), "utf-8").trim();
const entryText = (f: Fixture, hex: string) => readFileSync(join(f.store, `${hex}.md`), "utf-8");

describe("bin/fusion-checkout-name", () => {
  it("exit 2: --help prints the usage block and produces no value", () => {
    const r = run(fixture(), "--help");
    expect([r.status, r.stdout]).toEqual([2, ""]);
    expect(r.stderr).toContain("usage: fusion-checkout-name resolve <8hex>");
  });

  it("register creates the entry, carrying every field this checkout has", () => {
    const f = fixture();
    const r = run(f, "register");
    expect(r.status, r.stderr).toBe(0);
    const hex = ownHex(f);
    expect(r.value("entry")).toBe(`shared/checkouts/${hex}.md`);
    expect(r.value("action")).toBe("created");
    const text = entryText(f, hex);
    // Five, not six: `**Refreshed:**` is absent on a first write, and under the
    // answered gate there is no worker field at all.
    expect(text).toContain(`**Checkout:** ${hex}`);
    expect(text).toMatch(/^\*\*Alias:\*\* [a-z]+-[a-z]+$/m);
    expect(text).toContain("**Person:** Ada Example <ada@example.invalid>");
    expect(text).toContain("**Git identity:** Ada Example <ada@example.invalid>");
    expect(text).toMatch(/^\*\*Registered:\*\* \d{6}-\d{4}$/m);
    expect(text).not.toMatch(/^\*\*Refreshed:\*\*/m);
    expect(text.toLowerCase()).not.toContain("worker");
  });

  it("a refresh rewrites the git identity and the stamp, and leaves alias and person standing", () => {
    const f = fixture();
    run(f, "register", "--alias", "amber-harbor", "--person", "Ada E.");
    const hex = ownHex(f);
    spawnSync("git", ["config", "user.email", "moved@example.invalid"], { cwd: f.dir, env: { ...process.env, ...gitEnv(f.dir) } });
    const r = run(f, "register");
    expect(r.status, r.stderr).toBe(0);
    expect(r.value("action")).toBe("refreshed");
    const text = entryText(f, hex);
    expect(text).toContain("**Git identity:** Ada Example <moved@example.invalid>");
    expect(text).toContain("**Alias:** amber-harbor");
    expect(text).toContain("**Person:** Ada E.");
    expect(text).toMatch(/^\*\*Refreshed:\*\* \d{6}-\d{4}$/m);
  });

  it("resolve prints the entry's fields, and exits 3 with nothing on stdout for an unknown hex", () => {
    const f = fixture();
    run(f, "register", "--alias", "amber-harbor", "--person", "Ada E.");
    const hit = run(f, "resolve", ownHex(f));
    expect(hit.status, hit.stderr).toBe(0);
    expect(["alias", "person", "git_identity"].map(hit.value))
      .toEqual(["amber-harbor", "Ada E.", "Ada Example <ada@example.invalid>"]);
    const miss = run(f, "resolve", "00000000");
    expect([miss.status, miss.stdout]).toEqual([3, ""]);
  });

  it("roster over an empty store prints entries=0 and exits 0", () => {
    const r = run(fixture(), "roster");
    expect([r.status, r.stdout], r.stderr).toEqual([0, "entries=0\n"]);
  });

  it("suggest is stable across calls on one hex and differs across two", () => {
    const f = fixture();
    const first = run(f, "suggest", "3f9a1c07");
    expect(first.status, first.stderr).toBe(0);
    expect(first.value("suggested_alias")).toMatch(/^[a-z]+-[a-z]+$/);
    // Deterministic over the hex, so no test here works around randomness.
    expect(run(f, "suggest", "3f9a1c07").value("suggested_alias")).toBe(first.value("suggested_alias"));
    expect(run(f, "suggest", "5e8248d7").value("suggested_alias")).not.toBe(first.value("suggested_alias"));
  });

  it("a second entry holding the same alias produces exactly one collision line", () => {
    const f = fixture();
    run(f, "register", "--alias", "amber-harbor");
    writeFileSync(join(f.store, "aaaaaaaa.md"), "**Checkout:** aaaaaaaa\n**Alias:** amber-harbor\n");
    writeFileSync(join(f.store, "bbbbbbbb.md"), "**Checkout:** bbbbbbbb\n**Alias:** other-name\n");
    const r = run(f, "register");
    expect(r.status, r.stderr).toBe(0);
    // Reported and never enforced: the entry keeps the alias it holds.
    expect(r.lines("collision")).toEqual(["aaaaaaaa"]);
    expect(entryText(f, ownHex(f))).toContain("**Alias:** amber-harbor");
  });

  it("a field holding a TAB reaches roster flattened, so the record stays four fields wide", () => {
    const f = fixture();
    run(f, "register", "--alias", "amber-harbor");
    writeFileSync(join(f.store, "aaaaaaaa.md"), "**Checkout:** aaaaaaaa\n**Alias:** a\tb\n**Person:** Bo Example\n");
    const r = run(f, "roster");
    expect(r.status, r.stderr).toBe(0);
    expect(r.value("entries")).toBe("2");
    for (const e of r.lines("entry")) expect(e.split("\t")).toHaveLength(4);
    expect(r.lines("entry").find((e) => e.startsWith("aaaaaaaa"))).toBe("aaaaaaaa\ta b\tBo Example\t");
  });

  it("exit 4: register with no git identity, carrying fusion-identity's own reason", () => {
    const f = fixture();
    // That helper exits 1 and prints no CHECKOUT=, which reaches this program as its own 4.
    for (const k of ["user.name", "user.email"]) spawnSync("git", ["config", "--unset", k], { cwd: f.dir, env: { ...process.env, ...gitEnv(f.dir) } });
    const r = run(f, "register");
    expect([r.status, r.stdout]).toEqual([4, ""]);
    expect(r.stderr).toContain("user.name and user.email are not set");
  });

  it("exit 5: no workbench above the working directory, and nothing on stdout", () => {
    const dir = mkdtempSync(join(tmpdir(), "fusion-checkout-name-bare-"));
    tmpRoots.push(dir);
    const r = spawnSync(script, ["roster"], { cwd: dir, encoding: "utf-8", env: { ...process.env, ...gitEnv(dir) } });
    expect(r.status).toBe(5);
    expect([r.stdout, r.stderr.includes("no fusion workbench")]).toEqual(["", true]);
  });
});
