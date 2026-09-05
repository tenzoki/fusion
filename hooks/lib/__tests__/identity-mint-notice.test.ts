import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// The DELIVERING path, not the helper. `fusion-identity.test.ts` already pins
// that `bin/fusion-identity` announces a mint on stderr, and it passed on the
// commit that shipped the fault: the SessionStart clause that does the minting
// sent that stderr to /dev/null, so the announcement was correct and unheard
// (issue `260905-0933_*_the-mint-announcement-is-unreachable-on-every-path-that-actually-mints.md`).
// A second test of the helper would have missed it again. So every case below
// runs the SessionStart command AS `hooks.json` SPELLS IT, through `sh -c`,
// against a throwaway workbench, and asks what a user would receive.
//
// WHAT MAKES THE ANSWER USER-VISIBLE is the `systemMessage` envelope, measured
// against Claude Code 2.1.261 and recorded in `hooks/identity-notice.ts`: a
// SessionStart command's stderr at exit 0 reaches neither the user nor the
// model, and this envelope reaches the user. That measurement is the reason the
// assertions below read the envelope rather than stderr.

const command: string = (() => {
  const cfg = JSON.parse(readFileSync(join(pluginRoot, "hooks", "hooks.json"), "utf-8"));
  const found = (cfg.hooks.SessionStart as { hooks: { command: string }[] }[])
    .flatMap((e) => e.hooks.map((h) => h.command))
    .filter((c) => c.includes("bin/fusion-identity"));
  expect(found, "exactly one SessionStart command runs bin/fusion-identity").toHaveLength(1);
  return found[0];
})();

const tmpRoots: string[] = [];
afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

/**
 * A throwaway workbench, deliberately NOT a git work tree: that is exit 4, the
 * helper carries on, and the checkout half still mints. It keeps git's three
 * config layers out of a test that is not about the person half at all.
 */
function workbench(others: string[] = []): string {
  const dir = mkdtempSync(join(tmpdir(), "fusion-mint-notice-"));
  tmpRoots.push(dir);
  const wb = join(dir, "fusion-workbench");
  mkdirSync(wb);
  writeFileSync(join(wb, ".fusion-setup"), "{}\n");
  const rows = others.map((c) => JSON.stringify({ checkout: c })).join("\n");
  if (rows) writeFileSync(join(wb, "orchestrator-events.jsonl"), rows + "\n");
  return dir;
}

/** What a user, and $CLAUDE_ENV_FILE, got out of one session start. */
interface Run {
  /** The systemMessage, or null for a quiet run. */
  message: string | null;
  envFile: string;
  /** The identifier the workbench holds afterwards. */
  id: string;
}

/** One SessionStart, exactly as Claude Code would run this clause. */
function sessionStart(dir: string, envName: string): Run {
  const envFile = join(dir, envName);
  const r = spawnSync("sh", ["-c", command], {
    cwd: dir,
    encoding: "utf-8",
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: pluginRoot, CLAUDE_ENV_FILE: envFile },
  });
  expect(r.status, `the clause must never fail the session: ${r.stderr}`).toBe(0);
  const out = JSON.parse(r.stdout.trim());
  // The channel, pinned on every run: a bare string on stdout would be
  // `additionalContext` and would reach the model instead of the user.
  if (out.hookSpecificOutput) expect(out.hookSpecificOutput.hookEventName).toBe("SessionStart");
  return {
    message: out.hookSpecificOutput?.systemMessage ?? null,
    envFile: readFileSync(envFile, "utf-8"),
    id: readFileSync(join(dir, "fusion-workbench", ".checkout-id"), "utf-8").trim(),
  };
}

describe("the mint announcement reaches the user through the SessionStart clause", () => {
  it("a swept workbench: the session that re-mints says so, naming the identifier", () => {
    // The acceptance case. `git clean -xdf` took `.checkout-id` with it; the
    // rows other checkouts wrote survive, because they are tracked.
    const dir = workbench(["aaaaaaaa", "bbbbbbbb"]);
    const first = sessionStart(dir, "env1");
    rmSync(join(dir, "fusion-workbench", ".checkout-id"));

    const swept = sessionStart(dir, "env2");
    expect(swept.id, "a re-mint, not the old identifier").not.toBe(first.id);
    expect(swept.message, "the mint must reach the user").not.toBeNull();
    expect(swept.message).toContain(`minted ${swept.id}`);
    expect(swept.message, "and why this is worth reading").toContain("git clean -xdf");
    expect(swept.message).toContain("2 in orchestrator-events.jsonl");
  });

  it("it reports an act, not a state: a second session in the same checkout is silent", () => {
    const dir = workbench();
    const first = sessionStart(dir, "env1");
    expect(first.message).not.toBeNull();

    const second = sessionStart(dir, "env2");
    expect(second.message, "mint-once, and the notice with it").toBeNull();
    expect(second.id, "and the identifier is the one already held").toBe(first.id);
  });

  it("merging stderr into the capture leaks none of it into $CLAUDE_ENV_FILE", () => {
    // The regression the `2>/dev/null` -> `2>&1` change could have caused: the
    // two extractions are anchored on `^PERSON=` / `^CHECKOUT=`, so the
    // helper's reasons cannot be exported as values.
    const run = sessionStart(workbench(), "env1");
    expect(run.envFile).toContain("FUSION_CHECKOUT=");
    expect(run.envFile).toContain(run.id);
    expect(run.envFile, "no reason line became a value").not.toContain("fusion-identity:");
    expect(run.envFile, "and exit 4 owes no person").not.toContain("FUSION_PERSON");
  });
});
