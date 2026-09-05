import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// `bin/fusion-identity` is a bash script, so this drives the real script through
// child_process against throwaway trees — the way a filing agent calls it.
//
// WHAT IS UNDER TEST IS THE EXIT TABLE, because the exit code is the whole
// interface: a caller keys on the number and cannot key on stderr prose. All
// six codes are exercised below, exit 1 by both of its ways in. The script's own header states that table;
// this file asserts it rather than restating it.
//
// THE TWO PROPERTIES WORTH MORE THAN THE REST: exit 1 DOMINATES (an unset git
// identity stops the run before the checkout half is touched, so nothing is
// printed and no `.checkout-id` is minted), and exit 4 is NOT a halt (outside a
// git work tree no identity is owed; binding record
// `circles/260824-0530-record-attribution-and-circle-claim/decisions/260824-0613_*_does-a-filing-agent-halt-in-a-tree-that-is-not-a-git-work-tree-at-all.md`,
// option 2). A third, the never-overwrite of a malformed identifier, is the
// mint-once property seen from the succeeding side (issue 260824-1538).
//
// DELIBERATELY NOT TESTED: the concurrent mint. The write is a noclobber
// redirect; a test would fork twenty children and land in the load-sensitive
// flakiness already filed (`shared/issues/260814-2118_*_the-hooks-suite-fails-differently-on-repeated-full-runs-and-does-so-on-clean-head.md`).

const script = join(pluginRoot, "bin", "fusion-identity");
const tmpRoots: string[] = [];

afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

/**
 * Git reads three config layers. A fixture that neutralised only the repo one
 * would inherit this machine's global `user.name` and the two exit-1 cases
 * below would pass here and fail on a runner that has no global identity — or,
 * worse, the reverse. All three are cut off for every git call AND for every
 * call to the script itself.
 */
function gitEnv(home: string): Record<string, string> {
  return {
    HOME: home,
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_CONFIG_SYSTEM: "/dev/null",
    GIT_CONFIG_NOSYSTEM: "1",
  };
}

interface Fixture {
  /** The throwaway tree, and the working directory every run below uses. */
  dir: string;
  /** Where the identifier is minted, whether or not the workbench exists. */
  idFile: string;
}

/**
 * One throwaway tree. `git` selects the person half: `null` leaves the
 * directory a plain directory (the temp root is not inside any repository, so
 * this really is "not a git work tree"), and the three other values set the
 * identity fully or leave one key out. `workbench` selects the checkout half.
 */
function fixture(opts: { git: null | "both" | "no-name" | "no-email"; workbench: boolean }): Fixture {
  const dir = mkdtempSync(join(tmpdir(), "fusion-identity-"));
  tmpRoots.push(dir);
  if (opts.workbench) {
    mkdirSync(join(dir, "fusion-workbench"));
    writeFileSync(join(dir, "fusion-workbench", ".fusion-setup"), "{}\n");
  }
  if (opts.git) {
    const env = { ...process.env, ...gitEnv(dir) };
    spawnSync("git", ["init", "-q"], { cwd: dir, env });
    if (opts.git !== "no-name") spawnSync("git", ["config", "user.name", "Test Person"], { cwd: dir, env });
    if (opts.git !== "no-email") spawnSync("git", ["config", "user.email", "t@example.com"], { cwd: dir, env });
  }
  return { dir, idFile: join(dir, "fusion-workbench", ".checkout-id") };
}

interface Run {
  status: number;
  /** Asserted whole, not per key: "nothing on stdout" is half of exit 1. */
  stdout: string;
  stderr: string;
  /** `null` means the line is ABSENT, which is distinct from present-and-empty. */
  person: string | null;
  checkout: string | null;
}

function run(f: Fixture, env: Record<string, string> = {}, ...args: string[]): Run {
  const r = spawnSync(script, args, {
    cwd: f.dir,
    encoding: "utf-8",
    env: { ...process.env, ...gitEnv(f.dir), ...env },
  });
  const stdout = r.stdout ?? "";
  const value = (key: string): string | null => {
    const line = stdout.split("\n").find((l) => l.startsWith(`${key}=`));
    return line ? line.slice(key.length + 1) : null;
  };
  return { status: r.status ?? -1, stdout, stderr: r.stderr ?? "", person: value("PERSON"), checkout: value("CHECKOUT") };
}

