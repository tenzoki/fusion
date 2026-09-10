import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// `bin/fusion-claimed-item` is a bash script; this drives the real one against
// throwaway workbenches, the way its two Setup callers do. Under test is the
// header's exit table, every code of it reached by a case, and above all the one
// case a first-match implementation passes silently and wrongly: two items
// claimed by one checkout is REFUSED, both named, nothing on stdout.

const script = join(pluginRoot, "bin", "fusion-claimed-item");
const identity = join(pluginRoot, "bin", "fusion-identity");

const tmpRoots: string[] = [];
afterAll(() => {
  for (const d of tmpRoots) rmSync(d, { recursive: true, force: true });
});

/** Git reads none of the developer's own config: a global `user.name` would
 *  make the no-identity case pass for the wrong reason. */
const env = {
  ...process.env,
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_SYSTEM: "/dev/null",
};

function sh(cmd: string, args: string[], cwd: string) {
  const r = spawnSync(cmd, args, { cwd, env, encoding: "utf-8" });
  return { status: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

const run = (cwd: string, ...args: string[]) => sh(script, args, cwd);

interface Opts {
  /** false leaves the tree without a workbench at all. */
  workbench?: boolean;
  /** false leaves the tree outside a git work tree. */
  git?: boolean;
  /** false initialises a work tree with no `user.name`. */
  named?: boolean;
  /** Seed `.checkout-id` by hand, to make the minted value unreadable. */
  checkoutId?: string;
}

function project(opts: Opts = {}): string {
  const { workbench = true, git = true, named = true, checkoutId } = opts;
  const dir = mkdtempSync(join(tmpdir(), "fusion-claimed-item-"));
  tmpRoots.push(dir);
  if (git) {
    sh("git", ["init", "-q"], dir);
    sh("git", ["config", "user.email", "scratch@example.com"], dir);
    if (named) sh("git", ["config", "user.name", "Scratch Person"], dir);
  }
  if (workbench) {
    mkdirSync(join(dir, "fusion-workbench", "circles"), { recursive: true });
    writeFileSync(join(dir, "fusion-workbench", ".fusion-setup"), "{}\n");
    if (checkoutId !== undefined)
      writeFileSync(join(dir, "fusion-workbench", ".checkout-id"), checkoutId + "\n");
  }
  return dir;
}

/** This checkout's eight hex, through the one helper that mints and prints it. */
function checkout(dir: string): string {
  const m = /^CHECKOUT=(.*)$/m.exec(sh(identity, [], dir).stdout);
  expect(m, "the identity helper printed no CHECKOUT line").not.toBeNull();
  return m![1];
}

/** One item: its container, and the record named after it. `record` overrides
 *  that name, which is how a file at the same depth is shown NOT to be an item. */
function add(
  dir: string,
  slug: string,
  status: string,
  claim?: string,
  record = `${slug}.md`,
): void {
  const d = join(dir, "fusion-workbench", "circles", slug);
  mkdirSync(d, { recursive: true });
  writeFileSync(
    join(d, record),
    [
      `# ${slug}`,
      "",
      "---",
      "**Domain:** code",
      `**Status:** ${status}`,
      ...(claim === undefined ? [] : [`**Claim:** ${claim}`]),
      "**Filed by:** user, Scratch Person <scratch@example.com>",
      "",
      "---",
      "",
    ].join("\n"),
  );
}

describe("bin/fusion-claimed-item", () => {
  it("prints both lines for the one item this checkout has claimed", () => {
    const dir = project();
    add(dir, "260910-1000-alpha", "claimed", `${checkout(dir)} — Scratch Person, 260910-1000`);
    add(dir, "260910-1100-beta", "open");
    const r = run(dir);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toBe(
      "ITEM=circles/260910-1000-alpha/260910-1000-alpha.md\n" +
        "CONTAINER=circles/260910-1000-alpha\n",
    );
  });

  it("refuses two claimed items rather than taking the first", () => {
    // The case the whole exit table turns on. A first match would resolve here,
    // and would file this item's work into the other item's container.
    const dir = project();
    const mine = checkout(dir);
    add(dir, "260910-1000-alpha", "claimed", `${mine} — Scratch Person, 260910-1000`);
    add(dir, "260910-1100-beta", "claimed", `${mine} — Scratch Person, 260910-1100`);
    const r = run(dir);
    expect(r.status).toBe(3);
    expect(r.stdout, "nothing is resolved and nothing falls back to the shared store").toBe("");
    expect(r.stderr).toContain("circles/260910-1000-alpha/260910-1000-alpha.md");
    expect(r.stderr).toContain("circles/260910-1100-beta/260910-1100-beta.md");
  });

  it.each([
    ["no item is claimed at all", (d: string) => add(d, "260910-1000-alpha", "open")],
    [
      "the claim names another checkout",
      (d: string) => add(d, "260910-1000-alpha", "claimed", "ffffffff — Someone Else, 260910-1000"),
    ],
    [
      "the status says claimed with no claim beside it",
      (d: string) => add(d, "260910-1000-alpha", "claimed"),
    ],
    [
      "the claim sits on a done item",
      (d: string) => add(d, "260910-1000-alpha", "done", `${checkout(d)} — Scratch Person, 260910-1000`),
    ],
    [
      "the record is not named after its own container",
      (d: string) =>
        add(d, "260910-1000-alpha", "claimed", `${checkout(d)} — x, 260910-1000`, "notes.md"),
    ],
  ])("exit 0 with no output when %s", (_, seed) => {
    const dir = project();
    seed(dir);
    const r = run(dir);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toBe("");
  });

  it("a tree that is not a git work tree is exit 0, even with a claim naming its minted checkout", () => {
    // Not exit 3: no claim is held where the multi-checkout arrangement does not
    // reach, so the shared store is the TRUE answer and not a degraded one. The
    // cost is stated in the header: this hand-written claim is not read.
    const dir = project({ git: false });
    add(dir, "260910-1000-alpha", "claimed", `${checkout(dir)} — Scratch Person, 260910-1000`);
    const r = run(dir);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toBe("");
    expect(r.stderr).toContain("not a git work tree");
  });

  it("exit 3 when the checkout identifier cannot be read inside a git work tree", () => {
    // The other half of the pair above, and the reason the two must not merge.
    const dir = project({ checkoutId: "not-hex" });
    add(dir, "260910-1000-alpha", "open");
    const r = run(dir);
    expect(r.status).toBe(3);
    expect(r.stdout).toBe("");
    expect(r.stderr).toContain("item in scope is unknown");
  });

  it.each([
    ["no workbench above the working directory", { workbench: false }, "no fusion workbench"],
    ["git user.name is unset inside a work tree", { named: false }, "bin/fusion-identity stopped"],
  ])("exit 1, the only code that means stop, when %s", (_, opts, reason) => {
    const r = run(project(opts as Opts));
    expect(r.status).toBe(1);
    expect(r.stdout).toBe("");
    expect(r.stderr).toContain(reason as string);
  });

  it("exit 2 on any argument, with nothing on stdout", () => {
    const r = run(project(), "--help");
    expect(r.status).toBe(2);
    expect(r.stdout).toBe("");
  });
});
