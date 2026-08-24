import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// `bin/fusion-identity` is a bash script, so this drives the real script through
// child_process against throwaway trees — the way a filing agent calls it.
//
// WHAT IS UNDER TEST IS THE EXIT TABLE, because the exit code is the whole
// interface: a caller keys on the number and cannot key on stderr prose. All
// six codes are exercised below. The script's own header states that table;
// this file asserts it rather than restating it.
//
// THE TWO PROPERTIES WORTH MORE THAN THE REST.
//   - Exit 1 DOMINATES: an unset git identity stops the run before the checkout
//     half is touched, so nothing is printed and no `.checkout-id` is minted. A
//     failing call that left a file behind would be a side effect on the error
//     path, which is the kind of defect a test catches once and never again.
//   - Exit 4 is NOT a halt. Outside a git work tree no identity is owed, the
//     helper prints `CHECKOUT=` alone, and the caller files the record with the
//     person field absent rather than empty. Binding record:
//     `circles/260824-0530-record-attribution-and-circle-claim/decisions/260824-0613_*_does-a-filing-agent-halt-in-a-tree-that-is-not-a-git-work-tree-at-all.md`,
//     option 2.
//
// WHAT IS DELIBERATELY NOT TESTED HERE: the concurrent mint. The script's write
// is a noclobber redirect, so two racing processes mint one identifier; a test
// of it would fork twenty children, cost seconds of wall-clock on every run and
// land in the load-sensitive flakiness this suite already has filed
// (`shared/issues/260814-2118_*_the-hooks-suite-fails-differently-on-repeated-full-runs-and-does-so-on-clean-head.md`).
// The mint-once case below covers what a caller can observe — one identifier
// across successive calls — and the race was exercised by hand when it landed.

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

function run(f: Fixture, ...args: string[]): Run {
  const r = spawnSync(script, args, {
    cwd: f.dir,
    encoding: "utf-8",
    env: { ...process.env, ...gitEnv(f.dir) },
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

  it("exit 2: rejects an argument without printing a value", () => {
    const r = run(fixture({ git: "both", workbench: true }), "--help");
    expect(r.status).toBe(2);
    expect(r.stdout).toBe("");
  });
});