describe("bin/fusion-identity", () => {
  it("exit 0: prints both lines when the tree has an identity and a workbench", () => {
    const f = fixture({ git: "both", workbench: true });
    const r = run(f);
    expect(r.status, r.stderr).toBe(0);
    expect(r.person).toBe("Test Person <t@example.com>");
    expect(r.checkout).toMatch(/^[0-9a-f]{8}$/);
    // What is printed is what the file holds, not what the process generated.
    expect(readFileSync(f.idFile, "utf-8").trim()).toBe(r.checkout);
  });

  // Exit 1 dominates the table, and each half of the identity is a separate
  // way in. Both are driven, because a check written against `user.name` alone
  // would pass a script that never looked at `user.email`.
  for (const [half, key] of [
    ["no-name", "user.name"],
    ["no-email", "user.email"],
  ] as const) {
    it(`exit 1: prints nothing and mints nothing when ${key} is unset`, () => {
      const f = fixture({ git: half, workbench: true });
      const r = run(f);
      expect(r.status).toBe(1);
      expect(r.stdout).toBe("");
      expect(r.stderr).toContain(key);
      // The dominance property: the halt path has no side effect at all.
      expect(existsSync(f.idFile), "a failing call minted an identifier").toBe(false);
    });
  }

  it("exit 1: halts with nothing on stdout when git cannot be run at all", () => {
    // A PATH holding `bash` (for the shebang) and `dirname`, the one external
    // the script reaches before the person half: exit 1 and not exit 4, because
    // without git nothing about the tree is established (issue 260824-1538).
    const f = fixture({ git: "both", workbench: true });
    mkdirSync(join(f.dir, "bin"));
    for (const tool of ["bash", "dirname"]) {
      symlinkSync(spawnSync("sh", ["-c", `command -v ${tool}`], { encoding: "utf-8" }).stdout.trim(), join(f.dir, "bin", tool));
    }
    const r = run(f, { PATH: join(f.dir, "bin") });
    expect(r.status).toBe(1);
    expect(r.stdout).toBe("");
    expect(r.stderr).toContain("git is not on PATH");
    expect(existsSync(f.idFile)).toBe(false);
  });

  it("exit 3: prints PERSON alone when no workbench sits above the working directory", () => {
    const f = fixture({ git: "both", workbench: false });
    const r = run(f);
    expect(r.status).toBe(3);
    expect(r.person).toBe("Test Person <t@example.com>");
    expect(r.checkout).toBeNull();
  });

  it("exit 4: prints CHECKOUT alone outside a git work tree, and does not halt", () => {
    const f = fixture({ git: null, workbench: true });
    const r = run(f);
    expect(r.status).toBe(4);
    expect(r.person).toBeNull();
    expect(r.checkout).toMatch(/^[0-9a-f]{8}$/);
    expect(r.stderr).toContain("not a git work tree");
  });

  it("exit 5: prints neither line when both halves are absent", () => {
    const r = run(fixture({ git: null, workbench: false }));
    expect(r.status).toBe(5);
    expect(r.stdout).toBe("");
  });

  it("mints once: two successive calls return the one identifier", () => {
    const f = fixture({ git: "both", workbench: true });
    const first = run(f);
    const held = readFileSync(f.idFile, "utf-8");
    const second = run(f);
    expect(first.status).toBe(0);
    expect(second.status).toBe(0);
    expect(second.checkout).toBe(first.checkout);
    // Not merely equal output: the file itself was not rewritten.
    expect(readFileSync(f.idFile, "utf-8")).toBe(held);
  });

  it("never overwrites: a malformed .checkout-id is left byte-identical and exits 3", () => {
    const f = fixture({ git: "both", workbench: true });
    writeFileSync(f.idFile, "not-hex\n");
    const r = run(f);
    expect(r.status).toBe(3);
    expect(r.person).toBe("Test Person <t@example.com>");
    expect(r.checkout).toBeNull();
    expect(r.stderr).toContain("was not overwritten");
    expect(readFileSync(f.idFile, "utf-8")).toBe("not-hex\n");
  });

  it("the mint speaks: stderr states it, stdout and the exit code do not move", () => {
    const f = fixture({ git: "both", workbench: true });
    writeFileSync(join(f.dir, "fusion-workbench", "orchestrator-events.jsonl"), '{"checkout":"aaaaaaaa"}\n{"checkout":"aaaaaaaa"}\n{"checkout":"bbbbbbbb"}\n');
    const r = run(f);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toBe(`PERSON=Test Person <t@example.com>\nCHECKOUT=${r.checkout}\n`);
    expect(r.stderr).toContain(`minted ${r.checkout}`);
    expect(r.stderr).toContain("2 in orchestrator-events.jsonl");
    expect(r.stderr).toContain("0 under shared/checkouts/");
    expect(run(f).stderr, "the line reports an act, not a state").toBe("");
  });

  it("exit 1 fires in exactly the cases it fires in at HEAD", () => {
    const cases: [Parameters<typeof fixture>[0], number][] = [
      [{ git: "both", workbench: true }, 0], [{ git: "no-name", workbench: true }, 1], [{ git: "no-email", workbench: true }, 1],
      [{ git: "both", workbench: false }, 3], [{ git: null, workbench: true }, 4], [{ git: null, workbench: false }, 5],
    ];
    for (const [opts, code] of cases) expect(run(fixture(opts)).status, JSON.stringify(opts)).toBe(code);
  });

  it("exit 2: rejects an argument without printing a value", () => {
    const r = run(fixture({ git: "both", workbench: true }), {}, "--help");
    expect(r.status).toBe(2);
    expect(r.stdout).toBe("");
  });
});
